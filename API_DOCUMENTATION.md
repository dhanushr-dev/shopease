# ShopEase — API Documentation

This document outlines the API endpoints exposed by the ShopEase Spring Boot backend. All requests should be prefixed with `/api` (e.g. `http://localhost:8080/api`).

Secured endpoints require a JWT token passed in the `Authorization` header as:
`Authorization: Bearer <your_jwt_token>`

---

## 🔐 Authentication Endpoints

### 1. Register a User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password@123",
    "phone": "9876543210"
  }
  ```
- **Response** (`201 Created`): Returns user details and registration message.

### 2. Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password@123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ROLE_USER",
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
  ```

---

## 🛍️ Product Endpoints

### 1. Get All Products
- **URL**: `/products`
- **Method**: `GET`
- **Query Params**: `page` (default 0), `size` (default 10), `sortBy` (default `id`), `sortDir` (default `asc`)
- **Response**: Paged list of active products.

### 2. Get Product by ID
- **URL**: `/products/{id}`
- **Method**: `GET`

### 3. Search Products
- **URL**: `/products/search`
- **Method**: `GET`
- **Query Params**: `keyword` (e.g. `/products/search?keyword=sneaker`)

### 4. Get Products by Category
- **URL**: `/products/category/{categoryId}`
- **Method**: `GET`

---

## 🛒 Cart Endpoints (Secured)

### 1. Retrieve User Cart
- **URL**: `/cart`
- **Method**: `GET`

### 2. Add Item to Cart
- **URL**: `/cart/items`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "productId": 12,
    "quantity": 1,
    "selectedVariant": "M"
  }
  ```

### 3. Update Cart Item Quantity
- **URL**: `/cart/items/{itemId}`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "quantity": 3
  }
  ```

### 4. Remove Item from Cart
- **URL**: `/cart/items/{itemId}`
- **Method**: `DELETE`

### 5. Clear Cart
- **URL**: `/cart`
- **Method**: `DELETE`

---

## 📦 Order Endpoints (Secured)

### 1. Place Order
- **URL**: `/orders`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "addressId": 1,
    "paymentMethod": "COD",
    "notes": "Please deliver after 5 PM"
  }
  ```

### 2. Get User Orders
- **URL**: `/orders`
- **Method**: `GET`

### 3. Cancel Order
- **URL**: `/orders/{id}/cancel`
- **Method**: `PUT`

### 4. Request Order Return
- **URL**: `/orders/{id}/return`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "reason": "Wrong size delivered"
  }
  ```

### 5. Get Order Invoice
- **URL**: `/orders/{id}/invoice`
- **Method**: `GET`
- **Response**: Details representing receipt data (e.g. order number, itemized totals).

---

## 🏷️ Coupon Endpoints (Secured)

### 1. Apply Coupon Code
- **URL**: `/coupons/apply`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "couponCode": "SAVE50",
    "cartTotal": 500.00
  }
  ```
- **Response**: Discount amount and final cart calculation.

### 2. Get Active Coupons
- **URL**: `/coupons/active`
- **Method**: `GET`

---

## 👑 Admin Endpoints (Secured — Admin Only)

### 1. Get Dashboard Analytics
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Response**: Analytics summary (totals of users, products, orders, and revenue).

### 2. Create Product
- **URL**: `/admin/products`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Leather Chelsea Boots",
    "description": "Premium brown leather boots",
    "price": 4999.00,
    "stock": 15,
    "categoryId": 4,
    "brand": "Clarks",
    "imageUrl": "https://images.unsplash.com/..."
  }
  ```

### 3. Update Product
- **URL**: `/admin/products/{id}`
- **Method**: `PUT`

### 4. Delete Product (Soft Delete)
- **URL**: `/admin/products/{id}`
- **Method**: `DELETE`

### 5. Create Category
- **URL**: `/admin/categories`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Accessories",
    "description": "Belts, wallets and styling items",
    "imageUrl": ""
  }
  ```

### 6. Update Order Status
- **URL**: `/admin/orders/{id}/status`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "status": "SHIPPED",
    "message": "Order packed and shipped via BlueDart"
  }
  ```
