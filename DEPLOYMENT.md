# ARKLINE Developments — Decking Quote Quiz Funnel Deployment Guide

This guide details the architecture, design tokens, configuration parameters, measurement hooks, and hosting setup for the **ARKLINE Developments** mobile-first decking quote quiz funnel.

---

## 1. Customer Journey & Philosophy

The funnel follows a focused, Perspective-style quiz format:
$$\text{Ad Traffic} \longrightarrow \text{Welcome Screen} \longrightarrow \text{Questions 1–4} \longrightarrow \text{Contact Details} \longrightarrow \text{Phone Call} \longrightarrow \text{Site Visit} \longrightarrow \text{Free Quote}$$

- **One Question Per Screen**: Users are guided step-by-step with large selectable answer cards.
- **Explicit Continue Action**: Users select an answer and tap Continue, allowing natural review without unwanted accidental transitions.
- **Back Button & Memory Preservation**: Answers are preserved in-memory across the entire session when navigating backwards.
- **Submitting is an Enquiry**: Does not promise instant pricing or commit the homeowner to an installation.

---

## 2. ARKLINE Design Tokens

- **Colours**:
  - Bronze accent: `#AD855C`
  - Cream (background): `#F6F0EA`
  - Deep brown (primary buttons & headings): `#362617`
  - White (cards): `#FFFFFF`
  - Black: `#000000`
- **Typography**:
  - Headings: `Halyard Micro` / `Plus Jakarta Sans`, bold 700, line-height 1.2.
  - Body, labels, buttons: `Space Mono`, regular 400, line-height 1.4.
  - Input text: at least 16px (prevents iOS auto-zoom).
- **Controls**:
  - Primary button: Solid pill in Deep Brown (`#362617`) with White text.
  - Answer cards: Simple outline with clear selected state.

---

## 3. Central Configuration (`src/config/deckingQuoteConfig.ts`)

```typescript
export const deckingQuizConfig = {
  brand: {
    name: 'ARKLINE Developments',
    logoUrl: 'https://images.squarespace-cdn.com/.../Brown_Minimalist_Real_Estate_Logo...png',
    serviceArea: 'Stourbridge and surrounding areas',
    proofBadge: 'Award-winning ARKLINE Developments',
  },
  welcome: {
    headline: 'Request Your Free Decking Quote',
    supportingText: 'Thinking about refreshing your outdoor space?...',
    startButtonText: 'Start My Quote Request',
    deckingPhotoUrl: 'https://images.squarespace-cdn.com/.../IMG_4787.png', // Genuine project photo
  },
  questions: {
    q1: { /* Garden plans */ },
    q2: { /* Postcode */ },
    q3: { /* Timing */ },
    q4: { /* Call windows */ },
  },
  contact: {
    privacyPolicyUrl: 'https://www.arklinedevelopments.com/privacy-policy',
  },
  business: {
    phoneNumber: '+44 7949 123456', // Leave empty "" to hide call button
    displayPhoneNumber: '07949 123456',
    submissionEndpoint: '/api/quote-request', // Leave empty "" to test unconnected warning
    hostingPath: '/decking-quote',
  },
};
```

---

## 4. Measurement & Analytics Hooks (`src/utils/measurement.ts`)

Clearly named integration points are provided for custom analytics, Google Tag Manager, or Meta Conversions:

| Hook | Dispatched When | Payload Data |
|---|---|---|
| `measurement.trackQuizStarted()` | Homeowner clicks "Start My Quote Request" | `{ event: 'quiz_started', campaign, timestamp }` |
| `measurement.trackStepCompleted(stepNum, stepName)` | A question stage is completed | `{ event: 'quiz_step_completed', stepNumber, stepName }` |
| `measurement.trackLeadSubmitted(enquiryId)` | Server confirms saved enquiry | `{ event: 'lead_submitted_verified', enquiryId, campaign }` |

*Note: In accordance with privacy requirements, names, phone numbers, and postcodes are NEVER passed to analytics.*

---

## 5. Security & Verification

- **Spam Prevention**: Invisible honeypot field (`website_hp`) blocks automated submissions.
- **Server-Side Validation**: Validates full name, UK telephone number, and UK postcode format.
- **No Simulation Rule**: If `submissionEndpoint` is empty or unreachable, the UI clearly displays an unconnected warning. Real customer enquiries are never faked.
