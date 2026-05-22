alter table fusion_entries
  add column if not exists es jsonb;

alter table fusion_entries
  alter column es set not null;
