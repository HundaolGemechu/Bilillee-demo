# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Bilillee - Beauty & Wellness Marketplace Platform

---

**Version**: 2.0  
**Date**: April 14, 2026  
**Status**: Approved  
**Author**: Product & Engineering Team

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Subscription & Monetization](#4-subscription--monetization)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [External Interfaces](#6-external-interfaces)
7. [Data Requirements](#7-data-requirements)
8. [Appendices](#8-appendices)

---

## 1. INTRODUCTION

### 1.1 Purpose
This document specifies the complete software requirements for Bilillee, a dual-sided marketplace platform serving beauty and wellness businesses (B2B) and their consumers (B2C), built on Supabase infrastructure.

### 1.2 Scope
Bilillee encompasses:
- **Bilillee for Business**: Comprehensive SaaS platform with subscription tiers
- **Bilillee Marketplace**: Consumer-facing booking and discovery platform
- **Role-Based Access Control (RBAC)**: Granular permission system for team management
- **Payment Infrastructure**: Cash and mobile banking screenshot verification (no online payments)

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| **RBAC** | Role-Based Access Control |
| **POS** | Point of Sale |
| **CRM** | Customer Relationship Management |
| **GDPR** | General Data Protection Regulation |
| **Supabase** | Backend-as-a-Service platform (PostgreSQL + Auth + Realtime) |
| **RLS** | Row Level Security |
| **Feature Gate** | Restriction of functionality based on subscription tier |

---

## 2. SYSTEM OVERVIEW

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     Web      │  │    Mobile    │  │  Embedded Widget │  │
│  │  (React)     │  │(React Native)│  │   (Iframe)       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼────────────────┼──────────────────┼────────────┘
          │                │                  │
          └────────────────┴──────────────────┘
                           │
          ┌────────────────┴──────────────────┐
          │         SUPABASE PLATFORM          │
          │  ┌──────────────────────────────┐  │
          │  │  PostgreSQL Database         │  │
          │  │  • Business Data             │  │
          │  │  • Appointments              │  │
          │  │  • Subscriptions             │  │
          │  │  • RBAC                      │  │
          │  └──────────────────────────────┘  │
          │  ┌──────────────────────────────┐  │
          │  │  Supabase Auth               │  │
          │  │  • JWT Tokens                │  │
          │  │  • OAuth                     │  │
          │  └──────────────────────────────┘  │
          │  ┌──────────────────────────────┐  │
          │  │  Edge Functions              │  │
          │  │  • Business Logic            │  │
          │  └──────────────────────────────┘  │
          └─────────────────────────────────────┘
                           │
          ┌────────────────┴──────────────────┐
          │      EXTERNAL SERVICES            │
          │  • Stripe (Subscriptions/Payouts) │
          │  • Twilio (SMS)                   │
          │  • SendGrid (Email)               │
          │  • Supabase Storage               │
          └─────────────────────────────────────┘
```

### 2.2 User Classes

| User Class | Description | Primary Needs |
|------------|-------------|---------------|
| **Business Owner** | Account creator with full control | Subscription management, financial oversight, team administration |
| **Manager** | Senior staff with elevated permissions | Operational oversight, team coordination, reporting |
| **Service Provider** | Individual practitioners | Schedule management, client service, personal performance |
| **Receptionist/Front Desk** | Administrative staff | Booking management, payment processing, client communication |
| **Consumer** | End customers seeking services | Easy discovery, seamless booking, service management |

### 2.3 Operating Environment
- **Backend**: Supabase (PostgreSQL 15, Edge Functions)
- **Web Application**: Modern browsers (Chrome, Safari, Firefox, Edge)
- **Mobile Application**: iOS 14+, Android 10+
- **Real-time**: WebSocket connections via Supabase Realtime
- **Storage**: Supabase Storage (S3-compatible)

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 AUTHENTICATION & AUTHORIZATION

#### 3.1.1 User Authentication (F-AUTH-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-AUTH-001.1 | Users shall authenticate via Supabase Auth | JWT tokens issued with 24-hour expiry |
| F-AUTH-001.2 | Support email/password authentication | Password reset via email |
| F-AUTH-001.3 | Support OAuth providers (Google, Facebook) | One-click login for consumers |
| F-AUTH-001.4 | Business owners shall have MFA option | TOTP or SMS-based 2FA |
| F-AUTH-001.5 | Token refresh mechanism | Seamless session extension |

#### 3.1.2 Role-Based Access Control (F-RBAC-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-RBAC-001.1 | System shall support predefined roles | Owner, Manager, Staff, Receptionist |
| F-RBAC-001.2 | Custom roles only in Growth/Pro tiers | Free/Starter limited to predefined roles |
| F-RBAC-001.3 | Granular permissions per module | Calendar, Sales, Clients, Reports, Catalog, Payments |
| F-RBAC-001.4 | Permission levels per module | None, View Only, Edit, Full Access |
| F-RBAC-001.5 | UI elements hidden based on permissions | Buttons/routes inaccessible without permission |
| F-RBAC-001.6 | API enforcement of permissions | RLS policies prevent unauthorized data access |

### 3.2 BUSINESS MANAGEMENT

#### 3.2.1 Subscription Management (F-SUB-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-SUB-001.1 | Four subscription tiers | Free ($0), Starter ($29), Growth ($79), Pro ($149) |
| F-SUB-001.2 | Monthly and yearly billing options | 17% discount for yearly |
| F-SUB-001.3 | Feature gating by tier | API returns 403 for unauthorized features |
| F-SUB-001.4 | Upgrade/downgrade capability | Prorated billing handled by Stripe |
| F-SUB-001.5 | Usage tracking and limits | Team member limits enforced |
| F-SUB-001.6 | Grace period on failed payments | 7-day grace before downgrade to Free |
| F-SUB-001.7 | Cancellation with data retention | 30-day grace period post-cancellation |

#### 3.2.2 Smart Scheduling (F-SCH-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-SCH-001.1 | Visual calendar with drag-and-drop | Smooth interaction, mobile-responsive |
| F-SCH-001.2 | Recurring bookings | Daily, weekly, monthly patterns |
| F-SCH-001.3 | Group appointments | Multiple clients per slot |
| F-SCH-001.4 | Buffer times between services | Configurable per service |
| F-SCH-001.5 | Real-time availability updates | WebSocket push notifications |
| F-SCH-001.6 | Conflict prevention | Double-booking prevention at database level |

#### 3.2.3 Payment Recording (F-PAY-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-PAY-001.1 | Cash payment recording | Amount, method, staff recorded |
| F-PAY-001.2 | Mobile banking screenshot upload | Image stored in Supabase Storage |
| F-PAY-001.3 | Screenshot verification workflow | Staff approval required (Starter+ only) |
| F-PAY-001.4 | Auto-cancellation on non-verification | 2-hour timeout for screenshot approval |
| F-PAY-001.5 | Deposit tracking | Separate deposit and balance tracking |
| F-PAY-001.6 | Tip handling | Tip allocation to service providers |
| F-PAY-001.7 | NO online card processing | System shall not process cards online |

**Mobile Banking Workflow**:
```
1. Client selects "Mobile Banking" at checkout (Starter+ feature)
2. System displays business bank details + unique reference code
3. Client completes transfer in banking app
4. Client uploads screenshot of confirmation
5. Appointment status: "pending_verification"
6. Staff with "payments" permission reviews screenshot
7. Staff approves → appointment confirmed
8. Staff rejects → appointment cancelled, client notified
```

#### 3.2.4 Team Management (F-TEAM-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-TEAM-001.1 | Add team members via invite | Email invitation with onboarding link |
| F-TEAM-001.2 | Team member limits by tier | Free: 2, Starter: 5, Growth: 15, Pro: Unlimited |
| F-TEAM-001.3 | Individual commission rates | Configurable per team member |
| F-TEAM-001.4 | Service assignments | Link staff to specific services |
| F-TEAM-001.5 | Schedule management | Individual availability settings |

#### 3.2.5 Inventory Management (F-INV-001)
**Priority**: Should Have (Starter+)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-INV-001.1 | Product catalog management | CRUD operations for retail products |
| F-INV-001.2 | Stock tracking | Real-time quantity updates |
| F-INV-001.3 | Barcode scanning | Mobile camera integration |
| F-INV-001.4 | Low stock alerts | Configurable reorder points |
| F-INV-001.5 | Feature gate: Starter+ only | API returns 403 for Free tier |

#### 3.2.6 Waitlist Management (F-WAIT-001)
**Priority**: Should Have (Starter+)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-WAIT-001.1 | Client waitlist entry | Preferred dates, times, staff |
| F-WAIT-001.2 | Automatic cancellation filling | Notification to waitlisted clients |
| F-WAIT-001.3 | Priority handling | First-come-first-served or manual selection |
| F-WAIT-001.4 | SMS/Email notifications | Twilio/SendGrid integration |
| F-WAIT-001.5 | Feature gate: Starter+ only | UI shows paywall for Free tier |

#### 3.2.7 Resource Management (F-RES-001)
**Priority**: Should Have (Growth+)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-RES-001.1 | Resource definition | Rooms, chairs, equipment |
| F-RES-001.2 | Resource-appointment linking | Prevent double-booking of resources |
| F-RES-001.3 | Resource availability calendar | Visual resource scheduling |
| F-RES-001.4 | Feature gate: Growth+ only | API returns 403 for lower tiers |

### 3.3 MARKETPLACE & CONSUMER

#### 3.3.1 Business Discovery (F-MKT-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-MKT-001.1 | Geospatial search | Find businesses near location |
| F-MKT-001.2 | Filter by service, price, rating | Real-time filter application |
| F-MKT-001.3 | Business profiles | Photos, services, hours, reviews |
| F-MKT-001.4 | Real-time availability | Show open slots without booking |
| F-MKT-001.5 | Featured listings | Paid placement for Growth/Pro tiers |

#### 3.3.2 Consumer Booking (F-BOOK-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-BOOK-001.1 | Guest checkout | No registration required |
| F-BOOK-001.2 | Service selection | Browse and select services |
| F-BOOK-001.3 | Staff preference | Choose preferred provider |
| F-BOOK-001.4 | Time slot selection | Visual calendar interface |
| F-BOOK-001.5 | Deposit collection | Required deposit at booking time |
| F-BOOK-001.6 | Confirmation notifications | Email + SMS confirmation |
| F-BOOK-001.7 | Source tracking | Marketplace vs Direct vs Widget |

#### 3.3.3 Commission Calculation (F-COMM-001)
**Priority**: Must Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-COMM-001.1 | 20% commission on first booking | Applied only to marketplace-sourced clients |
| F-COMM-001.2 | 0% on repeat bookings | No commission for subsequent visits |
| F-COMM-001.3 | First booking detection | Database query for client history |
| F-COMM-001.4 | Commission recording | Separate commissions table |
| F-COMM-001.5 | Commission deduction from payout | Automatic from Stripe Connect payouts |

### 3.4 LOYALTY & RETENTION

#### 3.4.1 Loyalty Program (F-LOY-001)
**Priority**: Should Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-LOY-001.1 | Points accrual | Points per dollar spent |
| F-LOY-001.2 | Tier system | Bronze, Silver, Gold, Platinum |
| F-LOY-001.3 | Points redemption | Discounts on future services |
| F-LOY-001.4 | Advanced loyalty features | Growth+ tier only |

#### 3.4.2 Packages & Memberships (F-PKG-001)
**Priority**: Should Have

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-PKG-001.1 | Package creation | Bundle services at discount |
| F-PKG-001.2 | Session tracking | Track remaining sessions |
| F-PKG-001.3 | Expiration handling | Automatic expiration dates |
| F-PKG-001.4 | Package sales | Record package purchases |

---

## 4. SUBSCRIPTION & MONETIZATION

### 4.1 Subscription Tiers

| Feature | Free | Starter ($29/mo) | Growth ($79/mo) | Pro ($149/mo) |
|---------|------|------------------|-----------------|----------------|
| **Team Members** | 2 | 5 | 15 | Unlimited |
| **Core Scheduling** | ✅ | ✅ | ✅ | ✅ |
| **Cash Payments** | ✅ | ✅ | ✅ | ✅ |
| **Mobile Banking** | ❌ | ✅ | ✅ | ✅ |
| **Basic Reports** | ✅ | ✅ | ✅ | ✅ |
| **Advanced Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Inventory** | ❌ | ✅ | ✅ | ✅ |
| **Waitlist** | ❌ | ✅ | ✅ | ✅ |
| **Resource Management** | ❌ | ❌ | ✅ | ✅ |
| **Custom RBAC Roles** | ❌ | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ |
| **White-Label** | ❌ | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ | ✅ |
| **Marketplace Featured** | ❌ | ❌ | ✅ | ✅ |

### 4.2 Commission Structure

| Scenario | Commission | Notes |
|----------|------------|-------|
| First marketplace booking | 20% | One-time fee per new client |
| Repeat bookings | 0% | Unlimited repeat visits |
| Direct bookings | 0% | Business keeps 100% |
| Widget bookings | 0% | Business keeps 100% |

### 4.3 Feature Gating Requirements

```
User attempts to access feature
        ↓
System checks business subscription tier
        ↓
┌─────────────────┬─────────────────┐
│   HAS ACCESS    │  NO ACCESS      │
│                 │                 │
│ Allow action    │ Return 403      │
│ Log usage       │ Show upgrade    │
│                 │ prompt in UI    │
└─────────────────┴─────────────────┘
```

**API Response for Feature Gate**:
```json
{
  "success": false,
  "error": {
    "code": "FEATURE_NOT_AVAILABLE",
    "message": "This feature requires a subscription upgrade",
    "current_tier": "free",
    "required_tier": "starter",
    "upgrade_url": "/billing/upgrade"
  }
}
```

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| N-PERF-001 | API response time | < 200ms (95th percentile) |
| N-PERF-002 | Page load time | < 2 seconds |
| N-PERF-003 | Real-time sync latency | < 100ms |
| N-PERF-004 | Database query time | < 50ms |
| N-PERF-005 | Concurrent users | 10,000+ |

### 5.2 Security

| ID | Requirement | Implementation |
|----|-------------|----------------|
| N-SEC-001 | Data encryption at rest | PostgreSQL native encryption |
| N-SEC-002 | Data encryption in transit | TLS 1.3 |
| N-SEC-003 | Row Level Security | All tables protected by RLS |
| N-SEC-004 | Password policy | Min 12 chars, complexity requirements |
| N-SEC-005 | Session timeout | 24 hours |
| N-SEC-006 | Audit logging | All permission changes logged |
| N-SEC-007 | PII protection | Encryption of sensitive fields |

### 5.3 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| N-REL-001 | Uptime SLA | 99.9% |
| N-REL-002 | Backup frequency | Daily automated backups |
| N-REL-003 | Recovery Time Objective | < 1 hour |
| N-REL-004 | Recovery Point Objective | < 5 minutes |

### 5.4 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| N-SCL-001 | Businesses supported | 100,000+ |
| N-SCL-002 | Appointments per month | 1,000,000+ |
| N-SCL-003 | Horizontal scaling | Auto-scaling via Supabase |

---

## 6. EXTERNAL INTERFACES

### 6.1 Supabase Integration

| Service | Usage |
|---------|-------|
| PostgreSQL | Primary database with RLS |
| Auth | JWT authentication, OAuth |
| Realtime | WebSocket live updates |
| Storage | Image/screenshot storage |
| Edge Functions | Business logic |

### 6.2 Third-Party Services

| Service | Purpose |
|---------|---------|
| Stripe | Subscription billing, payouts |
| Twilio | SMS notifications |
| SendGrid | Email notifications |
| Google Maps | Location services |

### 6.3 Payment Methods

**Supported**:
- ✅ Cash (in-person)
- ✅ Mobile Banking (screenshot verification)

**Not Supported**:
- ❌ Credit/Debit cards (online)
- ❌ Digital wallets (Apple Pay, Google Pay)
- ❌ Cryptocurrency

---

## 7. DATA REQUIREMENTS

### 7.1 Database Schema

**Key Tables**:
- `profiles` - User accounts
- `businesses` - Business profiles with subscription tier
- `subscription_tiers` - Tier definitions and feature flags
- `appointments` - Booking records
- `payment_screenshots` - Mobile banking verification
- `team_members` - Staff management
- `roles` - RBAC roles
- `commissions` - Platform revenue tracking

### 7.2 Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| User data | 7 years post-deletion |
| Appointment history | 10 years |
| Payment screenshots | 2 years |
| Audit logs | 3 years |
| Deleted accounts | 30 days grace period |

---

## 8. APPENDICES

### Appendix A: Feature Matrix by Tier

| Feature | Free | Starter | Growth | Pro |
|---------|------|---------|--------|-----|
| Max Team | 2 | 5 | 15 | ∞ |
| Core Scheduling | ✅ | ✅ | ✅ | ✅ |
| Cash Payments | ✅ | ✅ | ✅ | ✅ |
| Mobile Banking | ❌ | ✅ | ✅ | ✅ |
| Basic Reports | ✅ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ |
| Inventory | ❌ | ✅ | ✅ | ✅ |
| Waitlist | ❌ | ✅ | ✅ | ✅ |
| Resource Management | ❌ | ❌ | ✅ | ✅ |
| Custom Roles | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| White-Label | ❌ | ❌ | ❌ | ✅ |

### Appendix B: Open Questions

1. Should annual subscribers get priority support regardless of tier?
2. What happens to data when downgrading from Growth to Starter (exceeding team limit)?
3. Should mobile banking verification have auto-approval for trusted clients?
4. Grace period duration for failed subscription payments?

### Appendix C: Success Metrics

| Metric | Target |
|--------|--------|
| Monthly Active Businesses | 10,000 by Year 1 |
| Subscription Conversion Rate | 15% Free → Paid |
| Monthly Churn Rate | < 5% |
| NPS Score | > 50 |
| Uptime | 99.9% |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-14 | Product Team | Added Supabase backend, subscription tiers, removed online payments |
| 1.0 | 2026-04-14 | Product Team | Initial release |

**Approval**

| Role | Name | Date |
|------|------|------|
| Product Manager | | |
| Engineering Lead | | |
| CTO | | |

---

*End of Document*
