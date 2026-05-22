/**
 * Flags quirk descriptions that likely mention characters or lore locations.
 * Run: node tools/catalog/bin/scan-character-mentions.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const locale = process.argv[2] ?? 'en'
const enPath = join(
  __dirname,
  `../output/copy/${locale === 'pt-BR' ? 'pt-BR' : 'en'}.ts`,
)

const KNOWN_NAMES = [
  'Yo', 'Hekiji', 'Itsuka', 'Daikaku', 'Moe', 'Kashiko', 'Jin', 'Konako', 'Tesla', 'Gunhead',
  'Shuichi', 'Needle', 'Pony', 'Moyuru', 'Setsuna', 'Ryo', 'Danjuro', 'Yuga', 'Takeshi', 'Togaru',
  'Garvey', 'Mashirao', 'Ugo', 'Kenji', 'Hari', 'Cowboy', 'Cow Cowboy', 'Overmodification',
  'Kendo', 'Knuckleduster', 'Pop', 'Gentle', 'Stain', 'Twice', 'Toga', 'Spinner', 'Compress',
  'Shigaraki', 'Tomura', 'Dabi', 'Hawks', 'Endeavor', 'Mirko', 'Nejire', 'Mirio', 'Shinsou',
  'Monoma', 'Tokoyami', 'Jiro', 'Kaminari', 'Sero', 'Ashido', 'Mineta', 'Shoji', 'Midoriya',
  'Bakugo', 'Todoroki', 'Uraraka', 'Kirishima', 'Iida', 'Aizawa', 'All Might', 'Present Mic',
  'Gran Torino', 'Best Jeanist', 'Fat Gum', 'Rappa', 'Shindo', 'Nagant', 'Curious', 'Re-Destro',
  'Mr.', 'Ms.', 'Lady Nagant', 'Captain Celebrity', 'Sloshed',
]

const LORE_MARKERS = [
  "Beast's Forest", 'Beast Forest', 'Floresta da Besta', 'Class 1-A', 'U.A.', 'UA High',
  'Meta Ability', 'viewers', 'telespectadores', 'province of Japan', 'província do Japão',
]

const text = readFileSync(enPath, 'utf8')
const re = /'([a-z0-9-]+)':\s*\{[^}]*description:\s*'((?:\\'|[^'])*)'/gs
const hits = []

let m
while ((m = re.exec(text)) !== null) {
  const id = m[1]
  const desc = m[2].replace(/\\'/g, "'")
  const reasons = []
  for (const name of KNOWN_NAMES) {
    const reName = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    if (reName.test(desc)) reasons.push(`name:${name}`)
  }
  for (const marker of LORE_MARKERS) {
    if (desc.includes(marker)) reasons.push(`lore:${marker}`)
  }
  if (/\bOnce within the ring, he could\b/.test(desc)) reasons.push('pronoun:he')
  if (/\bMr\.\s*'$/.test(desc) || desc.endsWith('Mr.')) reasons.push('truncated')
  if (reasons.length) hits.push({ id, reasons, desc })
}

console.log(`Found ${hits.length} entries`)
for (const h of hits) {
  console.log(`\n${h.id} [${h.reasons.join(', ')}]`)
  console.log(h.desc)
}
