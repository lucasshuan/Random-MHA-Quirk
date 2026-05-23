alter table quirks
  add column if not exists source text,
  add column if not exists inspiration text;

comment on column quirks.source is 'Primary reference URL (fan OC, list entry, etc.).';
comment on column quirks.inspiration is 'Short attribution / provenance note.';;
