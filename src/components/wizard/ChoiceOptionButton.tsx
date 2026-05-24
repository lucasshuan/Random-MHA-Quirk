import { useChoiceButtonPress } from '../../hooks/useChoiceButtonPress'

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
  const { isPeek, handleClick, handlePointerDown, handlePointerCancel } =
    useChoiceButtonPress(onClick)

  const classes = [
    'choice-btn',
    `choice-btn-${tone}`,
    iconSrc ? 'choice-btn-with-art' : '',
    isPeek ? 'is-peek' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      onPointerDown={handlePointerDown}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
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
