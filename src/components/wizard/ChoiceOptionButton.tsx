interface ChoiceOptionButtonProps {
  label: string
  description: string
  tone: string
  onClick: () => void
  className?: string
  iconSrc?: string
  iconAlt?: string
}

export function ChoiceOptionButton({
  label,
  description,
  tone,
  onClick,
  className = '',
  iconSrc,
  iconAlt = '',
}: ChoiceOptionButtonProps) {
  const classes = [
    'choice-btn',
    `choice-btn-${tone}`,
    iconSrc ? 'choice-btn-with-art' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
    >
      {iconSrc ? (
        <span className="choice-btn-art" aria-hidden="true">
          <img src={iconSrc} alt={iconAlt} />
        </span>
      ) : null}
      <span className="choice-btn-content">
        <span className="choice-btn-label">{label}</span>
        <span className="choice-btn-hint">{description}</span>
      </span>
    </button>
  )
}
