# MockBridge

MockBridge is a microservices-based mock interview platform where users can register, create profiles, publish interview slots, book interviews, confirm sessions, join live interview rooms, and communicate through chat.

This project contains:

- **Frontend**: React + Vite + Redux Toolkit
- **API Gateway**: Spring Cloud Gateway
- **Auth Service**: Spring Boot + JWT + PostgreSQL
- **User Service**: Spring Boot + PostgreSQL
- **Interview Service**: Spring Boot + PostgreSQL
- **Chat Service**: Spring Boot
- **Infrastructure**: PostgreSQL via Docker Compose
- **Live session integration**: Jitsi Meet

---

## Tech Stack

### Frontend
- React 19
- Vite
- Redux Toolkit
- React Router DOM
- Axios

### Backend
- Java 21
- Spring Boot 3.2.5
- Spring Security
- Spring Cloud Gateway
- Spring Data JPA
- Flyway
- PostgreSQL

---

## High-Level Architecture

```text
Frontend (React)
      |
      v
API Gateway (8082)
      |
      +--> Auth Service (8081)
      +--> User Service (8083)
      +--> Interview Service (8084)
      +--> Chat Service (8085)
