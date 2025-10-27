-- Enable extensions
create extension if not exists "pgcrypto";

-- Helper function to maintain updated_at columns
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'instructor', 'admin')),
  push_token text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_updated_at_on_profiles on public.profiles;
create trigger set_updated_at_on_profiles
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Locations and rooms
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Class templates
create table if not exists public.class_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  description text,
  default_duration_minutes integer default 60,
  created_at timestamptz not null default timezone('utc', now())
);

-- Sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.class_templates(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  room_id uuid references public.rooms(id) on delete set null,
  instructor_id uuid references public.profiles(id) on delete set null,
  capacity integer not null default 10,
  status text not null default 'scheduled' check (status in ('scheduled', 'canceled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_updated_at_on_sessions on public.sessions;
create trigger set_updated_at_on_sessions
before update on public.sessions
for each row execute procedure public.set_updated_at();

create index if not exists sessions_start_at_idx on public.sessions(start_at);
create index if not exists sessions_instructor_idx on public.sessions(instructor_id);

-- Enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'booked' check (status in ('booked', 'canceled', 'no_show')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (session_id, user_id)
);

drop trigger if exists set_updated_at_on_enrollments on public.enrollments;
create trigger set_updated_at_on_enrollments
before update on public.enrollments
for each row execute procedure public.set_updated_at();

create index if not exists enrollments_session_idx on public.enrollments(session_id);
create index if not exists enrollments_user_idx on public.enrollments(user_id);

-- Waitlist
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (session_id, user_id)
);

create index if not exists waitlist_session_idx on public.waitlist(session_id);
create index if not exists waitlist_user_idx on public.waitlist(user_id);

-- Credit wallet and ledger
create table if not exists public.credit_wallet (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_updated_at_on_credit_wallet on public.credit_wallet;
create trigger set_updated_at_on_credit_wallet
before update on public.credit_wallet
for each row execute procedure public.set_updated_at();

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  session_id uuid references public.sessions(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists credit_ledger_user_idx on public.credit_ledger(user_id);
create index if not exists credit_ledger_session_idx on public.credit_ledger(session_id);

-- Availability view powered by a security definer function
create or replace function public.sessions_with_availability_data()
returns table (
  id uuid,
  template_id uuid,
  start_at timestamptz,
  end_at timestamptz,
  room_id uuid,
  instructor_id uuid,
  capacity integer,
  status text,
  class_name text,
  class_level text,
  location_name text,
  room_name text,
  instructor_name text,
  booked_count integer,
  waitlist_count integer,
  available_spots integer
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.template_id,
    s.start_at,
    s.end_at,
    s.room_id,
    s.instructor_id,
    s.capacity,
    s.status,
    ct.name as class_name,
    ct.level as class_level,
    l.name as location_name,
    r.name as room_name,
    p.full_name as instructor_name,
    coalesce(count(distinct e.id) filter (where e.status = 'booked'), 0) as booked_count,
    coalesce(count(distinct w.id), 0) as waitlist_count,
    greatest(s.capacity - coalesce(count(distinct e.id) filter (where e.status = 'booked'), 0), 0) as available_spots
  from public.sessions s
  left join public.class_templates ct on ct.id = s.template_id
  left join public.rooms r on r.id = s.room_id
  left join public.locations l on l.id = r.location_id
  left join public.profiles p on p.id = s.instructor_id
  left join public.enrollments e on e.session_id = s.id
  left join public.waitlist w on w.session_id = s.id
  group by s.id, ct.name, ct.level, l.name, r.name, p.full_name
$$;

create or replace view public.sessions_with_availability as
select * from public.sessions_with_availability_data();

-- Row level security policies
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.waitlist enable row level security;
alter table public.credit_wallet enable row level security;
alter table public.credit_ledger enable row level security;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND polname = 'profiles_select_own') THEN
    create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND polname = 'profiles_insert_own') THEN
    create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND polname = 'profiles_update_own') THEN
    create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  END IF;
END$$;

-- Sessions policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sessions' AND polname = 'sessions_read_all') THEN
    create policy sessions_read_all on public.sessions for select using (true);
  END IF;
END$$;

-- Enrollments policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'enrollments' AND polname = 'enrollments_select_own_or_instructor') THEN
    create policy enrollments_select_own_or_instructor on public.enrollments
      for select
      using (
        auth.uid() = user_id OR
        auth.uid() = (select instructor_id from public.sessions s where s.id = session_id)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'enrollments' AND polname = 'enrollments_insert_own') THEN
    create policy enrollments_insert_own on public.enrollments for insert with check (auth.uid() = user_id);
  END IF;
END$$;

-- Waitlist policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist' AND polname = 'waitlist_select_own') THEN
    create policy waitlist_select_own on public.waitlist for select using (auth.uid() = user_id);
  END IF;
END$$;

-- Credit wallet policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'credit_wallet' AND polname = 'credit_wallet_select_own') THEN
    create policy credit_wallet_select_own on public.credit_wallet for select using (auth.uid() = user_id);
  END IF;
END$$;

-- Credit ledger policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'credit_ledger' AND polname = 'credit_ledger_select_own') THEN
    create policy credit_ledger_select_own on public.credit_ledger for select using (auth.uid() = user_id);
  END IF;
END$$;

-- Stored procedures for booking and cancellation
create or replace function public.book_session(p_session uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_capacity integer;
  v_booked integer;
  v_status text;
  v_wallet integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select status, capacity into v_status, v_capacity from public.sessions where id = p_session;
  if not found then
    raise exception 'Session not found';
  end if;

  if v_status <> 'scheduled' then
    return 'session_closed';
  end if;

  select count(*)
    into v_booked
    from public.enrollments
   where session_id = p_session
     and status = 'booked';

  if exists(
    select 1 from public.enrollments
    where session_id = p_session
      and user_id = v_user_id
      and status = 'booked'
  ) then
    return 'already_booked';
  end if;

  if exists(
    select 1 from public.waitlist
    where session_id = p_session
      and user_id = v_user_id
  ) then
    return 'already_waitlisted';
  end if;

  insert into public.credit_wallet(user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_wallet
    from public.credit_wallet
    where user_id = v_user_id
    for update;

  if v_wallet is null or v_wallet <= 0 then
    return 'insufficient_credits';
  end if;

  if v_booked >= coalesce(v_capacity, 0) then
    insert into public.waitlist(session_id, user_id)
    values (p_session, v_user_id)
    on conflict (session_id, user_id) do nothing;
    return 'waitlisted';
  end if;

  insert into public.enrollments(session_id, user_id, status)
  values (p_session, v_user_id, 'booked')
  on conflict (session_id, user_id)
  do update set status = 'booked', updated_at = timezone('utc', now());

  update public.credit_wallet
    set balance = balance - 1,
        updated_at = timezone('utc', now())
    where user_id = v_user_id;

  insert into public.credit_ledger(user_id, delta, reason, session_id)
  values (v_user_id, -1, 'booking', p_session);

  return 'booked';
end;
$$;

create or replace function public.cancel_booking(p_session uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_booking public.enrollments%rowtype;
  v_session public.sessions%rowtype;
  v_cutoff timestamptz;
  v_next_waiter uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_session from public.sessions where id = p_session;
  if not found then
    raise exception 'Session not found';
  end if;

  v_cutoff := v_session.start_at - interval '12 hours';

  select * into v_booking
    from public.enrollments
   where session_id = p_session
     and user_id = v_user_id
     and status = 'booked';

  if not found then
    delete from public.waitlist
     where session_id = p_session
       and user_id = v_user_id;
    return 'not_booked';
  end if;

  update public.enrollments
    set status = 'canceled',
        updated_at = timezone('utc', now())
    where id = v_booking.id;

  if timezone('utc', now()) > v_cutoff then
    return 'cutoff_passed';
  end if;

  insert into public.credit_wallet(user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  update public.credit_wallet
    set balance = balance + 1,
        updated_at = timezone('utc', now())
    where user_id = v_user_id;

  insert into public.credit_ledger(user_id, delta, reason, session_id)
  values (v_user_id, 1, 'cancellation', p_session);

  select user_id into v_next_waiter
    from public.waitlist
   where session_id = p_session
   order by created_at
   limit 1;

  if v_next_waiter is not null then
    delete from public.waitlist
     where session_id = p_session
       and user_id = v_next_waiter;

    insert into public.credit_wallet(user_id, balance)
    values (v_next_waiter, 0)
    on conflict (user_id) do nothing;

    insert into public.enrollments(session_id, user_id, status)
    values (p_session, v_next_waiter, 'booked')
    on conflict (session_id, user_id)
    do update set status = 'booked', updated_at = timezone('utc', now());

    update public.credit_wallet
      set balance = balance - 1,
          updated_at = timezone('utc', now())
      where user_id = v_next_waiter;

    insert into public.credit_ledger(user_id, delta, reason, session_id)
    values (v_next_waiter, -1, 'waitlist_promotion', p_session);

    return 'promoted';
  end if;

  return 'canceled';
end;
$$;
