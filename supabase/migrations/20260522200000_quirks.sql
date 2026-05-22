create table if not exists quirks (
  id text primary key,
  origin text not null,
  tier text not null,
  type text not null,
  range text not null,
  facets jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists quirk_translations (
  quirk_id text not null references quirks(id) on delete cascade,
  locale text not null check (locale in ('en', 'pt-BR', 'es')),
  name text not null,
  description text not null,
  search_text text not null,
  primary key (quirk_id, locale)
);

create index if not exists quirks_type_idx on quirks (type);
create index if not exists quirks_tier_idx on quirks (tier);
create index if not exists quirks_origin_idx on quirks (origin);
create index if not exists quirk_translations_locale_idx on quirk_translations (locale);
create index if not exists quirk_translations_search_idx on quirk_translations (search_text);
