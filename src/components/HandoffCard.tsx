import type { HandoffSlipDoc } from "../types";
import { formatStampTime } from "../lib/share";

interface HandoffCardProps {
  slip: HandoffSlipDoc | null;
}

function barcodeBars(id: string): number[] {
  const bars: number[] = [];
  for (let i = 0; i < 36; i += 1) {
    const code = id.charCodeAt(i % id.length) + i * 17;
    bars.push(1 + (code % 4));
  }
  return bars;
}

function RuleList({
  items,
  empty,
  tone,
}: {
  items: string[];
  empty: string;
  tone: string;
}) {
  if (!items.length) {
    return <p className="r-placeholder">{empty}</p>;
  }
  return (
    <ol className={`clauses ${tone}`}>
      {items.map((line, index) => (
        <li key={line}>
          <span className="n">{index + 1}</span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
}

export function HandoffCard({ slip }: HandoffCardProps) {
  const ready = Boolean(slip?.from && slip.to && slip.goal && slip.next);
  const urgent = slip?.priority === "URGENT";
  const tone = !ready ? "is-empty" : urgent ? "is-urgent" : "is-go";

  return (
    <article className={`ticket ${tone}`}>
      <div className="ticket-rail" aria-hidden="true" />
      <header className="ticket-head">
        <div>
          <p className="r-kicker">Agent-to-agent baton</p>
          <h2>Handoff</h2>
        </div>
        <p className="ticket-seq">{slip?.id ?? "HS-————"}</p>
      </header>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="ticket-body">
        <div className="stamp-row">
          <div className={`wax ${tone}`}>
            <div className="wax-ring" />
            <div className="wax-core">
              <span className="wax-kicker">SMF WORKS</span>
              <strong>{ready ? (urgent ? "URGENT" : "PASS") : "DRAFT"}</strong>
              <span className="wax-sub">{ready ? "HANDOFF SLIP" : "FILL BATON"}</span>
            </div>
          </div>
          <dl className="codes">
            <div>
              <dt>Stamp</dt>
              <dd>{ready ? "HANDOFF" : "—"}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{slip?.priority ?? "NORMAL"}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>{slip?.session || slip?.date || "OPEN"}</dd>
            </div>
          </dl>
        </div>

        <dl className="route">
          <div className="party">
            <dt>From</dt>
            <dd>{slip?.from || "Who is handing off."}</dd>
          </div>
          <span className="route-arrow" aria-hidden="true">
            →
          </span>
          <div className="party">
            <dt>To</dt>
            <dd>{slip?.to || "Who picks up."}</dd>
          </div>
        </dl>

        <section className="r-hero">
          <p className="r-label">Goal</p>
          <h3>{slip?.goal || "Name what this work is for."}</h3>
        </section>

        <div className="rule-grid is-two">
          <section className="rule-col is-must">
            <p className="r-label">Done so far</p>
            <RuleList
              items={slip?.done ?? []}
              empty="What not to redo."
              tone="is-must"
            />
          </section>
          <section className="rule-col is-deny">
            <p className="r-label is-deny">Open risks</p>
            <RuleList
              items={slip?.risks ?? []}
              empty="What not to miss."
              tone="is-deny"
            />
          </section>
        </div>

        <section className="next-block">
          <p className="r-label is-stop">Next action</p>
          <p className="next-line">{slip?.next || "One clear line for the next agent."}</p>
        </section>
      </div>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="barcode" aria-hidden="true">
        {barcodeBars(slip?.id ?? "HS-0000").map((width, index) => (
          <i key={index} style={{ width }} />
        ))}
      </div>

      <footer className="r-foot">
        <p>SMF Works · Handoff Slip</p>
        <p className="r-link">smfworks.com</p>
        <p className="r-motto">
          {slip ? formatStampTime(slip.issuedAt) : "Lab artifact · not a workflow engine"}
        </p>
        <p className="r-motto">Pass the baton. Do not redo the work.</p>
      </footer>
    </article>
  );
}
