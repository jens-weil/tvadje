-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  updated_at timestamp with time zone
);

-- Create event_participants table
create table if not exists event_participants (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  event_date date not null,
  created_at timestamp with time zone default now(),
  unique(profile_id, event_date)
);

-- Enable RLS
alter table profiles enable row level security;
alter table event_participants enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies for event_participants
create policy "Participants are viewable by everyone." on event_participants for select using (true);
create policy "Users can RSVP for themselves." on event_participants for insert with check (auth.uid() = profile_id);
create policy "Users can remove their own RSVP." on event_participants for delete using (auth.uid() = profile_id);

-- Set up a trigger to create a profile for every new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- For existing users who might be missing a profile record
insert into public.profiles (id, full_name)
select id, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;
