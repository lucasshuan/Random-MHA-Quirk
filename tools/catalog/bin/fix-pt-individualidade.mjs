/**
 * Fix remaining PT descriptions using "Quirk"/"Peculiaridade" → "individualidade"
 * and objective EN copy for the same ids.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manualPath = join(__dirname, '../data/sources/manual-copy.json')

const PATCHES = {
  'assault-dust': {
    en: 'Generates and manipulates dust, firing it at high speed as dense particulate attacks.',
    pt: 'Permite gerar e manipular poeira, disparando-a em alta velocidade como ataques de partículas densas.',
  },
  bat: {
    en: 'Grants bat-like traits including arm wings, fangs, pointed ears, high-speed running, and flight.',
    pt: 'Concede traços de morcego, incluindo asas nos braços, presas, orelhas pontudas, corrida em alta velocidade e voo.',
  },
  bloodcurdle: {
    en: 'Temporarily paralyzes opponents after the user ingests their blood sample. Also extends the tongue with papillae used to deliver the effect.',
    pt: 'Paralisa temporariamente oponentes depois que o usuário ingere uma amostra do sangue deles. Também alonga a língua com papilas usadas para aplicar o efeito.',
  },
  blueflame: {
    en: 'Produces blue flames from the body at will, with a hotter burn than typical fire-based emitters.',
    pt: 'Produz chamas azuis a partir do corpo à vontade, com combustão mais quente que a de emissores de fogo comuns.',
  },
  'body-bulk': {
    en: 'Lets the user enlarge their entire body, greatly increasing physical strength and overall mass.',
    pt: 'Permite ampliar todo o corpo, aumentando muito a força física e a massa geral.',
  },
  'body-morph': {
    en: 'Adds a second pair of arms and grants greatly enhanced physical strength.',
    pt: 'Acrescenta um segundo par de braços e concede força física muito aumentada.',
  },
  boomerang: {
    en: 'Curves the trajectory of thrown objects so they home in on targets. Affected objects and the user\'s hands may glow purple when active.',
    pt: 'Curva a trajetória de objetos arremessados para que se dirijam aos alvos. Objetos afetados e as mãos do usuário podem brilhar em roxo quando ativa.',
  },
  bristle: {
    en: 'Greatly hardens the user\'s hair for offense or defense. Further limits have not been clearly documented.',
    pt: 'Endurece muito o cabelo do usuário para ataque ou defesa. Limites adicionais não foram claramente documentados.',
  },
  'brown-bear': {
    en: 'Grants bear-like strength, durability, senses, and large sharp claws.',
    pt: 'Concede força, resistência, sentidos e garras grandes e afiadas semelhantes aos de um urso.',
  },
  bruiser: {
    en: 'Charges one limb with stored force; longer charging yields a stronger strike.',
    pt: 'Carrega um membro com força acumulada; quanto mais longa a carga, mais forte o golpe.',
  },
  burst: {
    en: 'Makes the user explode in a blinding flash of light. Appears to be a one-time, self-destructive activation.',
    pt: 'Faz o usuário explodir em um clarão ofuscante de luz. Parece ser uma ativação única e autodestrutiva.',
  },
  centipede: {
    en: 'Extends long centipede-like limbs from the arms, legs, and head for ranged grabs and restraint.',
    pt: 'Estende membros longos semelhantes a centopeias pelos braços, pernas e cabeça para agarrões e contenção à distância.',
  },
  'chest-hair': {
    en: 'Presumably enhances masculine physique traits based on its name; full capabilities are poorly documented.',
    pt: 'Presumivelmente realça traços físicos masculinos conforme o nome; as capacidades completas são pouco documentadas.',
  },
  chimera: {
    en: 'Combines traits from multiple animals, enhancing them and allowing monstrous enlargement of any chosen feature.',
    pt: 'Combina traços de vários animais, aprimorando-os e permitindo ampliar qualquer característica escolhida a proporções monstruosas.',
  },
  cleaning: {
    en: 'Secretes a soap-like substance that weakens or nullifies other quirks when scrubbed onto targets.',
    pt: 'Secreção de substância semelhante a sabão que enfraquece ou anula outras individualidades ao ser esfregada nos alvos.',
  },
  compress: {
    en: 'Shrinks anything inside a touched spherical zone into a small marble without damage. Requires hand contact to activate.',
    pt: 'Encolhe qualquer coisa dentro de uma zona esférica tocada em um pequeno mármore sem danificar. Exige contato com a mão para ativar.',
  },
  copy: {
    en: 'Lets the user temporarily wield another person\'s quirk after touching them, requiring only a few strands of hair.',
    pt: 'Permite ao usuário usar temporariamente a individualidade de outra pessoa após tocá-la, bastando alguns fios de cabelo.',
  },
  curse: {
    en: 'Turns the entire body into paper talismans, making the user extremely light. Paper strips can be launched as sharp strands.',
    pt: 'Transforma todo o corpo em talismãs de papel, tornando o usuário extremamente leve. Tiras de papel podem ser lançadas como fios cortantes.',
  },
  despot: {
    en: 'Extrudes control threads that puppeteer other people\'s bodies; dozens of victims can be guided at once.',
    pt: 'Expelir fios de controle que marionetam corpos alheios; dezenas de vítimas podem ser controladas ao mesmo tempo.',
  },
  'erasure-spot': {
    en: 'Creates a dome-shaped energy wave that deactivates the quirks of everyone inside its range.',
    pt: 'Cria uma onda de energia em forma de cúpula que desativa as individualidades de todos dentro de seu alcance.',
  },
  larceny: {
    en: 'Instantly pulls any possessed object from a target into the user\'s hands, including constructs created by other quirks.',
    pt: 'Puxa instantaneamente para as mãos do usuário qualquer objeto que o alvo possua, inclusive construtos criados por outras individualidades.',
  },
  scanning: {
    en: 'Detects and identifies nearby quirks to a limited degree and estimates power level through heat-signature-like vision.',
    pt: 'Detecta e identifica individualidades próximas em certa medida e estima o nível de poder por uma visão semelhante a assinatura térmica.',
  },
}

const manual = JSON.parse(readFileSync(manualPath, 'utf8'))

for (const [id, { en, pt }] of Object.entries(PATCHES)) {
  if (manual.en[id]) manual.en[id].description = en
  if (manual['pt-BR'][id]) manual['pt-BR'][id].description = pt
}

writeFileSync(manualPath, JSON.stringify(manual, null, 2) + '\n', 'utf8')
console.log(`Updated ${Object.keys(PATCHES).length} quirks (EN + PT)`)
