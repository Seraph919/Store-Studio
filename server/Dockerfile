# Stage 1: Building
FROM maven:3.9-eclipse-temurin-21 AS build


WORKDIR /app

COPY  pom.xml .
COPY  src ./src

# for now
RUN mvn clean package -DskipTests


# ========================================================
#                STAGE 2: Runtime Stage
# ========================================================

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -g 10001 appgroup && \
    adduser -u 10001 -G appgroup -h /home/appuser -D appuser


WORKDIR /app

COPY --from=build --chown=10001:10001 /app/target/*.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]