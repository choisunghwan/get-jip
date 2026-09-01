import { useMemo, useState } from "react";
import { useAppState } from "./hooks/useAppState.js";
import { DECK_INDEX_BY_NODE } from "./data/cardDeck.js";
import { JOURNEY_BY_ID } from "./data/journey.js";
import BrainGraph from "./components/BrainGraph.jsx";
import NodeDetail from "./components/NodeDetail.jsx";
import CardFlow from "./components/CardFlow.jsx";
import QuickStart from "./components/QuickStart.jsx";
import GuideMode from "./components/GuideMode.jsx";
import StepRail from "./components/StepRail.jsx";
import StepPanel from "./components/StepPanel.jsx";
import HouseProgress from "./components/HouseProgress.jsx";
import RuleSetSwitcher from "./components/RuleSetSwitcher.jsx";
import ProgressStats from "./components/ProgressStats.jsx";
import WritingPractice from "./components/WritingPractice.jsx";

export default function App() {
  const { state, ruleSets, pipeline, statuses, progress, stepProgress, deltas, shakeSeq, actions } =
    useAppState();
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // {type:'card'|'practice', ...}
  const [focusAll, setFocusAll] = useState(false);
  const [view, setView] = useState("guide"); // 'guide' | 'map'

  const highlightIds = useMemo(() => {
    if (focusAll) return null;
    const step = JOURNEY_BY_ID[state.currentStep];
    return step && step.nodeIds.length ? new Set(step.nodeIds) : null;
  }, [focusAll, state.currentStep]);

  if (!state.onboarded) {
    return <QuickStart state={state} actions={actions} />;
  }

  if (view === "guide") {
    return (
      <>
        <GuideMode
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          stepProgress={stepProgress}
          actions={actions}
          onOpenMap={() => setView("map")}
          onOpenPractice={(pid) => setModal({ type: "practice", practiceId: pid })}
        />
        {modal?.type === "practice" && (
          <WritingPractice
            practiceId={modal.practiceId}
            state={state}
            actions={actions}
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  const openCardForNode = (nodeId) => {
    setModal({ type: "card", startIndex: DECK_INDEX_BY_NODE[nodeId] ?? 0 });
  };

  const gotoStep = (id) => {
    setSelectedId(null);
    actions.setCurrentStep(id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>{state.userName}이 집 구하기 · 전체 지도</h1>
          <p className="sub">개념이 어떻게 얽혀 있는지 한눈에 · 노드를 눌러 값 입력</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="chip" onClick={() => setFocusAll((v) => !v)}>
            {focusAll ? "🧠 전체" : "🎯 이 단계만"}
          </button>
          <button className="chip" onClick={() => setView("guide")}>← 가이드로</button>
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
          {selectedId ? (
            <NodeDetail
              nodeId={selectedId}
              state={state}
              pipeline={pipeline}
              statuses={statuses}
              onSelect={setSelectedId}
              onLearn={(id) => actions.markLearned(id)}
              onSetFact={(key, v) => actions.setFact(key, v)}
              onOpenCard={openCardForNode}
              onOpenPractice={(pid) => setModal({ type: "practice", practiceId: pid })}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <>
              <HouseProgress stepProgress={stepProgress} />
              <StepPanel
                stepId={state.currentStep}
                state={state}
                statuses={statuses}
                stepProg={stepProgress}
                actions={actions}
                onSelectNode={setSelectedId}
              />
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
            </>
          )}
        </aside>
      </div>

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
      {modal?.type === "practice" && (
        <WritingPractice
          practiceId={modal.practiceId}
          state={state}
          actions={actions}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
