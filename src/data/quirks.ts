import { getQuirks } from '../i18n/quirks'

/** @deprecated Prefer `getQuirks(locale)` for locale-aware data. */
export const quirks = getQuirks('en')

export { quirksBase } from './quirks.base'
export { QUIRK_IDS } from './quirk-ids'
export { getQuirks } from '../i18n/quirks'
