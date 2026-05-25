import {
  buildFusionTierWeights,
  FUSION_GENERATED_TIERS,
} from '../../../src/server/fusion/prompts/roll-context.ts'

const OUTPUT_TIERS = [...FUSION_GENERATED_TIERS]

/** @typedef {'markdown' | 'tsv'} TierTableFormat */

/**
 * @param {import('../../../src/server/fusion/prompts/strategy.ts').FusionStrategyKey} strategy
 * @param {import('../../../src/types/quirk.ts').QuirkRange} range
 */
export function buildTierWeightRows(strategy, range) {
  const rows = []

  for (let i = 0; i < OUTPUT_TIERS.length; i++) {
    for (let j = i; j < OUTPUT_TIERS.length; j++) {
      const parentA = OUTPUT_TIERS[i]
      const parentB = OUTPUT_TIERS[j]
      const weights = buildFusionTierWeights(parentA, parentB, strategy, range)
      const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
      const pct = (tier) => {
        const row = weights.find((entry) => entry.tier === tier)
        return ((row?.weight ?? 0) / total) * 100
      }

      rows.push({
        parents: `${parentA}+${parentB}`,
        parentA,
        parentB,
        total,
        omegaPlusS: pct('Ω') + pct('S'),
        cells: Object.fromEntries(
          OUTPUT_TIERS.map((tier) => [tier, pct(tier)]),
        ),
      })
    }
  }

  return rows
}

/**
 * @param {import('../../../src/server/fusion/prompts/strategy.ts').FusionStrategyKey} strategy
 * @param {import('../../../src/types/quirk.ts').QuirkRange} range
 * @param {TierTableFormat} [format]
 */
export function formatTierWeightTable(strategy, range, format = 'markdown') {
  const rows = buildTierWeightRows(strategy, range)

  if (format === 'tsv') {
    const header = ['Parents', ...OUTPUT_TIERS, 'Ω+S'].join('\t')
    const body = rows
      .map((row) =>
        [
          row.parents,
          ...OUTPUT_TIERS.map((tier) => row.cells[tier].toFixed(1)),
          row.omegaPlusS.toFixed(1),
        ].join('\t'),
      )
      .join('\n')
    return `${header}\n${body}`
  }

  const header = `| Parents | ${OUTPUT_TIERS.join(' | ')} | Ω+S |`
  const divider = `|---------|${OUTPUT_TIERS.map(() => '-----').join('|')}|-------|`
  const body = rows
    .map(
      (row) =>
        `| ${row.parents} | ${OUTPUT_TIERS.map((tier) => row.cells[tier].toFixed(1)).join(' | ')} | ${row.omegaPlusS.toFixed(1)} |`,
    )
    .join('\n')

  return [header, divider, body].join('\n')
}
