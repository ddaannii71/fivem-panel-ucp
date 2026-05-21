# ETAPA 1: Construcción (Compilar el código)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilamos el proyecto ignorando los tests para ir más rápido
RUN mvn clean package -DskipTests

# ETAPA 2: Ejecución (Levantar el servidor)
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copiamos el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
# Comando para arrancar Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
