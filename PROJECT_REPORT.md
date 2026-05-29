# ShopEase Full-Stack E-Commerce Project Report

**Author**: Dhanush R  
**GitHub**: [github.com/dhanushr-dev](https://github.com/dhanushr-dev)  
**LinkedIn**: [linkedin.com/in/dhanushr-dev](https://www.linkedin.com/in/dhanushr-dev)  

---

## 1. Introduction

ShopEase is a full-stack, production-ready e-commerce web application designed to simulate a modern, online fashion catalog. The application implements standard e-commerce features including custom role-based login (User and Seller/Admin), a category-based product browse system, filter/sort queries, cart persistence, coupon engine application, mock checkout, returns management, product reviews, and an analytics dashboard for store operators.

---

## 2. Problem Statement & Objectives

### The Problem
Building a modern e-commerce application requires a solid architectural foundation. Challenges like secure password handling, session-less authorization (necessary for scalability), stock transaction safety (preventing overselling), and modular client state synchronization are common bottlenecks in engineering production web apps.

### The Objectives
1. Design and develop a clean, secure **RESTful API backend** using Java and Spring Boot.
2. Develop a **responsive React frontend** styled using Tailwind CSS with Vite as a bundler.
3. Secure endpoints utilizing **JWT-based stateless authentication** and Spring Security.
4. Implement proper **relational schemas** using JPA/Hibernate to prevent transactional integrity issues.
5. Create a clean **Admin/Seller control panel** to manage inventories, view dashboard metrics, generate csv reports, and approve customer refunds or returns.

---

## 3. Technology Stack

### Backend
- **Java 21**: Incorporates modern pattern matching, records, and virtual threads support.
- **Spring Boot 3.3.x**: Serves as the core application framework.
- **Spring Security & JWT**: Manages stateless role-based authorization.
- **Spring Data JPA & Hibernate**: Simplifies ORM mappings and SQL transaction handling.
- **MySQL**: Serves as the relational database.
- **Swagger/OpenAPI 3**: Provides interactive REST API testing pages.
- **Maven**: Project dependency management and builds.

### Frontend
- **React 18**: Dynamic components rendering.
- **Vite**: Rapid hot module replacement (HMR) bundler.
- **Tailwind CSS**: Utility-first CSS styling.
- **Axios**: Promised-based HTTP client for browser communication.
- **React Router 6**: Component routing and Route guards.

---

## 4. System Architecture & Database Design

### Backend Architecture
The backend follows the clean **MVC (Model-View-Controller)** pattern:
1. **Controllers**: Receive request payloads, map HTTP operations, validate requests, and return DTO responses.
2. **Services (and Service Implementations)**: House business logic, control ACID transaction boundaries, and interact with ORM repositories.
3. **Repositories**: Interfaces inheriting `JpaRepository` for data access.
4. **Security Filter Chain**: Validates incoming Authorization headers, extracts JWT tokens, and populates the Security Context.

### Database Design Summary
The relational schema comprises:
- `users`: Stores customer and admin records (names, hashed passwords, roles).
- `addresses`: Manages user shipping destinations (one-to-many relationship with `users`).
- `categories`: Broad product categories (e.g. Footwear, Bags).
- `products`: Catalog items linked to a category (many-to-one) and tracked by seller (createdBy).
- `cart`: Shopping carts associated with users.
- `cart_items`: Items added to cart with quantities and variant metadata.
- `orders`: Transactions with generated tracking numbers, payment states, and shipping addresses.
- `order_items`: Snapshots of product prices and quantities purchased at checkout.
- `coupons`: Promo codes with discount values, usage thresholds, and expiry limits.
- `returns` & `replacements` & `refunds`: Post-purchase service tracking.

---

## 5. Implementation Details & Security

### Stateless Authentication
Authentication uses JSON Web Tokens (JWT). When a user successfully logs in, the backend constructs a JWT signed with a secure HMACS-SHA key. The frontend stores this token in local storage and includes it in the `Authorization` header of all subsequent API calls via an Axios request interceptor.

### Security Configurations
- **BCrypt Password Hashing**: Passwords are never stored in plain text. Spring Security's `PasswordEncoder` hashes passwords prior to database insertion.
- **CORS Handling**: Cross-Origin Resource Sharing is configured globally to allow the React client origin to execute requests safely.

### Stock Transactions & Order Placement
During order placement, a transactional boundary ensures stock is decremented. If a product stock is insufficient, the system throws a `BadRequestException` and rolls back the order transaction.

---

## 6. Challenges Faced & Future Enhancements

### Key Challenges
1. **State Management**: Managing complex operations in the Admin dashboard required refactoring heavy React files into modular components to avoid syntax errors and ensure long-term maintenance.
2. **Database Seeding**: Balancing startup data initialization while preventing duplicate records on restart. Resolved by programmatically checking if database is empty prior to seeding.

### Future Scope
- **Image Hosting Integration**: Connect the backend with Cloudinary for automated seller product image uploads.
- **Real-Time Payment Gateway**: Replace mock simulated online payments with a live Stripe or Razorpay API checkout flow.
- **Microservice Migration**: Decoupling the billing/invoice generation system into a serverless email worker.
- **Recommendation Engine**: Integrate basic customer browsing similarity algorithms to suggest products.
