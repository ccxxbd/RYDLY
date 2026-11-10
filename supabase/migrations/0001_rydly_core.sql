create extension if not exists pgcrypto;
create type public.listing_status as enum ('draft','active','sold','archived','removed');
create type public.ride_status as enum ('draft','published','full','cancelled','completed');
create type public.participation_status as enum ('requested','approved','rejected','cancelled','attended');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique,
 display_name text not null default 'Rider',
 bio text, avatar_url text, city text,
 country_code char(2) not null default 'BD',
 preferred_language text not null default 'en' check (preferred_language in ('en','bn')),
 is_verified boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint username_format check (username is null or username ~ '^[a-zA-Z0-9_.]{3,24}$')
);
create table public.motorcycles (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete cascade,
 make text not null, model text not null,
 year smallint, engine_cc integer, registration_number text, nickname text,
 photo_url text, is_primary boolean not null default false, created_at timestamptz not null default now()
);
create table public.posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null default '', media_urls text[] not null default '{}',
 visibility text not null default 'public' check (visibility in ('public','followers','clubs')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (length(body)<=5000 and cardinality(media_urls)<=10 and (length(body)>0 or cardinality(media_urls)>0))
);
create table public.post_reactions (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 reaction text not null default 'like' check (reaction in ('like','love','respect')),
 created_at timestamptz not null default now(), primary key(post_id,user_id)
);
create table public.post_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(length(body) between 1 and 2000), created_at timestamptz not null default now()
);
create table public.follows (
 follower_id uuid not null references public.profiles(id) on delete cascade,
 following_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(follower_id,following_id), check(follower_id<>following_id)
);
create table public.clubs (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
 description text, city text, country_code char(2) not null default 'BD',
 cover_url text, created_by uuid not null references public.profiles(id),
 is_public boolean not null default true, created_at timestamptz not null default now()
);
create table public.club_members (
 club_id uuid not null references public.clubs(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null default 'member' check(role in ('member','moderator','admin')),
 joined_at timestamptz not null default now(), primary key(club_id,user_id)
);
create table public.rides (
 id uuid primary key default gen_random_uuid(),
 organizer_id uuid not null references public.profiles(id),
 club_id uuid references public.clubs(id) on delete set null,
 title text not null, description text, start_location text not null, destination text not null,
 city text, country_code char(2) not null default 'BD', starts_at timestamptz not null, ends_at timestamptz,
 distance_km numeric(8,2), max_riders integer, safety_notes text,
 status public.ride_status not null default 'draft', created_at timestamptz not null default now(),
 check(ends_at is null or ends_at>starts_at), check(distance_km is null or distance_km>0), check(max_riders is null or max_riders>0)
);
create table public.ride_participants (
 ride_id uuid not null references public.rides(id) on delete cascade,
 rider_id uuid not null references public.profiles(id) on delete cascade,
 status public.participation_status not null default 'requested',
 requested_at timestamptz not null default now(), primary key(ride_id,rider_id)
);
create table public.marketplace_listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references public.profiles(id),
 category text not null check(category in ('motorcycle','parts','gear','accessories','services')),
 title text not null, description text, price_bdt numeric(12,2), condition text,
 city text, country_code char(2) not null default 'BD', image_urls text[] not null default '{}',
 status public.listing_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(price_bdt is null or price_bdt>=0)
);
create table public.reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references public.profiles(id),
 target_type text not null check(target_type in ('profile','post','comment','ride','club','listing')),
 target_id uuid not null, reason text not null, details text,
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 insert into public.profiles(id,display_name,preferred_language,country_code)
 values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1),'Rider'),
 case when new.raw_user_meta_data->>'preferred_language'='bn' then 'bn' else 'en' end,
 coalesce(nullif(new.raw_user_meta_data->>'country_code',''),'BD'))
 on conflict(id) do nothing;
 return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.post_comments enable row level security;
alter table public.follows enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.rides enable row level security;
alter table public.ride_participants enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.reports enable row level security;

create policy "Authenticated riders read profiles" on public.profiles for select to authenticated using(true);
create policy "Riders update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "Owners manage motorcycles" on public.motorcycles for all to authenticated using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
create policy "Read public or own posts" on public.posts for select to authenticated using(visibility='public' or author_id=auth.uid());
create policy "Create own posts" on public.posts for insert to authenticated with check(auth.uid()=author_id);
create policy "Update own posts" on public.posts for update to authenticated using(auth.uid()=author_id) with check(auth.uid()=author_id);
create policy "Delete own posts" on public.posts for delete to authenticated using(auth.uid()=author_id);
create policy "Read reactions" on public.post_reactions for select to authenticated using(true);
create policy "Manage own reactions" on public.post_reactions for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Read comments" on public.post_comments for select to authenticated using(true);
create policy "Create own comments" on public.post_comments for insert to authenticated with check(auth.uid()=author_id);
create policy "Update own comments" on public.post_comments for update to authenticated using(auth.uid()=author_id) with check(auth.uid()=author_id);
create policy "Delete own comments" on public.post_comments for delete to authenticated using(auth.uid()=author_id);
create policy "Read follows" on public.follows for select to authenticated using(true);
create policy "Manage own follows" on public.follows for all to authenticated using(auth.uid()=follower_id) with check(auth.uid()=follower_id);
create policy "Read public clubs" on public.clubs for select to authenticated using(is_public or created_by=auth.uid());
create policy "Create clubs" on public.clubs for insert to authenticated with check(auth.uid()=created_by);
create policy "Update own clubs" on public.clubs for update to authenticated using(auth.uid()=created_by) with check(auth.uid()=created_by);
create policy "Read memberships" on public.club_members for select to authenticated using(true);
create policy "Join clubs as a regular member" on public.club_members for insert to authenticated with check(auth.uid()=user_id and role='member');
create policy "Leave as self" on public.club_members for delete to authenticated using(auth.uid()=user_id);
create policy "Read published rides" on public.rides for select to authenticated using(status in('published','full','completed') or organizer_id=auth.uid());
create policy "Create rides" on public.rides for insert to authenticated with check(auth.uid()=organizer_id);
create policy "Update own rides" on public.rides for update to authenticated using(auth.uid()=organizer_id) with check(auth.uid()=organizer_id);
create policy "Delete own rides" on public.rides for delete to authenticated using(auth.uid()=organizer_id);
create policy "Read ride participants" on public.ride_participants for select to authenticated using(true);
create policy "Request ride participation" on public.ride_participants for insert to authenticated with check(auth.uid()=rider_id and status='requested');
create policy "Cancel own request" on public.ride_participants for delete to authenticated using(auth.uid()=rider_id);
create policy "Read active or own listings" on public.marketplace_listings for select to authenticated using(status='active' or seller_id=auth.uid());
create policy "Create own listings" on public.marketplace_listings for insert to authenticated with check(auth.uid()=seller_id);
create policy "Update own listings" on public.marketplace_listings for update to authenticated using(auth.uid()=seller_id) with check(auth.uid()=seller_id);
create policy "Delete own listings" on public.marketplace_listings for delete to authenticated using(auth.uid()=seller_id);
create policy "Create own reports" on public.reports for insert to authenticated with check(auth.uid()=reporter_id);
create policy "Read own reports" on public.reports for select to authenticated using(auth.uid()=reporter_id);
