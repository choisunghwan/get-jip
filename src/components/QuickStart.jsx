import { useState } from "react";
import { QUICK_START } from "../data/cardDeck.js";
import FactField from "./FactField.jsx";
import SessionFile from "./SessionFile.jsx";

// 첫 화면. 3개만 묻고 바로 그래프로. 나머지는 노드를 눌러 채운다.
export default function QuickStart({ state, actions }) {
  const [draft, setDraft] = useState(() => {
    const d = {};
    for (const q of QUICK_START) d[q.field.key] = state.facts[q.field.key];
    return d;
  });
  const [name, setName] = useState(state.userName || "");

  const ready = name.trim() && QUICK_START.every((q) => draft[q.field.key] != null);

  const start = ({ skip } = {}) => {
    actions.setUserName(name);
    if (!skip) {
      for (const q of QUICK_START) {
        const v = draft[q.field.key];
        if (v != null) {
          actions.setFact(q.field.key, v);
          actions.markLearned(q.nodeId);
        }
      }
    }
    actions.finishOnboarding();
  };

  return (
    <div className="modal-backdrop" style={{ alignItems: "center" }}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 4px" }}>
          {name.trim() ? `${name.trim()}의 집짓기` : "집짓기"}
        </h1>
        <p className="muted" style={{ marginBottom: 4 }}>
          3개만 답하면 바로 내 대출 한도·필요 현금이 계산돼요. 나머지는 그래프에서 노드를 눌러 채우면 됩니다.
        </p>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 13.5, fontWeight: 700 }}>이름</label>
          <div className="field-row" style={{ marginTop: 6 }}>
            <input
              type="text"
              autoFocus
              maxLength={12}
              placeholder="예: 성환"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {QUICK_START.map((q) => (
          <div key={q.nodeId} style={{ marginTop: 18 }}>
            <label style={{ fontSize: 13.5, fontWeight: 700 }}>{q.title}</label>
            <FactField
              field={q.field}
              value={draft[q.field.key]}
              onChange={(v) => setDraft((d) => ({ ...d, [q.field.key]: v }))}
            />
          </div>
        ))}

        <div className="btn-row">
          <button className="btn primary" disabled={!ready} onClick={() => start()}>
            시작하기
          </button>
        </div>
        <button
          className="btn ghost"
          style={{ width: "100%", marginTop: 8, color: "var(--dim)", fontSize: 13 }}
          onClick={() => start({ skip: true })}
        >
          그냥 둘러보기
        </button>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <p className="muted" style={{ margin: "0 0 6px" }}>이미 하던 게 있어요?</p>
          <SessionFile state={state} onLoad={actions.replaceState} mode="load" compact />
        </div>

        <p className="muted" style={{ marginTop: 12, fontSize: 11.5, lineHeight: 1.6 }}>
          입력한 값은 로그인·계정 없이 이 브라우저와 익명 저장소에만 쓰여요. 개인정보 수집·제3자 공유 없음.
          서버에 아예 안 남기고 싶으면, 진행하다 '진행 파일 저장'으로 내 파일로만 보관하면 됩니다.
        </p>
      </div>
    </div>
  );
}
