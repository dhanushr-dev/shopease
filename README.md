# ShopEase — Full Stack E-Commerce Web Application

[![Java Version](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/technologies/downloads/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF.svg)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

ShopEase is a production-style, full-stack e-commerce web application featuring a modern React frontend and a robust Spring Boot REST API backend. It is designed to demonstrate clean architecture, secure session-less authentication, role-based controls, transactional inventory integrity, and a premium administrative dashboard.

---

## 🚀 Key Features

### 👤 Customer Features
- **Authentication**: JWT-based secure login, registration, and session-less profile management.
- **Product Discovery**: Browse catalog items by categories, perform full-text product search, and filter by brand/price.
- **Shopping Cart**: Fully persistent database cart sync (add, update quantities, remove items).
- **Checkout Process**: Supports Cash on Delivery (COD) and simulated secure online card payments.
- **Coupons**: Applies active promo codes with minimum cart total and maximum discount limits.
- **Order Tracking**: Detailed order history tracker, itemized receipt logs, and simulated order tracking timelines.
- **Post-Purchase Support**: Raise cancellation requests, request order returns, or request replacements.
- **Wishlist**: Save favorite items to purchase later and seamlessly move them to the cart.
- **Reviews & Ratings**: Add review logs and star ratings on purchased products.

### 👑 Seller / Admin Features
- **KPI Dashboard**: View real-time shop performance statistics (Total Users, Catalog count, total orders, and shop revenue).
- **Out-of-Stock Alerts**: Low stock (<10) and Out of Stock notifications displayed instantly.
- **Inventory Management**: Create new products, update existing specifications (price, stock, descriptions, and images), and soft-delete listings.
- **Category Control**: Create, update, or toggle category status.
- **Order Fulfilment**: View all store orders, track payments, and update progress states (Pending, Confirmed, Shipped, Out for Delivery, Delivered).
- **Promo Coupon Manager**: Define new coupon discount structures, min-spend limits, usage limits, and active date bounds.
- **Customer Support Desk**: Approve or reject return/replacement tickets, complete refunds, and answer customer product questions.
- **Reports Export**: Export sales reports or stock reports to `.csv` format instantly.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Java 21, Spring Boot 3.3.5, Spring Security (Stateless JWT Authentication)
- **Persistence**: Spring Data JPA, Hibernate, MySQL Database
- **API Documentation**: OpenAPI 3, Swagger UI
- **Build & Tests**: Maven, JUnit 5, Mockito

### Frontend
- **Core**: React 18, React Router 6, Axios HTTP client, Vite Bundler
- **Styling**: Tailwind CSS, Vanilla CSS, React Icons
- **Toast Notifications**: React Hot Toast

---

## 📂 Project Structure

```
shopease/
├── backend/                  # Spring Boot REST API Application
│   ├── src/
│   │   ├── main/             # Java source and resources (application.properties)
│   │   └── test/             # JUnit 5 & Mockito Unit Tests
│   ├── pom.xml               # Maven configuration and dependencies
│   └── .env.example          # Environment variables template
├── frontend/                 # React SPA Application (Vite + Tailwind)
│   ├── src/
│   │   ├── components/       # Reusable layout and tab components
│   │   ├── pages/            # View pages (Admin, Checkout, Profile)
│   │   ├── services/         # Axios API client (api.js)
│   │   └── utils/            # Helper utilities
│   ├── package.json          # Node dependencies
│   └── .env.example          # Frontend configuration template
└── docs/                     # Additional guides and QA files
```

---

## ⚙️ Setup and Installation

Please refer to the detailed [Setup Guide](./SETUP_GUIDE.md) for full configuration steps.

### Quick Start:

1. **Database Setup**:
   Create a schema in MySQL:
   ```sql
   CREATE DATABASE easeshop_db;
   ```

2. **Run Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Update database password and secret keys in your .env
   mvn clean test
   mvn spring-boot:run
   # For development profile:
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Run Frontend**:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

---

## 🧪 Running Unit Tests

Backend test suites are written using **JUnit 5** and **Mockito** (running offline without MySQL dependency).

To run the unit tests:
```bash
cd backend
mvn test
```

---

## 📡 API Documentation
Interactive Swagger endpoints documentation is available when the backend server is running:
- **Swagger URL**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Raw API JSON**: `http://localhost:8080/api-docs`

---

## 🔑 Demo Credentials

*Note: The database seeds these accounts programmatically on the first startup if the user table is empty.*

- **Customer Profile**:
  - **Email**: `john@example.com`
  - **Password**: `user123`
- **Admin / Seller Profile**:
  - **Email**: `admin@shopease.com`
  - **Password**: `admin123`

---

## Screenshots

> [!NOTE]
> Screenshots should be captured after running the app locally. Add screenshots inside `/screenshots` folder with these names.

### Home Page
![Home Page](./screenshots/home.png)

### Products Page
![Products Page](./screenshots/products.png)

### Product Details
![Product Details](./screenshots/product-details.png)

### Cart Page
![Cart Page](./screenshots/cart.png)

### Checkout Page
![Checkout Page](./screenshots/checkout.png)

### Order Invoice
![Invoice](./screenshots/invoice.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

### Add Product
![Add Product](./screenshots/add-product.png)


---

## 🔮 Future Enhancements
- **Image Upload Integration**: Implement automated product photo uploading via Cloudinary.
- **Live Payments Integration**: Integrate standard Stripe or Razorpay credit card transaction gateways.
- **Transactional Mailing**: Setup SMTP mail notifications for invoices and order tracking updates.

---

## 👤 Author

**Dhanush R**  
- **LinkedIn**: [linkedin.com/in/dhanushr-dev](https://www.linkedin.com/in/dhanushr-dev)  
- **GitHub**: [github.com/dhanushr-dev](https://github.com/dhanushr-dev)
