import { motion } from "framer-motion";
import { JOURNEY, JOURNEY_BY_ID } from "../data/journey.js";
import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import { FIELD_BY_NODE } from "../data/cardDeck.js";
import { InlineFactField } from "./FactField.jsx";
import Icon from "./Icon.jsx";

export default function StepPanel({ stepId, state, statuses, stepProg, actions, onSelectNode }) {
  const step = JOURNEY_BY_ID[stepId];
  if (!step) return null;
  const idx = JOURNEY.findIndex((s) => s.id === stepId);
  const p = stepProg[stepId] || {};
  const todos = state.stepTodos[stepId] || {};

  const factNodeIds = step.nodeIds.filter((id) => FIELD_BY_NODE[id]);
  const conceptNodeIds = step.nodeIds.filter((id) => !FIELD_BY_NODE[id]);

  return (
    <motion.div
      className="panel-box"
      key={stepId}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      <span className="pill">STEP {step.num} / 7</span>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: "10px 0 4px" }}>{step.title}</h2>
      <p className="muted" style={{ fontSize: 13, color: "var(--text)" }}>{step.blurb}</p>

      {factNodeIds.length > 0 && (
        <>
          <p className="panel-title" style={{ margin: "16px 0 0" }}>
            이 단계 입력 <span style={{ color: "var(--dim)" }}>· {p.filled}/{p.factTotal}</span>
          </p>
          {factNodeIds.map((id) => {
            const node = NODE_BY_ID[id];
            const field = FIELD_BY_NODE[id];
            const done = statuses[id] === "hasValue";
            return (
              <div key={id} style={{ marginTop: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                  <span>{node.label}</span>
                  {done && <Icon name="check" size={13} strokeWidth={3} style={{ color: AREAS[node.area].color }} />}
                </label>
                <InlineFactField
                  field={field}
                  value={state.facts[field.key]}
                  onCommit={(v) => actions.setFact(field.key, v)}
                />
              </div>
            );
          })}
        </>
      )}

      {conceptNodeIds.length > 0 && (
        <>
          <p className="panel-title" style={{ margin: "16px 0 6px" }}>배울 개념 · 계산 결과</p>
          <div className="chip-row">
            {conceptNodeIds.map((id) => {
              const node = NODE_BY_ID[id];
              const a = AREAS[node.area];
              const st = statuses[id];
              return (
                <button
                  key={id}
                  className={`chip area chip-${st}`}
                  style={{ "--c": a.color }}
                  onClick={() => onSelectNode(id)}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="panel-title" style={{ margin: "18px 0 6px" }}>앱 밖에서 할 일</p>
      {step.todo.map((t, i) => (
        <button
          key={i}
          className="todo-row"
          onClick={() => actions.toggleStepTodo(stepId, i)}
        >
          <span className={`todo-box${todos[i] ? " on" : ""}`}>{todos[i] && <Icon name="check" size={11} strokeWidth={3} />}</span>
          <span style={{ textDecoration: todos[i] ? "line-through" : "none", opacity: todos[i] ? 0.6 : 1 }}>{t}</span>
        </button>
      ))}

      <button
        className={`btn ${p.done ? "" : "primary"}`}
        style={{ width: "100%", marginTop: 14 }}
        onClick={() => actions.toggleStepDone(stepId)}
      >
        {p.done ? "완료 취소" : "이 단계 완료 — 집 짓기"}
      </button>
      {!p.done && p.factTotal > 0 && !p.inputsReady && (
        <p className="muted" style={{ marginTop: 6 }}>입력칸을 다 채우면 이 단계를 완료할 수 있어요.</p>
      )}

      <div className="btn-row">
        {idx > 0 && (
          <button className="btn ghost" onClick={() => actions.setCurrentStep(JOURNEY[idx - 1].id)}>← 이전 단계</button>
        )}
        {idx < JOURNEY.length - 1 && (
          <button className="btn ghost" onClick={() => actions.setCurrentStep(JOURNEY[idx + 1].id)}>다음 단계 →</button>
        )}
      </div>
    </motion.div>
  );
}
