import { useState } from "react";
import { won } from "../lib/format.js";

// 공용 입력 위젯. cardDeck 의 field 스펙 하나를 받아 렌더.
// onChange(nextValue, decisive)
//   decisive=true  → 결정적 선택(예/아니오, 지역, 프리셋 칩). 바로 커밋해도 되는 신호.
//   decisive=false → 다이얼 중(스테퍼, 직접 입력). '저장'으로 확정하는 게 자연스러움.
// value 는 항상 기준 단위(원 / 개월 / 명). 비었으면 undefined.
export default function FactField({ field, value, onChange }) {
  const scale = field.scale || 1;
  const matchesChip =
    field.input === "chips" && value != null && field.options.some((o) => o.value === value);
  const [customOpen, setCustomOpen] = useState(
    field.input === "chips" && value != null && !matchesChip
  );

  if (field.input === "bool") {
    return (
      <div className="bool-row">
        <button className={`btn${value === true ? " on" : ""}`} onClick={() => onChange(true, true)}>예</button>
        <button className={`btn${value === false ? " on" : ""}`} onClick={() => onChange(false, true)}>아니오</button>
      </div>
    );
  }

  if (field.input === "select") {
    return (
      <div className="chip-row big" style={{ marginTop: 12 }}>
        {field.options.map((opt) => (
          <button
            key={opt}
            className={`chip${value === opt ? " selected" : ""}`}
            onClick={() => onChange(opt, true)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (field.input === "chips") {
    return (
      <>
        <div className="chip-row big" style={{ marginTop: 12 }}>
          {field.options.map((opt) => (
            <button
              key={opt.label}
              className={`chip${!customOpen && value === opt.value ? " selected" : ""}`}
              onClick={() => {
                setCustomOpen(false);
                onChange(opt.value, true);
              }}
            >
              {opt.label}
            </button>
          ))}
          {field.allowCustom && (
            <button
              className={`chip${customOpen ? " selected" : ""}`}
              onClick={() => setCustomOpen(true)}
            >
              직접 입력
            </button>
          )}
        </div>
        {customOpen && (
          <div style={{ marginTop: 10 }}>
            <div className="field-row" style={{ marginTop: 0 }}>
              <input
                type="number"
                autoFocus
                inputMode="decimal"
                step={field.step || 1}
                placeholder={field.placeholder}
                defaultValue={value != null && !matchesChip ? value / scale : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = parseFloat(raw);
                  onChange(raw === "" || Number.isNaN(n) ? undefined : Math.round(n * scale), false);
                }}
              />
              {field.unit && <span className="unit">{field.unit}</span>}
            </div>
            {typeof value === "number" && value > 0 && (
              <p className="muted" style={{ marginTop: 6 }}>= {won(value)}</p>
            )}
          </div>
        )}
      </>
    );
  }

  if (field.input === "stepper") {
    const min = field.min ?? 0;
    const max = field.max ?? 999;
    const stepN = field.step || 1;
    const unset = value == null;
    const disp = unset ? field.default ?? min : Math.round(value / scale);
    const emit = (d) => onChange(Math.round(Math.min(max, Math.max(min, d)) * scale), false);
    return (
      <div className="stepper">
        <button
          className="stepper-btn"
          onClick={() => emit(unset ? field.default ?? min : disp - stepN)}
          disabled={!unset && disp <= min}
        >
          −
        </button>
        <div className="stepper-val">
          <span className="stepper-num" style={unset ? { opacity: 0.4 } : undefined}>{disp}</span>
          <span className="stepper-unit">{field.unit}</span>
        </div>
        <button
          className="stepper-btn"
          onClick={() => emit(unset ? field.default ?? min : disp + stepN)}
          disabled={!unset && disp >= max}
        >
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
        inputMode="decimal"
        step={field.step || 1}
        placeholder={field.placeholder}
        defaultValue={value != null ? value / scale : ""}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(e.target.value === "" || Number.isNaN(n) ? undefined : Math.round(n * scale), false);
        }}
      />
      {field.unit && <span className="unit">{field.unit}</span>}
    </div>
  );
}
