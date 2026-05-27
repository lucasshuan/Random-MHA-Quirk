/**
 * One-time migration: split App.css, extract colors to :root tokens, wire src/styles/.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')
const SRC = path.join(ROOT, 'src')
const STYLES = path.join(SRC, 'styles')
const APP_CSS = path.join(SRC, 'App.css')
const INDEX_CSS = path.join(SRC, 'index.css')

const EXISTING_VAR_VALUES = new Map([
  ['#0b1018', 'bg'],
  ['#121a27', 'panel-bg'],
  ['#0f1722', 'panel-bg-2'],
  ['#e7ecf5', 'text'],
  ['#9facbd', 'muted'],
  ['#253244', 'border'],
  ['#314359', 'border-strong'],
  ['#f8d849', 'accent'],
  ['#ffe97d', 'accent-strong'],
  ['#ff8f8f', 'danger'],
  ['#f5b3b3', 'danger-soft'],
  ['#172131', 'btn-bg'],
  ['#0d1520', 'input-bg'],
  ['#fff', 'white'],
  ['#ffffff', 'white'],
  ['#000', 'black'],
  ['#000000', 'black'],
])

const COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)/g

function normalizeHex(hex) {
  let h = hex.toLowerCase()
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h
}

function normalizeColor(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith('#')) return normalizeHex(trimmed)
  return trimmed.replace(/\s+/g, ' ')
}

function colorToVarSlug(color) {
  const normalized = normalizeColor(color)
  if (normalized.startsWith('#')) {
    return `hex-${normalized.slice(1)}`
  }
  const rgba = normalized.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
  )
  if (!rgba) return null
  const r = Math.round(Number(rgba[1]))
  const g = Math.round(Number(rgba[2]))
  const b = Math.round(Number(rgba[3]))
  const a = rgba[4] !== undefined ? rgba[4] : '1'
  const aSlug = String(a).replace('.', '')
  return `rgba-${r}-${g}-${b}-${aSlug}`
}

function parseRootVars(css) {
  const vars = new Map()
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/s)
  if (!rootMatch) return vars
  for (const line of rootMatch[1].split('\n')) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);?\s*$/)
    if (!m) continue
    const value = m[2].trim()
    if (value.startsWith('#') || value.startsWith('rgb')) {
      vars.set(normalizeColor(value), m[1])
    }
  }
  return vars
}

function buildColorMap(cssBlocks) {
  const rootVars = parseRootVars(fs.readFileSync(INDEX_CSS, 'utf8'))
  const colorToVar = new Map()

  for (const [hex, name] of EXISTING_VAR_VALUES) {
    colorToVar.set(normalizeColor(hex), `--${name}`)
  }
  for (const [value, varName] of rootVars) {
    colorToVar.set(value, varName)
  }

  const discovered = new Set()
  for (const css of cssBlocks) {
    for (const match of css.matchAll(COLOR_LITERAL)) {
      const raw = match[0]
      if (raw.includes('var(')) continue
      discovered.add(normalizeColor(raw))
    }
  }

  const newVars = []
  for (const color of [...discovered].sort()) {
    if (colorToVar.has(color)) continue
    const slug = colorToVarSlug(color)
    if (!slug) continue
    const varName = `--color-${slug}`
    colorToVar.set(color, varName)
    newVars.push({ varName, value: color })
  }

  return { colorToVar, newVars }
}

function replaceColors(css, colorToVar) {
  return css.replace(COLOR_LITERAL, (raw) => {
    if (raw.includes('var(')) return raw
    const key = normalizeColor(raw)
    const varName = colorToVar.get(key)
    return varName ? `var(${varName})` : raw
  })
}

const SPLITS = [
  { file: 'layout/shell.css', start: 1, end: 624 },
  { file: 'components/tier-toggle.css', start: 625, end: 916 },
  { file: 'components/wizard.css', start: 917, end: 1197 },
  { file: 'utilities/scroll.css', start: 1198, end: 1896 },
  { file: 'components/tooltips.css', start: 1897, end: 2188 },
  { file: 'components/filters.css', start: 2189, end: 2471 },
  { file: 'components/quirk-card.css', start: 2472, end: 2788 },
  { file: 'components/hybrid.css', start: 2789, end: 3191 },
  { file: 'components/manual-pick.css', start: 3192, end: 4048 },
  { file: 'utilities/responsive.css', start: 4049, end: Infinity },
]

function splitAppCss(lines) {
  const chunks = []
  for (const split of SPLITS) {
    const slice = lines.slice(split.start - 1, split.end === Infinity ? undefined : split.end)
    chunks.push({ file: split.file, content: slice.join('\n').trimEnd() + '\n' })
  }
  return chunks
}

function extractIndexSections(css) {
  const rootEnd = css.indexOf('\n}\n\n*,')
  const rootBlock = css.slice(0, rootEnd + 2)
  const rest = css.slice(rootEnd + 2)
  return { rootBlock, rest }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

const appLines = fs.readFileSync(APP_CSS, 'utf8').split('\n')
const indexCss = fs.readFileSync(INDEX_CSS, 'utf8')
const { rootBlock, rest: indexRest } = extractIndexSections(indexCss)

const splitChunks = splitAppCss(appLines)
const cssBlocks = [indexRest, ...splitChunks.map((c) => c.content)]
const { colorToVar, newVars } = buildColorMap(cssBlocks)

const existingRootInner = rootBlock.match(/:root\s*\{([\s\S]*)\}/)[1]
const tokenLines = existingRootInner
  .trim()
  .split('\n')
  .map((line) => line.trimEnd())

const colorsCss = [
  '/* Auto-generated color tokens — every literal color resolves through :root */',
  ':root {',
  ...tokenLines.map((line) => (line ? `  ${line}` : '')),
  '',
  '  /* Extended palette (from App.css literals) */',
  ...newVars.map(({ varName, value }) => `  ${varName}: ${value};`),
  '}',
  '',
].join('\n')

const spacingCss = indexRest.includes('--fluid-screen-pad-top')
  ? ''
  : ''

// indexRest contains box-sizing, body, backgrounds
const baseReset = indexRest.split('body::before')[0].trim()
const baseBackground = 'body::before' + indexRest.split('body::before')[1]

const processedChunks = splitChunks.map(({ file, content }) => ({
  file,
  content: replaceColors(content, colorToVar),
}))

const processedBaseReset = replaceColors(baseReset, colorToVar)
const processedBaseBackground = replaceColors(baseBackground, colorToVar)

const stylesIndex = [
  '@import "./tokens/colors.css";',
  '@import "./tokens/spacing.css";',
  '@import "./base/reset.css";',
  '@import "./base/background.css";',
  ...processedChunks.map(({ file }) => `@import "./${file.replace(/\\/g, '/')}";`),
  '',
].join('\n')

ensureDir(path.join(STYLES, 'tokens', 'colors.css'))
ensureDir(path.join(STYLES, 'tokens', 'spacing.css'))
ensureDir(path.join(STYLES, 'base', 'reset.css'))
ensureDir(path.join(STYLES, 'base', 'background.css'))
for (const { file } of processedChunks) {
  ensureDir(path.join(STYLES, file))
}

// spacing from original :root (fluid vars + typography on :root moved to spacing)
const spacingContent = `:root {
${tokenLines
  .filter((line) => line.includes('--fluid-') || line.includes('font-') || line.includes('line-height') || line.includes('font-weight') || line.includes('text-rendering') || line.includes('font-synthesis') || line.includes('-webkit-font') || line.includes('-moz-osx'))
  .map((line) => `  ${line.trim()}`)
  .join('\n')}
}
`

// Remove spacing/typography from colors.css :root duplicate - rebuild colors.css properly
const colorOnlyLines = tokenLines.filter(
  (line) =>
    line &&
    !line.includes('--fluid-') &&
    !line.includes('font-family') &&
    !line.includes('line-height') &&
    !line.includes('font-weight') &&
    !line.includes('font-synthesis') &&
    !line.includes('text-rendering') &&
    !line.includes('-webkit-font') &&
    !line.includes('-moz-osx') &&
    !line.includes('color:') &&
    !line.includes('background-color:'),
)

const colorsCssFinal = [
  '/* Design tokens — colors */',
  ':root {',
  ...colorOnlyLines.map((line) => `  ${line.trim()}`),
  '',
  '  /* Extended palette */',
  ...newVars.map(({ varName, value }) => `  ${varName}: ${value};`),
  '}',
  '',
].join('\n')

fs.writeFileSync(path.join(STYLES, 'tokens', 'colors.css'), colorsCssFinal)
fs.writeFileSync(path.join(STYLES, 'tokens', 'spacing.css'), spacingContent + '\n')
fs.writeFileSync(path.join(STYLES, 'base', 'reset.css'), processedBaseReset + '\n')
fs.writeFileSync(path.join(STYLES, 'base', 'background.css'), processedBaseBackground.trimEnd() + '\n')

for (const { file, content } of processedChunks) {
  fs.writeFileSync(path.join(STYLES, file), content)
}

fs.writeFileSync(path.join(STYLES, 'index.css'), stylesIndex)

fs.writeFileSync(
  path.join(SRC, 'app', 'globals.css'),
  `@import '../styles/index.css';

html,
body {
  height: var(--app-height);
  max-height: var(--app-height);
  overflow: hidden;
}

body > * {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
}
`,
)

console.log(`Migrated ${processedChunks.length} CSS modules`)
console.log(`Added ${newVars.length} new color tokens`)
console.log(`Total mapped colors: ${colorToVar.size}`)
