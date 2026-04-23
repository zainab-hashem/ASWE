# 🗺️ Wasel Palestine – Smart Mobility & Checkpoint Intelligence Platform

A backend API platform designed to support Palestinians in navigating daily movement challenges by providing structured, reliable, and up-to-date mobility intelligence.

---

## 👥 Team Members

| Name | GitHub |
|------|--------|
| Manar Nofal | [@manarnofal2004](https://github.com/manarnofal2004) |
| Zainab Hashem | [@zainab-hashem](https://github.com/zainab-hashem) |
| Dina Hanna | [@diiinahanna2004](https://github.com/diiinahanna2004) |
| Rama Yaseen | [@ramayaseen498-ai](https://github.com/ramayaseen498-ai) |

---

## 📌 What is Wasel Palestine?

Wasel Palestine is a backend API platform designed to support Palestinians in navigating daily movement challenges. The platform aggregates data related to road conditions, checkpoints, traffic incidents, and environmental factors, and exposes this information through a well-defined REST API.

---

## ❗ Problem Statement

Palestinians face daily mobility challenges due to checkpoints, road closures, and unpredictable conditions. There is no centralized, reliable system that aggregates real-time mobility intelligence and makes it accessible through a structured API.

---

## ✅ Solution

Wasel Palestine provides:
- A centralized registry of checkpoints and their real-time status
- Crowdsourced incident reporting with community verification
- Route estimation between any two locations
- Weather data integration for environmental context
- Alert system for real-time notifications

---

## 👤 Who Uses It?

| Role | Permissions |
|------|-------------|
| **Admin** | Full system control |
| **Moderator** | Verify incidents and reports |
| **Citizen** | Submit reports, subscribe to alerts |

---

## 🏗️ System Architecture

![System Architecture](https://github.com/user-attachments/assets/db085641-38db-458c-a7b9-b303d0d3e8d3)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Authentication | JWT (Access + Refresh Tokens) |
| Deployment | Docker + Docker Compose |
| External APIs | OpenWeatherMap, OpenStreetMap |
| GraphQL | Apollo Server |
| Load Testing | k6 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/zainab-hashem/ASWE.git
cd ASWE

# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET=secretkey
REFRESH_TOKEN_SECRET=refreshsecretkey
WEATHER_API_KEY=your_openweathermap_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=wasel_project
```

### Run Locally
```bash
node server.js
```

### Run with Docker
```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.js               # Database connection (Pool)
├── controllers/
│   ├── authController.js
│   ├── checkpointController.js
│   ├── incidentController.js
│   ├── reportController.js
│   ├── alertController.js
│   ├── subscriptionController.js
│   ├── mobilityController.js
│   └── weatherController.js
├── middleware/
│   ├── authMiddleware.js
│   └── authorizeRoles.js
├── models/
│   ├── index.js            # Sequelize connection
│   ├── User.js
│   ├── Checkpoint.js
│   └── Incident.js
├── routes/
│   ├── authRoutes.js
│   ├── checkpointRoutes.js
│   ├── incidentRoutes.js
│   ├── reportRoutes.js
│   ├── alertRoutes.js
│   ├── subscriptionRoutes.js
│   ├── mobilityRoutes.js
│   └── weatherRoutes.js
├── graphql/
│   ├── schema.js
│   └── resolvers.js
└── services/
    ├── NotificationService.js
    └── weatherService.js
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `users` | System users (admin, moderator, citizen) |
| `checkpoints` | Checkpoint registry |
| `checkpoint_status_history` | Checkpoint status changes log |
| `incidents` | Road incidents and hazards |
| `reports` | Crowdsourced citizen reports |
| `report_votes` | Community voting on reports |
| `report_status_history` | Report moderation log |
| `comments` | Comments on reports |
| `subscriptions` | Alert subscriptions |
| `alerts` | Generated alert records |
| `refresh_tokens` | JWT refresh tokens |

📄 [View Full ERD](docs/ERD.pdf)

---

## 📡 API Endpoints

### 🔐 Auth `/api/v1/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login + get access & refresh tokens | ❌ |
| POST | `/refresh` | Refresh access token | ❌ |
| POST | `/logout` | Logout + revoke refresh token | ❌ |

### 🚧 Checkpoints `/api/v1/checkpoints`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all checkpoints (filter/sort/paginate) | ❌ |
| GET | `/:id` | Get checkpoint + status history | ❌ |
| POST | `/` | Create checkpoint | ✅ admin/mod |
| PATCH | `/:id/status` | Update checkpoint status | ✅ admin/mod |

**Filtering examples:**
```
GET /api/v1/checkpoints?area=نابلس
GET /api/v1/checkpoints?current_status=closed
GET /api/v1/checkpoints?page=1&limit=10&sort_by=name&order=ASC
```

### 🚨 Incidents `/api/v1/incidents`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all incidents (filter/sort/paginate) | ❌ |
| GET | `/:id` | Get incident by ID | ❌ |
| POST | `/` | Create incident | ✅ admin/mod |
| PATCH | `/:id` | Update incident | ✅ admin/mod |
| PATCH | `/:id/status` | Verify or close incident | ✅ admin/mod |
| DELETE | `/:id` | Delete incident | ✅ admin |

**Filtering examples:**
```
GET /api/v1/incidents?incident_type=closure
GET /api/v1/incidents?severity=high&status=verified
GET /api/v1/incidents?page=1&limit=10
```

### 📝 Reports `/api/v1/reports`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all reports | ❌ |
| GET | `/:id` | Get report by ID | ❌ |
| POST | `/` | Submit report (with duplicate detection) | ✅ |
| POST | `/:id/vote` | Vote on report (up/down) | ✅ |
| GET | `/:id/votes` | Get report votes & credibility | ❌ |
| PUT | `/:id/status` | Update report status | ✅ admin/mod |
| GET | `/:id/history` | Get status change history | ❌ |
| DELETE | `/:id` | Delete report | ✅ admin |

**Filtering examples:**
```
GET /api/v1/reports?category=closure
GET /api/v1/reports?status=pending
```

### 🔔 Alerts `/api/v1/alerts`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user alerts | ✅ |
| PUT | `/:id/read` | Mark alert as read | ✅ |

### 📬 Subscriptions `/api/v1/subscriptions`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Subscribe to alerts by area/type | ✅ |
| DELETE | `/` | Unsubscribe | ✅ |

**Subscribe examples:**
```json
{ "area": "نابلس", "incident_type": "closure" }
{ "area": null, "incident_type": "delay" }
{ "area": null, "incident_type": null }
```

### 🗺️ Mobility `/api/v1/mobility`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/estimate-route` | Estimate route between two locations | ❌ |

**Examples:**
```
GET /api/v1/mobility/estimate-route?origin=Nablus, Palestine&destination=Ramallah, Palestine
GET /api/v1/mobility/estimate-route?origin=حاجز قلنديا&destination=حاجز حوارة
GET /api/v1/mobility/estimate-route?origin=An-Najah National University&destination=Al-Manara Square Ramallah
```

### 🌤️ Weather `/api/v1/weather`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get weather by city name | ❌ |
| GET | `/checkpoint/:id` | Get weather at checkpoint location | ❌ |
| GET | `/incident/:id` | Get weather at incident location | ❌ |

**Examples:**
```
GET /api/v1/weather?city=Nablus
GET /api/v1/weather/checkpoint/1
GET /api/v1/weather/incident/1
```

### 🔮 GraphQL (Bonus)
**Endpoint:** `POST /graphql`

**Available queries:**
```graphql
# Get all incidents
{ incidents { id title severity status area } }

# Filter incidents
{ incidents(severity: "critical") { id title area } }

# Get all checkpoints
{ checkpoints { id name area current_status } }

# Filter checkpoints
{ checkpoints(area: "نابلس") { id name current_status } }

# Get all reports
{ reports { id title category status } }

# Get single incident
{ incident(id: 1) { id title description severity status } }

# Get single checkpoint
{ checkpoint(id: 1) { id name area current_status } }
```

---

## 🌐 External API Integrations

### OpenStreetMap (OSRM)
- Route estimation between any two locations
- Supports city names, checkpoint names, and landmarks
- Caching (10 min), timeout (5s), error handling

### OpenWeatherMap
- Real-time weather at checkpoints and incident locations
- API key authentication via `.env`
- Caching (10 min), rate limiting (50 req/min), timeout (5s)
- Graceful degradation if API is unavailable

---

## 🔐 API Design Rationale

- **REST:** Simple, widely understood, easy to document
- **Versioning `/api/v1/`:** Allows future API versions without breaking existing clients
- **JWT + Refresh Token:** Stateless auth, shorter access token lifetime (1h) improves security
- **Role-based Access:** admin > moderator > citizen prevents unauthorized modifications
- **GraphQL:** Optional flexible querying for read-only data

---

## 🐳 Docker

```bash
# Build and run
docker-compose up --build

# Stop
docker-compose down
```

---

## 📊 Performance Testing

Tested with **k6** — full results in the [Wiki](https://github.com/zainab-hashem/ASWE/wiki/Performance-&-Load-Testing)

| Test | Max VUs | p(95) | Error Rate | Verdict |
|------|---------|-------|------------|---------|
| Read Heavy | 500 | 8.68 ms | 0.00% | ✅ PASS |
| Write Heavy | 50 | 6.75 ms | Expected* | ✅ PASS |
| Mixed | 50 | 7.54 ms | Expected* | ✅ PASS |
| Spike | 100 | 7.98 ms | 0.00% | ✅ PASS |
| Soak | 20 | 5.83 ms | Expected* | ✅ PASS |

*Error rates caused by duplicate detection (HTTP 409), not server instability.

---

## 📚 Documentation

| Page | Description |
|------|-------------|
| [System Overview](https://github.com/zainab-hashem/ASWE/wiki/System-Overview) | Project overview, architecture, and features |
| [API Design & External Integrations](https://github.com/zainab-hashem/ASWE/wiki/API-Design-&-External-Integrations) | API design rationale and external APIs |
| [Database Schema](https://github.com/zainab-hashem/ASWE/wiki/Database-Schema) | ERD and tables description |
| [Performance & Load Testing](https://github.com/zainab-hashem/ASWE/wiki/Performance-&-Load-Testing) | k6 test results and analysis |
