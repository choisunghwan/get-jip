import { useState } from "react";
import { NODES, AREAS } from "../data/nodes.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue, eok } from "../lib/format.js";

// 그래프 대신 쓰는 차분한 목록 뷰. 상단 요약 + 영역별 접이식 리스트.
export default function ListView({ state, pipeline, statuses, onSelect }) {
  const areaKeys = Object.keys(AREAS);
  const [open, setOpen] = useState(() => new Set(areaKeys));
  const toggle = (k) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  const p = pipeline;
  const summary = [
    { k: "목표 집값", v: state.facts.targetPrice != null ? eok(state.facts.targetPrice) : "?" },
    { k: "빌릴 수 있는 돈", v: p.loanLimit != null ? eok(p.loanLimit) : "계산 전" },
    { k: "지금 필요한 현금", v: p.requiredCash != null ? eok(p.requiredCash) : "계산 전" },
    {
      k: "더 모아야",
      v: p.savingGap == null ? "?" : p.savingGap > 0 ? eok(p.savingGap) : "충분",
      good: p.savingGap != null && p.savingGap <= 0,
    },
  ];

  return (
    <div className="lst has-tabbar">
      <div className="lst-head">
        <span className="lst-head-title">전체 항목</span>
      </div>

      <div className="lst-body">
        <div className="lst-summary">
          {summary.map((s) => (
            <div className="lst-sum-item" key={s.k}>
              <span>{s.k}</span>
              <b className={s.good ? "good" : undefined}>{s.v}</b>
            </div>
          ))}
        </div>

        {areaKeys.map((ak) => {
          const area = AREAS[ak];
          const nodes = NODES.filter((n) => n.area === ak);
          const done = nodes.filter((n) => statuses[n.id] === "hasValue").length;
          const isOpen = open.has(ak);
          return (
            <section className="lst-section" key={ak}>
              <button className="lst-sec-head" onClick={() => toggle(ak)}>
                <span className="lst-sec-name" style={{ color: area.color }}>
                  <span className="areadot" style={{ background: area.color }} /> {area.label}
                </span>
                <span className="lst-sec-count">{done}/{nodes.length}</span>
                <span className="lst-sec-caret">{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen && (
                <div className="lst-rows">
                  {nodes.map((n) => {
                    const st = statuses[n.id];
                    const val = n.value ? resolveNodeValue(n, state.facts, pipeline) : undefined;
                    const shown =
                      val != null && val !== ""
                        ? n.value.kind === "won"
                          ? eok(val)
                          : formatValue(n.value.kind, val)
                        : null;
                    return (
                      <button className="lst-row" key={n.id} onClick={() => onSelect(n.id)}>
                        <span className={`lst-dot lst-${st}`} style={st !== "unlearned" ? { background: area.color, borderColor: area.color } : undefined} />
                        <span className="lst-label">{n.label}</span>
                        {shown ? (
                          <span className="lst-val">{shown}</span>
                        ) : n.value ? (
                          <span className="lst-missing">미입력</span>
                        ) : (
                          <span className="lst-missing">개념</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
