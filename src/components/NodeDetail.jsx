import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import { EDGES_BY_NODE } from "../data/edges.js";
import { DECK_INDEX_BY_NODE } from "../data/cardDeck.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue } from "../lib/format.js";

export default function NodeDetail({
  nodeId,
  state,
  pipeline,
  statuses,
  onSelect,
  onLearn,
  onOpenCard,
  onOpenPractice,
  onClose,
}) {
  const node = NODE_BY_ID[nodeId];
  if (!node) return null;
  const area = AREAS[node.area];
  const status = statuses[nodeId];
  const rawVal = resolveNodeValue(node, state.facts, pipeline);
  const hasVal = status === "hasValue" && node.value;
  const neighbors = [...new Set(EDGES_BY_NODE[nodeId] || [])];
  const cardIndex = DECK_INDEX_BY_NODE[nodeId];

  return (
    <div className="panel-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="pill" style={{ color: area.color, borderColor: area.color }}>
          {area.emoji} {area.label}
        </span>
        <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 18 }} onClick={onClose}>
          ×
        </button>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, margin: "10px 0 4px" }}>{node.label}</h2>
      <p className="muted" style={{ fontSize: 13, color: "var(--text)" }}>{node.desc}</p>

      <div className="tip">💡 <b>꿀팁</b> — {node.tip}</div>

      {hasVal ? (
        <div className="kv" style={{ marginTop: 14, borderBottom: "none" }}>
          <span className="k">내 값</span>
          <span className="v" style={{ color: area.color, fontSize: 16 }}>
            {formatValue(node.value.kind, rawVal)}
          </span>
        </div>
      ) : node.value ? (
        <p className="muted" style={{ marginTop: 12 }}>
          {node.value.source === "fact"
            ? "아직 입력 안 함 — 아래 '관련 카드로'에서 답할 수 있어요."
            : "선행 정보가 더 필요해요. 관련 팩트를 채우면 자동 계산됩니다."}
        </p>
      ) : null}

      {neighbors.length > 0 && (
        <>
          <p className="panel-title" style={{ margin: "16px 0 6px" }}>얽힌 개념</p>
          <div className="chip-row">
            {neighbors.map((id) => {
              const nb = NODE_BY_ID[id];
              const nbArea = AREAS[nb.area];
              const st = statuses[id];
              return (
                <button
                  key={id}
                  className="chip"
                  style={{ borderColor: st === "unlearned" ? "var(--line)" : nbArea.color }}
                  onClick={() => onSelect(id)}
                >
                  {nbArea.emoji} {nb.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="btn-row">
        {status === "unlearned" && (
          <button className="btn primary" onClick={() => onLearn(nodeId)}>
            이해했어요
          </button>
        )}
        {cardIndex != null && (
          <button className="btn" onClick={() => onOpenCard(nodeId)}>
            관련 카드로
          </button>
        )}
        {node.practice && (
          <button className="btn" onClick={() => onOpenPractice(node.practice)}>
            연습해보기
          </button>
        )}
      </div>
    </div>
  );
}
