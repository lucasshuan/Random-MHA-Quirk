interface LoadingScreenProps {
  label: string
  embedded?: boolean
}

export function LoadingScreen({ label, embedded = false }: LoadingScreenProps) {
  return (
    <div
      className={`catalog-loading-screen${embedded ? ' catalog-loading-screen-embedded' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="catalog-loading-spinner" aria-hidden="true" />
      <span className="catalog-loading-label">{label}</span>
    </div>
  )
}
