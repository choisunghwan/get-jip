import { buildReportModel } from "../lib/reportModel.js";
import { downloadSessionHtml } from "../lib/sessionFile.js";
import Icon from "./Icon.jsx";

// 전체 진행을 하나의 리포트로 — 화면에서 읽고, 파일로 받기.
export default function ReportView({ state, onClose }) {
  const m = buildReportModel(state);

  return (
    <div className="report-overlay">
      <div className="report-top">
        <span className="report-title">
          <Icon name="scroll" size={15} /> {m.hon}의 집짓기 리포트
        </span>
        <button className="btn ghost" style={{ padding: "4px 10px", fontSize: 18 }} onClick={onClose}>×</button>
      </div>

      <div className="report-body">
        <p className="muted" style={{ margin: 0 }}>
          {m.stamp} 기준 · LV {m.level.lv} {m.level.title} · 집 짓기 {m.doneCount}/7
        </p>

        <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => downloadSessionHtml(state)}>
          <Icon name="scroll" size={13} /> 이 리포트 파일로 받기 (HTML)
        </button>
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          받은 파일은 더블클릭하면 그대로 읽을 수 있고, 나중에 첫 화면에 올리면 여기서 이어서 할 수 있어요.
        </p>

        <h2 className="report-h2">지금 상황 한눈에</h2>
        <div className="report-kv">
          {m.summary.map((r) => (
            <div key={r.k} className={`report-row${r.strong ? " strong" : ""}`}>
              <span>{r.k}</span>
              <b>{r.v}</b>
            </div>
          ))}
        </div>

        <h2 className="report-h2">단계별 정리</h2>
        {m.steps.map((s) => {
          const tag = s.done ? "완료" : m.currentStep?.id === s.id ? "지금 할 단계" : "아직";
          return (
            <div key={s.id} className="report-step" style={{ "--c": s.color }}>
              <div className="rs-num" style={{ background: s.color }}>{s.num}</div>
              <div style={{ flex: 1 }}>
                <div className="rs-title-row">
                  <span className="rs-t">{s.title}</span>
                  <span className="rs-tag">{tag}</span>
                </div>
                {s.verdict ? (
                  <>
                    <p className="rs-v">{s.verdict}</p>
                    {s.rows.length > 0 && (
                      <div className="report-kv sub">
                        {s.rows.map((r, i) => (
                          <div key={i} className="report-row">
                            <span>{r.k}</span>
                            <b>{r.v}</b>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="muted" style={{ margin: "2px 0 0" }}>{s.blurb}</p>
                )}
              </div>
            </div>
          );
        })}

        {m.nextTodos.length > 0 && (
          <>
            <h2 className="report-h2">다음에 실제로 할 일 · {m.currentStep.title}</h2>
            <ul className="report-list">
              {m.nextTodos.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        )}

        <h2 className="report-h2">입력한 값 ({m.facts.length})</h2>
        {m.facts.length ? (
          <div className="report-kv">
            {m.facts.map((r) => (
              <div key={r.k} className="report-row"><span>{r.k}</span><b>{r.v}</b></div>
            ))}
          </div>
        ) : <p className="muted">아직 없음</p>}

        <h2 className="report-h2">배운 개념 ({m.learned.length})</h2>
        {m.learned.length ? (
          <ul className="report-list">
            {m.learned.map((x, i) => <li key={i}>{x.area} · {x.label}</li>)}
          </ul>
        ) : <p className="muted">아직 없음</p>}

        <p className="muted" style={{ fontSize: 11, marginTop: 20, lineHeight: 1.6 }}>
          계산·규칙 수치는 근사치입니다. 최종 확정은 은행 사전심사·공인중개사·법무사와 확인하세요.
        </p>
      </div>
    </div>
  );
}
