<div align="center">

# 🛒 ShopEase

### A Full-Stack E-Commerce Web Application

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ShopEase-4f46e5?style=for-the-badge)](https://shopease-iucm.onrender.com)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Deploy](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render&logoColor=white)](https://shopease-iucm.onrender.com)

**ShopEase** is a production-ready, full-stack e-commerce platform with Razorpay payment integration, an admin dashboard, order management, and a responsive modern UI. Built with **Spring Boot** and **React**.

[Live Demo](https://shopease-iucm.onrender.com) · [API Docs](https://shopease-iucm.onrender.com/swagger-ui.html) · [Setup Guide](./SETUP_GUIDE.md)

</div>

---

## ✨ Features

### 🛍️ Customer Experience
- **Product Catalog** — Browse, search & filter by category, brand, and price
- **Shopping Cart** — Persistent cart with quantity management & variant selection
- **Checkout** — COD & Razorpay online payment (test mode)
- **Order Tracking** — Real-time order status with timeline view
- **Wishlist** — Save favorites & move to cart
- **Reviews & Ratings** — Star ratings with written reviews
- **Coupons** — Apply promo codes at checkout
- **Invoice** — Downloadable/printable order invoices
- **Returns & Replacements** — Post-purchase support flow

### 👑 Admin Dashboard
- **Analytics** — Revenue, orders, users & product KPIs
- **Inventory** — Full CRUD for products & categories
- **Order Management** — Update status (Pending → Shipped → Delivered)
- **Coupon Engine** — Create/manage discount codes with limits
- **Customer Support** — Handle returns, replacements & refunds
- **Product Q&A** — Answer customer questions
- **Banner Manager** — Homepage promotional banners
- **CSV Export** — Export reports for offline analysis

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6, Axios, React Hot Toast |
| **Styling** | Custom CSS Design System (not Tailwind) |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA |
| **Auth** | Stateless JWT (HS256), Role-based access (USER / ADMIN) |
| **Database** | PostgreSQL (Neon — production), MySQL (local development) |
| **Payments** | Razorpay (test mode — real signature verification) |
| **API Docs** | OpenAPI 3 + Swagger UI |
| **Deployment** | Docker → Render (single-service), Neon PostgreSQL |
| **Build** | Maven (backend), Vite (frontend), Multi-stage Dockerfile |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                      │
│  Components · Pages · Context (Auth, Cart) · API Client │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────┐
│                Spring Boot 3.3.5                         │
│  Controllers → Services → Repositories                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Security │  │ JWT Auth │  │ Global Exception       │ │
│  │ Filter   │→ │ Filter   │→ │ Handler (@ControlAdvice)│ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌───────────┐ ┌───────────┐
   │ PostgreSQL │ │ Razorpay  │ │ Gmail     │
   │ (Neon)     │ │ Payments  │ │ SMTP      │
   └────────────┘ └───────────┘ └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** (JDK)
- **Node.js 18+** (with npm)
- **MySQL 8** (for local development)
- **Maven 3.8+**

### 1. Clone & Configure
```bash
git clone https://github.com/dhanushr-dev/shopease.git
cd shopease
```

### 2. Backend
```bash
cd backend
cp .env.example .env     # Edit with your MySQL password & JWT secret
mvn spring-boot:run
```
> Server starts at `http://localhost:8080`
> Swagger UI at `http://localhost:8080/swagger-ui.html`

### 3. Frontend
```bash
cd frontend
cp .env.example .env     # Verify VITE_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev
```
> App opens at `http://localhost:5173`

📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration.

---

## 🔑 Demo Credentials

> Auto-seeded on first startup when the database is empty.

| Role | Email | Password |
|------|-------|----------|
| **Customer** | `jane@example.com` | `user123` |
| **Customer** | `john@example.com` | `user123` |
| **Admin** | `admin@shopease.com` | `admin123` |

---

## 📡 API Overview

Full interactive API docs available at [/swagger-ui.html](https://shopease-iucm.onrender.com/swagger-ui.html).

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | `POST /api/auth/register`, `/login` | Public |
| Products | `GET /api/products`, `/search`, `/{id}` | Public |
| Categories | `GET /api/categories` | Public |
| Cart | `GET/POST/PUT/DELETE /api/cart` | JWT |
| Orders | `POST /api/orders`, `GET /api/orders` | JWT |
| Payments | `POST /api/orders/{id}/verify` | JWT |
| Wishlist | `GET/POST/DELETE /api/wishlist` | JWT |
| Reviews | `POST /api/products/{id}/reviews` | JWT |
| Coupons | `POST /api/coupons/apply` | JWT |
| Admin | `/api/admin/dashboard`, `/products`, `/orders` | Admin |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed request/response examples.

---

## 💳 Payment Flow

ShopEase uses **Razorpay** in test mode with real signature verification:

```
1. User selects "Online Payment" → clicks "Place Order"
2. Backend creates Razorpay order (via Razorpay API)
3. Frontend opens Razorpay checkout modal
4. User completes payment with test card
5. Razorpay returns: payment_id, order_id, signature
6. Frontend sends to POST /api/orders/{id}/verify
7. Backend verifies HMAC-SHA256 signature
8. Order status → CONFIRMED, payment → PAID
9. Cart cleared → redirect to success page
```

**Test Card**: `4111 1111 1111 1111` | Any future expiry | Any CVV

---

## 🗂️ Project Structure

```
shopease/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/easeshop/
│   │   ├── config/             # Security, CORS, Swagger config
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities (User, Product, Order...)
│   │   ├── exception/          # Global exception handling
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── service/            # Business logic layer
│   │   └── util/               # Helpers (DtoMapper, JWT)
│   └── src/main/resources/
│       ├── application.properties       # Default config (MySQL)
│       └── application-prod.properties  # Production config (Neon PostgreSQL)
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute...
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/              # All page components
│   │   ├── services/           # Axios API client
│   │   └── utils/              # Image helpers, formatters
│   └── index.html
├── docs/                       # Architecture & ER diagrams
├── Dockerfile                  # Multi-stage Docker build
├── render.yaml                 # Render deployment blueprint
└── README.md
```

---

## 🌐 Deployment

ShopEase runs as a **single Docker container** on Render's free tier:

| Service | Provider | Plan |
|---------|----------|------|
| **Web App** | [Render](https://render.com) | Free |
| **Database** | [Neon](https://neon.tech) | Free (PostgreSQL) |

The multi-stage [Dockerfile](./Dockerfile) builds both frontend and backend into a single JAR.

> ⚠️ Render free tier spins down after 15 minutes of inactivity. First request after idle may take ~30 seconds.

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](./SETUP_GUIDE.md) | Local development setup instructions |
| [API Documentation](./API_DOCUMENTATION.md) | Endpoint details with request/response examples |
| [Architecture](./docs/Architecture.md) | System architecture & layer diagrams |
| [ER Diagram](./docs/ER-Diagram.md) | Database entity relationships |

---

## 👤 Author

**Dhanush R**

## 👤 Author

📍 Mandya, Karnataka, India

📧 Email: dhanushrmdy@gmail.com

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/dhanushr-dev)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/dhanushr-dev)

---

<div align="center">

**⭐ Star this repo if you found it useful!**

</div>
