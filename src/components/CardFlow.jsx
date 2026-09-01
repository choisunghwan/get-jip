import { useMemo, useState } from "react";
import { CARD_DECK } from "../data/cardDeck.js";
import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import FactField from "./FactField.jsx";
import Icon from "./Icon.jsx";

// 선택형 가이드. "차근차근 배우며 채우기". 기본 경로는 QuickStart + 노드 탭.
export default function CardFlow({ startIndex = 0, state, actions, onClose }) {
  const [idx, setIdx] = useState(Math.min(Math.max(0, startIndex), CARD_DECK.length - 1));
  const step = CARD_DECK[idx];
  const [value, setValue] = useState(() => initValue(step, state));

  const remaining = CARD_DECK.length - idx - 1;
  const node = step.nodeId ? NODE_BY_ID[step.nodeId] : null;
  const area = node ? AREAS[node.area] : null;

  const go = (nextIdx) => {
    const c = Math.max(0, Math.min(CARD_DECK.length - 1, nextIdx));
    setIdx(c);
    setValue(initValue(CARD_DECK[c], state));
  };

  const commit = () => {
    if (step.type === "name") {
      actions.setUserName(value || state.userName);
      if (!state.onboarded) actions.finishOnboarding();
    } else if (step.type === "learn") {
      actions.markLearned(step.nodeId);
    } else if (step.type === "fact") {
      const f = step.field;
      let v = value;
      if (v == null && f.input === "stepper") {
        v = Math.round((f.default ?? f.min ?? 0) * (f.scale || 1));
      }
      if (v != null) actions.setFact(f.key, v);
      actions.markLearned(step.nodeId);
    }
    if (idx >= CARD_DECK.length - 1) onClose();
    else go(idx + 1);
  };

  const canProceed = useMemo(() => {
    if (step.type === "name") return !!String(value || "").trim();
    if (step.type !== "fact") return true;
    if (step.field.input === "stepper" || step.field.optional) return true;
    return value != null;
  }, [step, value]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <span style={{ width: `${((idx + 1) / CARD_DECK.length) * 100}%`, background: "var(--glow)" }} />
          </div>
          <span className="muted" style={{ whiteSpace: "nowrap" }}>
            {remaining > 0 ? `${remaining}장 남음` : "마지막"}
          </span>
          <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 18 }} onClick={onClose}>×</button>
        </div>

        {area && (
          <span className="pill" style={{ color: area.color, borderColor: area.color, marginBottom: 8 }}>
            <span className="areadot" style={{ background: area.color }} /> {area.label}
          </span>
        )}
        {step.type === "learn" && (
          <span className="pill" style={{ marginBottom: 8 }}><Icon name="book" size={12} /> 개념 배우기</span>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0 8px" }}>{step.title}</h2>
        <p className="muted" style={{ fontSize: 13.5, color: "var(--text)" }}>{step.body}</p>
        {step.tip && <div className="tip"><Icon name="bulb" size={13} /> {step.tip}</div>}

        {step.type === "name" && (
          <div className="field-row">
            <input
              type="text"
              autoFocus
              maxLength={step.field.maxLength}
              placeholder={step.field.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canProceed && commit()}
            />
          </div>
        )}

        {step.type === "fact" && (
          <FactField field={step.field} value={value} onChange={(v) => setValue(v)} />
        )}
        {step.type === "fact" && step.field.optional && (
          <p className="muted" style={{ marginTop: 8 }}>모르면 그냥 넘어가도 돼요.</p>
        )}

        <div className="btn-row">
          {idx > 0 && (
            <button className="btn ghost" style={{ flex: "0 0 auto" }} onClick={() => go(idx - 1)}>
              이전
            </button>
          )}
          <button className="btn primary" disabled={!canProceed} onClick={commit}>
            {idx >= CARD_DECK.length - 1 ? "완료" : step.type === "learn" ? "배웠어요" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

function initValue(step, state) {
  if (step.type === "name") return state.userName || "";
  if (step.type !== "fact") return null;
  return state.facts[step.field.key] ?? null;
}
