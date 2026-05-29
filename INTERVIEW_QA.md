# ShopEase — Interview Q&A Preparation Guide

This guide contains 25 typical interview questions and detailed professional answers based on the architecture, technologies, and implementation of the ShopEase e-commerce application.

---

### Q1. Why did you choose Spring Boot for the backend?
**Answer**: Spring Boot is selected because of its production-grade features, ease of configuration, and rich ecosystem. It provides out-of-the-box support for dependency injection, transaction management, object-relational mapping (via JPA/Hibernate), and security (via Spring Security). Additionally, its auto-configuration features reduce boilerplate setup code, allowing rapid API development.

### Q2. Why did you implement JWT instead of standard session-based authentication?
**Answer**: JSON Web Tokens (JWT) enable stateless, decentralized authentication. Since e-commerce applications target high scalability, storing user session details in memory on a single server limits load balancing. By issuing a signed JWT token to the client, the backend does not need to store session state. Any backend server in a cluster can validate the token using a shared secret key, facilitating horizontal scaling.

### Q3. How does Role-Based Access Control (RBAC) work in your security config?
**Answer**: We configure roles using Spring Security's `HttpSecurity` bean. Standard endpoints like `/api/products` are made publicly accessible, while cart and order endpoints are secured for authenticated users. Administrative endpoints under `/api/admin/**` are strictly gated with `hasRole('ROLE_ADMIN')`. The user role is encoded in the JWT claims during login, extracted by the `JwtAuthenticationFilter` on each request, and mapped to the security context authorities.

### Q4. How is the shopping cart implemented and persisted?
**Answer**: Carts are persisted in the MySQL database to ensure data is preserved across devices and sessions. We design a `Cart` entity that has a one-to-one relationship with a `User`, and a one-to-many relationship with `CartItem` entities. When a user updates cart quantities or adds items on the React client, Axios API calls trigger updates in the backend.

### Q5. How does the order placement and transaction logic prevent overselling?
**Answer**: We implement order placement inside a `@Transactional` service method. During checkout:
1. The user's cart is loaded.
2. For each item, we inspect the available stock of the corresponding `Product`.
3. If stock is sufficient, the product stock is decremented and saved. If stock is insufficient, we throw a `BadRequestException`.
4. Because the method is marked as `@Transactional`, if any product check fails, the entire transaction is rolled back, preventing orphaned order rows or inconsistent inventory.

### Q6. How are coupons applied, and how do you prevent abuse (usage limit checks)?
**Answer**: The `Coupon` entity contains validation attributes like `usageLimit`, `usedCount`, `startDate`, `endDate`, and `minOrderAmount`. When a user requests to apply a coupon, the `CouponServiceImpl` checks if the coupon is active, not expired, matches the minimum order requirement, and that its `usedCount` is strictly less than its `usageLimit`. On order completion, we increment the coupon usage counts.

### Q7. How does product ownership work in the seller dashboard?
**Answer**: Products contain a reference to the `User` entity who created them (mapped via the `createdBy` field). When a seller/admin attempts to update or delete a product, the backend checks the email from the `SecurityContext` against the `createdBy.email` field. If they do not match, a `BadRequestException` is thrown, preventing unauthorized modifications to someone else's listings.

### Q8. How does the frontend connect to the backend securely?
**Answer**: The frontend communicates using the Axios client, with endpoints pointing to the base URL stored in `VITE_API_BASE_URL`. Security is enforced by attaching the JWT token from `localStorage` into the HTTP `Authorization` header on every request using an Axios Request Interceptor.

### Q9. Can you describe the database relationship between Users, Orders, and Address?
**Answer**: 
- **User and Address**: One-to-many. A user can store multiple shipping addresses.
- **User and Order**: One-to-many. A user can place multiple orders over time.
- **Order and Address**: Many-to-one. Multiple orders can target the same shipping address. An order captures a foreign key referring to the specific `Address` used during checkout.

### Q10. What is the role of DtoMapper in your application?
**Answer**: `DtoMapper` decouples our database entities from the REST API responses (DTOs). Directly returning database entities from controllers risks exposing internal database structures (like hashed passwords) and can trigger infinite recursive loops due to bidirectional Hibernate mappings. `DtoMapper` cleanly maps entities to flat, client-friendly responses.

### Q11. What challenges did you face with frontend file sizes, and how did you resolve them?
**Answer**: The initial implementation of `AdminDashboard.jsx` grew very large because it contained multiple UI layouts (tables for products, categories, orders, alerts, statistics cards) and form handlers in a single file. This made it prone to JSX syntax errors. I resolved this by refactoring it: extracting distinct views into stateless components (`AdminStatsCards`, `AdminLowStock`, `AdminProductsTab`, etc.) and passing data as props, keeping the main dashboard container readable and easy to debug.

### Q12. How does the simulated payment system work?
**Answer**: During checkout, the checkout component gives the user the choice between Cash on Delivery (COD) and Online Payment. Selecting Online Payment triggers a simulated bank gateway interface where transaction state is verified, marking the order payment status as `PAID` instantly instead of `PENDING`.

### Q13. How did you design the invoice feature?
**Answer**: The database captures order details, client name, items purchased, totals, and final billing amounts. When a user requests an invoice, the frontend loads the order invoice API payload and renders a clean, printable styling sheet mapping order number, dates, addresses, and individual items.

### Q14. Why did you separate development and production configurations?
**Answer**: In production, security, performance, and log cleanliness are critical. Verbose database logs like SQL query formatting (`hibernate.format_sql=true`) slow down the system and clutter console logs. We disabled SQL logging by default in `application.properties`, and moved it to a dedicated `dev` profile. Developers can enable verbose output by launching with `mvn spring-boot:run -Dspring-boot.run.profiles=dev`.

### Q15. How are security secrets protected on public repositories?
**Answer**: We removed hardcoded MySQL database passwords and JWT security keys from the configuration properties file. Instead, the backend reads them from environment variables via spring expressions (`${DB_PASSWORD}`, `${JWT_SECRET}`). We added a `.env.example` file that shows the variable names to configure locally without exposing actual passwords on public Git repositories.

### Q16. How did you test your service layer, and why are unit tests important?
**Answer**: I wrote Mockito-based unit tests for `OrderService`, `CouponService`, and `ProductService`. Using JUnit 5 and Mockito allowed mocking repository dependencies. Unit tests ensure that business validations (like discount math and stock checking) continue working correctly when the codebase is refactored, without requiring a running database server.

### Q17. How does your backend handle validation errors?
**Answer**: The controller parameters are decorated with Jakarta validation annotations like `@NotBlank`, `@Min`, or `@NotNull`. The controller methods use `@Valid` triggers. If a validation fails, Spring Boot throws a `MethodArgumentNotValidException` or a `ConstraintViolationException`. We capture these globally and return readable error responses containing specific fields that failed validation.

### Q18. How do you prevent SQL Injection?
**Answer**: We use Spring Data JPA, which internally uses Hibernate and JDBC Prepared Statements. Variables passed to JPA query methods are automatically parameterized and bound to SQL query placeholders, preventing attackers from injecting malicious SQL commands into input fields.

### Q19. How did you configure CORS?
**Answer**: Cross-Origin Resource Sharing is configured globally in `CorsConfig.java`. It defines which external origins (e.g. `http://localhost:5173`) are allowed to perform HTTP operations on our Spring Boot API, which HTTP methods are permitted (GET, POST, PUT, DELETE), and allows credential sharing (cookies/authorization headers).

### Q20. How would you scale this application to support a high volume of users?
**Answer**:
1. **Caching**: Integrate Redis to cache product listings and categories so they are read from memory instead of hitting MySQL repeatedly.
2. **Database Read-Replicas**: Use one primary database for writes (updates, checkouts) and scale queries with multiple read replicas.
3. **Session State**: Keep the application stateless (already achieved with JWT) and place it behind an ALB (Application Load Balancer).
4. **Asynchronous Processing**: Offload heavy processes (like mailing invoices) to message queues like RabbitMQ or Kafka.

### Q21. How did you structure the Git repository files?
**Answer**: The project is split into a `backend` directory (Maven Spring Boot project) and a `frontend` directory (Vite React app). The root directory has a `.gitignore` to prevent tracking dependency files like `node_modules` or Java target files.

### Q22. Explain the flow of a customer checkout request.
**Answer**:
1. Frontend calls `/api/orders` passing the shipping address ID and payment method.
2. `OrderController` intercepts the request and extracts user email from authentication details.
3. `OrderService` validates cart contents and checks product stock levels.
4. Product stock levels are reduced.
5. `Order` and `OrderItem` records are constructed and stored in the database.
6. A status history log is written.
7. The user's cart items are cleared.
8. The order details are mapped to DTO and returned to the client.

### Q23. Why did you use soft deletion for products?
**Answer**: Hard-deleting products from the database creates foreign key constraint violations if those products are already referenced in existing `order_items` tables. Instead, we use soft deletion by setting the `active` attribute of `Product` to `false`. Active queries filter products using `active = true`, while order records can still query the product entity without breaking database integrity.

### Q24. How is the coupon discount computed?
**Answer**: When a coupon is applied:
1. If the coupon type is `PERCENTAGE`, the discount is calculated as `cartTotal * discountValue / 100`.
2. If `maxDiscountAmount` is specified and the computed discount exceeds it, the discount is capped at `maxDiscountAmount`.
3. If the coupon type is `FIXED`, the discount is exactly the `discountValue`.
4. Finally, we ensure the discount is capped at the total amount in the cart (to prevent negative totals).

### Q25. What did you learn from completing this project?
**Answer**: I gained experience in architecting full-stack applications. I learned how to implement token-based authentication securely, design scalable relational database schemas with JPA, manage transactions, write fast unit tests with Mockito, and clean/refactor frontend React codebases into modular, high-quality, recruiter-ready architectures.
