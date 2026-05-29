# ShopEase System Architecture

## Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - React.js"
        A[React App - Vite] --> B[React Router v6]
        B --> C[Pages]
        B --> D[Components]
        C --> E[Auth Context]
        C --> F[Cart Context]
        E --> G[API Service - Axios]
        F --> G
    end

    subgraph "Backend - Spring Boot"
        G -->|REST API| H[Controllers]
        H --> I[Service Layer]
        I --> J[Repository Layer]
        H --> K[Security Filter Chain]
        K --> L[JWT Filter]
        L --> M[JWT Utility]
        K --> N[Custom UserDetailsService]
        I --> O[Global Exception Handler]
    end

    subgraph "Database"
        J -->|JPA/Hibernate| P[(MySQL 8)]
    end

    subgraph "External Services"
        I --> Q[Cloudinary - Image Upload]
        I --> R[Gmail SMTP - Email]
        I --> S[Razorpay - Payment]
    end

    subgraph "Deployment"
        T[Vercel - Frontend]
        U[Render/Railway - Backend]
        V[Railway/Aiven - MySQL]
        W[Cloudinary CDN]
    end

    style A fill:#61dafb,stroke:#333,color:#000
    style H fill:#6db33f,stroke:#333,color:#fff
    style P fill:#4479a1,stroke:#333,color:#fff
    style Q fill:#f5a623,stroke:#333,color:#000
```

## Layer Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        A[Browser/Mobile]
    end

    subgraph "Presentation Layer"
        B[REST Controllers]
        C[DTO Request/Response]
    end

    subgraph "Business Layer"
        D[Service Interfaces]
        E[Service Implementations]
        F[Bean Validation]
    end

    subgraph "Security Layer"
        G[Security Config]
        H[JWT Authentication]
        I[Role-Based Access]
    end

    subgraph "Data Access Layer"
        J[JPA Repositories]
        K[Entity Classes]
    end

    subgraph "Database Layer"
        L[(MySQL)]
    end

    A --> B
    B --> D
    D --> E
    E --> J
    J --> L
    B -.-> G
    G -.-> H
    H -.-> I
```

## API Architecture

| Layer | Responsibility | Technologies |
|---|---|---|
| Controller | Handle HTTP requests, validate input | Spring MVC, Bean Validation |
| Service | Business logic, transaction management | Spring Service, @Transactional |
| Repository | Data access, queries | Spring Data JPA, JPQL |
| Security | Authentication, authorization | Spring Security, JWT |
| Exception | Error handling | @ControllerAdvice |
| DTO | Data transfer | Request/Response DTOs |
| Entity | Database mapping | JPA, Hibernate, Lombok |
