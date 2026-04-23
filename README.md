# Wasel Palestine
## Smart Mobility & Checkpoint Intelligence Platform

> An API-centric backend system designed to support Palestinians in navigating daily movement challenges by providing structured, reliable, and up-to-date mobility intelligence.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Team Members](#team-members)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [External API Integrations](#external-api-integrations)
- [API Design Rationale](#api-design-rationale)
- [Docker Deployment](#docker-deployment)
- [Performance Testing](#performance-testing)
- [Documentation](#documentation)

---

## Project Overview

Wasel Palestine is a backend REST API platform built to aggregate and expose mobility intelligence for Palestinian users. The system centralizes data related to road conditions, checkpoints, traffic incidents, and environmental factors, making it accessible through a well-structured API consumed by mobile applications, web dashboards, or third-party systems.

The platform is focused exclusively on backend engineering concerns including API design, data modeling, external data integration, performance optimization, and system reliability.

### Problem Statement

Palestinians face daily mobility challenges caused by military checkpoints, road closures, and unpredictable traffic conditions. There is no centralized, reliable system that aggregates real-time mobility intelligence and makes it accessible through a structured API.

### Solution

Wasel Palestine addresses this gap by providing:

- A centralized registry of checkpoints with real-time status tracking
- A crowdsourced incident reporting system with community verification
- Intelligent route estimation between any two locations
- Real-time weather data integration for environmental context
- An event-driven alert and notification system

---

## Team Members

| Name | Role | GitHub |
|------|------|--------|
| Manar Nofal | Backend Developer | [@manarnofal2004](https://github.com/manarnofal2004) |
| Zainab Hashem | Backend Developer | [@zainab-hashem](https://github.com/zainab-hashem) |
| Dina Hanna | Backend Developer | [@diiinahanna2004](https://github.com/diiinahanna2004) |
| Rama Yaseen | Backend Developer | [@ramayaseen498-ai](https://github.com/ramayaseen498-ai) |

---

## Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Runtime | Node.js v18+ | Non-blocking I/O, high concurrency |
| Framework | Express.js | Lightweight, flexible, widely adopted |
| Database | MySQL 8.0 | Relational integrity, ACID compliance |
| ORM | Sequelize | Abstraction layer over raw SQL |
| Authentication | JWT (Access + Refresh Tokens) | Stateless, scalable authentication |
| Deployment | Docker + Docker Compose | Reproducible, containerized environments |
| External APIs | OpenWeatherMap, OpenStreetMap | Real-world data enrichment |
| GraphQL | Apollo Server | Flexible read-only querying (bonus) |
| Load Testing | k6 | Performance and reliability validation |

---

## System Architecture

![System Architecture](https://github.com/user-attachments/assets/db085641-38db-458c-a7b9-b303d0d3e8d3)

The system follows a three-tier architecture:

- **Client Layer** — Mobile applications, admin dashboards, and third-party systems communicate via versioned REST APIs over HTTPS
- **Backend Services Layer** — Express.js server handles business logic, authentication, crowdsourcing, and alert management, backed by a MySQL database with connection pooling
- **External API Integration Layer** — OpenStreetMap for route estimation and OpenWeatherMap for contextual weather data

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MySQL 8.0
- Docker and Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/zainab-hashem/ASWE.git
cd ASWE

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
JWT_SECRET=secretkey
REFRESH_TOKEN_SECRET=refreshsecretkey
WEATHER_API_KEY=your_openweathermap_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=wasel_project
```

> **Note:** Never commit the `.env` file to version control. It is listed in `.gitignore`.

### Running the Application

**Local Development:**
```bash
node server.js
```

**Docker Deployment:**
```bash
docker-compose up --build
```

---

## Project Structure

```
api-project/
├── src/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── checkpointController.js
│   │   ├── incidentController.js
│   │   ├── reportController.js
│   │   ├── alertController.js
│   │   ├── subscriptionController.js
│   │   ├── mobilityController.js
│   │   └── weatherController.js
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification
│   │   └── authorizeRoles.js         # Role-based access control
│   ├── models/
│   │   ├── index.js                  # Sequelize instance
│   │   ├── User.js
│   │   ├── Checkpoint.js
│   │   └── Incident.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── checkpointRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── mobilityRoutes.js
│   │   └── weatherRoutes.js
│   ├── graphql/
│   │   ├── schema.js
│   │   └── resolvers.js
│   └── services/
│       ├── NotificationService.js
│       └── weatherService.js
├── k6-tests/
│   ├── test1_read_heavy.js
│   ├── test2_write_heavy.js
│   ├── Test3_mixed.js
│   ├── test4_Spike.js
│   └── test5_soak.js
├── docs/
│   └── ERD.pdf
├── Dockerfile
├── docker-compose.yml
├── .env
├── .gitignore
└── server.js
```

---

## Database Schema

The system uses 11 relational tables:

| Table | Description |
|-------|-------------|
| `users` | System users with roles: admin, moderator, citizen |
| `checkpoints` | Checkpoint registry with geographic coordinates |
| `checkpoint_status_history` | Audit log of checkpoint status changes |
| `incidents` | Road incidents categorized by type and severity |
| `reports` | Crowdsourced citizen mobility reports |
| `report_votes` | Community upvote/downvote records per report |
| `report_status_history` | Audit log of report moderation actions |
| `comments` | User comments on reports |
| `subscriptions` | User alert subscriptions by area and incident type |
| `alerts` | Generated alert notifications for subscribed users |
| `refresh_tokens` | Stored JWT refresh tokens for session management |

For the full entity relationship diagram, see [docs/ERD.pdf](docs/ERD.pdf) or the [Database Schema Wiki page](https://github.com/zainab-hashem/ASWE/wiki/Database-Schema).

---

## API Reference

All endpoints are versioned under `/api/v1/`. Authentication is performed via JWT Bearer tokens.

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user account | No |
| POST | `/login` | Authenticate and receive access + refresh tokens | No |
| POST | `/refresh` | Exchange a refresh token for a new access token | No |
| POST | `/logout` | Revoke the current refresh token | No |

---

### Checkpoints — `/api/v1/checkpoints`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Retrieve all checkpoints with filtering, sorting, and pagination | No |
| GET | `/:id` | Retrieve a specific checkpoint and its full status history | No |
| POST | `/` | Register a new checkpoint | Admin / Moderator |
| PATCH | `/:id/status` | Update the operational status of a checkpoint | Admin / Moderator |

**Supported query parameters:**
```
GET /api/v1/checkpoints?area=نابلس
GET /api/v1/checkpoints?current_status=closed
GET /api/v1/checkpoints?page=1&limit=10&sort_by=name&order=ASC
```

---

### Incidents — `/api/v1/incidents`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Retrieve all incidents with filtering, sorting, and pagination | No |
| GET | `/:id` | Retrieve a specific incident | No |
| POST | `/` | Report a new incident | Admin / Moderator |
| PATCH | `/:id` | Update incident details | Admin / Moderator |
| PATCH | `/:id/status` | Verify or close an incident (triggers alerts) | Admin / Moderator |
| DELETE | `/:id` | Permanently delete an incident | Admin only |

**Supported query parameters:**
```
GET /api/v1/incidents?incident_type=closure
GET /api/v1/incidents?severity=high&status=verified
GET /api/v1/incidents?page=1&limit=10
```

---

### Reports — `/api/v1/reports`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Retrieve all reports | No |
| GET | `/:id` | Retrieve a specific report | No |
| POST | `/` | Submit a new report (includes duplicate detection) | Authenticated |
| POST | `/:id/vote` | Cast an upvote or downvote on a report | Authenticated |
| GET | `/:id/votes` | Retrieve vote counts and credibility score | No |
| PUT | `/:id/status` | Update report moderation status | Admin / Moderator |
| GET | `/:id/history` | Retrieve the full status change history | No |
| DELETE | `/:id` | Delete a report | Admin only |

**Supported query parameters:**
```
GET /api/v1/reports?category=closure
GET /api/v1/reports?status=pending
```

---

### Alerts — `/api/v1/alerts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Retrieve all alerts for the authenticated user | Authenticated |
| PUT | `/:id/read` | Mark a specific alert as read | Authenticated |

---

### Subscriptions — `/api/v1/subscriptions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Subscribe to alerts for a specific area and/or incident type | Authenticated |
| DELETE | `/` | Cancel an existing subscription | Authenticated |

**Subscription filter options:**
```json
{ "area": "نابلس", "incident_type": "closure" }
{ "area": null, "incident_type": "delay" }
{ "area": null, "incident_type": null }
```

---

### Mobility — `/api/v1/mobility`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/estimate-route` | Estimate route distance and duration between two points | No |

**Supported input formats:**
```
GET /api/v1/mobility/estimate-route?origin=Nablus, Palestine&destination=Ramallah, Palestine
GET /api/v1/mobility/estimate-route?origin=حاجز قلنديا&destination=حاجز حوارة
GET /api/v1/mobility/estimate-route?origin=An-Najah National University&destination=Al-Manara Square Ramallah
```

---

### Weather — `/api/v1/weather`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Retrieve current weather conditions for a city | No |
| GET | `/checkpoint/:id` | Retrieve weather at a specific checkpoint's location | No |
| GET | `/incident/:id` | Retrieve weather at a specific incident's location | No |

**Examples:**
```
GET /api/v1/weather?city=Nablus
GET /api/v1/weather/checkpoint/1
GET /api/v1/weather/incident/1
```

---

### GraphQL Interface (Bonus Feature)

**Endpoint:** `POST /graphql`

The system exposes a read-only GraphQL interface for flexible data querying.

**Example queries:**
```graphql
{ incidents { id title severity status area } }
{ incidents(severity: "critical") { id title area } }
{ checkpoints { id name area current_status } }
{ checkpoints(area: "نابلس") { id name current_status } }
{ reports { id title category status } }
{ incident(id: 1) { id title description severity status } }
{ checkpoint(id: 1) { id name area current_status } }
```

---

## External API Integrations

### OpenStreetMap / OSRM

| Property | Detail |
|----------|--------|
| Purpose | Route estimation and geolocation |
| Authentication | None required (open API) |
| Caching | In-memory, TTL: 10 minutes |
| Timeout | 5 seconds per request |
| Error Handling | Graceful degradation with descriptive error responses |

### OpenWeatherMap

| Property | Detail |
|----------|--------|
| Purpose | Real-time weather data at checkpoints and incident locations |
| Authentication | API key via environment variable |
| Rate Limit | 50 requests per minute (free tier: 60/min) |
| Caching | In-memory per coordinate pair, TTL: 10 minutes |
| Timeout | 5 seconds per request |
| Error Handling | Graceful degradation — response returned without weather data if unavailable |

---

## API Design Rationale

| Decision | Rationale |
|----------|-----------|
| RESTful architecture | Widely understood, easy to document, tool-compatible |
| Versioned endpoints (`/api/v1/`) | Enables future breaking changes without disrupting existing consumers |
| JWT access tokens (1h expiry) | Short-lived tokens reduce exposure in case of compromise |
| JWT refresh tokens (7d expiry) | Maintains session continuity without requiring re-authentication |
| Role-based access control | Enforces least-privilege — citizens cannot modify system data |
| GraphQL for read operations | Allows clients to fetch only required fields, reducing payload size |
| Connection pooling | Prevents connection exhaustion under concurrent load |

For a detailed discussion, see the [API Design & External Integrations](https://github.com/zainab-hashem/ASWE/wiki/API-Design-&-External-Integrations) Wiki page.

---

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down
```

The `docker-compose.yml` file defines two services: the Node.js application and a MySQL 8.0 database instance, connected via an internal Docker network.

---

## Performance Testing

Load testing was conducted using **k6 by Grafana**. All tests were run against a locally deployed instance with MySQL connection pooling enabled.

| Test Scenario | Max VUs | p(95) Latency | Error Rate | Result |
|---------------|---------|---------------|------------|--------|
| Read-Heavy (GET /incidents) | 500 | 8.68 ms | 0.00% | PASS |
| Write-Heavy (POST /reports) | 50 | 6.75 ms | Expected† | PASS |
| Mixed Workload (70% GET / 30% POST) | 50 | 7.54 ms | Expected† | PASS |
| Spike Test (5 → 100 VUs in 10s) | 100 | 7.98 ms | 0.00% | PASS |
| Soak Test (20 VUs sustained 10 min) | 20 | 5.83 ms | Expected† | PASS |

† Error rates in write-heavy tests are caused exclusively by the duplicate detection system returning HTTP 409 (Conflict). No HTTP 5xx errors were recorded in any test.

Full test scripts, results, and analysis are available in the [Performance & Load Testing](https://github.com/zainab-hashem/ASWE/wiki/Performance-&-Load-Testing) Wiki page.

---

## Documentation

| Resource | Description |
|----------|-------------|
| [System Overview](https://github.com/zainab-hashem/ASWE/wiki/System-Overview) | Project overview, architecture diagram, and feature summary |
| [API Design & External Integrations](https://github.com/zainab-hashem/ASWE/wiki/API-Design-&-External-Integrations) | API design decisions and external API integration details |
| [Database Schema](https://github.com/zainab-hashem/ASWE/wiki/Database-Schema) | Full ERD and table descriptions |
| [Performance & Load Testing](https://github.com/zainab-hashem/ASWE/wiki/Performance-&-Load-Testing) | k6 test scenarios, results, bottleneck analysis, and recommendations |
| [ERD (PDF)](docs/ERD.pdf) | Downloadable entity relationship diagram |

---

> **Course:** Advanced Software Engineering — Spring 2026
> **Instructor:** Dr. Amjad AbuHassan
> **Institution:** An-Najah National University
