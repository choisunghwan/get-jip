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
import Roadmap from "./Roadmap.jsx";
import LevelBadge from "./LevelBadge.jsx";
import Icon from "./Icon.jsx";
import { downloadSessionHtml } from "../lib/sessionFile.js";

// 초보자 기본 화면. 여정 화면(뭘 해야 하는지) → 단계별 카드 흐름.
export default function GuideMode({ state, pipeline, stepProgress, level, actions, onOpenMap, onOpenList, onOpenPractice }) {
  const [mode, setMode] = useState("roadmap"); // 'roadmap' | 'step'
  const stepId = state.currentStep;
  const step = JOURNEY_BY_ID[stepId];
  const stepIdx = JOURNEY.findIndex((s) => s.id === stepId);
  const guide = STEP_GUIDE[stepId];

  const conceptIds = useMemo(() => {
    const facts = step.nodeIds.filter((id) => FIELD_BY_NODE[id]);
    const rest = step.nodeIds.filter((id) => !FIELD_BY_NODE[id]);
    return [...facts, ...rest];
  }, [step]);

  const screens = useMemo(() => ["intro", ...conceptIds.map((id) => `c:${id}`), "summary"], [conceptIds]);
  const [si, setSi] = useState(0);
  const [dir, setDir] = useState(1);

  const openStep = (id, opts = {}) => {
    setDir(1);
    const target = JOURNEY_BY_ID[id];
    const screenCount = target.nodeIds.length + 2; // intro + concepts + summary
    setSi(opts.toReport ? screenCount - 1 : 0);
    actions.setCurrentStep(id);
    setMode("step");
  };
  const backToRoadmap = () => setMode("roadmap");

  const goNext = () => {
    if (si < screens.length - 1) {
      setDir(1);
      setSi(si + 1);
      return;
    }
    // 단계 정리 화면에서 '다음' → 완료 처리 + 여정 화면으로
    if (!stepProgress[stepId]?.done) actions.toggleStepDone(stepId);
    const next = JOURNEY[stepIdx + 1];
    if (next) actions.setCurrentStep(next.id);
    setMode("roadmap");
  };
  const goPrev = () => {
    if (si > 0) {
      setDir(-1);
      setSi(si - 1);
      return;
    }
    setMode("roadmap");
  };

  if (mode === "roadmap") {
    return (
      <Roadmap
        name={state.userName}
        state={state}
        actions={actions}
        pipeline={pipeline}
        stepProgress={stepProgress}
        level={level}
        onOpenStep={openStep}
        onOpenMap={onOpenMap}
        onOpenList={onOpenList}
      />
    );
  }

  const screen = screens[si];
  const conceptNo = screen.startsWith("c:") ? si : null;
  const onSummary = screen === "summary";

  return (
    <div className="guide">
      {/* 슬림 헤더 */}
      <div className="guide-head">
        <button className="gh-back" onClick={backToRoadmap} aria-label="여정으로">←</button>
        <div className="gh-mid">
          <div className="gh-step">
            STEP {step.num} / 7 · {step.title}
            <LevelBadge level={level} compact />
          </div>
          <div className="gh-dots">
            {JOURNEY.map((s, i) => (
              <span
                key={s.id}
                className={`ghd${i === stepIdx ? " on" : ""}${stepProgress[s.id]?.done ? " done" : ""}`}
              />
            ))}
          </div>
        </div>
        {pipeline.requiredCash != null && (
          <div className="gh-cash">
            <span>필요한 돈</span>
            <b>{eok(pipeline.requiredCash)}</b>
          </div>
        )}
      </div>

      <div className="guide-body">
        <motion.div
          key={`${stepId}:${si}`}
          initial={{ opacity: 0, x: dir * 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          className="guide-card"
        >
          {screen === "intro" && (
            <div className="g-intro">
              <div className="g-intro-art">
                <HouseProgress stepProgress={stepProgress} size={132} />
              </div>
              <span className="g-kicker">STEP {step.num} / 7</span>
              <h1 className="g-title">{step.title}</h1>
              <p className="g-lead">{guide.intro}</p>
            </div>
          )}

          {conceptNo != null && (
            <ConceptScreen
              nodeId={screen.slice(2)}
              no={conceptNo}
              total={conceptIds.length}
              name={state.userName}
              state={state}
              pipeline={pipeline}
              actions={actions}
              onOpenPractice={onOpenPractice}
            />
          )}

          {onSummary && (
            <SummaryScreen
              step={step}
              hasNext={!!JOURNEY[stepIdx + 1]}
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
        <button className="btn ghost gn-prev" onClick={goPrev} disabled={si === 0 && stepIdx === 0}>
          ←
        </button>
        <span className="gn-count">{si + 1} / {screens.length}</span>
        <button className="btn primary gn-next" onClick={goNext}>
          {onSummary ? (JOURNEY[stepIdx + 1] ? "다음 단계 →" : "완성!") : "다음 →"}
        </button>
      </div>

      <div className="guide-view-links">
        <button onClick={onOpenList}><Icon name="list" size={13} /> 전체 항목 목록</button>
        <button onClick={onOpenMap}><Icon name="map" size={13} /> 전체 지도</button>
      </div>
    </div>
  );
}

function ConceptScreen({ nodeId, no, total, name, state, pipeline, actions, onOpenPractice }) {
  const node = NODE_BY_ID[nodeId];
  const field = FIELD_BY_NODE[nodeId];
  const val = node.value ? resolveNodeValue(node, state.facts, pipeline) : undefined;
  const isPipeline = node.value?.source === "pipeline";
  const ord = ["첫", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"][no - 1] || `${no}`;

  return (
    <div className="g-concept">
      <span className="g-kicker">{ord}번째 · 개념 {no}/{total}</span>
      <h1 className="g-title">{node.label}</h1>
      <p className="g-body">{node.desc}</p>
      <div className="g-tip"><Icon name="bulb" size={15} /><p>{node.tip}</p></div>

      {field && (
        <div className="g-ask">
          <p className="g-ask-label">{name}님은 어때요?</p>
          <InlineFactField field={field} value={state.facts[field.key]} onCommit={(v) => actions.setFact(field.key, v)} />
        </div>
      )}

      {isPipeline && (
        <div className={`g-result${val == null ? " pending" : ""}`}>
          {val == null ? (
            "앞의 값을 채우면 여기에 내 숫자가 나와요."
          ) : (
            <>
              <Icon name="pin" size={15} className="g-result-icon" />
              <span>
                {name}님은 지금 <b>{node.value.kind === "won" ? `약 ${eok(val)}` : formatValue(node.value.kind, val)}</b>
                {node.value.kind === "won" ? "예요." : "예요."}
              </span>
            </>
          )}
        </div>
      )}

      {node.practice && (
        <button className="btn" style={{ width: "100%", marginTop: 14 }} onClick={() => onOpenPractice(node.practice)}>
          <Icon name="pencil" size={13} /> 직접 연습해보기
        </button>
      )}
    </div>
  );
}

function SummaryScreen({ step, hasNext, guide, name, state, pipeline, stepProgress, actions }) {
  const s = guide.buildSummary(name, state.facts, pipeline);
  const todos = state.stepTodos[step.id] || {};
  const partKo = HOUSE_PART_KO[step.housePart];

  return (
    <div className="g-summary">
      <span className="g-kicker done"><Icon name="list" size={12} /> STEP {step.num} 리포트</span>

      {s.verdict && (
        <div className="g-verdict">
          <span className="g-verdict-label">결론</span>
          <p className="g-verdict-main">{s.verdict}</p>
          {s.verdictSub && <p className="g-verdict-sub">{s.verdictSub}</p>}
        </div>
      )}

      {s.headline && <p className="g-headline">{s.headline}</p>}

      {s.rows.length > 0 && (
        <div className="g-rows">
          {s.rows.map((r, i) =>
            r.head ? (
              <div key={i} className="g-row-head">{r.k}</div>
            ) : (
              <div key={i} className={`g-row${r.strong ? " strong" : ""}`}>
                <span>{r.k}</span>
                <b>{r.v}</b>
              </div>
            )
          )}
        </div>
      )}

      {s.soWhat && <div className="g-sowhat">{s.soWhat}</div>}
      {s.note && <div className="warn-box" style={{ marginTop: 10 }}>{s.note}</div>}

      {step.todo.length > 0 && (
        <div className="g-todos">
          <p className="g-todos-title">이 단계에서 실제로 할 일</p>
          {step.todo.map((t, i) => (
            <button key={i} className="todo-row" onClick={() => actions.toggleStepTodo(step.id, i)}>
              <span className={`todo-box${todos[i] ? " on" : ""}`}>{todos[i] && <Icon name="check" size={11} strokeWidth={3} />}</span>
              <span style={{ textDecoration: todos[i] ? "line-through" : "none", opacity: todos[i] ? 0.55 : 1 }}>{t}</span>
            </button>
          ))}
        </div>
      )}

      <div className="g-house-reward">
        <HouseProgress stepProgress={stepProgress} size={150} />
        <p className="muted" style={{ marginTop: 2 }}>
          {stepProgress[step.id]?.done
            ? `집에 '${partKo}'이(가) 생겼어요`
            : `'${hasNext ? "다음 단계" : "완성"}'을 누르면 '${partKo}'이(가) 생겨요`}
        </p>
      </div>

      <button
        className="btn ghost"
        style={{ width: "100%", marginTop: 14 }}
        onClick={() => downloadSessionHtml(state)}
      >
        <Icon name="scroll" size={13} /> 여기까지 리포트·진행 파일로 저장
      </button>
    </div>
  );
}
