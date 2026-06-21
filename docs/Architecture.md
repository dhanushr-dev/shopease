# ShopEase — System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend — React 18 + Vite"
        A[React App] --> B[React Router v6]
        B --> C[Pages]
        B --> D[Components]
        C --> E[Auth Context]
        C --> F[Cart Context]
        E --> G[API Service — Axios]
        F --> G
    end

    subgraph "Backend — Spring Boot 3.3.5"
        G -->|REST API| H[Controllers]
        H --> I[Service Layer]
        I --> J[Repository Layer]
        H --> K[Security Filter Chain]
        K --> L[JWT Filter]
        L --> M[JWT Utility]
        K --> N[UserDetailsService]
        I --> O["Global Exception Handler"]
    end

    subgraph "Database"
        J -->|JPA / Hibernate| P[("PostgreSQL (Neon)")]
    end

    subgraph "External Services"
        I --> Q[Razorpay — Payments]
        I --> R[Gmail SMTP — Email]
    end

    style A fill:#61dafb,stroke:#333,color:#000
    style H fill:#6db33f,stroke:#333,color:#fff
    style P fill:#4169e1,stroke:#333,color:#fff
    style Q fill:#0c2451,stroke:#333,color:#fff
```

## Layered Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        A[Browser]
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
        L[("PostgreSQL")]
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

## Deployment Architecture

```mermaid
graph LR
    subgraph "Render — Free Tier"
        A["Docker Container<br/>(Spring Boot + React)"]
    end

    subgraph "Neon — Free Tier"
        B[("PostgreSQL<br/>Serverless")]
    end

    subgraph "External"
        C[Razorpay API]
    end

    User[🌐 Browser] --> A
    A -->|JDBC + SSL| B
    A -->|HTTPS| C
```

## API Layer Summary

| Layer | Responsibility | Technologies |
|-------|---------------|-------------|
| Controller | HTTP request handling, input validation | Spring MVC, Bean Validation |
| Service | Business logic, transactions | Spring Service, `@Transactional` |
| Repository | Data access, custom queries | Spring Data JPA, JPQL, JOIN FETCH |
| Security | Authentication & authorization | Spring Security, JWT (HS256) |
| Exception | Centralized error handling | `@ControllerAdvice`, `@ExceptionHandler` |
| DTO | Data transfer objects | Request/Response DTOs, DtoMapper |
| Entity | Database mapping | JPA, Hibernate 6, Lombok |
