# Smart Campus Service Management System (SCSMS)

A full-stack enterprise campus service management web application built from scratch with **Spring Boot** (REST API & backend service) and **Vanilla JavaScript / Modern CSS / HTML5** (responsive client frontend), backed by **MySQL**.

---

## 🌟 Key Features

1. **Service Request Dashboard**:
   - Live metrics: Total requests, Pending, In Progress, and Resolved counts.
   - Dynamic campus category breakdown (Electrical, Plumbing, Wi-Fi, Classroom Maintenance, Laboratory Equipment, Other).
   - Recent requests quick inspection table.

2. **Service Request Submission**:
   - Student submission form with client & server-side validation.
   - Fields: Student Full Name, Student ID / Roll No, Department, Category, Location / Room, Priority (Low, Medium, High, Urgent), and Problem Description.
   - Automatically generates a unique, human-friendly tracking code (e.g. `REQ-20261011-4821`).
   - One-click copy and instant tracking shortcuts upon submission.

3. **Request Tracking & Lifecycle Stepper**:
   - Real-time status lookup using tracking code.
   - Visual 3-node progress stepper: `Submitted (Pending)` ➔ `In Progress` ➔ `Resolved`.
   - Comprehensive request details display including timestamps and administrator remarks.

4. **Administrator Portal**:
   - Manage campus tickets.
   - Update request status (`Pending`, `In Progress`, `Resolved`) with technician remarks.
   - Delete requests with safety confirmation modal.
   - Filter by status and service category.

5. **Modern Responsive UI**:
   - Collapsible mobile navigation drawer.
   - Interactive modal dialogues for viewing, updating, and confirming deletions.
   - Live system clock and toast notification system.
   - Single unified port: Frontend is served directly by the Spring Boot server (`http://localhost:8080`).

---

## 🛠️ Technology Stack

- **Backend**: Java 17+, Spring Boot 3.3.4, Spring Web (REST API), Spring Data JPA (Hibernate), Spring Boot Validation (Hibernate Validator)
- **Frontend**: HTML5, Modern CSS (Custom properties, Flexbox/Grid, Responsive), Vanilla JavaScript (Modular ES6 `api.js` & `app.js`)
- **Database**: MySQL 8.0+ (with H2 in-memory profile for automated tests)
- **Build Tool**: Apache Maven 3.9+

---

## 🏗️ System Architecture

The project follows a clean **layered architecture** pattern with strict separation of concerns:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Client Browser)                │
│  - index.html (Responsive Dashboard & Modals)          │
│  - styles.css (Modern CSS, Variables, Grid/Flexbox)    │
│  - api.js (Fetch wrapper for REST endpoints)           │
│  - app.js (State management, reactive UI, validations) │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP JSON / REST
┌───────────────────────────▼────────────────────────────┐
│                    Controller Layer                    │
│  - ServiceRequestController (@RestController)          │
│  - DashboardController (@RestController)               │
│  - GlobalExceptionHandler (@RestControllerAdvice)      │
└───────────────────────────▲────────────────────────────┘
                            │ DTOs (Data Transfer Objects)
┌───────────────────────────▼────────────────────────────┐
│                     Service Layer                      │
│  - ServiceRequestService (Interface)                   │
│  - ServiceRequestServiceImpl (Business logic & IDs)    │
└───────────────────────────▲────────────────────────────┘
                            │ Entity Models
┌───────────────────────────▼────────────────────────────┐
│                   Repository Layer                     │
│  - ServiceRequestRepository (Spring Data JPA)          │
└───────────────────────────▲────────────────────────────┘
                            │ JDBC / Hibernate ORM
┌───────────────────────────▼────────────────────────────┐
│                    Database Layer                      │
│  - MySQL Database (`smart_campus_db`)                  │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ MySQL Database Setup & Configuration

### 1. Start MySQL Server
Ensure your local MySQL service is running (default port `3306`).

### 2. Create the Database (Optional)
The application connects with `createDatabaseIfNotExist=true`, but you can also manually create it using the MySQL client:
```sql
CREATE DATABASE IF NOT EXISTS smart_campus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Credentials in `application.properties`
Open `src/main/resources/application.properties`:
```properties
# MySQL Connection URL
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/smart_campus_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}

# Set your MySQL username and password below:
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:your_mysql_password}

# Hibernate DDL Auto (creates and updates tables automatically)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> **Tip:** You can either update `spring.datasource.password` directly in the file or set an environment variable before running:
> ```powershell
> $env:SPRING_DATASOURCE_PASSWORD="your_actual_password"
> ```

---

## 🚀 Running the Application

### Option 1: Run with Maven Plugin (Recommended during development)
Run the following command from the project root (`c:\Users\DELL\Documents\SCSMS`):
```powershell
mvn spring-boot:run
```
To supply your MySQL credentials directly in the command:
```powershell
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.username=root --spring.datasource.password=your_password"
```

### Option 2: Build and Run the Packaged JAR
1. Build the executable JAR:
```powershell
mvn clean package
```
2. Run the JAR:
```powershell
java -jar target/scsms-1.0.0.jar --spring.datasource.username=root --spring.datasource.password=your_password
```

### Option 3: Run with H2 In-Memory Database (No MySQL required)
If you want to test the application instantly without connecting to MySQL:
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:8080
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/requests` | Submit a new service request |
| `GET` | `/api/requests` | Retrieve all requests (supports `status`, `category`, `search`) |
| `GET` | `/api/requests/{id}` | Get request details by database ID |
| `GET` | `/api/requests/track/{requestId}` | Track request by unique tracking ID |
| `PUT` | `/api/requests/{id}/status` | Update request status and admin notes |
| `DELETE` | `/api/requests/{id}` | Permanently delete a service request |
| `GET` | `/api/requests/stats` | Retrieve dashboard counters and category stats |
| `GET` | `/api/dashboard/stats` | Alias endpoint for dashboard analytics |

### Sample Payload: Submit Request (`POST /api/requests`)
```json
{
  "studentName": "Alex Morgan",
  "studentId": "STU-2024-1049",
  "department": "Computer Science & Engineering",
  "serviceCategory": "Wi-Fi",
  "location": "Engineering Block B, Lab 302",
  "priority": "HIGH",
  "description": "Wi-Fi access point in Lab 302 drops connection every 5 minutes during lab sessions."
}
```

### Sample Response (`201 Created`)
```json
{
  "success": true,
  "message": "Service request submitted successfully with ID: REQ-20261011-8421",
  "data": {
    "id": 1,
    "requestId": "REQ-20261011-8421",
    "studentName": "Alex Morgan",
    "studentId": "STU-2024-1049",
    "department": "Computer Science & Engineering",
    "serviceCategory": "WIFI",
    "categoryDisplayName": "Wi-Fi",
    "description": "Wi-Fi access point in Lab 302 drops connection every 5 minutes during lab sessions.",
    "priority": "HIGH",
    "priorityDisplayName": "High",
    "status": "PENDING",
    "statusDisplayName": "Pending",
    "location": "Engineering Block B, Lab 302",
    "adminNotes": null,
    "createdAt": "2026-10-11T14:40:00",
    "updatedAt": "2026-10-11T14:40:00"
  },
  "timestamp": "2026-10-11T14:40:00.123"
}
```

---

## 🧪 Running Automated Tests

Run the full suite of unit and integration tests using:
```powershell
mvn test
```
The test suite validates:
- Spring Boot Application Context initialization
- Service layer business logic & automatic tracking ID generation
- Status update workflow & timestamp handling
- Deletion verification
- Centralized exception mapping
- REST Controller MockMvc endpoints & validation constraints
