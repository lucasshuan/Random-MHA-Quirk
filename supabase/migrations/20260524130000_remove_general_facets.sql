-- Support, Construct, and Defense describe uses or roles rather than core mechanisms.
-- Strip them from catalog rows, then repair known entries whose only tag was retired.
update quirks as q
set facets = (
  select coalesce(jsonb_agg(facet order by ordinal), '[]'::jsonb)
  from jsonb_array_elements_text(q.facets) with ordinality as item(facet, ordinal)
  where facet not in ('Support', 'Construct', 'Defense')
)
where q.facets ?| array['Support', 'Construct', 'Defense'];

with canonical_facets (id, facets) as (
  values
    ('barrier', '["Emission"]'::jsonb),
    ('blade-tooth', '["Biological"]'::jsonb),
    ('bubble', '["Emission"]'::jsonb),
    ('bullet-laser', '["Elemental", "Emission"]'::jsonb),
    ('cell-activation', '["Emission"]'::jsonb),
    ('cement', '["Control"]'::jsonb),
    ('clean-bubbler', '["Emission"]'::jsonb),
    ('creation', '["Emission"]'::jsonb),
    ('dark-shadow', '["Emission"]'::jsonb),
    ('fiber-master', '["Control"]'::jsonb),
    ('float', '["Mobility", "Emission"]'::jsonb),
    ('foldabody', '["Biological"]'::jsonb),
    ('hardening', '["Enhancement"]'::jsonb),
    ('heal', '["Emission"]'::jsonb),
    ('laser', '["Elemental", "Emission"]'::jsonb),
    ('navel-laser', '["Elemental", "Emission"]'::jsonb),
    ('permeation', '["Mobility"]'::jsonb),
    ('rewind', '["Control", "Biological", "Stockpile"]'::jsonb),
    ('rivet', '["Biological"]'::jsonb),
    ('rivet-stab', '["Biological"]'::jsonb),
    ('shield', '["Biological"]'::jsonb),
    ('shock-absorption', '["Enhancement"]'::jsonb),
    ('spike', '["Biological"]'::jsonb),
    ('super-regeneration', '["Biological"]'::jsonb),
    ('tape', '["Anthropomorphic", "Mobility"]'::jsonb),
    ('zero-gravity', '["Control"]'::jsonb),
    ('ctrl', '["Control"]'::jsonb),
    ('marker', '["Emission"]'::jsonb),
    ('dark-matter', '["Emission"]'::jsonb),
    ('lattice', '["Elemental"]'::jsonb),
    ('spinblade', '["Enhancement"]'::jsonb),
    ('oubliette', '["Stockpile"]'::jsonb)
)
update quirks as q
set facets = canonical_facets.facets
from canonical_facets
where q.id = canonical_facets.id
  and q.facets is distinct from canonical_facets.facets;
