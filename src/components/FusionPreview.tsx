import type { Quirk } from '../types/quirk'
import { QuirkCard } from './QuirkCard'

interface FusionPreviewProps {
  pair: [Quirk, Quirk] | null
}

export function FusionPreview({ pair }: FusionPreviewProps) {
  return (
    <section className="panel">
      <h2>Fusion Inputs</h2>
      {pair ? (
        <div className="fusion-grid">
          <QuirkCard quirk={pair[0]} slotLabel="1" />
          <QuirkCard quirk={pair[1]} slotLabel="2" />
        </div>
      ) : (
        <p>Choose or roll two quirks to preview a possible fusion input pair.</p>
      )}
    </section>
  )
}

