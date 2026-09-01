import { useState } from "react";
import Icon from "./Icon.jsx";

// 규칙셋 전환 = 재계산 트리거. busang.gu 카드뉴스 스타일 note 노출.
export default function RuleSetSwitcher({ ruleSets, current, onSwitch, deltas, onDismiss }) {
  const [showNote, setShowNote] = useState(true);
  const active = ruleSets.find((r) => r.version === current);
  const changedCount = Object.keys(deltas).length;

  return (
    <div className="panel-box" style={{ borderColor: active?.regulatedAreas.length ? "var(--warn)" : "var(--line)" }}>
      <p className="panel-title"><Icon name="news" size={12} /> 규제 규칙셋 — 바꾸면 내 값 전체가 다시 계산돼요</p>
      <div className="btn-row" style={{ marginTop: 0 }}>
        {ruleSets.map((r) => {
          const on = r.version === current;
          const warn = r.regulatedAreas.length > 0;
          return (
            <button
              key={r.version}
              className={`btn${on ? " primary" : ""}`}
              style={
                on && warn
                  ? { background: "rgba(255,140,105,0.14)", borderColor: "var(--warn)", color: "var(--warn)" }
                  : undefined
              }
              onClick={() => {
                onSwitch(r.version);
                setShowNote(true);
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {changedCount > 0 && (
        <p className="muted" style={{ marginTop: 10, color: "var(--accent)" }}>
          ▶ 재계산됨 — {changedCount}개 노드 값이 바뀌었어요. 그래프에서 흔들리는 노드를 확인하세요.{" "}
          <button className="btn ghost" style={{ padding: 0, color: "var(--dim)", fontSize: 12 }} onClick={onDismiss}>
            배지 지우기
          </button>
        </p>
      )}

      {active?.note && showNote && (
        <div
          className={active.regulatedAreas.length ? "warn-box" : "tip"}
          style={{ marginTop: 12, position: "relative" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <b><Icon name="news" size={13} /> {active.label}</b>
            <button
              className="btn ghost"
              style={{ padding: 0, fontSize: 15, color: "var(--dim)" }}
              onClick={() => setShowNote(false)}
            >
              ×
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.6 }}>{active.note}</p>
          <p className="muted" style={{ marginTop: 6, fontSize: 11 }}>
            적용 시작 {active.effectiveFrom} · 참고용 근사치입니다.
          </p>
        </div>
      )}
    </div>
  );
}
