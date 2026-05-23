-- Search runs in app memory via buildQuirkSearchText(); column was never queried.
drop index if exists quirk_translations_search_idx;

alter table quirk_translations
  drop column if exists search_text;
