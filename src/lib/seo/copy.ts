import type { Locale } from '@/i18n/types'

export type SeoPageKey = 'home' | 'start' | 'database' | 'history' | 'shareFallback'

interface PageSeoCopy {
  title: string
  description: string
}

const SEO_COPY: Record<Locale, Record<SeoPageKey, PageSeoCopy>> = {
  en: {
    home: {
      title: 'Roll Your Quirk',
      description:
        'Fan-made My Hero Academia quirk roller. Draw one quirk from a curated canon-and-original pool, or fuse two parents into an AI-crafted hybrid — in English, Português, and Español.',
    },
    start: {
      title: 'Roll a Quirk',
      description:
        'Pick One Quirk, Hybrid, or Try Your Luck. Filter by type, tier, range, and facets — then reveal your Hero Academia quirk.',
    },
    database: {
      title: 'Quirk Database',
      description:
        'Browse every Hero Academia quirk and hybrid in the database. Search by name, type, tier, range, origin, and facets — open any entry or roll your own.',
    },
    history: {
      title: 'Previous Results',
      description:
        'Revisit quirks and hybrids you rolled on this device. Search saved results and reopen share links from your session.',
    },
    shareFallback: {
      title: 'Shared Quirk Result',
      description:
        'Someone rolled a My Hero Academia quirk on MHA Lab. Open the link to read the full individuality — or roll your own.',
    },
  },
  'pt-BR': {
    home: {
      title: 'Sorteie Sua Individualidade',
      description:
        'Rolador de individualidades de My Hero Academia feito por fãs. Sorteie uma quirk do acervo canônico e original, ou funda dois pais em um híbrido gerado por IA — em português, inglês e espanhol.',
    },
    start: {
      title: 'Sortear Individualidade',
      description:
        'Escolha Uma Individualidade, Híbrido ou Tente a Sorte. Filtre por tipo, tier, alcance e facetas — e revele sua quirk de MHA.',
    },
    database: {
      title: 'Base de Individualidades',
      description:
        'Explore todas as quirks e híbridos salvos. Busque por nome, tipo, tier, alcance, origem e facetas — abra qualquer entrada ou sorteie a sua.',
    },
    history: {
      title: 'Resultados Anteriores',
      description:
        'Reviva quirks e híbridos que você sorteou neste dispositivo. Busque resultados salvos e reabra links compartilhados da sessão.',
    },
    shareFallback: {
      title: 'Resultado Compartilhado',
      description:
        'Alguém sorteou uma individualidade de My Hero Academia. Abra o link para ver o resultado completo — ou sorteie o seu.',
    },
  },
  es: {
    home: {
      title: 'Sortea Tu Don',
      description:
        'Generador de dones de My Hero Academia hecho por fans. Saca un don del catálogo canónico y original, o fusiona dos padres en un híbrido con IA — en español, inglés y portugués.',
    },
    start: {
      title: 'Sortear un Don',
      description:
        'Elige Un Don, Híbrido o Prueba tu Suerte. Filtra por tipo, tier, alcance y facetas — y descubre tu don de MHA.',
    },
    database: {
      title: 'Base de Dones',
      description:
        'Explora todos los dones e híbridos guardados. Busca por nombre, tipo, tier, alcance, origen y facetas — abre cualquier entrada o sortea el tuyo.',
    },
    history: {
      title: 'Resultados Anteriores',
      description:
        'Vuelve a los dones e híbridos que sorteaste en este dispositivo. Busca resultados guardados y reabre enlaces compartidos.',
    },
    shareFallback: {
      title: 'Resultado Compartido',
      description:
        'Alguien sorteó un don de My Hero Academia. Abre el enlace para ver el resultado completo — o sortea el tuyo.',
    },
  },
}

export function getPageSeoCopy(
  page: SeoPageKey,
  locale: Locale = 'en',
): PageSeoCopy {
  return SEO_COPY[locale][page]
}

export function hybridShareTitle(
  fusionName: string,
  parentAName: string,
  parentBName: string,
  locale: Locale,
): string {
  const labels = {
    en: { hybrid: 'Hybrid', of: 'of' },
    'pt-BR': { hybrid: 'Híbrido', of: 'de' },
    es: { hybrid: 'Híbrido', of: 'de' },
  } as const
  const { hybrid, of } = labels[locale]
  return `${fusionName} (${hybrid}) — ${of} ${parentAName} + ${parentBName}`
}

export function quirkShareTitle(name: string, locale: Locale): string {
  const suffix = {
    en: 'Quirk',
    'pt-BR': 'Individualidade',
    es: 'Don',
  } as const
  return `${name} — ${suffix[locale]} MHA`
}
