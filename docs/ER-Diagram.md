# ShopEase ER Diagram

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        enum role
        varchar phone
        datetime created_at
        datetime updated_at
    }

    CATEGORIES {
        bigint id PK
        varchar name UK
        varchar description
        varchar image_url
        datetime created_at
    }

    PRODUCTS {
        bigint id PK
        varchar name
        varchar description
        decimal price
        int stock
        varchar image_url
        varchar brand
        boolean active
        bigint category_id FK
        datetime created_at
        datetime updated_at
    }

    CARTS {
        bigint id PK
        bigint user_id FK UK
        datetime created_at
    }

    CART_ITEMS {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        int quantity
    }

    ORDERS {
        bigint id PK
        varchar order_number UK
        bigint user_id FK
        decimal total_amount
        enum status
        bigint shipping_address_id FK
        varchar payment_id
        varchar payment_status
        varchar notes
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal price
        varchar product_name
        varchar product_image_url
    }

    ADDRESSES {
        bigint id PK
        bigint user_id FK
        varchar full_name
        varchar phone_number
        varchar address_line_1
        varchar address_line_2
        varchar city
        varchar state
        varchar postal_code
        varchar country
        boolean is_default
        datetime created_at
    }

    USERS ||--o| CARTS : "has one"
    USERS ||--o{ ADDRESSES : "has many"
    USERS ||--o{ ORDERS : "places"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    CARTS ||--o{ CART_ITEMS : "contains"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    ADDRESSES ||--o{ ORDERS : "ships to"
```

## Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| User → Cart | One-to-One | Each user has exactly one shopping cart |
| User → Address | One-to-Many | A user can have multiple delivery addresses |
| User → Order | One-to-Many | A user can place multiple orders |
| Category → Product | One-to-Many | Each category contains multiple products |
| Cart → CartItem | One-to-Many | A cart contains multiple cart items |
| Product → CartItem | One-to-Many | A product can appear in multiple carts |
| Order → OrderItem | One-to-Many | An order contains multiple order items |
| Product → OrderItem | One-to-Many | A product can appear in multiple orders |
| Address → Order | One-to-Many | An address can be used for multiple orders |
