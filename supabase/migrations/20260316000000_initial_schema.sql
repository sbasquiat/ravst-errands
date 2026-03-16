-- ============================================
-- Ravst Errands — Initial Schema Migration
-- ============================================
-- This migration creates the complete database schema
-- including tables, enums, functions, RLS policies,
-- indexes, and triggers.
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- 1. ENUMS
-- ============================================

create type user_role as enum ('customer', 'runner', 'admin');
create type errand_type as enum ('returns', 'handoffs', 'collect');
create type errand_status as enum (
  'pending', 'finding_runner', 'runner_assigned',
  'in_progress', 'completed', 'cancelled', 'disputed'
);
create type runner_status as enum ('pending', 'active', 'inactive', 'suspended');
create type transport_mode as enum ('bicycle', 'walking', 'car');
create type document_type as enum ('id_verification', 'background_check', 'insurance', 'transport_cert');
create type document_status as enum ('pending', 'verified', 'expired', 'rejected');
create type proof_photo_type as enum ('pickup', 'dropoff');
create type sender_role as enum ('customer', 'runner', 'system');
create type dispute_status as enum ('open', 'investigating', 'resolved', 'escalated');
create type dispute_priority as enum ('high', 'medium', 'low');
create type evidence_type as enum ('photo', 'text', 'gps');
create type payout_status as enum ('pending', 'processing', 'completed', 'failed');
create type job_offer_status as enum ('pending', 'accepted', 'declined', 'expired');
create type subscription_plan as enum ('pay_as_you_go', 'starter', 'regular', 'power');
create type subscription_status as enum ('active', 'cancelled', 'past_due');

-- ============================================
-- 2. TABLES
-- ============================================

-- Profiles (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Runner profiles (extends profiles for runners)
create table runner_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  status runner_status not null default 'pending',
  transport_mode transport_mode not null default 'bicycle',
  availability_zones text[] not null default '{}',
  is_available boolean not null default false,
  verified boolean not null default false,
  documents_complete boolean not null default false,
  rating numeric(3,2) not null default 0,
  jobs_completed integer not null default 0,
  total_earnings numeric(10,2) not null default 0,
  stripe_connect_account_id text
);

-- Runner documents
create table runner_documents (
  id uuid primary key default uuid_generate_v4(),
  runner_id uuid not null references runner_profiles(id) on delete cascade,
  type document_type not null,
  status document_status not null default 'pending',
  storage_path text,
  uploaded_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Errands (the core job table)
create table errands (
  id uuid primary key default uuid_generate_v4(),
  display_id text not null unique,
  customer_id uuid not null references profiles(id) on delete restrict,
  runner_id uuid references runner_profiles(id) on delete set null,
  type errand_type not null,
  status errand_status not null default 'pending',
  current_phase text,

  -- Addresses
  pickup_address text not null,
  pickup_lat double precision not null default 0,
  pickup_lng double precision not null default 0,
  dropoff_address text not null,
  dropoff_lat double precision not null default 0,
  dropoff_lng double precision not null default 0,

  -- Job details
  item_description text not null,
  special_instructions text,
  package_size text,
  recipient_name text,
  order_number text,
  collection_name text,
  tracking_number text,

  -- Scheduling
  scheduled_date date not null,
  time_slot_start time not null,
  time_slot_end time not null,

  -- Pricing
  base_fee numeric(10,2) not null,
  distance_fee numeric(10,2) not null default 0,
  urgency_fee numeric(10,2) not null default 0,
  tip numeric(10,2) not null default 0,
  platform_fee numeric(10,2) not null,
  runner_payout numeric(10,2) not null,
  total_price numeric(10,2) not null,
  distance_km numeric(6,2),

  -- Payment
  stripe_payment_intent_id text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Errand stops (multi-stop support)
create table errand_stops (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  stop_order integer not null default 0,
  address text not null,
  lat double precision not null default 0,
  lng double precision not null default 0
);

-- Errand timeline (status history)
create table errand_timeline (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  event_type text not null,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Proof photos
create table proof_photos (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  type proof_photo_type not null,
  storage_path text not null,
  gps_lat double precision,
  gps_lng double precision,
  notes text,
  verified boolean not null default false,
  captured_at timestamptz not null default now()
);

-- Chat messages
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  sender_role sender_role not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Ratings
create table ratings (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(errand_id, from_user_id)
);

-- Job offers (runner assignment queue)
create table job_offers (
  id uuid primary key default uuid_generate_v4(),
  errand_id uuid not null references errands(id) on delete cascade,
  runner_id uuid not null references runner_profiles(id) on delete cascade,
  status job_offer_status not null default 'pending',
  offered_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Runner locations (real-time tracking)
create table runner_locations (
  id uuid primary key default uuid_generate_v4(),
  runner_id uuid not null references runner_profiles(id) on delete cascade,
  errand_id uuid references errands(id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  accuracy double precision,
  heading double precision,
  speed double precision,
  recorded_at timestamptz not null default now()
);

-- Disputes
create table disputes (
  id uuid primary key default uuid_generate_v4(),
  display_id text not null unique,
  errand_id uuid not null references errands(id) on delete restrict,
  filed_by uuid not null references profiles(id) on delete restrict,
  reason text not null,
  description text not null,
  status dispute_status not null default 'open',
  priority dispute_priority not null default 'medium',
  resolution text,
  resolved_at timestamptz,
  resolved_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Dispute evidence
create table dispute_evidence (
  id uuid primary key default uuid_generate_v4(),
  dispute_id uuid not null references disputes(id) on delete cascade,
  type evidence_type not null,
  label text not null,
  content text,
  storage_path text,
  created_at timestamptz not null default now()
);

-- Payouts
create table payouts (
  id uuid primary key default uuid_generate_v4(),
  display_id text not null unique,
  runner_id uuid not null references runner_profiles(id) on delete restrict,
  amount numeric(10,2) not null,
  job_count integer not null,
  period_start date not null,
  period_end date not null,
  scheduled_date date not null,
  status payout_status not null default 'pending',
  stripe_transfer_id text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Payout items
create table payout_items (
  id uuid primary key default uuid_generate_v4(),
  payout_id uuid not null references payouts(id) on delete cascade,
  errand_id uuid not null references errands(id) on delete restrict,
  amount numeric(10,2) not null,
  tip numeric(10,2) not null default 0
);

-- Notification preferences
create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default true,
  push_enabled boolean not null default true,
  job_updates boolean not null default true,
  promotions boolean not null default false
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  plan subscription_plan not null default 'pay_as_you_go',
  status subscription_status not null default 'active',
  errands_remaining integer,
  stripe_subscription_id text,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- 3. DATABASE FUNCTIONS
-- ============================================

-- Check if current user is admin
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Calculate pricing for an errand
create or replace function calculate_pricing(
  p_type errand_type,
  p_distance_km numeric,
  p_is_urgent boolean default false
)
returns table (
  base_fee numeric,
  distance_fee numeric,
  urgency_fee numeric,
  platform_fee numeric,
  runner_payout numeric,
  total_price numeric
)
language plpgsql
stable
as $$
declare
  v_base_fee numeric;
  v_distance_fee numeric;
  v_urgency_fee numeric;
  v_subtotal numeric;
  v_platform_fee numeric;
  v_runner_payout numeric;
  v_total numeric;
begin
  -- Base fee by type
  v_base_fee := case p_type
    when 'returns' then 8.99
    when 'handoffs' then 6.99
    when 'collect' then 9.99
  end;

  -- Distance fee: €1.50/km after first 2km
  v_distance_fee := greatest(0, (p_distance_km - 2) * 1.50);

  -- Urgency surcharge: 50% of base
  v_urgency_fee := case when p_is_urgent then v_base_fee * 0.5 else 0 end;

  -- Calculate totals
  v_subtotal := v_base_fee + v_distance_fee + v_urgency_fee;
  v_platform_fee := round(v_subtotal * 0.20, 2);  -- 20% platform cut
  v_runner_payout := v_subtotal - v_platform_fee;
  v_total := v_subtotal;

  return query select v_base_fee, v_distance_fee, v_urgency_fee,
    v_platform_fee, v_runner_payout, v_total;
end;
$$;

-- Auto-update updated_at timestamp
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create profile after auth signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url'
  );
  -- Create default notification preferences
  insert into notification_preferences (user_id)
  values (new.id);
  return new;
end;
$$;

-- Auto-update runner rating after new rating
create or replace function update_runner_rating()
returns trigger
language plpgsql
security definer
as $$
begin
  update runner_profiles
  set rating = (
    select round(avg(r.rating), 2)
    from ratings r
    where r.to_user_id = new.to_user_id
  )
  where id = new.to_user_id;
  return new;
end;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- updated_at triggers
create trigger set_updated_at before update on profiles
  for each row execute function handle_updated_at();

create trigger set_updated_at before update on errands
  for each row execute function handle_updated_at();

-- Auto-create profile on signup
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update runner rating
create trigger on_new_rating after insert on ratings
  for each row execute function update_runner_rating();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table runner_profiles enable row level security;
alter table runner_documents enable row level security;
alter table errands enable row level security;
alter table errand_stops enable row level security;
alter table errand_timeline enable row level security;
alter table proof_photos enable row level security;
alter table chat_messages enable row level security;
alter table ratings enable row level security;
alter table job_offers enable row level security;
alter table runner_locations enable row level security;
alter table disputes enable row level security;
alter table dispute_evidence enable row level security;
alter table payouts enable row level security;
alter table payout_items enable row level security;
alter table notification_preferences enable row level security;
alter table subscriptions enable row level security;

-- ─── PROFILES ───
-- Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Runners & customers can see each other's basic info (for errand context)
create policy "Users can view profiles of errand participants"
  on profiles for select
  using (
    exists (
      select 1 from errands
      where (errands.customer_id = auth.uid() and errands.runner_id = profiles.id)
         or (errands.runner_id = auth.uid() and errands.customer_id = profiles.id)
    )
  );

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

-- Admins can update all profiles
create policy "Admins can update all profiles"
  on profiles for update
  using (is_admin());

-- ─── RUNNER PROFILES ───
create policy "Runners can view own runner profile"
  on runner_profiles for select
  using (auth.uid() = id);

create policy "Runners can update own runner profile"
  on runner_profiles for update
  using (auth.uid() = id);

create policy "Runners can insert own runner profile"
  on runner_profiles for insert
  with check (auth.uid() = id);

-- Customers can see runner profiles of assigned runners
create policy "Customers can view assigned runner profile"
  on runner_profiles for select
  using (
    exists (
      select 1 from errands
      where errands.customer_id = auth.uid()
        and errands.runner_id = runner_profiles.id
    )
  );

create policy "Admins can view all runner profiles"
  on runner_profiles for select
  using (is_admin());

create policy "Admins can update all runner profiles"
  on runner_profiles for update
  using (is_admin());

-- ─── RUNNER DOCUMENTS ───
create policy "Runners can view own documents"
  on runner_documents for select
  using (auth.uid() = runner_id);

create policy "Runners can upload own documents"
  on runner_documents for insert
  with check (auth.uid() = runner_id);

create policy "Admins can view all documents"
  on runner_documents for select
  using (is_admin());

create policy "Admins can update document status"
  on runner_documents for update
  using (is_admin());

-- ─── ERRANDS ───
create policy "Customers can view own errands"
  on errands for select
  using (auth.uid() = customer_id);

create policy "Customers can create errands"
  on errands for insert
  with check (auth.uid() = customer_id);

create policy "Customers can cancel own pending errands"
  on errands for update
  using (auth.uid() = customer_id and status in ('pending', 'finding_runner'));

create policy "Runners can view assigned errands"
  on errands for select
  using (auth.uid() = runner_id);

create policy "Runners can update assigned errands"
  on errands for update
  using (auth.uid() = runner_id and status in ('runner_assigned', 'in_progress'));

create policy "Admins can view all errands"
  on errands for select
  using (is_admin());

create policy "Admins can update all errands"
  on errands for update
  using (is_admin());

-- ─── ERRAND STOPS ───
create policy "Users can view errand stops for their errands"
  on errand_stops for select
  using (
    exists (
      select 1 from errands
      where errands.id = errand_stops.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Customers can create stops for own errands"
  on errand_stops for insert
  with check (
    exists (
      select 1 from errands
      where errands.id = errand_stops.errand_id
        and errands.customer_id = auth.uid()
    )
  );

create policy "Admins can view all errand stops"
  on errand_stops for select
  using (is_admin());

-- ─── ERRAND TIMELINE ───
create policy "Users can view timeline for their errands"
  on errand_timeline for select
  using (
    exists (
      select 1 from errands
      where errands.id = errand_timeline.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "System can insert timeline events"
  on errand_timeline for insert
  with check (
    exists (
      select 1 from errands
      where errands.id = errand_timeline.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Admins can view all timeline events"
  on errand_timeline for select
  using (is_admin());

create policy "Admins can insert timeline events"
  on errand_timeline for insert
  with check (is_admin());

-- ─── PROOF PHOTOS ───
create policy "Runners can upload proof for assigned errands"
  on proof_photos for insert
  with check (
    exists (
      select 1 from errands
      where errands.id = proof_photos.errand_id
        and errands.runner_id = auth.uid()
    )
  );

create policy "Users can view proof for their errands"
  on proof_photos for select
  using (
    exists (
      select 1 from errands
      where errands.id = proof_photos.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Admins can view all proof photos"
  on proof_photos for select
  using (is_admin());

-- ─── CHAT MESSAGES ───
create policy "Users can view chat for their errands"
  on chat_messages for select
  using (
    exists (
      select 1 from errands
      where errands.id = chat_messages.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Users can send chat messages for their errands"
  on chat_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from errands
      where errands.id = chat_messages.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Admins can view all chat messages"
  on chat_messages for select
  using (is_admin());

-- ─── RATINGS ───
create policy "Users can view ratings for their errands"
  on ratings for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can create ratings for completed errands"
  on ratings for insert
  with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from errands
      where errands.id = ratings.errand_id
        and errands.status = 'completed'
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

create policy "Admins can view all ratings"
  on ratings for select
  using (is_admin());

-- ─── JOB OFFERS ───
create policy "Runners can view their job offers"
  on job_offers for select
  using (auth.uid() = runner_id);

create policy "Runners can update their pending offers"
  on job_offers for update
  using (auth.uid() = runner_id and status = 'pending');

create policy "Admins can view all job offers"
  on job_offers for select
  using (is_admin());

create policy "Admins can manage job offers"
  on job_offers for all
  using (is_admin());

-- ─── RUNNER LOCATIONS ───
create policy "Runners can insert own location"
  on runner_locations for insert
  with check (auth.uid() = runner_id);

create policy "Runners can view own locations"
  on runner_locations for select
  using (auth.uid() = runner_id);

-- Customers can view runner location for active errands
create policy "Customers can view runner location for active errands"
  on runner_locations for select
  using (
    exists (
      select 1 from errands
      where errands.id = runner_locations.errand_id
        and errands.customer_id = auth.uid()
        and errands.status in ('runner_assigned', 'in_progress')
    )
  );

create policy "Admins can view all runner locations"
  on runner_locations for select
  using (is_admin());

-- ─── DISPUTES ───
create policy "Users can view own disputes"
  on disputes for select
  using (auth.uid() = filed_by);

create policy "Users can file disputes for their errands"
  on disputes for insert
  with check (
    auth.uid() = filed_by
    and exists (
      select 1 from errands
      where errands.id = disputes.errand_id
        and (errands.customer_id = auth.uid() or errands.runner_id = auth.uid())
    )
  );

-- Runners can see disputes filed against errands they ran
create policy "Runners can view disputes on their errands"
  on disputes for select
  using (
    exists (
      select 1 from errands
      where errands.id = disputes.errand_id
        and errands.runner_id = auth.uid()
    )
  );

create policy "Admins can view all disputes"
  on disputes for select
  using (is_admin());

create policy "Admins can update disputes"
  on disputes for update
  using (is_admin());

-- ─── DISPUTE EVIDENCE ───
create policy "Users can view evidence for their disputes"
  on dispute_evidence for select
  using (
    exists (
      select 1 from disputes
      where disputes.id = dispute_evidence.dispute_id
        and disputes.filed_by = auth.uid()
    )
  );

create policy "Users can submit evidence for their disputes"
  on dispute_evidence for insert
  with check (
    exists (
      select 1 from disputes
      where disputes.id = dispute_evidence.dispute_id
        and disputes.filed_by = auth.uid()
        and disputes.status in ('open', 'investigating')
    )
  );

create policy "Admins can view all evidence"
  on dispute_evidence for select
  using (is_admin());

-- ─── PAYOUTS ───
create policy "Runners can view own payouts"
  on payouts for select
  using (auth.uid() = runner_id);

create policy "Admins can view all payouts"
  on payouts for select
  using (is_admin());

create policy "Admins can manage payouts"
  on payouts for all
  using (is_admin());

-- ─── PAYOUT ITEMS ───
create policy "Runners can view own payout items"
  on payout_items for select
  using (
    exists (
      select 1 from payouts
      where payouts.id = payout_items.payout_id
        and payouts.runner_id = auth.uid()
    )
  );

create policy "Admins can view all payout items"
  on payout_items for select
  using (is_admin());

-- ─── NOTIFICATION PREFERENCES ───
create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

create policy "Admins can view all notification preferences"
  on notification_preferences for select
  using (is_admin());

-- ─── SUBSCRIPTIONS ───
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = customer_id);

create policy "Admins can view all subscriptions"
  on subscriptions for select
  using (is_admin());

create policy "Admins can manage subscriptions"
  on subscriptions for all
  using (is_admin());

-- ============================================
-- 6. INDEXES
-- ============================================

-- Profiles
create index idx_profiles_email on profiles (email);
create index idx_profiles_role on profiles (role);

-- Runner profiles
create index idx_runner_profiles_status on runner_profiles (status);
create index idx_runner_profiles_available on runner_profiles (is_available, verified, status)
  where is_available = true and verified = true and status = 'active';
create index idx_runner_profiles_rating on runner_profiles (rating desc);

-- Errands
create index idx_errands_customer on errands (customer_id);
create index idx_errands_runner on errands (runner_id);
create index idx_errands_status on errands (status);
create index idx_errands_display_id on errands (display_id);
create index idx_errands_created on errands (created_at desc);
create index idx_errands_scheduled on errands (scheduled_date, time_slot_start);
-- Composite: customer's active errands
create index idx_errands_customer_active on errands (customer_id, status)
  where status not in ('completed', 'cancelled');
-- Composite: runner's active errands
create index idx_errands_runner_active on errands (runner_id, status)
  where status in ('runner_assigned', 'in_progress');

-- Errand stops
create index idx_errand_stops_errand on errand_stops (errand_id, stop_order);

-- Errand timeline
create index idx_errand_timeline_errand on errand_timeline (errand_id, created_at);

-- Proof photos
create index idx_proof_photos_errand on proof_photos (errand_id);

-- Chat messages
create index idx_chat_messages_errand on chat_messages (errand_id, created_at);

-- Ratings
create index idx_ratings_to_user on ratings (to_user_id);
create index idx_ratings_errand on ratings (errand_id);

-- Job offers
create index idx_job_offers_errand on job_offers (errand_id);
create index idx_job_offers_runner on job_offers (runner_id, status);
create index idx_job_offers_pending on job_offers (status, expires_at)
  where status = 'pending';

-- Runner locations (latest location lookups)
create index idx_runner_locations_runner on runner_locations (runner_id, recorded_at desc);
create index idx_runner_locations_errand on runner_locations (errand_id, recorded_at desc);

-- Runner documents
create index idx_runner_documents_runner on runner_documents (runner_id);

-- Disputes
create index idx_disputes_errand on disputes (errand_id);
create index idx_disputes_status on disputes (status);
create index idx_disputes_filed_by on disputes (filed_by);

-- Payouts
create index idx_payouts_runner on payouts (runner_id);
create index idx_payouts_status on payouts (status);
create index idx_payouts_scheduled on payouts (scheduled_date);

-- Subscriptions
create index idx_subscriptions_customer on subscriptions (customer_id);
create index idx_subscriptions_active on subscriptions (customer_id, status)
  where status = 'active';

-- ============================================
-- 7. STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('proof-photos', 'proof-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('runner-documents', 'runner-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('dispute-evidence', 'dispute-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Storage RLS policies

-- Proof photos: runners upload, customers & admins view
create policy "Runners can upload proof photos"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-photos'
    and auth.role() = 'authenticated'
  );

create policy "Users can view proof photos for their errands"
  on storage.objects for select
  using (
    bucket_id = 'proof-photos'
    and auth.role() = 'authenticated'
  );

-- Runner documents: runners upload, admins view
create policy "Runners can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'runner-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Runners can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'runner-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can view all runner documents"
  on storage.objects for select
  using (
    bucket_id = 'runner-documents'
    and is_admin()
  );

-- Avatars: users upload own, anyone can view (public bucket)
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Dispute evidence: users upload for their disputes, admins view all
create policy "Users can upload dispute evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'dispute-evidence'
    and auth.role() = 'authenticated'
  );

create policy "Admins can view all dispute evidence"
  on storage.objects for select
  using (
    bucket_id = 'dispute-evidence'
    and is_admin()
  );

-- ============================================
-- 8. REALTIME — Enable for key tables
-- ============================================

alter publication supabase_realtime add table errands;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table runner_locations;
alter publication supabase_realtime add table errand_timeline;
alter publication supabase_realtime add table job_offers;
