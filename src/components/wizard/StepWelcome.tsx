export function StepWelcome() {
  return (
    <div className="wizard-content">
      <h2>Generate your base quirk setup</h2>
      <p>
        This flow helps you select mode, optionally add filters, and produce
        results in order. You can always go back or restart.
      </p>
      <ul className="wizard-list">
        <li>Pick random rolling or manual quirk selection.</li>
        <li>Narrow the pool with optional filters and facets.</li>
        <li>Preview one quirk and a two-quirk fusion input pair.</li>
      </ul>
    </div>
  )
}

