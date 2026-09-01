import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { JOURNEY, JOURNEY_BY_ID } from "../data/journey.js";
import { NODE_BY_ID } from "../data/nodes.js";
import { FIELD_BY_NODE } from "../data/cardDeck.js";
import { STEP_GUIDE, HOUSE_PART_KO } from "../data/narration.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue, eok } from "../lib/format.js";
import { InlineFactField } from "./FactField.jsx";
import HouseProgress from "./HouseProgress.jsx";
import StepRail from "./StepRail.jsx";

// 초보자 기본 화면. 한 번에 하나씩: 쉬운 설명 → (있으면) 입력 → 결과 문장.
export default function GuideMode({ state, pipeline, statuses, stepProgress, actions, onOpenMap, onOpenPractice }) {
  const stepId = state.currentStep;
  const step = JOURNEY_BY_ID[stepId];
  const stepIdx = JOURNEY.findIndex((s) => s.id === stepId);
  const guide = STEP_GUIDE[stepId];

  const conceptIds = useMemo(() => {
    const facts = step.nodeIds.filter((id) => FIELD_BY_NODE[id]);
    const rest = step.nodeIds.filter((id) => !FIELD_BY_NODE[id]);
    return [...facts, ...rest];
  }, [step]);

  const screens = useMemo(
    () => ["intro", ...conceptIds.map((id) => `c:${id}`), "summary"],
    [conceptIds]
  );

  const [si, setSi] = useState(0);
  const [dir, setDir] = useState(1);
  const clamp = (i) => Math.max(0, Math.min(screens.length - 1, i));

  const f = state.facts;
  const doneCount = JOURNEY.filter((s) => stepProgress[s.id]?.done).length;

  const goNext = () => {
    if (si < screens.length - 1) {
      setDir(1);
      setSi(si + 1);
      return;
    }
    // summary 에서 다음 → 이 단계 완료 + 다음 단계로
    if (!stepProgress[stepId]?.done) actions.toggleStepDone(stepId);
    const next = JOURNEY[stepIdx + 1];
    if (next) {
      setDir(1);
      setSi(0);
      actions.setCurrentStep(next.id);
    }
  };
  const goPrev = () => {
    if (si > 0) {
      setDir(-1);
      setSi(si - 1);
      return;
    }
    const prev = JOURNEY[stepIdx - 1];
    if (prev) {
      setDir(-1);
      setSi(0);
      actions.setCurrentStep(prev.id);
    }
  };
  const jumpStep = (id) => {
    setDir(1);
    setSi(0);
    actions.setCurrentStep(id);
  };

  const screen = screens[si];
  const conceptNo = screen.startsWith("c:") ? si : null;

  return (
    <div className="guide">
      {/* 요약 바 */}
      <div className="guide-summary">
        <div className="gs-item"><span>목표</span><b>{f.targetPrice != null ? eok(f.targetPrice) : "?"}</b></div>
        <div className="gs-item"><span>내 돈</span><b>{f.seedSavings != null ? eok(f.seedSavings) : "?"}</b></div>
        <div className="gs-item"><span>빌릴 수 있음</span><b>{pipeline.loanLimit != null ? eok(pipeline.loanLimit) : "계산 전"}</b></div>
        <div className="gs-item">
          <span>더 필요</span>
          <b>{pipeline.savingGap == null ? "?" : pipeline.savingGap > 0 ? eok(pipeline.savingGap) : "충분"}</b>
        </div>
        <div className="gs-item gs-house"><span>집</span><b>{doneCount}/7</b></div>
      </div>

      <StepRail current={stepId} stepProgress={stepProgress} onSelect={jumpStep} />

      <div className="guide-body">
          <motion.div
            key={`${stepId}:${si}`}
            initial={{ opacity: 0, x: dir * 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="guide-card"
          >
            {screen === "intro" && (
              <>
                <span className="pill">STEP {step.num} / 7</span>
                <h1 className="guide-h1">{step.title}</h1>
                <p className="guide-lead">{guide.intro}</p>
              </>
            )}

            {conceptNo != null && (
              <ConceptScreen
                nodeId={screen.slice(2)}
                idxLabel={`개념 ${conceptNo}/${conceptIds.length}`}
                name={state.userName}
                state={state}
                pipeline={pipeline}
                actions={actions}
                onOpenPractice={onOpenPractice}
              />
            )}

            {screen === "summary" && (
              <SummaryScreen
                step={step}
                stepIdx={stepIdx}
                guide={guide}
                name={state.userName}
                state={state}
                pipeline={pipeline}
                stepProgress={stepProgress}
                actions={actions}
              />
            )}
          </motion.div>
      </div>

      <div className="guide-nav">
        <button className="btn ghost" onClick={goPrev} disabled={si === 0 && stepIdx === 0}>
          ← 이전
        </button>
        <div className="guide-dots">
          {screens.map((s, i) => (
            <span key={i} className={`gdot${i === si ? " on" : ""}`} />
          ))}
        </div>
        <button className="btn primary" onClick={goNext}>
          {screen === "summary"
            ? JOURNEY[stepIdx + 1]
              ? `STEP ${step.num + 1} →`
              : "완성 🎉"
            : "다음 →"}
        </button>
      </div>

      <button className="guide-map-link" onClick={onOpenMap}>
        🗺️ 전체 지도로 보기 — 개념이 어떻게 얽혀 있는지
      </button>
    </div>
  );
}

function ConceptScreen({ nodeId, idxLabel, name, state, pipeline, actions, onOpenPractice }) {
  const node = NODE_BY_ID[nodeId];
  const field = FIELD_BY_NODE[nodeId];
  const val = node.value ? resolveNodeValue(node, state.facts, pipeline) : undefined;
  const isPipeline = node.value?.source === "pipeline";

  return (
    <>
      <span className="muted" style={{ fontSize: 12 }}>{idxLabel}</span>
      <h1 className="guide-h1" style={{ fontSize: 22 }}>{node.label}</h1>
      <p className="guide-body-text">{node.desc}</p>
      <div className="tip">💡 <b>꿀팁</b> — {node.tip}</div>

      {field && (
        <div style={{ marginTop: 16 }}>
          <p className="panel-title" style={{ margin: "0 0 4px" }}>당신은?</p>
          <InlineFactField field={field} value={state.facts[field.key]} onCommit={(v) => actions.setFact(field.key, v)} />
        </div>
      )}

      {isPipeline && (
        <div className={`guide-result${val == null ? " muted-box" : ""}`}>
          {val == null
            ? "아직 계산 전이에요. 앞 단계의 입력값을 채우면 여기에 내 값이 나와요."
            : `${name}님은 지금 ${node.value.kind === "won" ? `약 ${eok(val)}` : formatValue(node.value.kind, val)}예요.`}
        </div>
      )}

      {node.practice && (
        <button className="btn" style={{ width: "100%", marginTop: 12 }} onClick={() => onOpenPractice(node.practice)}>
          ✍️ 연습해보기
        </button>
      )}
    </>
  );
}

function SummaryScreen({ step, stepIdx, guide, name, state, pipeline, stepProgress, actions }) {
  const s = guide.buildSummary(name, state.facts, pipeline);
  const todos = state.stepTodos[step.id] || {};
  const partKo = HOUSE_PART_KO[step.housePart];

  return (
    <>
      <span className="pill" style={{ background: "rgba(79,209,165,0.12)", borderColor: "var(--glow)", color: "var(--glow)" }}>
        STEP {step.num} 정리
      </span>
      <p className="guide-headline">{s.headline}</p>

      {s.rows.length > 0 && (
        <div className="guide-rows">
          {s.rows.map((r, i) => (
            <div key={i} className={`grow${r.strong ? " strong" : ""}`}>
              <span>{r.k}</span>
              <b>{r.v}</b>
            </div>
          ))}
        </div>
      )}

      {s.soWhat && <div className="tip" style={{ marginTop: 14 }}>{s.soWhat}</div>}
      {s.note && <div className="warn-box" style={{ marginTop: 10 }}>{s.note}</div>}

      {step.todo.length > 0 && (
        <>
          <p className="panel-title" style={{ margin: "18px 0 4px" }}>이 단계에서 실제로 할 일</p>
          {step.todo.map((t, i) => (
            <button key={i} className="todo-row" onClick={() => actions.toggleStepTodo(step.id, i)}>
              <span className={`todo-box${todos[i] ? " on" : ""}`}>{todos[i] ? "✓" : ""}</span>
              <span style={{ textDecoration: todos[i] ? "line-through" : "none", opacity: todos[i] ? 0.6 : 1 }}>{t}</span>
            </button>
          ))}
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <HouseProgress stepProgress={stepProgress} />
        <p className="muted" style={{ textAlign: "center", marginTop: 4 }}>
          {stepProgress[step.id]?.done ? `🏠 집에 '${partKo}'이(가) 놓였어요` : `'다음'을 누르면 집에 '${partKo}'이(가) 놓여요`}
        </p>
      </div>
    </>
  );
}
