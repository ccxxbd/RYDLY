# RYDLY

**Ride together. Go further.**

RYDLY is a Bangladesh-first rider community platform, designed for English and Bangla users and structured for international expansion. It brings rider identity, motorcycle ownership, social riding, clubs, group rides and a rider-to-rider marketplace together.

## Implemented foundation

- Responsive RYDLY public landing page.
- Supabase email/password registration and login.
- Email confirmation callback route.
- Protected rider dashboard and sign-out.
- Supabase browser/server clients and middleware session refresh.
- PostgreSQL migration for profiles, motorcycles, posts, reactions, comments, follows, clubs, rides, ride participants, marketplace listings and reports.
- Row Level Security policies on the core tables.

The feed, ride cards and marketplace preview on the public homepage are sample content. The rider dashboard currently provides the authenticated entry point; garage, clubs, rides and marketplace screens are the next implementation milestones.

## Technology

- Next.js 15, React 19 and TypeScript
- Tailwind CSS 4 and Lucide icons
- Supabase Auth and PostgreSQL with Row Level Security

## Local setup

1. Install dependencies with npm install.
2. Copy .env.example to .env.local.
3. Add your Supabase project URL and publishable/anon key.
4. Run npm run dev.

Required environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Supabase setup

1. Create a Supabase project.
2. In Project Settings → API, copy the Project URL and publishable key (or legacy anon key).
3. Add both values to Vercel Environment Variables for Preview and Production.
4. Open Supabase SQL Editor and run supabase/migrations/0001_rydly_core.sql.
5. In Authentication → URL Configuration, set the Site URL to your deployed domain.
6. Add allowed redirect URLs for your local and deployed callback routes, including http://localhost:3000/auth/callback and https://YOUR_DOMAIN/auth/callback.
7. Redeploy on Vercel after adding environment variables.

Never expose a Supabase service-role key in browser code or commit it to GitHub. The app only needs the public publishable/anon key in these two NEXT_PUBLIC variables.

## Roadmap

1. Authentication and rider account foundation — implemented.
2. Rider profile editor and motorcycle garage.
3. Live social feed, follows, comments, media storage and notifications.
4. Clubs, ride creation, registration and organizer tools.
5. Classified marketplace with seller enquiries and moderation.
6. Achievements, ride passport, business directory and mobile apps.

## Product principles

- Safety and privacy before engagement mechanics.
- No speed contests or incentives for risky riding.
- Location sharing must be opt-in, temporary and clearly visible.
- Marketplace starts with classifieds and enquiries; payments and escrow require separate legal and operational review.
- Bangladesh-first launch, with country-aware data structures for expansion.
