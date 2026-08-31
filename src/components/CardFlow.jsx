import { useMemo, useState } from "react";
import { CARD_DECK } from "../data/cardDeck.js";
import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import { won } from "../lib/format.js";

// 카드 한 장씩. "아는 팩트"만 묻는다. learn 카드는 입력 없이 개념만.
export default function CardFlow({ startIndex = 0, state, actions, onClose }) {
  const [idx, setIdx] = useState(Math.min(startIndex, CARD_DECK.length - 1));
  const step = CARD_DECK[idx];
  const [draft, setDraft] = useState(() => initDraft(step, state));

  const remaining = CARD_DECK.length - idx - 1;
  const node = step.nodeId ? NODE_BY_ID[step.nodeId] : null;
  const area = node ? AREAS[node.area] : null;

  const go = (nextIdx) => {
    const clamped = Math.max(0, Math.min(CARD_DECK.length - 1, nextIdx));
    setIdx(clamped);
    setDraft(initDraft(CARD_DECK[clamped], state));
  };

  const commit = () => {
    if (step.type === "name") {
      actions.setUserName(draft.userName);
      if (!state.onboarded) actions.finishOnboarding();
    } else if (step.type === "learn") {
      actions.markLearned(step.nodeId);
    } else if (step.type === "fact") {
      const f = step.field;
      const val = normalize(f, draft.value);
      if (val !== undefined) actions.setFact(f.key, val);
      actions.markLearned(step.nodeId);
    }
    if (idx >= CARD_DECK.length - 1) onClose();
    else go(idx + 1);
  };

  const canProceed = useMemo(() => {
    if (step.type !== "fact") return step.type === "name" ? !!draft.userName?.trim() : true;
    if (step.field.input === "stepper") return true; // 항상 값이 있음(0 포함)
    if (step.field.optional) return true;
    return draft.value !== "" && draft.value !== undefined && draft.value !== null;
  }, [step, draft]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* progress */}
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
            {area.emoji} {area.label}
          </span>
        )}
        {step.type === "learn" && (
          <span className="pill" style={{ marginBottom: 8 }}>📖 개념 배우기</span>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0 8px" }}>{step.title}</h2>
        <p className="muted" style={{ fontSize: 13.5, color: "var(--text)" }}>{step.body}</p>
        {step.tip && <div className="tip">💡 {step.tip}</div>}

        {/* input */}
        {step.type === "name" && (
          <div className="field-row">
            <input
              type="text"
              autoFocus
              maxLength={step.field.maxLength}
              placeholder={step.field.placeholder}
              value={draft.userName}
              onChange={(e) => setDraft({ userName: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && canProceed && commit()}
            />
          </div>
        )}

        {step.type === "fact" && <FactInput field={step.field} draft={draft} setDraft={setDraft} onEnter={() => canProceed && commit()} />}

        {step.type === "fact" && step.field.optional && (
          <p className="muted" style={{ marginTop: 8 }}>모르면 비워두고 넘어가도 돼요.</p>
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

function FactInput({ field, draft, setDraft, onEnter }) {
  if (field.input === "bool") {
    return (
      <div className="bool-row">
        <button className={`btn${draft.value === true ? " on" : ""}`} onClick={() => setDraft({ value: true })}>예</button>
        <button className={`btn${draft.value === false ? " on" : ""}`} onClick={() => setDraft({ value: false })}>아니오</button>
      </div>
    );
  }

  if (field.input === "select") {
    return (
      <div className="chip-row big" style={{ marginTop: 14 }}>
        {field.options.map((opt) => (
          <button
            key={opt}
            className={`chip${draft.value === opt ? " selected" : ""}`}
            onClick={() => setDraft({ value: opt })}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (field.input === "chips") {
    const custom = !!draft.custom;
    return (
      <>
        <div className="chip-row big" style={{ marginTop: 14 }}>
          {field.options.map((opt) => (
            <button
              key={opt.label}
              className={`chip${!custom && draft.value === opt.value ? " selected" : ""}`}
              onClick={() => setDraft({ value: opt.value, custom: false })}
            >
              {opt.label}
            </button>
          ))}
          {field.allowCustom && (
            <button
              className={`chip${custom ? " selected" : ""}`}
              onClick={() => setDraft({ value: "", custom: true, customText: "" })}
            >
              직접 입력
            </button>
          )}
        </div>
        {custom && (
          <div style={{ marginTop: 10 }}>
            <div className="field-row" style={{ marginTop: 0 }}>
              <input
                type="number"
                autoFocus
                inputMode="decimal"
                step={field.step || 1}
                placeholder={field.placeholder}
                value={draft.customText ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = parseFloat(raw);
                  setDraft({
                    custom: true,
                    customText: raw,
                    value: raw === "" || Number.isNaN(n) ? "" : Math.round(n * (field.scale || 1)),
                  });
                }}
                onKeyDown={(e) => e.key === "Enter" && onEnter()}
              />
              {field.unit && <span className="unit">{field.unit}</span>}
            </div>
            {typeof draft.value === "number" && draft.value > 0 && (
              <p className="muted" style={{ marginTop: 6 }}>= {won(draft.value)}</p>
            )}
          </div>
        )}
      </>
    );
  }

  if (field.input === "stepper") {
    const cur = Number(draft.value) || 0;
    const min = field.min ?? 0;
    const max = field.max ?? 999;
    const step = field.step || 1;
    return (
      <div className="stepper">
        <button className="stepper-btn" onClick={() => setDraft({ value: Math.max(min, cur - step) })} disabled={cur <= min}>
          −
        </button>
        <div className="stepper-val">
          <span className="stepper-num">{cur}</span>
          <span className="stepper-unit">{field.unit}</span>
        </div>
        <button className="stepper-btn" onClick={() => setDraft({ value: Math.min(max, cur + step) })} disabled={cur >= max}>
          +
        </button>
      </div>
    );
  }

  // number (fallback)
  return (
    <div className="field-row">
      <input
        type="number"
        autoFocus
        inputMode="decimal"
        step={field.step || 1}
        placeholder={field.placeholder}
        value={draft.value}
        onChange={(e) => setDraft({ value: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
      />
      {field.unit && <span className="unit">{field.unit}</span>}
    </div>
  );
}

function initDraft(step, state) {
  if (step.type === "name") return { userName: state.userName || "" };
  if (step.type !== "fact") return {};
  const f = step.field;
  const cur = state.facts[f.key];
  const scale = f.scale || 1;

  if (f.input === "stepper") {
    const v = cur !== undefined ? Math.round(cur / scale) : f.default ?? f.min ?? 0;
    return { value: v };
  }
  if (f.input === "chips") {
    if (cur === undefined) return { value: "", custom: false };
    if (f.options.some((o) => o.value === cur)) return { value: cur, custom: false };
    return { value: cur, custom: true, customText: String(cur / scale) };
  }
  if (f.input === "bool") return { value: cur };
  if (f.input === "number") return { value: cur === undefined ? "" : String(cur / scale) };
  return { value: cur === undefined ? "" : cur }; // select / text
}

function normalize(field, raw) {
  if (field.input === "bool") return typeof raw === "boolean" ? raw : undefined;
  if (field.input === "select" || field.input === "text") return raw || undefined;
  if (field.input === "chips") {
    if (raw === "" || raw === undefined || raw === null) return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : Math.round(n); // 이미 기준 단위(원)
  }
  // stepper / number: raw 는 표시 단위 → 기준 단위로 환산
  if (raw === "" || raw === undefined || raw === null) return undefined;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return undefined;
  return Math.round(n * (field.scale || 1));
}
