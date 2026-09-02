import { useEffect, useMemo, useState } from "react";
import { useAppState } from "./hooks/useAppState.js";
import { JOURNEY_BY_ID } from "./data/journey.js";
import LevelUpBanner from "./components/LevelUpBanner.jsx";
import Icon from "./components/Icon.jsx";
import TabBar from "./components/TabBar.jsx";
import BrainGraph from "./components/BrainGraph.jsx";
import NodeDetail from "./components/NodeDetail.jsx";
import CardFlow from "./components/CardFlow.jsx";
import QuickStart from "./components/QuickStart.jsx";
import GuideMode from "./components/GuideMode.jsx";
import ListView from "./components/ListView.jsx";
import ReportView from "./components/ReportView.jsx";
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
  const [homeSignal, setHomeSignal] = useState(0); // 바뀔 때마다 GuideMode가 여정 화면으로 리셋
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    document.title = state.userName ? `${state.userName}의 집짓기` : "집짓기 — 내 집 마련 가이드";
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

  const goHome = () => {
    setSelectedId(null);
    setView("guide");
    setHomeSignal((s) => s + 1);
  };
  const goList = () => {
    setSelectedId(null);
    setView("list");
  };
  const goMap = () => {
    setSelectedId(null);
    setView("map");
  };

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

  const tabBar = <TabBar active={view === "guide" ? "home" : view} onHome={goHome} onList={goList} onMap={goMap} />;
  const reportOverlay = showReport ? <ReportView state={state} onClose={() => setShowReport(false)} /> : null;

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
          homeSignal={homeSignal}
          onOpenReport={() => setShowReport(true)}
          onOpenPractice={(pid) => setModal({ type: "practice", practiceId: pid })}
        />
        {tabBar}
        {reportOverlay}
        {practiceModal}
      </>
    );
  }

  if (view === "list") {
    return (
      <>
        {showLevelUp && <LevelUpBanner level={level} onAck={() => actions.ackLevel(level.lv)} />}
        <ListView state={state} pipeline={pipeline} statuses={statuses} onSelect={setSelectedId} />
        {tabBar}
        {reportOverlay}
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
    <div className="app has-tabbar">
      {showLevelUp && <LevelUpBanner level={level} onAck={() => actions.ackLevel(level.lv)} />}
      <header className="app-header">
        <div>
          <h1>{state.userName}의 집짓기 · 전체 지도</h1>
          <p className="sub">개념이 어떻게 얽혀 있는지 한눈에 · 노드를 눌러 값 입력</p>
        </div>
        <button className="chip chip-ico" onClick={() => setFocusAll((v) => !v)}>
          <Icon name={focusAll ? "brain" : "target"} size={13} /> {focusAll ? "전체" : "이 단계만"}
        </button>
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
        입력값은 로그인·개인정보 수집 없이 익명으로만 쓰이며, 진행 파일로 내려받아 직접 보관할 수 있습니다.
      </div>

      {tabBar}
      {reportOverlay}

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
