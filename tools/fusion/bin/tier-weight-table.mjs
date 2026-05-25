#!/usr/bin/env node
/**
 * Prints fusion tier weight tables (parent pair × output tier %).
 *
 * Usage:
 *   node tools/fusion/bin/tier-weight-table.mjs
 *   node tools/fusion/bin/tier-weight-table.mjs --strategy failure-mode --range Medium
 *   node tools/fusion/bin/tier-weight-table.mjs --format tsv
 */
import { FUSION_STRATEGY_KEYS } from '../../../src/server/fusion/prompts/strategy.ts'
import { QUIRK_RANGES } from '../../../src/types/quirk.ts'
import { formatTierWeightTable } from '../lib/tier-weight-table.mjs'

function printUsage() {
  console.error(`Usage: node tools/fusion/bin/tier-weight-table.mjs [options]

Options:
  --strategy <key>   Fusion strategy (default: synergy)
  --range <range>    Output range roll (default: Short)
  --format <fmt>     markdown | tsv (default: markdown)
  --help             Show this help

Strategies: ${FUSION_STRATEGY_KEYS.join(', ')}
Ranges: ${QUIRK_RANGES.join(', ')}
`)
}

function parseArgs(argv) {
  let strategy = 'synergy'
  let range = 'Short'
  let format = 'markdown'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }
    if (arg === '--strategy') {
      strategy = argv[++i]
      continue
    }
    if (arg === '--range') {
      range = argv[++i]
      continue
    }
    if (arg === '--format') {
      format = argv[++i]
      continue
    }
    console.error(`Unknown argument: ${arg}`)
    printUsage()
    process.exit(1)
  }

  if (!FUSION_STRATEGY_KEYS.includes(strategy)) {
    console.error(`Invalid strategy: ${strategy}`)
    process.exit(1)
  }
  if (!QUIRK_RANGES.includes(range)) {
    console.error(`Invalid range: ${range}`)
    process.exit(1)
  }
  if (format !== 'markdown' && format !== 'tsv') {
    console.error(`Invalid format: ${format}`)
    process.exit(1)
  }

  return { strategy, range, format }
}

const { strategy, range, format } = parseArgs(process.argv.slice(2))
const table = formatTierWeightTable(strategy, range, format)

if (format === 'markdown') {
  console.log(`# Fusion tier weights (${strategy}, ${range})\n`)
}
console.log(table)
