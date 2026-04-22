-- Buyer leads from the "Buy Beef" intake form on farmshare.co
create table if not exists buyer_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  zip text,
  species text not null,
  cut_type text not null,
  timing text,
  notes text,
  processor_slug text, -- if they came through a specific processor's page
  status text default 'new', -- new, contacted, matched, closed
  created_at timestamptz default now()
);

-- Enable RLS but allow anon inserts (the form is public)
alter table buyer_leads enable row level security;
create policy "Allow anon insert" on buyer_leads for insert with check (true);
-- Only authenticated users (admin) can read
create policy "Admin read" on buyer_leads for select using (auth.role() = 'authenticated');
