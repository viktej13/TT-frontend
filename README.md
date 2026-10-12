# Smart Campus Service Management System (SCSMS)

A full-stack enterprise campus facility and service management application built with **React (Vite, JavaScript, CSS)** and **Spring Boot 3.3.4 (Java 17)**, featuring **PostgreSQL** persistence, **Spring Security 6** role-based authentication with credentialed CORS & CSRF protection, and **Render** cloud deployment readiness.

---

## 🌟 Key Features

1. **Modern React Frontend (Vite, ES6, Modular Components)**:
   - **Component Architecture**: Built inside `frontend/` using Vite, React 18, and modular reusable components (`Header`, `Sidebar`, `Toast`, `AuthModal`, `StatusBadge`, `PriorityBadge`, `RequestDetailsModal`, `StatusUpdateModal`, `DeleteConfirmModal`, `SuccessModal`).
   - **State & Auth Management**: Unified `AuthContext` managing authentication state, session initialization, login, registration, and logout.
   - **Configurable API Layer**: `services/api.js` connects via `VITE_API_BASE_URL` with credentials (`include`), CSRF token extraction (`X-XSRF-TOKEN`), and error handling.
   - **Responsive Design**: Professional layout featuring collapsible mobile navigation drawer, live system clock, statistical cards, data tables, and modal dialogs.

2. **Enterprise Authentication & Session Security**:
   - **Student Self-Registration**: Public registration automatically assigns `ROLE_STUDENT` with BCrypt password hashing ($2a$). Validates unique email and student ID.
   - **Secure Administrator Provisioning**: The first administrator account (`ROLE_ADMIN`) is initialized safely via environment variables (`APP_ADMIN_PASSWORD` / `APP_ADMIN_EMAIL`) or a secure one-time generated console token on startup without hardcoding passwords. Public registration never allows creating admin accounts.
   - **Session-Based Authentication & CSRF Protection**: Spring Security session management with `CookieCsrfTokenRepository` (`XSRF-TOKEN` cookie and `X-XSRF-TOKEN` request header).
   - **Credentialed Cross-Origin CORS**: Configured in `SecurityConfig` and `WebConfig` using `CorsConfigurationSource` with `allowCredentials(true)` and specific origin patterns, supporting separate frontend domains on Render without insecure wildcards.

3. **Role-Based Access Control (RBAC)**:
   - **Students**: Can submit service requests, track their own requests by unique tracking ID, and view only their own submitted requests (backend enforcement prevents inspecting other students' tickets). Form auto-fills student details upon login.
   - **Administrators**: Can inspect all campus tickets, update ticket statuses (`Pending`, `In Progress`, `Resolved`), append official technician/admin notes, and permanently delete tickets.
   - **Role-Aware UI**: Automatically toggles navigation options, pre-fills student profile fields, displays active user badges, and provides secure session logout.

4. **Facility & Service Request Management**:
   - Unique, human-friendly tracking code generation (e.g. `REQ-20261012-4821`).
   - Categorized by Electrical, Plumbing, Wi-Fi, Classroom Maintenance, Laboratory Equipment, and Other.
   - Urgency priority selector (Low, Medium, High, Urgent).
   - Real-time resolution stepper: `Submitted (Pending)` ➔ `In Progress` ➔ `Resolved`.

5. **Live Dashboard & Metrics**:
   - Real-time counters: Total requests, Pending review, In Progress, and Resolved.
   - Interactive category distribution breakdown with percentage progress indicators.
   - Recent requests quick inspection table.

6. **Cloud Deployment & PostgreSQL Architecture**:
   - Migration from MySQL to PostgreSQL.
   - Automatic `DATABASE_URL` parser converting Render's connection URI format (`postgres://...` / `postgresql://...`) into HikariCP JDBC connections.
   - Dynamic port binding via `${PORT:8080}`.
   - Built-in health check endpoints (`/actuator/health` and `/api/health`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), Modern CSS (Variables, Grid/Flexbox) |
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA (Hibernate 6), Spring Boot Validation, Spring Boot Actuator |
| **Database** | PostgreSQL 15+ (Production/Local), H2 in PostgreSQL compatibility mode (Automated Tests/Demo) |
| **Security** | BCrypt Password Hashing, HTTP Sessions, Cookie-based CSRF protection (`CookieCsrfTokenRepository.withHttpOnlyFalse()`), Credentialed CORS |
| **Build & Deploy**| Vite (`npm run build`), Apache Maven 3.9+ (`mvn clean package`), Render Blueprint (`render.yaml`) |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│             React Frontend (Vite / Single-Page App)          │
│  - App.jsx (Routing, Global Modals, Toast Container)         │
│  - AuthContext.jsx (Session state, Login/Register/Logout)    │
│  - views/ (Dashboard, SubmitRequest, Track, AllRequests, ...)│
│  - components/ (Header, Sidebar, Modals, Badges, Toasts)     │
│  - services/api.js (VITE_API_BASE_URL, CSRF, Credentials)    │
└──────────────────────────────▲───────────────────────────────┘
                               │ HTTPS / JSON (Credentials + CSRF)
┌──────────────────────────────▼───────────────────────────────┐
│              Spring Security 6 & REST Controller Layer       │
│  - SecurityConfig (BCrypt, CsrfCookieFilter, CorsSource)     │
│  - AuthController (/api/auth/register, /login, /me, /logout) │
│  - ServiceRequestController (Student & Admin REST endpoints) │
│  - DashboardController (/api/dashboard/stats, /api/health)   │
│  - GlobalExceptionHandler (401, 403, 404, 400 Handler)       │
└──────────────────────────────▲───────────────────────────────┘
                               │ DTOs (Data Transfer Objects)
┌──────────────────────────────▼───────────────────────────────┐
│                    Business Service Layer                    │
│  - AuthService & AuthServiceImpl                             │
│  - ServiceRequestService & ServiceRequestServiceImpl         │
│  - CustomUserDetailsService (Loads user by email)            │
└──────────────────────────────▲───────────────────────────────┘
                               │ JPA Entities (User, ServiceRequest)
┌──────────────────────────────▼───────────────────────────────┐
│               Repository & Persistence Layer                 │
│  - UserRepository (Student/Admin credentials & queries)      │
│  - ServiceRequestRepository (Student-scoped & admin queries) │
│  - DatabaseConfig (HikariCP pool & DATABASE_URL parser)      │
└──────────────────────────────▲───────────────────────────────┘
                               │ PostgreSQL JDBC Driver (42.7.4)
┌──────────────────────────────▼───────────────────────────────┐
│                       PostgreSQL Database                    │
│  - Render Managed PostgreSQL / Local PostgreSQL 15+          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 React Frontend Structure (`frontend/`)

```
frontend/
├── index.html                 # HTML entry with Inter typography
├── package.json               # Dependencies (React 18, Vite 5)
├── vite.config.js             # Vite config with dev proxy to http://localhost:8080
├── .env                       # Local environment defaults
├── .env.production            # Production environment configuration
└── src/
    ├── main.jsx               # React DOM entry point mounting AuthProvider
    ├── App.jsx                # Core layout, view switching, toasts, modal manager
    ├── index.css              # Modern CSS theme and responsive rules
    ├── context/
    │   └── AuthContext.jsx    # Authentication context, session hook (useAuth)
    ├── services/
    │   └── api.js             # Reusable API service handling CSRF and credentials
    ├── components/
    │   ├── Header.jsx         # Header with live clock and user profile badge
    │   ├── Sidebar.jsx        # Navigation sidebar with role-aware admin links
    │   ├── StatusBadge.jsx    # Status and priority badges
    │   ├── Toast.jsx          # Toast alert notifications
    │   ├── AuthModal.jsx      # Modal with Sign In and Student Registration tabs
    │   ├── RequestDetailsModal.jsx # Detailed ticket view modal
    │   ├── StatusUpdateModal.jsx   # Admin status update modal
    │   ├── DeleteConfirmModal.jsx  # Admin deletion confirmation modal
    │   └── SuccessModal.jsx   # Post-submission modal with Copy/Track shortcuts
    └── views/
        ├── DashboardView.jsx  # Metrics cards, category breakdown, recent tickets
        ├── SubmitRequestView.jsx # Ticket creation form with live counter
        ├── TrackRequestView.jsx  # Search bar with 3-node resolution stepper
        ├── AllRequestsView.jsx   # Filter tabs, category dropdown, search table
        └── AdminView.jsx      # Admin table with status update and delete actions
```

---

## ☁️ Deploying to Render

The repository includes a ready-to-use Render Blueprint ([render.yaml](file:///c:/Users/DELL/Documents/SCSMS/render.yaml)) defining all 3 required components:

### 1. Spring Boot Web Service (`scsms-backend`)
- **Type**: Web Service
- **Environment**: `Java` (or `Docker` using included `Dockerfile`)
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/scsms-1.0.0.jar`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  | Key | Value | Description |
  |---|---|---|
  | `DATABASE_URL` | From `scsms-postgres.connectionString` | Cloud PostgreSQL URI |
  | `APP_ADMIN_EMAIL` | `admin@campus.edu` | Initial admin account email |
  | `APP_ADMIN_PASSWORD` | *(Generated automatically)* | Initial admin account password |
  | `APP_CORS_ALLOWED_ORIGINS` | `https://scsms-frontend.onrender.com,http://localhost:5173` | Explicit allowed frontend origins |
  | `SESSION_COOKIE_SAME_SITE` | `None` | Cross-site cookie support |
  | `SESSION_COOKIE_SECURE` | `true` | Secure HTTPS cookie flag |

### 2. React Vite Static Site (`scsms-frontend`)
- **Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Routes / SPA Rewrite**:
  - Type: `rewrite`
  - Source: `/*`
  - Destination: `/index.html`
- **Environment Variables**:
  | Key | Value | Description |
  |---|---|---|
  | `VITE_API_BASE_URL` | `https://scsms-backend.onrender.com` | Target backend REST URL |

### 3. Managed PostgreSQL Database (`scsms-postgres`)
- **Database Name**: `scsms_db`
- **User**: `scsms_user`
- **Plan**: `free`

---

## 🚀 Running Locally

### Step 1: Run the Backend (Spring Boot)
Option A: With local PostgreSQL (ensure database `smart_campus_db` exists):
```powershell
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_postgres_password"
mvn spring-boot:run
```

Option B: Standalone Demo Mode (H2 in PostgreSQL mode, no DB server required):
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
or run with packaged JAR:
```powershell
java -jar target/scsms-1.0.0.jar --spring.profiles.active=h2
```

### Step 2: Run the React Frontend (Vite)
Open a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser. Vite automatically proxies `/api` calls to `http://localhost:8080`.

### Step 3: Production Build
```powershell
# Build React frontend
cd frontend
npm run build

# Build Spring Boot deployable JAR
cd ..
mvn package -DskipTests
```

---

## 🧪 Verification & Automated Tests

Run the full backend test suite:
```powershell
mvn clean test
```

### Verified Test Results:
- **`AuthSecurityTest`**: 9 tests passed (Registration, duplicate checking, BCrypt password hashing, session login/logout, 401 unauthorized protection, 403 student forbidden checks on admin status updates and deletions, admin status updates and deletions, health check).
- **`ServiceRequestControllerTest`**: 4 tests passed (REST controller endpoints, validation error constraints, dashboard statistics).
- **`ServiceRequestServiceTest`**: 7 tests passed (Core business logic, unique ID generation, student scoping, category filters, and status stepper transitions).
- **`ScsmsApplicationTests`**: 1 test passed (Spring Boot context bootstrap).

**Total**: 21/21 tests passed (0 failures, 0 errors).
**React Production Build**: `npm run build` compiled 47 modules into `frontend/dist` in 2.78s without errors.
