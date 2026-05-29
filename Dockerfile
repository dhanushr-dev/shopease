# ========================
# ShopEase — Unified Docker Build (Backend + Frontend)
# ========================
# Builds React frontend, bundles it into Spring Boot JAR,
# and runs as a single service.

# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --production=false
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Build Backend (with frontend bundled) ----
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app

# Copy frontend build output first
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Cache Maven dependencies
COPY backend/pom.xml ./backend/
WORKDIR /app/backend
RUN mvn dependency:go-offline -B

# Copy backend source and build JAR (skip frontend-maven-plugin since we already built it)
COPY backend/src ./src
RUN mvn package -DskipTests -B -Dskip.npm -Dskip.npx -Dskip.installnodenpm

# ---- Stage 3: Run ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=backend-build /app/backend/target/*.jar app.jar

# Set ownership
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

# JVM tuning for containers (Render free tier has 512MB RAM)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
