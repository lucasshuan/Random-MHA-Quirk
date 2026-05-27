import type { FusionTranslationLocale } from '@/server/fusion/constants'
import type { FusionNameRegister } from '@/server/fusion/prompts/naming'
import { isFusionNameRegister } from '@/server/fusion/prompts/naming'

const LOCALE_LABELS: Record<
  FusionTranslationLocale,
  { languageLabel: string; jsonKey: FusionTranslationLocale }
> = {
  'pt-BR': { languageLabel: 'Brazilian Portuguese', jsonKey: 'pt-BR' },
  es: { languageLabel: 'Spanish', jsonKey: 'es' },
}

/** Applies to every register when localizing en.name. */
export const LOCALE_NAME_SHARED_RULES = [
  'Keep the English title’s chosen angle — do not rename from a different detail in the description (e.g. Drift → Deriva, not Nuvem/Nube from “gas cloud”).',
  'If the English title is very short, meme-adjacent, or a widely recognized loanword with no natural native equivalent, keeping the English title is acceptable — do not force a calque (e.g. Pop Off, Zoom, Stress, Playtime).',
] as const

interface LocaleNameRegisterConfig {
  /** Register-specific localization rules for this locale. */
  rules: readonly string[]
  /** Illustrative English → localized title patterns (not mandatory outputs). */
  examples: readonly string[]
}

const LOCALE_NAME_BY_REGISTER: Record<
  FusionTranslationLocale,
  Record<FusionNameRegister, LocaleNameRegisterConfig>
> = {
  'pt-BR': {
    pun: {
      rules: [
        'O trocadilho precisa funcionar em português — adapte o jogo de palavras, não traduza literal.',
        'Gíria e frases coloquiais são OK se fizerem o trocadilho cair.',
        'Se traduzir mata a piada, não for possível trocar o trocadilho por um outro e o termo não é usado assim online, traduza o conceito ou mantenha o inglês.',
      ],
      examples: [
        'Got Milk? → Temos Leite?',
        'Current Events → Corrente Elétrica (não Eventos Atuais — a individualidade é a corrente elétrica, não os eventos)',
        'Fly Swatter → Mata-Moscas',
        'Control Glass → Controle de Vidro',
      ],
    },
    blunt: {
      rules: [
        'Deadpan nickname voice: 1–3 palavras, como apelido que alguém falaria de verdade.',
        'Abreviações, atalhos falados e termos coloquiais leves são permitidos se soarem naturais.',
        'Evite tradução formal ou enciclopédica — prefira o jeito que fãs falam.',
      ],
      examples: [
        'Drift → Deriva',
        'Float → Flutuar',
        'Zoom → Zoom',
        'Smoke → Fumaça',
        'Decay → Desintegração',
        'Flight → Voo',
      ],
    },
    dramatic: {
      rules: [
        'Título estilo canon — composto, marcante, heroico/vilão; sem gíria nem abreviação.',
        'Compostos e cognatos dramáticos são bem-vindos quando soam publicados.',
      ],
      examples: [
        'Hellflame → Chama Infernal',
        'Blackwhip → Chicote Negro',
        'Chronostasis → Cronostase',
        'Rewind → Rebobinar',
      ],
    },
    'absurd-long': {
      rules: [
        'Mantenha a frase longa e específica — traduza o absurdo, não encurte.',
        'O humor vem do tamanho e da imagem mental.',
      ],
      examples: [
        'Gigantic Spinning Flying Turtle → Gigante Tartaruga Voadora Giratória',
        'Half-Cold Half-Hot → Meio-Frio Meio-Quente',
        'Beams From His Eyes → Raios de seus Olhos',
        'Shoulder-Mounted Jets → Jatos Montados no Ombro',
      ],
    },
    'meme-adjacent': {
      rules: [
        'Humor de internet, frases de meme e termos chulos/leves coloquiais são permitidos.',
        'Abreviações e gíria online são OK se mantiverem a piada.',
        'Se traduzir mata a piada ou o termo já é usado assim online, mantenha o inglês.',
      ],
      examples: [
        'Who, Me? → Pera, Eu?',
        'Sugar Rush → Corrida do Açúcar',
        'Chest Hair → Pelos no Peito',
        'Pop Off → Ploc-ploc',
        'Stress → Estresse',
      ],
    },
  },
  es: {
    pun: {
      rules: [
        'El juego de palabras debe funcionar en español — adapta el chiste, no traduzcas literal.',
        'Coloquialismo ligero está OK si hace caer el trocadillo.',
        'Se traduzir mata a piada, no es posible cambiar el trocadillo por otro y el término no se usa así online, traduzca el concepto o mantenga el inglés.',
      ],
      examples: [
        'Got Milk? → ¿Tienes Leche?',
        'Current Events → Corriente Eléctrica (no Eventos Atuais — la individualidad es la corriente eléctrica, no los eventos)',
        'Fly Swatter → Matamoscas',
        'Control Glass → Control de Vidrio',
      ],
    },
    blunt: {
      rules: [
        'Apodo directo: 1–3 palabras, como un mote que alguien diría en voz alta.',
        'Abreviaciones, atajos hablados y términos coloquiales leves están permitidos.',
        'Evita traducción formal — prefiere cómo hablarían los fans.',
      ],
      examples: [
        'Drift → Deriva',
        'Float → Flotar',
        'Zoom → Zoom',
        'Smoke → Humo',
        'Blast → Explosión',
        'Decay → Putrefacción',
        'Flight → Vuelo',
      ],
    },
    dramatic: {
      rules: [
        'Título estilo canon — compuesto, memorable; sin jerga ni abreviaciones.',
      ],
      examples: [
        'Hellflame → Llama Infernal',
        'Blackwhip → Látigo Negro',
        'Chronostasis → Cronostasis',
        'Rewind → Rebobinar',
      ],
    },
    'absurd-long': {
      rules: [
        'Conserva la frase larga y específica — traduce el absurdo, no acortes.',
        'El humor viene del tamaño y de la imagen mental.',
      ],
      examples: [
        'Gigantic Spinning Flying Turtle → Tortuga Gigante Voladora Giratoria',
        'Half-Cold Half-Hot → Mitad Frío Mitad Caliente',
        'Beams From His Eyes → Rayos de sus Ojos',
        'Shoulder-Mounted Jets → Cohetes Montados en sus Ombros',
      ],
    },
    'meme-adjacent': {
      rules: [
        'Humor de internet, frases meme y términos coloquiales/chulos leves están permitidos.',
        'Abreviaciones y jerga online OK si mantienen el chiste.',
        'Si traducir mata el chiste o el término ya se usa así online, mantén el inglés.',
      ],
      examples: [
        'Who, Me? → ¿Quién, Yo?',
        'Sugar Rush → Subidón de Azúcar',
        'Chest Hair → Pelos en el Pecho',
        'Pop Off → Plo-plo',
        'Stress → Estrés',
      ],
    },
  },
}

export function formatLocaleNameRegisterBlock(
  register: string,
  locales: readonly FusionTranslationLocale[],
): string {
  if (!isFusionNameRegister(register)) return ''

  const sharedRules = LOCALE_NAME_SHARED_RULES.map((line) => `- ${line}`).join('\n')

  const sections = locales.map((locale) => {
    const config = LOCALE_LABELS[locale]
    const registerConfig = LOCALE_NAME_BY_REGISTER[locale][register]
    const rules = registerConfig.rules.map((line) => `- ${line}`).join('\n')
    const examples = registerConfig.examples.map((line) => `- ${line}`).join('\n')

    return `#### ${config.languageLabel} (${config.jsonKey})
Rules:
${rules}
Examples:
${examples}`
  })

  return `Localized title adaptation (same register as English generation):
Shared:
${sharedRules}

${sections.join('\n\n')}`
}
