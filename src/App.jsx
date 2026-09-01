import { useEffect, useMemo, useState } from "react";
import { useAppState } from "./hooks/useAppState.js";
import { JOURNEY_BY_ID } from "./data/journey.js";
import LevelUpBanner from "./components/LevelUpBanner.jsx";
import Icon from "./components/Icon.jsx";
import BrainGraph from "./components/BrainGraph.jsx";
import NodeDetail from "./components/NodeDetail.jsx";
import CardFlow from "./components/CardFlow.jsx";
import QuickStart from "./components/QuickStart.jsx";
import GuideMode from "./components/GuideMode.jsx";
import ListView from "./components/ListView.jsx";
import StepRail from "./components/StepRail.jsx";
import RuleSetSwitcher from "./components/RuleSetSwitcher.jsx";
import ProgressStats from "./components/ProgressStats.jsx";
import WritingPractice from "./components/WritingPractice.jsx";

export default function App() {
  const { state, ruleSets, pipeline, statuses, progress, stepProgress, level, deltas, shakeSeq, actions } =
    useAppState();
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // {type:'card'|'practice', ...}
  const [focusAll, setFocusAll] = useState(false);
  const [view, setView] = useState("guide"); // 'guide' | 'list' | 'map'

  useEffect(() => {
    document.title = `${state.userName}의 집짓기`;
  }, [state.userName]);

  const showLevelUp = level.lv > state.seenLevel;

  const highlightIds = useMemo(() => {
    if (focusAll) return null;
    const step = JOURNEY_BY_ID[state.currentStep];
    return step && step.nodeIds.length ? new Set(step.nodeIds) : null;
  }, [focusAll, state.currentStep]);

  if (!state.onboarded) {
    return <QuickStart state={state} actions={actions} />;
  }

  const practiceModal =
    modal?.type === "practice" ? (
      <WritingPractice
        practiceId={modal.practiceId}
        state={state}
        actions={actions}
        onClose={() => setModal(null)}
      />
    ) : null;

  const nodeSheet = selectedId ? (
    <div className="modal-backdrop" onClick={() => setSelectedId(null)}>
      <div className="node-sheet" onClick={(e) => e.stopPropagation()}>
        <NodeDetail
          nodeId={selectedId}
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          onSelect={setSelectedId}
          onLearn={(id) => actions.markLearned(id)}
          onSetFact={(key, v) => actions.setFact(key, v)}
          onOpenPractice={(pid) => setModal({ type: "practice", practiceId: pid })}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  ) : null;

  if (view === "guide") {
    return (
      <>
        {showLevelUp && <LevelUpBanner level={level} onAck={() => actions.ackLevel(level.lv)} />}
        <GuideMode
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          stepProgress={stepProgress}
          level={level}
          actions={actions}
          onOpenMap={() => setView("map")}
          onOpenList={() => setView("list")}
          onOpenPractice={(pid) => setModal({ type: "practice", practiceId: pid })}
        />
        {practiceModal}
      </>
    );
  }

  if (view === "list") {
    return (
      <>
        {showLevelUp && <LevelUpBanner level={level} onAck={() => actions.ackLevel(level.lv)} />}
        <ListView
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          onSelect={setSelectedId}
          onBack={() => setView("guide")}
          onOpenMap={() => setView("map")}
        />
        {nodeSheet}
        {practiceModal}
      </>
    );
  }


  const gotoStep = (id) => {
    setSelectedId(null);
    actions.setCurrentStep(id);
  };

  return (
    <div className="app">
      {showLevelUp && <LevelUpBanner level={level} onAck={() => actions.ackLevel(level.lv)} />}
      <header className="app-header">
        <div>
          <h1>{state.userName}의 집짓기 · 전체 지도</h1>
          <p className="sub">개념이 어떻게 얽혀 있는지 한눈에 · 노드를 눌러 값 입력</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="chip chip-ico" onClick={() => setFocusAll((v) => !v)}>
            <Icon name={focusAll ? "brain" : "target"} size={13} /> {focusAll ? "전체" : "이 단계만"}
          </button>
          <button className="chip chip-ico" onClick={() => setView("list")}>
            <Icon name="list" size={13} /> 목록
          </button>
          <button className="chip" onClick={() => setView("guide")}>← 가이드</button>
        </div>
      </header>

      <StepRail current={state.currentStep} stepProgress={stepProgress} onSelect={gotoStep} />

      <div className="app-body">
        <BrainGraph
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          deltas={deltas}
          shakeSeq={shakeSeq}
          selectedId={selectedId}
          onSelect={setSelectedId}
          highlightIds={highlightIds}
        />

        <aside className="side-pane">
          <p className="muted" style={{ margin: 0 }}>
            노드를 눌러 값을 입력하거나 개념을 배우세요. 회색은 아직 안 배운 개념이에요.
          </p>
          <RuleSetSwitcher
            ruleSets={ruleSets}
            current={state.ruleSetVersion}
            onSwitch={actions.switchRuleSet}
            deltas={deltas}
            onDismiss={actions.dismissDeltas}
          />
          <ProgressStats
            progress={progress}
            statuses={statuses}
            pipeline={pipeline}
            onOpenCard={(startIndex) => setModal({ type: "card", startIndex })}
            onReset={actions.reset}
          />
        </aside>
      </div>

      {nodeSheet}

      <div className="disclaimer">
        이 앱은 계약서 쓰기 전까지 감을 잡고 준비하는 도구입니다. 모든 계산·규칙 수치는 근사치이며,
        대출 승인·계약서 검토·시세는 은행 사전심사·공인중개사·법무사와 반드시 확인하세요.
      </div>

      {modal?.type === "card" && (
        <CardFlow
          startIndex={modal.startIndex ?? 0}
          state={state}
          actions={actions}
          onClose={() => setModal(null)}
        />
      )}
      {practiceModal}
    </div>
  );
}
