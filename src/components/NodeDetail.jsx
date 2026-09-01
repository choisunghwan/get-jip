import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import { EDGES_BY_NODE } from "../data/edges.js";
import { FIELD_BY_NODE } from "../data/cardDeck.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue } from "../lib/format.js";
import { InlineFactField } from "./FactField.jsx";
import Icon from "./Icon.jsx";

// 이 노드를 채우거나 바꾸는 데 필요한 입력(fact) 노드들 — 최대 2홉.
function relatedFactIds(nodeId) {
  const seen = new Set([nodeId]);
  const out = [];
  let frontier = [nodeId];
  for (let hop = 0; hop < 2 && out.length < 6; hop++) {
    const next = [];
    for (const id of frontier) {
      for (const nb of EDGES_BY_NODE[id] || []) {
        if (seen.has(nb)) continue;
        seen.add(nb);
        if (FIELD_BY_NODE[nb]) out.push(nb);
        next.push(nb);
      }
    }
    frontier = next;
  }
  return out;
}

export default function NodeDetail({
  nodeId,
  state,
  pipeline,
  statuses,
  onSelect,
  onLearn,
  onSetFact,
  onOpenPractice,
  onClose,
}) {
  const node = NODE_BY_ID[nodeId];
  if (!node) return null;

  const field = FIELD_BY_NODE[nodeId];
  const area = AREAS[node.area];
  const status = statuses[nodeId];
  const rawVal = resolveNodeValue(node, state.facts, pipeline);
  const hasVal = status === "hasValue" && node.value;

  // 이 노드에 딸린 입력들: fact면 자기 자신, pipeline이면 계산에 쓰이는 fact들
  const inputIds = field
    ? [nodeId]
    : relatedFactIds(nodeId).sort((a, b) => {
        const fa = statuses[a] === "hasValue" ? 1 : 0;
        const fb = statuses[b] === "hasValue" ? 1 : 0;
        return fa - fb; // 안 채운 것 먼저
      });

  const otherNeighbors = [...new Set(EDGES_BY_NODE[nodeId] || [])].filter(
    (id) => !inputIds.includes(id)
  );

  return (
    <div className="panel-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="pill" style={{ color: area.color, borderColor: area.color }}>
          <span className="areadot" style={{ background: area.color }} /> {area.label}
        </span>
        <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 18 }} onClick={onClose}>×</button>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, margin: "10px 0 4px" }}>{node.label}</h2>
      <p className="muted" style={{ fontSize: 13, color: "var(--text)" }}>{node.desc}</p>
      <div className="tip"><Icon name="bulb" size={14} /> <b>꿀팁</b> — {node.tip}</div>

      {/* pipeline 노드: 계산 결과 */}
      {!field && hasVal && (
        <div className="kv" style={{ marginTop: 14, borderBottom: "none" }}>
          <span className="k">계산된 내 값</span>
          <span className="v" style={{ color: area.color, fontSize: 16 }}>
            {formatValue(node.value.kind, rawVal)}
          </span>
        </div>
      )}

      {/* 채울 수 있는 입력들 (자기 자신 또는 계산에 쓰이는 값들) */}
      {inputIds.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p className="panel-title" style={{ margin: "0 0 4px" }}>
            {field ? "내 값" : "이 값을 바꾸려면 여기를 채워요"}
          </p>
          {inputIds.map((id) => {
            const inode = NODE_BY_ID[id];
            const ifield = FIELD_BY_NODE[id];
            const filled = statuses[id] === "hasValue";
            return (
              <div key={id} style={{ marginTop: field ? 0 : 12 }}>
                {!field && (
                  <label style={{ fontSize: 13, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                    <span>{inode.label}</span>
                    {filled && <Icon name="check" size={13} strokeWidth={3} style={{ color: AREAS[inode.area].color }} />}
                  </label>
                )}
                <InlineFactField
                  field={ifield}
                  value={state.facts[ifield.key]}
                  onCommit={(v) => onSetFact(ifield.key, v)}
                />
              </div>
            );
          })}
        </div>
      )}

      {!field && inputIds.length === 0 && !hasVal && (
        <p className="muted" style={{ marginTop: 12 }}>
          이건 개념이에요. 아래 얽힌 개념을 눌러 살펴보세요.
        </p>
      )}

      {otherNeighbors.length > 0 && (
        <>
          <p className="panel-title" style={{ margin: "16px 0 6px" }}>얽힌 개념</p>
          <div className="chip-row">
            {otherNeighbors.map((id) => {
              const nb = NODE_BY_ID[id];
              const nbArea = AREAS[nb.area];
              const st = statuses[id];
              return (
                <button
                  key={id}
                  className={`chip area chip-${st}`}
                  style={{ "--c": nbArea.color }}
                  onClick={() => onSelect(id)}
                >
                  <span className="areadot" style={{ background: nbArea.color }} /> {nb.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {status === "learned" && !field && !hasVal && (
        <p className="learned-note">
          <Icon name="check" size={13} strokeWidth={3} /> 배운 개념이에요 — 그래프·목록에서 이 노드에 불이 들어와요
        </p>
      )}

      <div className="btn-row">
        {status === "unlearned" && !field && (
          <button className="btn primary" onClick={() => { onLearn(nodeId); onClose(); }}>이해했어요</button>
        )}
        {node.practice && (
          <button className="btn" onClick={() => onOpenPractice(node.practice)}>연습해보기</button>
        )}
      </div>
    </div>
  );
}
