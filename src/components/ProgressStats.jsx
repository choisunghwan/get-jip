import { NODES, AREAS } from "../data/nodes.js";

export default function ProgressStats({ progress, statuses, pipeline, onOpenCard }) {
  const byArea = Object.values(AREAS).map((a) => {
    const ns = NODES.filter((n) => n.area === a.key);
    const done = ns.filter((n) => statuses[n.id] === "hasValue").length;
    const learned = ns.filter((n) => statuses[n.id] !== "unlearned").length;
    return { ...a, total: ns.length, done, learned };
  });

  return (
    <div className="panel-box">
      <p className="panel-title">완성도</p>
      <div className="progress-track">
        <span style={{ width: `${progress.pct.hasValue}%`, background: "var(--glow)" }} />
        <span style={{ width: `${progress.pct.learned}%`, background: "rgba(18,128,95,0.3)" }} />
        <span style={{ width: `${progress.pct.unlearned}%`, background: "var(--locked)" }} />
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        미학습 {progress.pct.unlearned}% · 배움 {progress.pct.learned}% · 내값있음 {progress.pct.hasValue}%
        <span style={{ color: "var(--dim)" }}> ({progress.hasValue}/{progress.total})</span>
      </p>

      <div style={{ marginTop: 12 }}>
        {byArea.map((a) => (
          <div className="kv" key={a.key}>
            <span className="k"><span className="areadot" style={{ background: a.color }} /> {a.label}</span>
            <span className="v" style={{ color: a.color }}>
              {a.done}/{a.total} <span style={{ color: "var(--dim)", fontWeight: 400 }}>내값 · 배움 {a.learned}</span>
            </span>
          </div>
        ))}
      </div>

      {pipeline.savingGap != null && (
        <div className="tip" style={{ marginTop: 12 }}>
          지금 조건이면 <b>{fmtEok(pipeline.savingGap)}</b>
          {pipeline.savingGap > 0 ? " 더 모아야 하고, " : " 여유가 있고, "}
          {pipeline.monthsToClose != null && pipeline.monthsToClose > 0
            ? `이 저축 속도로 약 ${Math.floor(pipeline.monthsToClose / 12)}년 ${pipeline.monthsToClose % 12}개월 걸려요.`
            : "지금 바로 도전할 수 있어요."}
        </div>
      )}

      <div className="btn-row">
        <button className="btn" onClick={() => onOpenCard(0)}>차근차근 배우며 채우기</button>
      </div>
    </div>
  );
}

function fmtEok(n) {
  const abs = Math.abs(n);
  return `${(abs / 1e8).toFixed(2)}억원`;
}
