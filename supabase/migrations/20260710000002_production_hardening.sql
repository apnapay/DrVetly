-- ==============================================================================
-- DrVetly Production Hardening Migration (Timestamp: 20260710000002)
-- ==============================================================================

-- 1. Helper Security Functions (Resolver from auth.uid())
create or replace function public.current_app_user_id()
returns uuid as $$
  select id from public.users where auth_id = auth.uid() limit 1;
$$ language sql security definer stable;

create or replace function public.current_clinic_id()
returns uuid as $$
  select clinic_id from public.users where auth_id = auth.uid() limit 1;
$$ language sql security definer stable;

create or replace function public.current_user_role()
returns text as $$
  select role from public.users where auth_id = auth.uid() limit 1;
$$ language sql security definer stable;

-- 2. Ensure RLS on all operational tables
alter table if exists public.clinics enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.clients enable row level security;
alter table if exists public.patients enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.soap_notes enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.creem_subscriptions enable row level security;
alter table if exists public.messages enable row level security;
alter table if exists public.audit_log enable row level security;
alter table if exists public.contact_messages enable row level security;
alter table if exists public.beta_signups enable row level security;

-- 3. RLS Policies

-- Clinics
drop policy if exists "Clinics view own record" on public.clinics;
create policy "Clinics view own record" on public.clinics
  for select using (id = public.current_clinic_id());

drop policy if exists "Admins update own clinic" on public.clinics;
create policy "Admins update own clinic" on public.clinics
  for update using (id = public.current_clinic_id() and public.current_user_role() = 'ADMIN');

-- Users (Staff)
drop policy if exists "Users view clinic staff" on public.users;
create policy "Users view clinic staff" on public.users
  for select using (clinic_id = public.current_clinic_id());

drop policy if exists "Admins manage clinic staff" on public.users;
create policy "Admins manage clinic staff" on public.users
  for all using (clinic_id = public.current_clinic_id() and public.current_user_role() = 'ADMIN');

-- Clients
drop policy if exists "Users manage clinic clients" on public.clients;
create policy "Users manage clinic clients" on public.clients
  for all using (clinic_id = public.current_clinic_id());

-- Patients
drop policy if exists "Users manage clinic patients" on public.patients;
create policy "Users manage clinic patients" on public.patients
  for all using (clinic_id = public.current_clinic_id());

-- Appointments
drop policy if exists "Users manage clinic appointments" on public.appointments;
create policy "Users manage clinic appointments" on public.appointments
  for all using (clinic_id = public.current_clinic_id());

-- SOAP Notes
drop policy if exists "Users manage clinic soap notes" on public.soap_notes;
create policy "Users manage clinic soap notes" on public.soap_notes
  for all using (clinic_id = public.current_clinic_id());

-- Invoices & Payments
drop policy if exists "Users manage clinic invoices" on public.invoices;
create policy "Users manage clinic invoices" on public.invoices
  for all using (clinic_id = public.current_clinic_id());

drop policy if exists "Users manage clinic payments" on public.payments;
create policy "Users manage clinic payments" on public.payments
  for all using (clinic_id = public.current_clinic_id());

-- Creem Subscriptions
drop policy if exists "Users view clinic subscriptions" on public.creem_subscriptions;
create policy "Users view clinic subscriptions" on public.creem_subscriptions
  for all using (clinic_id = public.current_clinic_id());

-- Messages
drop policy if exists "Users manage clinic messages" on public.messages;
create policy "Users manage clinic messages" on public.messages
  for all using (clinic_id = public.current_clinic_id());

-- Public Marketing Forms (INSERT-only for anon)
drop policy if exists "Anon submit contact messages" on public.contact_messages;
create policy "Anon submit contact messages" on public.contact_messages
  for insert with check (true);

drop policy if exists "Anon submit beta signups" on public.beta_signups;
create policy "Anon submit beta signups" on public.beta_signups
  for insert with check (true);

-- 4. Realtime Publication Setup
do $$
begin
  alter publication supabase_realtime add table public.patients;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.appointments;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.soap_notes;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.invoices;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.payments;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.users;
  exception when duplicate_object then null;
end $$;
