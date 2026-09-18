export function Header() {
  return (
    <header className="mast">
      <div className="mast-brand">
        <span className="mark" aria-hidden="true" />
        <div>
          <p className="eyebrow">SMF Works · Human-AI lab</p>
          <h1>Handoff Slip</h1>
        </div>
      </div>
      <p className="lede">
        Fill From / To / Goal / Done so far / Open risks / Next action. Print a
        baton card for the next agent — or the human on the next shift.
      </p>
    </header>
  );
}
