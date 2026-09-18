interface ActionsProps {
  disabled: boolean;
  busy: "png" | "share" | "json" | null;
  onDownload: () => void;
  onCopyShare: () => void;
  onCopyJson: () => void;
  onLoadSample: () => void;
  onReset: () => void;
}

export function Actions({
  disabled,
  busy,
  onDownload,
  onCopyShare,
  onCopyJson,
  onLoadSample,
  onReset,
}: ActionsProps) {
  return (
    <div className="actions">
      <button
        type="button"
        className="btn btn-go"
        disabled={disabled || busy !== null}
        onClick={onDownload}
      >
        {busy === "png" ? "Printing…" : "Download PNG"}
      </button>
      <button
        type="button"
        className="btn"
        disabled={disabled || busy !== null}
        onClick={onCopyShare}
      >
        {busy === "share" ? "Copying…" : "Copy share text"}
      </button>
      <button
        type="button"
        className="btn"
        disabled={disabled || busy !== null}
        onClick={onCopyJson}
      >
        {busy === "json" ? "Copying…" : "Copy JSON"}
      </button>
      <button type="button" className="btn" onClick={onLoadSample}>
        Load sample
      </button>
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
