/** Name flicker interval during roll phase. */
export const RESULT_FLICKER_MS = 95

/** Roll orb + label flicker before reveal. */
export const RESULT_REVEAL_MS = 1150

/** Card pop-in after reveal (matches `resultCardPop` duration). */
export const RESULT_CARD_ENTRANCE_MS = 520

/** Wait for reveal + card entrance before swapping to share URL. */
export const RESULT_SHARE_NAVIGATE_MS = RESULT_REVEAL_MS + RESULT_CARD_ENTRANCE_MS + 80
