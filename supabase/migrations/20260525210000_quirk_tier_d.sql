-- Tier D (gag / near-useless quirks). Reclassify catalog entries from tools/catalog/data/sources/tier-overrides.json
update quirks set tier = 'D' where id in (
  'anivoice',
  'beams-from-his-eyes',
  'binging-ball',
  'brown-bear',
  'chart',
  'chest-hair',
  'comic',
  'cubism',
  'day-dream',
  'dog',
  'fan',
  'fly-swatter',
  'food',
  'glycerin',
  'good-ear',
  'hula-hoop',
  'papyrus',
  'soccer',
  'stock',
  'swan',
  'toho',
  'whale',
  'whole-body-lens',
  'wooden-swords-from-his-hands',
  '2d-ify'
);

update quirks set tier = 'B' where id in ('tail', 'flying-squirrel');

update quirks set tier = 'C' where id in (
  'pop-off',
  'sugar-rush',
  'zoom',
  'attraction-of-small-objects',
  'cleaning',
  'spray-art',
  'snip-clip'
);
