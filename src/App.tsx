import { SAMPLES } from "./data/samples";
import {
  addBullet,
  applySplit,
  canExport,
  cloneDraft,
  removeBullet,
  serializeSlip,
  slugify,
  slipToJson,
} from "./lib/slip";
import { cardToPngBlob, copyText, downloadBlob } from "./lib/exportImage";
import { splitHasContent, splitPaste } from "./lib/split";
import { EMPTY_DRAFT, type BulletBucket, type HandoffDraft } from "./types";
import { Actions } from "./components/Actions";
import { Composer } from "./components/Composer";
import { HandoffCard } from "./components/HandoffCard";
import { Header } from "./components/Header";
import { SisterStrip } from "./components/SisterStrip";
import { HandoffBanner } from "./components/HandoffBanner";
import { Toast } from "./components/Toast";
import { formatCompactStats, formatShareText } from "./lib/share";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function initialFromUrl(): { draft: HandoffDraft; sampleId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const sample = params.get("sample");
  const found = SAMPLES.find((item) => item.id === sample);
  if (!found) return { draft: cloneDraft(), sampleId: null };
  return { draft: cloneDraft(found.draft), sampleId: found.id };
}

function applyShotClass(): void {
  const shot = new URLSearchParams(window.location.search).get("shot");
  if (shot === "card" || shot === "og") {
    document.body.classList.add(`shot-${shot}`);
  }
}

export default function App() {
  applyShotClass();
  const [draft, setDraft] = useState<HandoffDraft>(() => initialFromUrl().draft);
  const [sampleId, setSampleId] = useState<string | null>(() => initialFromUrl().sampleId);
  const [paste, setPaste] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "share" | "json" | null>(null);
  const [now] = useState(() => new Date());
  const frameRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadSample = useCallback((id: string) => {
    const sample = SAMPLES.find((item) => item.id === id);
    if (!sample) return;
    setDraft(cloneDraft(sample.draft));
    setSampleId(id);
    setPaste("");
  }, []);

  const loadDefaultSample = useCallback(() => {
    loadSample(SAMPLES[0].id);
    showToast("Loaded research-to-writer.");
  }, [loadSample, showToast]);

  const slip = useMemo(() => serializeSlip(draft, now), [draft, now]);
  const exportable = canExport(slip);

  const reset = useCallback(() => {
    setDraft(cloneDraft(EMPTY_DRAFT));
    setSampleId(null);
    setPaste("");
    showToast("Cleared.");
  }, [showToast]);

  const withFrame = useCallback(async () => {
    const node = frameRef.current;
    if (!node || !exportable) throw new Error("Nothing to stamp yet.");
    node.classList.add("is-exporting");
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    try {
      return await cardToPngBlob(node);
    } finally {
      node.classList.remove("is-exporting");
    }
  }, [exportable]);

  const downloadPng = useCallback(async () => {
    if (!exportable) return;
    setBusy("png");
    try {
      const blob = await withFrame();
      downloadBlob(blob, `handoff-slip-${slugify(`${slip.from}-to-${slip.to}`)}.png`);
      showToast("PNG downloaded.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "PNG export failed.");
    } finally {
      setBusy(null);
    }
  }, [exportable, slip.from, slip.to, showToast, withFrame]);

  const copyShare = useCallback(async () => {
    if (!exportable) return;
    setBusy("share");
    try {
      await copyText(formatShareText(slip));
      showToast("Share text copied.");
    } catch {
      showToast("Could not copy share text.");
    } finally {
      setBusy(null);
    }
  }, [exportable, slip, showToast]);

  const copyJson = useCallback(async () => {
    if (!exportable) return;
    setBusy("json");
    try {
      await copyText(slipToJson(slip));
      showToast("JSON copied.");
    } catch {
      showToast("Could not copy JSON.");
    } finally {
      setBusy(null);
    }
  }, [exportable, slip, showToast]);

  const onChange = useCallback((next: HandoffDraft) => {
    setSampleId(null);
    setDraft(next);
  }, []);

  const onAdd = useCallback(
    (bucket: BulletBucket, raw: string) => {
      const next = addBullet(draft[bucket], raw);
      if (next.length === draft[bucket].length) return false;
      setSampleId(null);
      setDraft({ ...draft, [bucket]: next });
      return true;
    },
    [draft],
  );

  const onRemove = useCallback(
    (bucket: BulletBucket, raw: string) => {
      setSampleId(null);
      setDraft({ ...draft, [bucket]: removeBullet(draft[bucket], raw) });
    },
    [draft],
  );

  const onSplitPaste = useCallback(() => {
    const result = splitPaste(paste);
    if (!splitHasContent(result)) {
      showToast("Nothing to split.");
      return;
    }
    setSampleId(null);
    setDraft(applySplit(draft, result));
    const guessed = result.guessed ? ` · ${result.guessed} guessed` : "";
    showToast(`Split the note into a slip${guessed}.`);
  }, [paste, draft, showToast]);

  const live = useMemo(() => {
    if (!exportable) return "Waiting for a baton";
    return `${slip.from} → ${slip.to}`;
  }, [exportable, slip.from, slip.to]);

  const preview =
    slip.from || slip.to || slip.goal || slip.next || slip.done.length || slip.risks.length
      ? slip
      : null;

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <Header />
      <SisterStrip current="handoff-slip" payload={paste || JSON.stringify(draft)} kind="json" />
      <HandoffBanner accept={["json", "plain"]} onPaste={(text) => { setPaste(text); setSampleId(null); }} />
      <main className="layout">
        <Composer
          draft={draft}
          sampleId={sampleId}
          paste={paste}
          onChange={onChange}
          onSample={loadSample}
          onPasteChange={setPaste}
          onSplitPaste={onSplitPaste}
          onAdd={onAdd}
          onRemove={onRemove}
        />
        <section className="stage" aria-label="Handoff preview">
          <p className="sr-only" aria-live="polite">
            {live}
          </p>
          <div className="stage-scroll">
            <div ref={frameRef} className="export-frame">
              <HandoffCard slip={preview} />
            </div>
          </div>
          {exportable ? <p className="stage-stats">{formatCompactStats(slip)}</p> : null}
          <Actions
            disabled={!exportable}
            busy={busy}
            onDownload={() => void downloadPng()}
            onCopyShare={() => void copyShare()}
            onCopyJson={() => void copyJson()}
            onLoadSample={loadDefaultSample}
            onReset={reset}
          />
        </section>
      </main>
      <footer className="site-foot">
        <p>Handoff Slip · SMF Works</p>
        <p>
          Twin:{" "}
          <a href="https://github.com/smfworks/agent-contract">Agent Contract</a>
          {" — the bound · "}
          <a href="https://github.com/smfworks/agent-receipt">Agent Receipt</a>
          {" — what happened · "}
          <a href="https://github.com/smfworks/session-timeline">Session Timeline</a>
          {" — the log."}
        </p>
        <p>Intelligence is abundant. Judgment is the product.</p>
        <p>
          MIT · Built by{" "}
          <a href="https://smfworks.com" rel="noreferrer" target="_blank">
            SMF Works
          </a>
          {" · "}
          <a href="https://github.com/smfworks/handoff-slip" rel="noreferrer" target="_blank">
            GitHub
          </a>
          {" · "}
          <a href="https://x.com/MichaelGannotti" rel="noreferrer" target="_blank">
            @MichaelGannotti
          </a>
        </p>
        <p className="fineprint">
          Lab artifact for communication. Not a workflow runtime and not a
          legal instrument. A shareable baton card is not a substitute for a
          contract, a receipt, or a human.
        </p>
      </footer>
      <Toast message={toast} />
    </div>
  );
}
