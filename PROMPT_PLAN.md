# Bilillee - AI Prompt Engineering Plan

## Overview

This document outlines the AI/LLM integration strategy for Bilillee, including prompt templates, context management, and automation workflows.

## AI Use Cases

### 1. Smart Scheduling Assistant
**Purpose**: Natural language appointment booking and management

**System Prompt**:
```
You are Bilillee, a helpful scheduling assistant for beauty and wellness businesses. 
You help clients book appointments, answer questions about services, and manage existing bookings.

Context:
- Business: {business_name}
- Services: {available_services}
- Staff: {staff_members}
- Hours: {business_hours}
- Today's Date: {current_date}

Rules:
1. Always confirm availability before suggesting times
2. Respect buffer times between appointments
3. Ask for client contact info if not provided
4. Never double-book resources (rooms, equipment)
5. Be friendly but professional
6. If unsure, ask clarifying questions

Current conversation with: {client_name} (Phone: {client_phone})
```

**Example Interactions**:

| User Input | AI Response | Action |
|------------|-------------|--------|
| "I need a haircut tomorrow" | "I'd be happy to help! We have availability tomorrow (April 15) at 10:00 AM, 2:00 PM, or 4:30 PM with Sarah. Which works best for you?" | Show available slots |
| "Book me with Mike" | "Great choice! Mike is available for the following services: [list]. What service would you like and when?" | List services by staff |
| "Cancel my appointment" | "I can help with that. I see you have an appointment on April 16 at 3:00 PM for a facial. Would you like me to cancel this?" | Confirm cancellation |

### 2. Review Response Generator
**Purpose**: Generate personalized responses to customer reviews

**System Prompt**:
```
You are a business owner responding to customer reviews. Generate a personalized, 
grateful response that addresses specific points mentioned in the review.

Business: {business_name}
Service Provided: {service_name}
Staff Member: {staff_name}

Tone Guidelines:
- 5-star reviews: Enthusiastic, personal, invite back
- 4-star reviews: Appreciative, address minor concerns
- 3-star and below: Empathetic, offer to make it right, take offline

Rules:
1. Never use generic templates
2. Mention specific details from the review
3. Keep responses under 100 words
4. Include staff name if mentioned positively
5. For negative reviews, provide contact info for resolution
```

**Few-Shot Examples**:

**Input Review**:
> "Sarah was amazing! She really listened to what I wanted and my balayage turned out perfect. The salon is so cute too. Will definitely be back!"

**Generated Response**:
> "Thank you so much, [Name]! 🎉 Sarah will be thrilled to hear you love your balayage—she truly has an eye for creating that perfect sun-kissed look. We're so glad you enjoyed the salon vibe too! Can't wait to see you at your next appointment. 💕"

---

**Input Review**:
> "Service was okay but had to wait 20 minutes past my appointment time. The haircut was fine but not worth the price."

**Generated Response**:
> "Hi [Name], thank you for your honest feedback. I'm truly sorry about the wait time—that's not the experience we want for our guests. I'd love to make this right for you. Please reach out to me directly at [phone] or [email] so we can discuss how to improve your next visit. — [Owner Name]"

### 3. Service Recommendation Engine
**Purpose**: Suggest services based on client history and preferences

**Context Prompt**:
```
Recommend services for a client based on their profile and history.

Client Profile:
- Name: {client_name}
- Preferred Staff: {preferred_staff}
- Past Services: {service_history}
- Last Visit: {last_visit_date}
- Total Spent: {lifetime_value}
- Loyalty Points: {points_balance}

Available Services: {services_with_prices}

Rules:
1. Consider seasonal relevance (e.g., facials in winter, waxing before summer)
2. Suggest upgrades or add-ons to previous services
3. Respect price sensitivity (don't suggest 3x their average spend)
4. Mention loyalty point redemption opportunities
5. Prioritize their preferred staff's availability
```

**Example Output**:
```json
{
  "recommendations": [
    {
      "service": "Hydrating Facial",
      "reason": "It's been 8 weeks since your last facial, and winter weather can be harsh on skin",
      "staff": "Sarah (your preferred)",
      "price": "$85",
      "loyalty_discount": "Use 500 points for $10 off"
    },
    {
      "service": "Brow Lamination",
      "reason": "Popular add-on to your usual brow shaping",
      "staff": "Available with any brow specialist",
      "price": "$45"
    }
  ]
}
```

### 4. No-Show Risk Prediction
**Purpose**: Identify appointments likely to no-show for proactive outreach

**Analysis Prompt**:
```
Analyze this appointment for no-show risk based on historical patterns.

Appointment Details:
- Client: {client_name}
- Service: {service_name}
- Date/Time: {appointment_datetime}
- Booking Time: {booking_timestamp}
- Deposit Paid: {deposit_amount}
- Previous No-Shows: {no_show_count}
- Previous Cancellations: {cancellation_count}
- Total Bookings: {total_bookings}
- Booking Source: {source}

Risk Factors to Consider:
1. First-time client without deposit (HIGH RISK)
2. Booked far in advance (>14 days)
3. History of no-shows/cancellations
4. No confirmation response
5. Weekend/evening appointments (higher no-show rates)
6. Low-cost services (less skin in the game)

Output JSON:
{
  "risk_level": "LOW|MEDIUM|HIGH",
  "risk_score": 0-100,
  "factors": ["reason1", "reason2"],
  "recommended_action": "Send reminder|Request confirmation|Call directly|No action"
}
```

### 5. Smart Waitlist Matcher
**Purpose**: Match cancelled appointments with waitlisted clients optimally

**Matching Prompt**:
```
Find the best client from the waitlist to fill a cancelled appointment slot.

Available Slot:
- Date/Time: {slot_datetime}
- Duration: {duration_minutes}
- Service: {service_name}
- Staff: {staff_name}
- Room: {room_name}

Waitlist Candidates:
{waitlist_clients}

Optimization Criteria (weighted):
1. Exact service match (weight: 30%)
2. Staff preference match (weight: 25%)
3. Time flexibility (can they come earlier/later?) (weight: 20%)
4. Wait time (how long they've been waiting) (weight: 15%)
5. Client value (lifetime spend) (weight: 10%)

Constraints:
- Must be able to arrive by slot time
- No conflicting appointments
- Must match service requirements (e.g., specific room/equipment)

Output JSON:
{
  "recommended_client": "client_id",
  "confidence": 0-100,
  "reasoning": "explanation",
  "alternative_slots": ["option1", "option2"],
  "notification_message": "personalized message to send"
}
```

### 6. Inventory Intelligence
**Purpose**: Predict stock needs and generate reorder recommendations

**Analysis Prompt**:
```
Analyze inventory data and generate restock recommendations.

Product: {product_name}
Current Stock: {current_quantity}
Reorder Point: {reorder_threshold}
Lead Time: {supplier_lead_time_days}

Sales History (90 days):
{sales_velocity_data}

Seasonal Factors:
- Current season: {season}
- Upcoming holidays/events: {events}

Supplier Info:
- Minimum order quantity: {moq}
- Unit cost: {cost_price}
- Current retail price: {retail_price}

Predict:
1. Days until stockout
2. Optimal reorder quantity
3. Revenue at risk if stockout occurs
4. Overstock risk if ordering MOQ

Output JSON:
{
  "status": "CRITICAL|WARNING|OK",
  "days_until_stockout": number,
  "recommended_order_qty": number,
  "urgency": "Immediate|This week|Next week",
  "revenue_at_risk": "$X",
  "suggested_action": "Place order|Monitor closely|No action",
  "alternative_products": ["substitute1", "substitute2"]
}
```

### 7. Marketing Content Generator
**Purpose**: Generate social media posts, email campaigns, and promotions

**Campaign Prompt**:
```
Generate marketing content for a beauty/wellness business.

Business: {business_name}
Type: {business_type}
Tone: {brand_tone} (e.g., "Luxury", "Playful", "Wellness-focused")
Audience: {target_demographic}

Campaign Details:
- Type: {campaign_type} (new service, promotion, seasonal, etc.)
- Offer: {offer_details}
- Valid Dates: {start_date} to {end_date}
- Restrictions: {terms_conditions}

Generate:
1. Instagram caption (with hashtags)
2. Instagram Story text (short, punchy)
3. Email subject line (5 options)
4. Email body (HTML-friendly)
5. Google My Business post
6. SMS text (under 160 chars)

Rules:
- Include clear call-to-action
- Create urgency without being pushy
- Mention booking link: {booking_url}
- Use emojis appropriately for beauty industry
- Avoid all caps and excessive punctuation
```

**Example Output**:
```
Instagram Caption:
✨ New Service Alert! ✨

Say hello to our NEW HydraFacial treatment—your skin's new best friend! 💧

For a limited time, get $25 off your first HydraFacial when you book through our app. 
Perfect for that pre-summer glow! ☀️

Tap the link in bio to book your glow-up session ✨

#HydraFacial #Skincare #GlowUp #Beauty #[BusinessName] #[CityName] #Facial #SelfCareSunday

---

Email Subject Lines:
1. "Your skin called—it wants a HydraFacial 💧"
2. "New service + $25 off = Perfect timing ✨"
3. "Ready for your glow-up, [FirstName]?"
4. "Introducing: The facial everyone’s talking about"
5. "$25 off our newest treatment (limited time)"
```

### 8. Support Ticket Triage
**Purpose**: Classify and route customer support inquiries

**Triage Prompt**:
```
Classify this support ticket and determine priority and routing.

Ticket:
- From: {user_type} (business owner/staff/consumer)
- Subject: {subject}
- Message: {message_body}
- Business ID: {business_id}
- Account Age: {account_age_days}
- Plan: {subscription_tier}

Categories:
- TECHNICAL: App bugs, login issues, payment failures
- BILLING: Commission questions, payouts, refunds
- ONBOARDING: Setup help, training, feature questions
- URGENT: System down, data loss, security concern
- GENERAL: Feature requests, feedback, how-to

Priority Matrix:
- P0 (Immediate): System down, payment stuck, data breach
- P1 (Today): Can't book, can't access account, payout issue
- P2 (This week): Feature questions, minor bugs
- P3 (Backlog): Feature requests, general feedback

Output JSON:
{
  "category": "TECHNICAL|BILLING|ONBOARDING|URGENT|GENERAL",
  "priority": "P0|P1|P2|P3",
  "routing": "engineering|billing|success|general",
  "suggested_response": "draft response or template to use",
  "auto_resolvable": true|false,
  "knowledge_base_article": "link if applicable"
}
```

## Context Management Strategy

### 1. RAG (Retrieval Augmented Generation) Setup

**Knowledge Base Structure**:
```
kb/
├── business_profiles/
│   ├── {business_id}_services.json
│   ├── {business_id}_staff.json
│   ├── {business_id}_policies.json
│   └── {business_id}_faqs.json
├── platform/
│   ├── features.md
│   ├── pricing.md
│   ├── troubleshooting.md
│   └── policies/
│       ├── cancellation.md
│       ├── refunds.md
│       └── privacy.md
└── templates/
    ├── email_templates/
    ├── sms_templates/
    └── response_templates/
```

**Retrieval Strategy**:
- Use vector embeddings for semantic search
- Cache frequently accessed business data (Redis)
- Real-time sync for availability/calendar data
- Version control for policy documents

### 2. Conversation Memory

**Session Context**:
```json
{
  "session_id": "uuid",
  "user_id": "user_uuid",
  "business_id": "business_uuid",
  "role": "owner|staff|consumer",
  "conversation_history": [
    {"role": "user", "content": "...", "timestamp": "..."},
    {"role": "assistant", "content": "...", "timestamp": "..."}
  ],
  "extracted_entities": {
    "requested_service": "haircut",
    "preferred_date": "2026-04-20",
    "preferred_staff": "Sarah"
  },
  "pending_action": "awaiting_time_selection"
}
```

**Memory Management**:
- Keep last 10 messages in context window
- Summarize older conversations if > 24 hours
- Persist key facts (preferences, restrictions) to user profile

### 3. Multi-Modal Inputs

**Image Processing** (for screenshot payments):
```
Analyze this payment screenshot for verification.

Extract:
1. Amount transferred
2. Recipient account/name
3. Transaction ID/reference
4. Timestamp
5. Sender information (if visible)

Compare against:
- Expected amount: {expected_amount}
- Business account details: {business_bank_info}
- Booking reference: {booking_ref}

Output:
{
  "is_valid": true|false,
  "confidence": 0-100,
  "extracted_amount": "$XX.XX",
  "matches_expected": true|false,
  "notes": "any discrepancies or concerns",
  "requires_manual_review": true|false
}
```

## Automation Workflows

### Workflow 1: Smart Reminders
**Trigger**: 24 hours before appointment
**Action**: AI generates personalized reminder

```
Context:
- Client: {name}
- Service: {service}
- Staff: {staff}
- History: {past_visits}

Generate reminder message that:
1. Confirms appointment details
2. Includes preparation instructions (if needed)
3. Mentions any outstanding balance
4. Provides easy reschedule/cancel options
5. Personalizes based on relationship (first-timer vs. regular)
```

### Workflow 2: Win-Back Campaign
**Trigger**: 60 days since last appointment
**Action**: AI generates personalized re-engagement

```
Context:
- Client: {name}
- Last Service: {service}
- Last Visit: {date}
- Total Visits: {count}
- Preferred Staff: {staff}

Generate win-back offer that:
1. Acknowledges absence without being pushy
2. Suggests their favorite service or something new
3. Offers incentive (loyalty points, small discount)
4. Highlights what's new since they last visited
5. Easy one-click booking
```

### Workflow 3: Review Request
**Trigger**: 2 hours after appointment completion
**Action**: AI generates review request

```
Context:
- Client: {name}
- Service: {service}
- Staff: {staff}
- Rating Prediction: {high|medium|low} (based on history)

Generate review request that:
1. Thanks them for visiting
2. Asks for feedback (if prediction is uncertain)
3. Directs to Google/Yelp if likely positive
4. Offers private feedback option if concerns exist
5. Includes direct review links
```

## Safety & Guardrails

### Content Policies

**Prohibited Actions**:
- Never share other clients' information
- Never modify confirmed appointments without explicit consent
- Never process refunds above $X without human approval
- Never promise availability without checking calendar
- Never give medical advice (wellness context)

**Validation Layer**:
```python
def validate_ai_action(action, context):
    checks = {
        "modify_booking": requires_confirmation(),
        "process_refund": amount < 100 and staff_permission(),
        "share_data": is_own_data_only(),
        "medical_advice": block_and_escalate(),
    }
    return all(checks.get(action, True))
```

### Bias Mitigation

**Guidelines**:
- Use gender-neutral language unless specified
- Avoid assumptions about client preferences
- Respect cultural differences in beauty standards
- Inclusive language for all body types and skin tones

### Privacy Protection

**Data Handling**:
- PII redacted from logs
- Client data only accessible to authorized staff
- No training on customer conversations
- 30-day retention for AI conversation logs

## Implementation Roadmap

| Phase | Features | Timeline |
|-------|----------|----------|
| 1 | Review responses, Service recommendations | Month 1-2 |
| 2 | Scheduling assistant, Waitlist matcher | Month 3-4 |
| 3 | No-show prediction, Inventory intelligence | Month 5-6 |
| 4 | Marketing generator, Support triage | Month 7-8 |
| 5 | Multi-modal (image analysis), Advanced personalization | Month 9-12 |

## Model Selection

| Use Case | Recommended Model | Rationale |
|----------|-------------------|-----------|
| Scheduling Assistant | GPT-4 / Claude 3 | High accuracy, complex reasoning |
| Review Responses | GPT-3.5 / Claude 3 Haiku | Cost-effective, creative writing |
| Content Generation | GPT-4 / Claude 3 | Quality marketing copy |
| Classification (Triage) | Fine-tuned BERT | Fast, deterministic |
| Image Analysis | GPT-4V / Claude 3 Vision | Screenshot verification |
| Embeddings | text-embedding-3-large | RAG retrieval quality |

## Evaluation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Accuracy | >95% | Human review of samples |
| User Satisfaction | >4.5/5 | Post-interaction rating |
| Task Completion Rate | >80% | Fully resolved without human |
| Latency | <2s | Time to first token |
| Cost per Conversation | <$0.10 | API cost tracking |
| Hallucination Rate | <1% | Factual error detection |

---

**Version**: 1.0  
**Last Updated**: 2026-04-14  
**Owner**: AI/ML Team
