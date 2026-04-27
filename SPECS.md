# Bilillee - Technical Specifications

## API Specification

### Base URLs

```yaml
Production: https://api.bilillee.com/v1
Staging: https://api-staging.bilillee.com/v1
Local: http://localhost:3000/v1
```

### Authentication

**JWT Bearer Token**
```http
Authorization: Bearer {jwt_token}
```

**Token Structure**:
```json
{
  "sub": "user_uuid",
  "business_id": "business_uuid",
  "role": "owner|manager|staff",
  "permissions": ["calendar:read", "sales:write"],
  "iat": 1713091200,
  "exp": 1713177600
}
```

### Standard Response Format

**Success (200-299)**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-14T12:00:00Z",
    "request_id": "req_uuid",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

**Error (400-599)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_uuid"
  }
}
```

### Core Endpoints

#### Authentication

**POST /auth/login**
```json
// Request
{
  "email": "user@example.com",
  "password": "secure_password",
  "device_id": "optional_device_identifier"
}

// Response 200
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 86400,
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "owner",
    "business_id": "business_uuid"
  }
}
```

**POST /auth/refresh**
```json
// Request
{
  "refresh_token": "refresh_token"
}

// Response 200
{
  "access_token": "new_jwt_token",
  "expires_in": 86400
}
```

#### Business Management

**GET /businesses/{id}**
```json
// Response 200
{
  "id": "business_uuid",
  "name": "Glamour Studio",
  "slug": "glamour-studio",
  "description": "Premium hair and nail services",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "contact": {
    "phone": "+1-555-123-4567",
    "email": "hello@glamourstudio.com",
    "website": "https://glamourstudio.com"
  },
  "hours": {
    "monday": {"open": "09:00", "close": "18:00", "is_closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "is_closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "is_closed": false},
    "thursday": {"open": "09:00", "close": "20:00", "is_closed": false},
    "friday": {"open": "09:00", "close": "20:00", "is_closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "is_closed": false},
    "sunday": {"open": null, "close": null, "is_closed": true}
  },
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD",
    "cancellation_policy": "24_hours",
    "deposit_required": true,
    "deposit_percentage": 20
  },
  "subscription": {
    "tier": "free|growth|pro",
    "status": "active",
    "expires_at": "2026-12-31T23:59:59Z"
  },
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2026-04-14T08:30:00Z"
}
```

**PUT /businesses/{id}**
```json
// Request
{
  "name": "Glamour Studio NYC",
  "description": "Updated description",
  "hours": {
    "monday": {"open": "08:00", "close": "19:00", "is_closed": false}
  }
}
```

#### Team Management

**GET /businesses/{id}/team**
```json
// Response 200
{
  "data": [
    {
      "id": "staff_uuid",
      "user_id": "user_uuid",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah@glamourstudio.com",
      "phone": "+1-555-987-6543",
      "avatar_url": "https://cdn.bilillee.com/avatars/...",
      "role": {
        "id": "role_uuid",
        "name": "Senior Stylist",
        "is_custom": true
      },
      "permissions": {
        "calendar": "own_only",
        "sales": "process_payments",
        "clients": "contact_info",
        "reports": "view_only",
        "catalog": "view_only",
        "payments": "none"
      },
      "services": ["srv_uuid_1", "srv_uuid_2"],
      "commission_rate": 0.45,
      "is_active": true,
      "joined_at": "2025-02-01T09:00:00Z"
    }
  ]
}
```

**POST /businesses/{id}/team**
```json
// Request
{
  "first_name": "Mike",
  "last_name": "Chen",
  "email": "mike@glamourstudio.com",
  "phone": "+1-555-456-7890",
  "role_id": "role_uuid",
  "services": ["srv_uuid_1"],
  "commission_rate": 0.40,
  "send_invite": true
}

// Response 201
{
  "id": "new_staff_uuid",
  "invite_token": "invite_token_for_email",
  "invite_url": "https://app.bilillee.com/invite?token=..."
}
```

#### RBAC Management

**GET /rbac/roles**
```json
// Response 200
{
  "data": [
    {
      "id": "role_uuid",
      "name": "Receptionist",
      "description": "Front desk staff with booking and payment access",
      "is_system": false,
      "is_default": false,
      "user_count": 3,
      "permissions": {
        "calendar": {
          "level": "full_access",
          "description": "View and edit all team schedules"
        },
        "sales": {
          "level": "full_sales",
          "description": "Process payments, issue refunds, apply discounts"
        },
        "clients": {
          "level": "contact_info",
          "description": "View client contact details"
        },
        "reports": {
          "level": "no_access",
          "description": "No access to reports"
        },
        "catalog": {
          "level": "view_only",
          "description": "Browse services and products"
        },
        "payments": {
          "level": "process_transactions",
          "description": "Accept payments, view wallet"
        }
      },
      "created_at": "2025-03-01T10:00:00Z"
    }
  ]
}
```

**POST /rbac/roles**
```json
// Request
{
  "name": "Junior Stylist",
  "description": "New stylists with limited access",
  "permissions": {
    "calendar": "own_only",
    "sales": "process_payments",
    "clients": "names_only",
    "reports": "no_access",
    "catalog": "view_only",
    "payments": "none"
  }
}
```

**PUT /rbac/roles/{id}/permissions**
```json
// Request
{
  "calendar": "team_view",
  "reports": "view_only"
}
```

#### Services & Catalog

**GET /businesses/{id}/services**
```json
// Response 200
{
  "data": [
    {
      "id": "srv_uuid",
      "name": "Women's Haircut",
      "description": "Precision cut with consultation",
      "category": "hair",
      "duration": 60,
      "buffer_time": 15,
      "price": 85.00,
      "deposit_required": true,
      "deposit_amount": 20.00,
      "color_code": "#FF6B6B",
      "resources_required": ["chair_1", "chair_2"],
      "staff_ids": ["staff_uuid_1", "staff_uuid_2"],
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**POST /businesses/{id}/services**
```json
// Request
{
  "name": "Balayage",
  "description": "Hand-painted highlights",
  "category": "hair_color",
  "duration": 180,
  "buffer_time": 30,
  "price": 250.00,
  "deposit_required": true,
  "deposit_percentage": 25,
  "color_code": "#C9B1FF",
  "staff_ids": ["staff_uuid_1"]
}
```

#### Scheduling

**GET /calendar/{business_id}**
```json
// Query Parameters
// ?start_date=2026-04-14&end_date=2026-04-20&staff_id=optional&resource_id=optional

// Response 200
{
  "business_id": "business_uuid",
  "timezone": "America/New_York",
  "date_range": {
    "start": "2026-04-14",
    "end": "2026-04-20"
  },
  "appointments": [
    {
      "id": "apt_uuid",
      "client": {
        "id": "client_uuid",
        "first_name": "Emily",
        "last_name": "Davis",
        "phone": "+1-555-111-2222",
        "email": "emily@example.com",
        "is_new_client": false,
        "bookings_count": 5
      },
      "service": {
        "id": "srv_uuid",
        "name": "Women's Haircut",
        "duration": 60,
        "price": 85.00
      },
      "staff": {
        "id": "staff_uuid",
        "first_name": "Sarah",
        "last_name": "Johnson"
      },
      "resources": ["chair_1"],
      "start_time": "2026-04-14T14:00:00-04:00",
      "end_time": "2026-04-14T15:00:00-04:00",
      "status": "confirmed",
      "source": "marketplace|direct|widget",
      "notes": "Prefers extra time for styling",
      "is_recurring": false,
      "created_at": "2026-04-10T10:30:00Z",
      "deposit_paid": 20.00,
      "total_paid": 0.00,
      "balance_due": 65.00
    }
  ],
  "availability": {
    "staff_uuid": {
      "2026-04-14": [
        {"start": "09:00", "end": "12:00", "is_available": true},
        {"start": "14:00", "end": "18:00", "is_available": true}
      ]
    }
  }
}
```

**POST /appointments**
```json
// Request
{
  "business_id": "business_uuid",
  "client": {
    "first_name": "Jessica",
    "last_name": "Smith",
    "phone": "+1-555-333-4444",
    "email": "jessica@example.com"
  },
  "service_id": "srv_uuid",
  "staff_id": "staff_uuid",
  "start_time": "2026-04-15T10:00:00-04:00",
  "notes": "First time balayage",
  "source": "marketplace",
  "send_confirmation": true
}

// Response 201
{
  "id": "new_apt_uuid",
  "status": "confirmed",
  "client": {
    "id": "new_client_uuid",
    "is_new_client": true
  },
  "commission": {
    "applicable": true,
    "rate": 0.20,
    "estimated_amount": 50.00,
    "notes": "First booking from marketplace - commission applies"
  },
  "confirmation_sent": true
}
```

**PUT /appointments/{id}**
```json
// Request
{
  "start_time": "2026-04-15T11:00:00-04:00",
  "staff_id": "different_staff_uuid",
  "reason": "Client request"
}
```

**DELETE /appointments/{id}**
```json
// Query Parameters
// ?reason=client_requested&charge_cancellation_fee=true

// Response 200
{
  "id": "apt_uuid",
  "status": "cancelled",
  "cancellation_fee_charged": 20.00,
  "refund_processed": 0.00,
  "waitlist_notified": ["client_uuid_1", "client_uuid_2"]
}
```

#### Availability & Slots

**GET /slots/available**
```json
// Query Parameters
// ?business_id=xxx&service_id=xxx&staff_id=optional&date=2026-04-15&duration=60

// Response 200
{
  "date": "2026-04-15",
  "service_id": "srv_uuid",
  "staff_id": "staff_uuid",
  "slots": [
    {
      "start_time": "09:00",
      "end_time": "10:00",
      "is_available": true,
      "resources_available": ["chair_1"]
    },
    {
      "start_time": "10:00",
      "end_time": "11:00",
      "is_available": true,
      "resources_available": ["chair_1", "chair_2"]
    }
  ]
}
```

#### Payments

**POST /payments/intent**
```json
// Request
{
  "business_id": "business_uuid",
  "appointment_id": "apt_uuid",
  "amount": 85.00,
  "currency": "USD",
  "method": "card_present|card_not_present|mobile_banking",
  "split_with": [
    {"staff_id": "staff_uuid", "amount": 38.25, "type": "commission"}
  ],
  "metadata": {
    "tip_amount": 15.00,
    "discount_code": "SPRING10"
  }
}

// Response 200
{
  "id": "payment_intent_uuid",
  "client_secret": "pi_secret_key",
  "status": "requires_confirmation",
  "amount": 85.00,
  "breakdown": {
    "subtotal": 85.00,
    "tip": 15.00,
    "discount": -8.50,
    "total": 91.50
  }
}
```

**POST /payments/confirm**
```json
// Request
{
  "payment_intent_id": "payment_intent_uuid",
  "payment_method": {
    "type": "card",
    "card_token": "tok_visa"
  }
}

// Response 200
{
  "id": "payment_intent_uuid",
  "status": "succeeded",
  "charge_id": "ch_uuid",
  "receipt_url": "https://pay.bilillee.com/receipts/...",
  "commission_calculated": {
    "amount": 17.00,
    "is_first_booking": true,
    "platform_fee": 17.00,
    "net_to_business": 68.00
  }
}
```

**POST /payments/screenshot**
```json
// Request (multipart/form-data)
// image: [binary image file]
// appointment_id: "apt_uuid"
// amount: "85.00"

// Response 202
{
  "id": "screenshot_payment_uuid",
  "status": "pending_verification",
  "image_url": "https://cdn.bilillee.com/screenshots/...",
  "submitted_at": "2026-04-14T12:00:00Z",
  "requires_approval_by": "2026-04-14T14:00:00Z",
  "auto_cancel_if_not_approved": true
}
```

**POST /payments/screenshot/{id}/approve**
```json
// Request
{
  "approved": true,
  "notes": "Payment verified - matches reference number"
}

// Response 200
{
  "id": "screenshot_payment_uuid",
  "status": "approved",
  "appointment_confirmed": true,
  "approved_by": "staff_uuid",
  "approved_at": "2026-04-14T12:15:00Z"
}
```

#### Wallet & Payouts

**GET /wallet/{business_id}**
```json
// Response 200
{
  "business_id": "business_uuid",
  "balance": 1250.00,
  "currency": "USD",
  "available_for_payout": 1000.00,
  "pending_clearance": 250.00,
  "last_payout": {
    "amount": 500.00,
    "date": "2026-04-01T00:00:00Z",
    "status": "completed",
    "transaction_id": "payout_uuid"
  },
  "payout_schedule": "weekly",
  "payout_method": {
    "type": "bank_transfer",
    "bank_name": "Chase",
    "account_last4": "4242"
  }
}
```

**POST /wallet/{business_id}/withdraw**
```json
// Request
{
  "amount": 500.00,
  "method": "standard|instant"
}

// Response 200
{
  "payout_id": "payout_uuid",
  "amount": 500.00,
  "fee": 0.00,
  "net_amount": 500.00,
  "estimated_arrival": "2026-04-16T00:00:00Z",
  "status": "pending"
}
```

#### Marketplace

**GET /marketplace/search**
```json
// Query Parameters
// ?lat=40.7128&lng=-74.0060&radius=10&service=haircut&date=2026-04-15&price_max=100

// Response 200
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "radius_miles": 10
  },
  "filters_applied": {
    "service": "haircut",
    "date": "2026-04-15",
    "price_max": 100
  },
  "results": [
    {
      "business": {
        "id": "business_uuid",
        "name": "Glamour Studio",
        "slug": "glamour-studio",
        "rating": 4.8,
        "review_count": 127,
        "distance_miles": 2.3,
        "address": {
          "city": "New York",
          "state": "NY"
        },
        "thumbnail_url": "https://cdn.bilillee.com/businesses/...",
        "is_featured": false
      },
      "available_slots": [
        {
          "staff": {
            "id": "staff_uuid",
            "first_name": "Sarah",
            "rating": 4.9
          },
          "service": {
            "id": "srv_uuid",
            "name": "Women's Haircut",
            "price": 85.00,
            "duration": 60
          },
          "start_times": ["09:00", "14:00", "16:00"]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

**GET /marketplace/businesses/{id}**
```json
// Response 200
{
  "id": "business_uuid",
  "name": "Glamour Studio",
  "description": "Premium hair and nail services in the heart of NYC",
  "rating": 4.8,
  "review_count": 127,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "hours": { ... },
  "services": [
    {
      "id": "srv_uuid",
      "name": "Women's Haircut",
      "price": 85.00,
      "duration": 60,
      "description": "Precision cut with consultation"
    }
  ],
  "staff": [
    {
      "id": "staff_uuid",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "rating": 4.9,
      "specialties": ["balayage", "precision cuts"],
      "avatar_url": "https://cdn.bilillee.com/avatars/..."
    }
  ],
  "photos": [
    {
      "url": "https://cdn.bilillee.com/photos/...",
      "caption": "Our beautiful salon space"
    }
  ],
  "reviews": [
    {
      "id": "review_uuid",
      "client_name": "Emily D.",
      "rating": 5,
      "comment": "Sarah is amazing! Best haircut I've ever had.",
      "date": "2026-03-15T00:00:00Z",
      "is_verified": true
    }
  ],
  "booking_url": "https://book.bilillee.com/glamour-studio",
  "is_favorite": false
}
```

#### Loyalty & Packages

**GET /loyalty/{client_id}**
```json
// Response 200
{
  "client_id": "client_uuid",
  "business_id": "business_uuid",
  "points_balance": 450,
  "lifetime_earned": 1200,
  "lifetime_redeemed": 750,
  "tier": {
    "name": "Gold",
    "benefits": ["10% off all services", "Priority booking"],
    "next_tier": "Platinum",
    "points_to_next": 550
  },
  "recent_transactions": [
    {
      "id": "txn_uuid",
      "type": "earned",
      "points": 85,
      "description": "Women's Haircut - $85",
      "date": "2026-04-10T14:00:00Z"
    }
  ],
  "available_rewards": [
    {
      "id": "reward_uuid",
      "name": "$10 Off Next Service",
      "points_cost": 500,
      "expires_at": "2026-12-31T23:59:59Z"
    }
  ]
}
```

**GET /packages/{business_id}**
```json
// Response 200
{
  "data": [
    {
      "id": "pkg_uuid",
      "name": "Monthly Cut Club",
      "description": "One haircut per month at a discounted rate",
      "services": ["srv_uuid"],
      "total_sessions": 12,
      "validity_months": 12,
      "price": 780.00,
      "savings": 240.00,
      "is_active": true
    }
  ]
}
```

**POST /packages/{id}/purchase**
```json
// Request
{
  "client_id": "client_uuid",
  "payment_method_id": "pm_uuid"
}

// Response 201
{
  "purchase_id": "purchase_uuid",
  "package_id": "pkg_uuid",
  "client_id": "client_uuid",
  "sessions_total": 12,
  "sessions_remaining": 12,
  "valid_until": "2027-04-14T23:59:59Z",
  "status": "active"
}
```

#### Waitlist

**POST /waitlist**
```json
// Request
{
  "business_id": "business_uuid",
  "client": {
    "first_name": "Alex",
    "last_name": "Johnson",
    "phone": "+1-555-777-8888"
  },
  "preferred_staff_id": "staff_uuid",
  "preferred_service_id": "srv_uuid",
  "preferred_dates": ["2026-04-15", "2026-04-16", "2026-04-17"],
  "preferred_times": ["morning", "afternoon"],
  "flexibility": "same_day|within_3_days|within_week",
  "notes": "Need appointment before weekend event"
}

// Response 201
{
  "id": "waitlist_uuid",
  "position": 3,
  "estimated_notification": "2026-04-14T18:00:00Z",
  "status": "active"
}
```

**GET /waitlist/{business_id}**
```json
// Response 200
{
  "data": [
    {
      "id": "waitlist_uuid",
      "client": {
        "first_name": "Alex",
        "last_name": "Johnson"
      },
      "preferences": {
        "staff_id": "staff_uuid",
        "service_id": "srv_uuid",
        "dates": ["2026-04-15", "2026-04-16"]
      },
      "position": 1,
      "wait_time_hours": 4,
      "status": "active"
    }
  ]
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., double booking) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary outage |

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 | per minute |
| General API | 1000 | per minute |
| Marketplace Search | 100 | per minute |
| Payment Operations | 50 | per minute |
| Webhook Delivery | N/A | Retry 3x with backoff |

## Webhooks

**Configuration**
```json
POST /webhooks
{
  "url": "https://your-app.com/webhooks/bilillee",
  "events": [
    "appointment.created",
    "appointment.cancelled",
    "payment.succeeded",
    "payment.failed",
    "client.created"
  ],
  "secret": "whsec_your_secret"
}
```

**Event Payload Example**:
```json
{
  "id": "evt_uuid",
  "type": "appointment.created",
  "created_at": "2026-04-14T12:00:00Z",
  "data": {
    "appointment": { ... },
    "commission": { ... }
  }
}
```

## SDK & Client Libraries

```javascript
// JavaScript SDK Example
import Bilillee from '@bilillee/sdk';

const bilillee = new Bilillee({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create appointment
const appointment = await bilillee.appointments.create({
  businessId: 'biz_uuid',
  client: { firstName: 'Jane', phone: '+15551234567' },
  serviceId: 'srv_uuid',
  startTime: '2026-04-15T10:00:00'
});

// Check permissions
const canRefund = await bilillee.permissions.check('sales:refund');
```

---

**Version**: 1.0  
**Last Updated**: 2026-04-14  
**API Version**: v1
