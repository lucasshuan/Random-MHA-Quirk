import { readFileSync, writeFileSync } from 'node:fs'

function parseNames(content) {
  const map = new Map()
  const re = /'([a-z0-9-]+)':\s*\{\s*name: '((?:\\'|[^'])*)',/g
  let m
  while ((m = re.exec(content)) !== null) {
    map.set(m[1], m[2].replace(/\\'/g, "'"))
  }
  return map
}

const en = parseNames(readFileSync('src/i18n/quirks/en.ts', 'utf8'))
const pt = parseNames(readFileSync('src/i18n/quirks/pt-BR.ts', 'utf8'))

const same = []
const englishish = []

for (const [id, pn] of pt) {
  const enN = en.get(id)
  if (!enN) continue
  if (pn === enN) {
    same.push({ id, name: pn })
    continue
  }
  const hasAccent = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(pn)
  const asciiOnly = /^[A-Za-z0-9 .,'-]+$/.test(pn)
  const englishTokens = pn.match(/\b[A-Za-z]{3,}\b/g) ?? []
  const loanwords = englishTokens.filter(
    (w) =>
      !/^(de|da|do|das|dos|no|na|em|por|um|uma|ao|aos|as|os|e|ou|jet|neo|mega|ultra|super|mini)$/i.test(
        w,
      ),
  )
  if (!hasAccent && asciiOnly && loanwords.length >= 1) {
    englishish.push({ id, pt: pn, en: enN, loanwords })
  }
}

writeFileSync(
  'research/reports/en-like-pt-names.json',
  JSON.stringify({ same, englishish }, null, 2) + '\n',
)
console.log('same:', same.length)
console.log('englishish:', englishish.length)
for (const x of englishish.sort((a, b) => a.pt.localeCompare(b.pt))) {
  console.log(`${x.id}: "${x.pt}" (en: "${x.en}")`)
}
