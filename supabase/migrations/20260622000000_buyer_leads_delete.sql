-- Allow authenticated admins to delete leads from the /admin/leads cockpit.
drop policy if exists "Admin delete" on buyer_leads;
create policy "Admin delete" on buyer_leads
  for delete using (auth.role() = 'authenticated');
