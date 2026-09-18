import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SAMPLES } from "../data/samples";
import type { BulletBucket, HandoffDraft, Priority } from "../types";

interface ComposerProps {
  draft: HandoffDraft;
  sampleId: string | null;
  paste: string;
  onChange: (next: HandoffDraft) => void;
  onSample: (id: string) => void;
  onPasteChange: (raw: string) => void;
  onSplitPaste: () => void;
  onAdd: (bucket: BulletBucket, raw: string) => boolean;
  onRemove: (bucket: BulletBucket, raw: string) => void;
}

const BUCKETS: {
  id: BulletBucket;
  label: string;
  hint: string;
  placeholder: string;
  tone: string;
}[] = [
  {
    id: "done",
    label: "Done so far",
    hint: "What the next agent should not redo. One line each.",
    placeholder: "e.g. Reproduced the PNG hang",
    tone: "is-must",
  },
  {
    id: "risks",
    label: "Open risks",
    hint: "What they must not miss. Watchouts, not a dump.",
    placeholder: "e.g. Do not touch the paste splitter",
    tone: "is-deny",
  },
];

export function Composer({
  draft,
  sampleId,
  paste,
  onChange,
  onSample,
  onPasteChange,
  onSplitPaste,
  onAdd,
  onRemove,
}: ComposerProps) {
  const [lines, setLines] = useState<Record<BulletBucket, string>>({
    done: "",
    risks: "",
  });

  const patch = (partial: Partial<HandoffDraft>) => {
    onChange({ ...draft, ...partial });
  };

  const submit = (bucket: BulletBucket, event?: FormEvent) => {
    event?.preventDefault();
    if (onAdd(bucket, lines[bucket])) {
      setLines((prev) => ({ ...prev, [bucket]: "" }));
    }
  };

  const onKey = (bucket: BulletBucket, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit(bucket);
    }
  };

  return (
    <section className="composer">
      <div className="composer-head">
        <h2>Write the baton</h2>
        <p>Pick a sample, paste a messy note, or fill From → To by hand.</p>
      </div>

      <div className="sample-row">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className={sampleId === sample.id ? "chip is-on" : "chip"}
            onClick={() => onSample(sample.id)}
          >
            <span className="chip-top">
              <i
                className={sample.draft.priority === "URGENT" ? "dot is-urgent" : "dot is-go"}
                aria-hidden="true"
              />
              {sample.label}
            </span>
            <small>{sample.blurb}</small>
          </button>
        ))}
      </div>

      <div className="party-inputs">
        <div>
          <label className="editor-label" htmlFor="from-input">
            From
          </label>
          <input
            id="from-input"
            value={draft.from}
            onChange={(event) => patch({ from: event.target.value })}
            placeholder="Literature scout"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="editor-label" htmlFor="to-input">
            To
          </label>
          <input
            id="to-input"
            value={draft.to}
            onChange={(event) => patch({ to: event.target.value })}
            placeholder="Brief writer"
            autoComplete="off"
          />
        </div>
      </div>

      <label className="editor-label" htmlFor="goal-input">
        Goal
      </label>
      <textarea
        id="goal-input"
        rows={2}
        className="goal-input"
        value={draft.goal}
        onChange={(event) => patch({ goal: event.target.value })}
        placeholder="Turn the survey into a one-page brief a human can ship."
      />

      <div className="party-inputs">
        <div>
          <label className="editor-label" htmlFor="session-input">
            Session <span className="opt">(optional)</span>
          </label>
          <input
            id="session-input"
            value={draft.session}
            onChange={(event) => patch({ session: event.target.value })}
            placeholder="this session"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="editor-label" htmlFor="date-input">
            Date <span className="opt">(optional)</span>
          </label>
          <input
            id="date-input"
            value={draft.date}
            onChange={(event) => patch({ date: event.target.value })}
            placeholder="2026-09-18"
            autoComplete="off"
          />
        </div>
      </div>

      <label className="editor-label" htmlFor="priority-input">
        Priority
      </label>
      <select
        id="priority-input"
        value={draft.priority}
        onChange={(event) => patch({ priority: event.target.value as Priority })}
      >
        <option value="NORMAL">NORMAL</option>
        <option value="URGENT">URGENT</option>
      </select>

      <label className="editor-label" htmlFor="paste-input">
        Paste a note <span className="opt">(optional · heuristic)</span>
      </label>
      <textarea
        id="paste-input"
        rows={6}
        value={paste}
        onChange={(event) => onPasteChange(event.target.value)}
        placeholder={
          "From: Debug agent\nTo: Fixer agent\nGoal: Patch the hang\nDone:\n- Reproduced it\nRisks:\n- Screenshot path\nNext: Guard the export frame"
        }
      />
      <div className="add-row">
        <p className="field-hint">
          Splits on headers: From, To, Goal, Done, Risks, Next, Session, Date,
          Priority. Approximate — review the slip.
        </p>
        <button type="button" className="btn btn-inline" onClick={onSplitPaste}>
          Split into fields
        </button>
      </div>

      {BUCKETS.map((bucket) => (
        <div key={bucket.id} className={`bucket-block ${bucket.tone}`}>
          <p className="editor-label" id={`${bucket.id}-label`}>
            {bucket.label}
          </p>
          {draft[bucket.id].length ? (
            <ul className={`picked is-block ${bucket.tone}`}>
              {draft[bucket.id].map((line) => (
                <li key={line}>
                  <span>{line}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(bucket.id, line)}
                    aria-label={`Remove ${line}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-hint">{bucket.hint}</p>
          )}
          <form className="add-row" onSubmit={(event) => submit(bucket.id, event)}>
            <input
              value={lines[bucket.id]}
              onChange={(event) =>
                setLines((prev) => ({ ...prev, [bucket.id]: event.target.value }))
              }
              onKeyDown={(event) => onKey(bucket.id, event)}
              placeholder={bucket.placeholder}
              aria-labelledby={`${bucket.id}-label`}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-inline">
              Add
            </button>
          </form>
        </div>
      ))}

      <label className="editor-label" htmlFor="next-input">
        Next action
      </label>
      <input
        id="next-input"
        value={draft.next}
        onChange={(event) => patch({ next: event.target.value })}
        placeholder="Write the one-pager from the cited map."
        autoComplete="off"
      />

      <p className="disclaimer">
        Not a workflow runtime. A shareable slip is a lab artifact for the
        baton pass. Pair with{" "}
        <a href="https://github.com/smfworks/agent-contract" rel="noreferrer" target="_blank">
          Agent Contract
        </a>{" "}
        for the bound and{" "}
        <a href="https://github.com/smfworks/agent-receipt" rel="noreferrer" target="_blank">
          Agent Receipt
        </a>{" "}
        for what happened. The paste splitter is approximate. Judgment stays human.
      </p>
    </section>
  );
}
