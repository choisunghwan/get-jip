import { useState } from "react";
import { WRITING_PRACTICE } from "../data/writingPractice.js";
import Icon from "./Icon.jsx";

// 작성 연습 — 핵심 필드만 뽑은 미니 양식. 저장값은 연습 기록일 뿐.
export default function WritingPractice({ practiceId, state, actions, onClose }) {
  const spec = WRITING_PRACTICE[practiceId];
  const saved = state.practice[spec.nodeId] || {};
  const [vals, setVals] = useState(() => ({ ...saved }));

  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const save = () => {
    for (const f of spec.fields) {
      if (vals[f.key] !== undefined && vals[f.key] !== "") {
        actions.setPractice(spec.nodeId, f.key, vals[f.key]);
      }
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span className="pill"><Icon name="pencil" size={12} /> 작성 연습</span>
          <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 18 }} onClick={onClose}>×</button>
        </div>

        <div className="practice-note">
          이건 <b>연습장</b>입니다. 실제 계약은 공인중개사·법무사와 원본 서식으로 진행하세요.
          여기 적은 값은 내 그래프에 연습 기록으로만 남습니다.
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>{spec.title}</h2>
        <p className="muted" style={{ fontSize: 13, color: "var(--text)" }}>{spec.intro}</p>

        <div style={{ marginTop: 8 }}>
          {spec.fields.map((f) => (
            <div key={f.key} style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 700 }}>
                {f.label}
                {f.optional && <span className="muted"> (선택)</span>}
              </label>
              <p className="why"><Icon name="eye" size={12} /> {f.why}</p>
              {f.input === "bool" ? (
                <div className="bool-row">
                  <button className={`btn${vals[f.key] === true ? " on" : ""}`} onClick={() => set(f.key, true)}>예 / 있음</button>
                  <button className={`btn${vals[f.key] === false ? " on" : ""}`} onClick={() => set(f.key, false)}>아니오 / 없음</button>
                </div>
              ) : f.input === "number" ? (
                <div className="field-row">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={vals[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                  {f.unit && <span className="unit">{f.unit}</span>}
                </div>
              ) : (
                <div className="field-row">
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={vals[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="btn-row">
          <button className="btn ghost" style={{ flex: "0 0 auto" }} onClick={onClose}>닫기</button>
          <button className="btn primary" onClick={save}>연습 기록 저장</button>
        </div>
      </div>
    </div>
  );
}
