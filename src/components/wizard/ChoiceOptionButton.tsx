interface ChoiceOptionButtonProps {
  label: string
  description: string
  tone: string
  onClick: () => void
  className?: string
}

export function ChoiceOptionButton({
  label,
  description,
  tone,
  onClick,
  className = '',
}: ChoiceOptionButtonProps) {
  return (
    <button
      type="button"
      className={`choice-btn choice-btn-${tone} ${className}`.trim()}
      onClick={onClick}
    >
      <span className="choice-btn-content">
        <span className="choice-btn-label">{label}</span>
        <span className="choice-btn-hint">{description}</span>
      </span>
    </button>
  )
}
