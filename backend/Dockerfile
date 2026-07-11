# --- build stage ---
FROM gradle:9.6.1-jdk25 AS build
WORKDIR /build
COPY settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
COPY gradlew ./
# Pre-resolve dependencies for better layer caching.
RUN gradle --no-daemon dependencies --configuration runtimeClasspath > /dev/null 2>&1 || true
COPY src ./src
RUN gradle --no-daemon clean bootJar -x test

# --- runtime stage ---
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /build/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
