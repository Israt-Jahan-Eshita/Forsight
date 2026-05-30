# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Make maven wrapper executable and build the application
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run the spring boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
