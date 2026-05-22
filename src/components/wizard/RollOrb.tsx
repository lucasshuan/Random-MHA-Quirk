interface RollOrbProps {
  phase: 'rolling' | 'reveal'
}

export function RollOrb({ phase }: RollOrbProps) {
  return (
    <div className={`roll-orb ${phase === 'rolling' ? 'roll-orb-spin' : 'roll-orb-reveal'}`}>
      <span className="roll-orb-core" />
      <span className="roll-orb-ring" />
    </div>
  )
}
