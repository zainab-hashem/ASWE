API Design Rationale

The API was designed to support a smart mobility and incident reporting system focused on checkpoints and road conditions. It enables communication between client applications (web/mobile) and backend services in a structured, scalable, and maintainable way.

Design Principles
RESTful Architecture
The API follows REST principles, where resources are exposed through clear and meaningful endpoints such as:
/incidents
/checkpoints
/reports
/users
Resource-Based Structure
Each core entity is modeled as a separate resource:
Users → authentication and role management
Checkpoints → locations and status tracking
Incidents → real-time events
Reports → user-generated data
Stateless Communication
Each request contains all required information (e.g., JWT token, parameters), ensuring scalability and simplicity in request handling.
Consistent HTTP Methods
GET → retrieve data
POST → create resources
PATCH / PUT → update resources
DELETE → remove resources
Authentication & Authorization
JWT-based authentication is implemented using:
/auth/login
/auth/refresh
Role-Based Access Control (RBAC):
Admin → full system control
Moderator → verify and manage content
Citizen → create reports and subscriptions

This ensures secure and controlled access to system functionality.

Endpoint Design Decisions
Clear and Predictable Naming
/incidents/:id/status
/reports/:id/vote
/checkpoints/:id/status
Separation of Concerns
Status updates are handled through dedicated endpoints
Voting is isolated from report management

These decisions improve readability, maintainability, and scalability.

Filtering, Pagination, and Querying

To enhance performance and usability, the API supports:

Filtering
/incidents?severity=high
/reports?category=closure
Pagination
/incidents?page=1&limit=2

This reduces payload size and improves response efficiency.

Event-Driven Design (Alerts System)

The system follows an event-driven approach:

When an incident is marked as verified, alerts are triggered
Users receive notifications based on their subscriptions (area and incident type)

This enables real-time responsiveness and improves user experience.

Data Integrity & Validation
Duplicate report detection based on location and category
Status history tracking for:
Incidents
Checkpoints
Reports

These mechanisms ensure data consistency, reliability, and traceability.

Hybrid API (REST + GraphQL)

In addition to RESTful endpoints, the system provides a GraphQL interface:

Endpoint:

/graphql

Example query:

{
  incidents {
    id
    title
    severity
    status
  }
}

GraphQL was introduced to allow flexible and efficient data retrieval, enabling clients to request only the fields they need.





External API Integration Details

The system integrates with external APIs to enhance functionality without reinventing complex services.

1. Route Estimation API
Purpose

Used to estimate travel routes between locations, considering checkpoints and geographical data.

Endpoints
/mobility/estimate-route?origin=...&destination=...
Functionality
Accepts flexible inputs:
checkpoint names
cities
landmarks
Returns estimated route details
Integration Process
The backend sends HTTP requests to an external mapping/geolocation API
The response is processed and formatted before being returned to the client
Error Handling
Invalid locations → appropriate error response
Missing parameters → validation error
