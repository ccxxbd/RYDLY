# RYDLY

**Ride together. Go further.**

RYDLY is a rider-first community platform: social riding, group rides, motorcycle ownership, achievements and a rider-to-rider marketplace in one place.

## Current status

This repository starts with the responsive public-facing product foundation. The current homepage is a frontend concept with sample content and local interaction states. It is not yet connected to authentication, a database, maps, messaging, payments or live GPS.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4
- Lucide icons

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Product roadmap

1. **Foundation:** Supabase project, authentication, profiles, rider privacy and role model.
2. **Rider core:** garage, follows, feed, posts, comments, reactions and notifications.
3. **Ride network:** clubs, events, ride requests, organizer tools and safety checklists.
4. **Marketplace:** motorcycle/parts/gear listings, seller profiles, enquiries, moderation and reporting.
5. **Progress:** achievements, ride passport and responsible-riding challenges.
6. **Trust & scale:** business directory, moderation console, analytics, PWA and native mobile apps.

## Product principles

- Safety and privacy before engagement mechanics.
- No speed contests or incentives for risky riding.
- Location sharing is opt-in, temporary and clearly visible.
- Marketplace starts as classifieds and enquiries; payments/escrow are a later, compliance-reviewed phase.
- Bangladesh-first launch, designed to expand internationally.

## Environment

No secrets are required for the initial frontend. Supabase and map credentials will be added only when those integrations are implemented. Never commit private keys or service-role credentials.
