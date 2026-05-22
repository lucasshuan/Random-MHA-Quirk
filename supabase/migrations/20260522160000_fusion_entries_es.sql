alter table fusion_entries
  add column if not exists es jsonb;
