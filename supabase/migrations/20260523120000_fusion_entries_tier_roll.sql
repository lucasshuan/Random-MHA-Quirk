alter table fusion_entries
  add column if not exists tier text,
  add column if not exists roll jsonb;
