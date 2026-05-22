create table if not exists fusion_entries (
  key text primary key,
  parent_a text not null,
  parent_b text not null,
  seed text not null,
  en jsonb not null,
  pt_br jsonb not null,
  type text not null,
  range text not null,
  facets jsonb not null,
  origin text not null default 'ORIGINAL',
  created_at timestamptz default now()
);

create index if not exists fusion_entries_parents_seed_idx
  on fusion_entries (parent_a, parent_b, seed);
