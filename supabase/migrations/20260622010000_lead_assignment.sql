-- Auto-assign buyer leads 50/50 between Henry and Wyatt at intake.
-- On insert, if no assignee is set, give the lead to whoever currently has fewer
-- (tie -> Henry). Self-balancing, and robust to deletes / retro-assignment.
create or replace function assign_lead_owner() returns trigger as $$
declare h int; w int;
begin
  if new.assignee is null then
    select count(*) into h from buyer_leads where assignee = 'Henry';
    select count(*) into w from buyer_leads where assignee = 'Wyatt';
    new.assignee := case when h <= w then 'Henry' else 'Wyatt' end;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assign_lead_owner on buyer_leads;
create trigger trg_assign_lead_owner
  before insert on buyer_leads
  for each row execute function assign_lead_owner();

-- One-time backfill: split the existing unassigned leads, balancing totals
-- (recomputes per row so it evens out against the already-assigned workbook leads).
do $$
declare r record; h int; w int;
begin
  for r in select id from buyer_leads where assignee is null order by created_at loop
    select count(*) into h from buyer_leads where assignee = 'Henry';
    select count(*) into w from buyer_leads where assignee = 'Wyatt';
    update buyer_leads set assignee = case when h <= w then 'Henry' else 'Wyatt' end where id = r.id;
  end loop;
end $$;
