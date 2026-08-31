import { useState } from "react";
import { useAppState } from "./hooks/useAppState.js";
import { AREAS } from "./data/nodes.js";
import { DECK_INDEX_BY_NODE } from "./data/cardDeck.js";
import BrainGraph from "./components/BrainGraph.jsx";
import NodeDetail from "./components/NodeDetail.jsx";
import CardFlow from "./components/CardFlow.jsx";
import QuickStart from "./components/QuickStart.jsx";
import RuleSetSwitcher from "./components/RuleSetSwitcher.jsx";
import ProgressStats from "./components/ProgressStats.jsx";
import WritingPractice from "./components/WritingPractice.jsx";

export default function App() {
  const { state, ruleSets, pipeline, statuses, progress, deltas, shakeSeq, actions } = useAppState();
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // {type:'card', startIndex} | {type:'practice', practiceId}
  const [areaFilter, setAreaFilter] = useState(null);

  if (!state.onboarded) {
    return <QuickStart state={state} actions={actions} />;
  }

  const openCardForNode = (nodeId) => {
    const i = DECK_INDEX_BY_NODE[nodeId];
    setModal({ type: "card", startIndex: i ?? 0 });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>{state.userName}이 집 구하기</h1>
          <p className="sub">뇌처럼 얽힌 개념 그래프 · 아는 것만 답하면 계산돼요</p>
        </div>
        <div className="chip-row" style={{ marginTop: 0 }}>
          <button
            className="chip"
            style={{ borderColor: !areaFilter ? "var(--glow)" : "var(--line)" }}
            onClick={() => setAreaFilter(null)}
          >
            전체
          </button>
          {Object.values(AREAS).map((a) => (
            <button
              key={a.key}
              className="chip"
              style={{ borderColor: areaFilter === a.key ? a.color : "var(--line)" }}
              onClick={() => setAreaFilter(areaFilter === a.key ? null : a.key)}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </header>

      <div className="app-body">
        <BrainGraph
          state={state}
          pipeline={pipeline}
          statuses={statuses}
          deltas={deltas}
          shakeSeq={shakeSeq}
          selectedId={selectedId}
          onSelect={setSelectedId}
          areaFilter={areaFilter}
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
              <p className="muted">
                그래프에서 회색 노드를 누르면 그 자리에서 값을 입력할 수 있어요.
                규칙셋을 바꾸면 영향받는 노드가 흔들리며 다시 계산됩니다.
              </p>
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
