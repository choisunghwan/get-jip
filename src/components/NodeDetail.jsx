import { NODE_BY_ID, AREAS } from "../data/nodes.js";
import { EDGES_BY_NODE } from "../data/edges.js";
import { FIELD_BY_NODE, DECK_INDEX_BY_NODE } from "../data/cardDeck.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue } from "../lib/format.js";
import { InlineFactField } from "./FactField.jsx";

export default function NodeDetail({
  nodeId,
  state,
  pipeline,
  statuses,
  onSelect,
  onLearn,
  onSetFact,
  onOpenCard,
  onOpenPractice,
  onClose,
}) {
  const node = NODE_BY_ID[nodeId];
  const field = FIELD_BY_NODE[nodeId];
  const saved = field ? state.facts[field.key] : undefined;

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
        <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 18 }} onClick={onClose}>×</button>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, margin: "10px 0 4px" }}>{node.label}</h2>
      <p className="muted" style={{ fontSize: 13, color: "var(--text)" }}>{node.desc}</p>
      <div className="tip">💡 <b>꿀팁</b> — {node.tip}</div>

      {/* fact 노드: 그 자리에서 입력 */}
      {field && (
        <div style={{ marginTop: 14 }}>
          <p className="panel-title" style={{ margin: "0 0 2px" }}>
            내 값 {saved != null && <span style={{ color: area.color }}>· 저장됨</span>}
          </p>
          <InlineFactField field={field} value={saved} onCommit={(v) => onSetFact(field.key, v)} />
        </div>
      )}

      {/* pipeline 노드: 계산 결과 */}
      {!field && hasVal && (
        <div className="kv" style={{ marginTop: 14, borderBottom: "none" }}>
          <span className="k">계산된 내 값</span>
          <span className="v" style={{ color: area.color, fontSize: 16 }}>
            {formatValue(node.value.kind, rawVal)}
          </span>
        </div>
      )}
      {!field && !hasVal && node.value && (
        <p className="muted" style={{ marginTop: 12 }}>
          선행 정보가 더 필요해요. 아래 얽힌 개념 중 회색 노드를 채우면 자동 계산됩니다.
        </p>
      )}

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
                  className={`chip${st === "unlearned" ? "" : " selected"}`}
                  style={st === "unlearned" ? undefined : { borderColor: nbArea.color, color: nbArea.color, background: "transparent" }}
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
        {status === "unlearned" && !field && (
          <button className="btn primary" onClick={() => onLearn(nodeId)}>이해했어요</button>
        )}
        {!field && cardIndex != null && (
          <button className="btn" onClick={() => onOpenCard(nodeId)}>관련 카드로</button>
        )}
        {node.practice && (
          <button className="btn" onClick={() => onOpenPractice(node.practice)}>연습해보기</button>
        )}
      </div>
    </div>
  );
}
