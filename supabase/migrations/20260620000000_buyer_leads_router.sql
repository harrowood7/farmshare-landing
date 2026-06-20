-- Lead-router fields on buyer_leads + admin update access for the cockpit.
alter table buyer_leads add column if not exists lat numeric;
alter table buyer_leads add column if not exists lng numeric;
alter table buyer_leads add column if not exists assignee text;          -- 'Henry' | 'Wyatt'
alter table buyer_leads add column if not exists lead_type text default 'buyer'; -- 'buyer' | 'producer'
alter table buyer_leads add column if not exists matched_slug text;      -- chosen processor at route time
alter table buyer_leads add column if not exists routed_at timestamptz;

-- Authenticated admins can update lead status/assignee/match from /admin/leads.
drop policy if exists "Admin update" on buyer_leads;
create policy "Admin update" on buyer_leads
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
