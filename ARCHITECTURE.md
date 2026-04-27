# Bilillee System Architecture

## Overview

Bilillee is a dual-sided marketplace platform built on a microservices architecture, designed for scalability, security, and real-time performance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────┬─────────────────────────────┬─────────────────┤
│      Web Application        │     Mobile Apps           │   Widgets/Embed │
│   (React/Vue Dashboard)     │  (React Native/Flutter)     │  (Booking Iframe)│
└──────────────┬──────────────┴──────────────┬──────────────┴────────┬────────┘
               │                             │                       │
               └─────────────────────────────┼───────────────────────┘
                                           │
                    ┌───────────────────────┴───────────────────────┐
                    │              API GATEWAY (Kong/AWS)           │
                    │  • Rate Limiting • Auth • SSL Termination    │
                    └───────────────────────┬───────────────────────┘
                                            │
┌───────────────────────────────────────────┼───────────────────────────────────┐
│                              SERVICE LAYER  │                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌───────▼──────┐ ┌──────────────┐           │
│  │   Identity   │ │  Scheduling  │ │   Payment    │ │ Notification │           │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │           │
│  │  (Auth/RBAC) │ │ (Calendar/   │ │  (Stripe/    │ │ (Email/SMS/  │           │
│  │              │ │  Booking)     │ │  Internal)   │ │  Push)       │           │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘           │
│  ┌──────┴───────┐ ┌──────┴───────┐ ┌──────┴───────┐ ┌──────┴───────┐           │
│  │   Business   │ │  Marketplace │ │   Loyalty    │ │   Analytics  │           │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │           │
│  │ (CRUD/Team)  │ │ (Discovery)  │ │ (Points/     │ │ (Reports/    │           │
│  │              │ │              │ │  Membership) │ │  Insights)   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │              MESSAGE QUEUE (Redis/RabbitMQ)   │
                    │         • Async Processing • Event Streaming │
                    └───────────────────────┬───────────────────────┘
                                            │
┌───────────────────────────────────────────┼───────────────────────────────────┐
│                              DATA LAYER     │                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────▼───────┐ ┌──────────────┐          │
│  │  PostgreSQL  │ │    Redis     │ │ Elasticsearch│ │   S3/Cloud   │          │
│  │ (Primary DB) │ │   (Cache/    │ │   (Search/   │ │   Storage    │          │
│  │              │ │   Sessions)  │ │    Logs)     │ │ (Images/     │          │
│  │              │ │              │ │              │ │  Documents)  │          │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┴───────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Stripe  │ │ Twilio   │ │  SendGrid│ │  Google  │ │ Facebook │             │
│  │ (Payments)│ │  (SMS)   │ │ (Email)  │ │  APIs    │ │  OAuth   │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Service Definitions

### 1. Identity Service
**Responsibility**: Authentication, authorization, RBAC management

```yaml
Endpoints:
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/refresh
  - GET  /auth/me
  - POST /rbac/roles
  - GET  /rbac/roles/{id}/permissions
  - PUT  /rbac/roles/{id}/permissions

Database:
  - users table
  - roles table
  - permissions table
  - role_permissions junction
  - user_roles junction
```

### 2. Scheduling Service
**Responsibility**: Calendar management, appointments, availability

```yaml
Endpoints:
  - GET  /calendar/{businessId}
  - POST /appointments
  - PUT  /appointments/{id}
  - DELETE /appointments/{id}
  - POST /availability
  - GET  /slots/available

Events:
  - appointment.created
  - appointment.updated
  - appointment.cancelled
  - slot.freed (for waitlist)
```

### 3. Payment Service
**Responsibility**: Transaction processing, commission calculation, wallet

```yaml
Endpoints:
  - POST /payments/intent
  - POST /payments/confirm
  - POST /refunds
  - GET  /wallet/{businessId}/balance
  - POST /wallet/{businessId}/withdraw
  - GET  /commissions/calculate

Payment Flows:
  - Card Present (POS)
  - Card Not Present (Online)
  - Mobile Banking (Screenshot workflow)
  - Split Payments

Commission Logic:
  - Check if client is new to business via marketplace
  - Apply 20% on first booking only
  - Track repeat bookings (0% commission)
```

### 4. Business Service
**Responsibility**: Business profile, team management, services catalog

```yaml
Endpoints:
  - CRUD /businesses
  - CRUD /businesses/{id}/team
  - CRUD /businesses/{id}/services
  - CRUD /businesses/{id}/products
  - POST /team/{id}/invite

Features:
  - Team member onboarding
  - Service configuration
  - Inventory tracking
  - Commission rules per team member
```

### 5. Marketplace Service
**Responsibility**: Discovery, search, reviews, consumer-facing APIs

```yaml
Endpoints:
  - GET  /marketplace/search
  - GET  /marketplace/businesses/{id}
  - GET  /marketplace/businesses/{id}/reviews
  - POST /marketplace/reviews
  - GET  /marketplace/categories

Search Features:
  - Geospatial search (near me)
  - Filter by service, price, rating, availability
  - Featured listings (paid placement)
```

### 6. Notification Service
**Responsibility**: Multi-channel communication

```yaml
Channels:
  - Email (SendGrid/AWS SES)
  - SMS (Twilio)
  - Push Notifications (Firebase)
  - In-App (WebSocket)

Triggers:
  - Booking confirmations
  - Appointment reminders
  - Waitlist notifications
  - Payment receipts
  - Marketing campaigns
```

### 7. Loyalty Service
**Responsibility**: Points, memberships, packages

```yaml
Endpoints:
  - GET  /loyalty/{clientId}/points
  - POST /loyalty/transactions
  - CRUD /memberships
  - CRUD /packages
  - POST /packages/{id}/redeem

Features:
  - Points accrual rules
  - Tier management
  - Package tracking
  - Automated rewards
```

### 8. Analytics Service
**Responsibility**: Reporting, insights, dashboards

```yaml
Endpoints:
  - GET  /reports/revenue
  - GET  /reports/performance
  - GET  /reports/retention
  - POST /reports/custom
  - GET  /dashboards/{userId}

Data Sources:
  - Read replicas from primary DB
  - Event stream processing
  - Aggregated metrics cache
```

## Data Architecture

### Primary Database Schema (PostgreSQL)

```sql
-- Core Tables
users (id, email, password_hash, phone, created_at, updated_at)
businesses (id, owner_id, name, slug, address, geo_location, settings, tier)

-- RBAC Tables
roles (id, business_id, name, is_system, created_at)
permissions (id, module, action, description)
role_permissions (role_id, permission_id, level)
user_roles (user_id, role_id, business_id)

-- Scheduling Tables
appointments (id, business_id, client_id, service_id, staff_id, 
              start_time, end_time, status, source, created_at)
availability (id, staff_id, day_of_week, start_time, end_time, is_available)
resources (id, business_id, name, type, capacity)
resource_bookings (resource_id, appointment_id, start_time, end_time)

-- Payment Tables
transactions (id, business_id, appointment_id, amount, currency, 
              method, status, commission_amount, commission_paid)
wallets (business_id, balance, currency, last_payout_at)
commissions (id, business_id, client_id, appointment_id, 
             amount, is_first_booking, calculated_at)

-- Marketplace Tables
marketplace_listings (business_id, is_featured, featured_until, 
                      search_score, category_ids)
reviews (id, business_id, client_id, rating, comment, is_verified, created_at)
client_sources (client_id, business_id, source, first_booking_at)

-- Loyalty Tables
loyalty_points (client_id, business_id, points_balance, lifetime_earned)
loyalty_transactions (id, client_id, business_id, points, type, reference_id)
memberships (id, business_id, name, benefits, monthly_price)
packages (id, business_id, name, services_included, total_sessions, price)
package_redemptions (package_id, client_id, sessions_used, sessions_remaining)
```

### Caching Strategy (Redis)

```yaml
Cache Layers:
  Session Store:
    TTL: 24 hours
    Key: session:{token}

  Calendar Cache:
    TTL: 5 minutes
    Key: calendar:{business_id}:{date}
    Invalidation: On appointment change

  Business Profile:
    TTL: 1 hour
    Key: business:{id}:profile

  Search Results:
    TTL: 10 minutes
    Key: search:{hash_of_params}

  Rate Limiting:
    TTL: 1 minute
    Key: ratelimit:{ip}:{endpoint}
```

## Security Architecture

### Authentication Flow

```
┌─────────┐                    ┌──────────────┐                    ┌─────────┐
│  Client │ ──(1) Credentials──>│    Auth      │──(2) Validate────>│   DB    │
│         │                    │   Service    │                    │         │
│         │ <─(3) JWT Tokens───│              │<───────────────────│         │
└────┬────┘                    └──────────────┘                    └─────────┘
     │
     │ (4) Request + JWT
     ▼
┌──────────────┐
│  API Gateway │──(5) Verify JWT──> Continue to Service
│              │
│  Rate Limit  │──(6) Check limits
│  RBAC Check  │──(7) Verify permissions
└──────────────┘
```

### RBAC Enforcement

```javascript
// Middleware example
async function checkPermission(req, res, next) {
  const { userId, businessId } = req.user;
  const { module, action } = req.requiredPermission;

  const userRoles = await getUserRoles(userId, businessId);
  const permissions = await aggregatePermissions(userRoles);

  if (!hasPermission(permissions, module, action)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Add permissions to request for downstream filtering
  req.userPermissions = permissions;
  next();
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Ingress Controller                  │   │
│  │              (SSL termination, routing)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────┼─────────────────────────────┐ │
│  │    Service Mesh (Istio) │                             │ │
│  │  ┌─────┐ ┌─────┐ ┌─────▼─────┐ ┌─────┐ ┌─────┐      │ │
│  │  │ Pod │ │ Pod │ │   Pod     │ │ Pod │ │ Pod │      │ │
│  │  │(API)│ │(API)│ │(Identity) │ │(Pay)│ │(Sched)│    │ │
│  │  └──┬──┘ └──┬──┘ └─────┬─────┘ └──┬──┘ └──┬──┘      │ │
│  │     └───────┴──────────┴──────────┴───────┘         │ │
│  │              Auto-scaling (HPA)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Stateful Services                          ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐  ││
│  │  │PostgreSQL │ │    Redis   │ │Elasticsearch       │  ││
│  │  │ (Primary + │ │  (Cluster) │ │   (Cluster)        │  ││
│  │  │  Replicas) │ │            │ │                    │  ││
│  │  └────────────┘ └────────────┘ └────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Web dashboard |
| **Mobile** | React Native / Flutter | iOS & Android apps |
| **API** | Node.js (NestJS) / Go | Microservices |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache** | Redis Cluster | Sessions, caching |
| **Search** | Elasticsearch | Full-text search |
| **Queue** | RabbitMQ / Apache Kafka | Async processing |
| **Storage** | AWS S3 / Cloudflare R2 | File storage |
| **Infra** | Kubernetes (EKS/GKE) | Container orchestration |
| **Monitoring** | Prometheus + Grafana | Metrics & alerting |
| **Logging** | ELK Stack / Datadog | Centralized logging |
| **CI/CD** | GitHub Actions + ArgoCD | Deployment pipeline |

## Scalability Considerations

### Horizontal Scaling
- Stateless services scale via Kubernetes HPA
- Database read replicas for query offloading
- Redis Cluster for cache distribution

### Performance Optimizations
- Database connection pooling (PgBouncer)
- GraphQL for efficient data fetching
- CDN for static assets and images
- Database indexing on search fields

### High Availability
- Multi-AZ deployment
- Database automated backups (point-in-time recovery)
- Circuit breakers for external services
- Graceful degradation strategies

## Development Guidelines

### Service Communication
- **Synchronous**: REST/GraphQL for user-facing operations
- **Asynchronous**: Event-driven for background processing
- **Events**: Standardized event schema with versioning

### Code Organization
```
services/
├── identity-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── guards/
│   │   └── events/
│   ├── tests/
│   └── Dockerfile
├── scheduling-service/
└── ...
```

### API Standards
- RESTful design with OpenAPI 3.0 specs
- Versioning via URL path (/v1/, /v2/)
- Standardized error responses
- Pagination with cursor-based approach
- Rate limiting per endpoint

---

*Last Updated: 2026-04-14*
*Version: 1.0*
