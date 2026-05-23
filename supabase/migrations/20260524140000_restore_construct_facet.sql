-- Construct is a mechanical facet for an object, structure, or entity
-- built or formed by the Quirk. Support and Defense remain retired.
update quirks
set facets = facets || '["Construct"]'::jsonb
where id in (
  'air-wall',
  'alchemy',
  'arbor',
  'barrier',
  'bubble',
  'clones',
  'cloud',
  'comic',
  'control-glass',
  'creation',
  'dark-shadow',
  'double',
  'earth-flow',
  'king-slam',
  'metal-manipulation',
  'monster-summon',
  'mummification',
  'overhaul',
  'shield',
  'solid-air',
  'soul',
  'wooden-swords-from-his-hands',
  'marker',
  'dark-matter',
  'lattice'
)
and not (facets ? 'Construct');
