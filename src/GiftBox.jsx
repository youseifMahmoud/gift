// The wrapped gift. `stage` is 'closed' | 'shaking' | 'opening'.
export default function GiftBox({ stage, onOpen, label }) {
  const busy = stage !== 'closed';
  return (
    <div className={`gift-wrap stage-${stage}`}>
      <div className="glow" aria-hidden="true" />
      <div className="rays" aria-hidden="true" />
      <button className="gift-btn" onClick={onOpen} disabled={busy} aria-label={label}>
        <span className="gift" aria-hidden="true">
          <span className="gift-body">
            <span className="rib rib-v" />
            <span className="shine" />
          </span>
          <span className="gift-lid">
            <span className="rib rib-v" />
            <span className="bow l" />
            <span className="bow r" />
            <span className="knot" />
          </span>
          <span className="spark a" />
          <span className="spark b" />
          <span className="spark c" />
          <span className="spark d" />
        </span>
      </button>
    </div>
  );
}
