# ShopEase — Setup & Installation Guide

This guide provides step-by-step instructions to configure, build, and run the ShopEase full-stack e-commerce web application locally.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Java Development Kit (JDK)**: Version 21
- **Node.js**: Version 18.x or 20.x (includes `npm`)
- **MySQL Database**: Version 8.0 or higher
- **Maven**: Version 3.8+ (or use the provided Maven wrapper `mvnw`)
- **Git** (optional, for cloning)

---

## 💾 Database Setup

1. Open your MySQL client (Command Line Client, Workbench, or DBeaver).
2. Create a new database named `easeshop_db`:
   ```sql
   CREATE DATABASE easeshop_db;
   ```
3. (Optional) Verify that the database is created successfully.

---

## ⚙️ Backend Configuration

The backend reads configuration settings from environment variables. We use safe placeholders by default in `application.properties`.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the `.env.example` file to create your own local `.env` file (or set these variables in your system/IDE environment):
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your actual local configuration:
   ```properties
   SERVER_PORT=8080
   DB_URL=jdbc:mysql://localhost:3306/easeshop_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=YourSuperSecretKeyForJWTMustBeAtLeast256BitsLong2024!
   JWT_EXPIRATION=86400000
   ```
   *Note: Never commit your actual `.env` file to source control.*

---

## 🚀 Running the Application

### 1. Start the Backend

1. In the `backend` folder, verify everything compiles and tests pass:
   ```bash
   mvn clean test
   ```
2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *Tip: To run the app with SQL queries printed to the console (development profile):*
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
3. Once running, the server is available at `http://localhost:8080`.
4. Access the API documentation (Swagger UI) at:
   [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 2. Start the Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Verify it has:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

---

## 🛠️ Troubleshooting Common Errors

### 1. `Access denied for user 'root'@'localhost'` (using password: YES)
- **Cause**: The database password in your environment configuration does not match your MySQL password.
- **Solution**: Check that the `DB_PASSWORD` environment variable in your run configuration or `.env` matches your MySQL root account password.

### 2. `Address already in use: bind` / Port 8080 in use
- **Cause**: Another service is running on port 8080.
- **Solution**: Stop the service running on 8080 or change the port by setting `SERVER_PORT=8081` in your environment variables and updating the frontend `VITE_API_BASE_URL` to `http://localhost:8081/api`.

### 3. `CORS Error: Blocked by CORS Policy`
- **Cause**: The frontend origin is not allowed by the backend security configuration.
- **Solution**: Check the CorsConfig class (`backend/src/main/java/com/easeshop/config/CorsConfig.java`). Ensure the origin `http://localhost:5173` (or your Vite dev server port) is allowed.

### 4. `JWT Secret must be at least 256 bits long`
- **Cause**: The provided `JWT_SECRET` is too short.
- **Solution**: Use a longer secret key in your environment variables (at least 32 characters/bytes long).
