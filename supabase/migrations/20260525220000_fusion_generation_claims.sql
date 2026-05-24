create table if not exists fusion_generation_claims (
  key text primary key,
  claim_id text not null,
  expires_at timestamptz not null
);

create table if not exists fusion_entry_aliases (
  key text primary key,
  entry_key text not null references fusion_entries (key) on delete cascade,
  created_at timestamptz not null default now()
);

alter table fusion_generation_claims enable row level security;
alter table fusion_entry_aliases enable row level security;

create index if not exists fusion_generation_claims_expires_at_idx
  on fusion_generation_claims (expires_at);

create or replace function claim_fusion_generation(
  p_key text,
  p_claim_id text,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into fusion_generation_claims as existing (key, claim_id, expires_at)
  values (
    p_key,
    p_claim_id,
    now() + greatest(p_lease_seconds, 1) * interval '1 second'
  )
  on conflict (key) do update
    set claim_id = excluded.claim_id,
        expires_at = excluded.expires_at
    where existing.expires_at <= now();

  return found;
end;
$$;

revoke all on function claim_fusion_generation(text, text, integer) from public;
grant execute on function claim_fusion_generation(text, text, integer) to service_role;
