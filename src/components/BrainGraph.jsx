import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NODES, NODE_BY_ID, AREAS } from "../data/nodes.js";
import { EDGES, EDGES_BY_NODE } from "../data/edges.js";
import { useForceSimulation } from "../hooks/useForceSimulation.js";
import { formatValue } from "../lib/format.js";
import { resolveNodeValue } from "../hooks/useAppState.js";

const R = 21;
const MOVE_THRESHOLD = 4;

export default function BrainGraph({
  state,
  pipeline,
  statuses,
  deltas,
  shakeSeq,
  selectedId,
  onSelect,
  areaFilter,
}) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [view, setView] = useState({ tx: 0, ty: 0, k: 1 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { positions, dragControls, reheat } = useForceSimulation(NODES, EDGES, size.w, size.h);

  // 화면 좌표 -> 월드 좌표
  const toWorld = useCallback(
    (clientX, clientY) => {
      const rect = wrapRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - view.tx) / view.k,
        y: (clientY - rect.top - view.ty) / view.k,
      };
    },
    [view]
  );

  // ── pan (배경 드래그) ──
  const panRef = useRef(null);
  const onSvgPointerDown = (e) => {
    if (e.target.closest?.(".node-g")) return; // 노드 위면 노드 핸들러가 처리
    panRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onSvgPointerMove = (e) => {
    if (!panRef.current) return;
    setView((v) => ({
      ...v,
      tx: panRef.current.tx + (e.clientX - panRef.current.x),
      ty: panRef.current.ty + (e.clientY - panRef.current.y),
    }));
  };
  const onSvgPointerUp = (e) => {
    panRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setView((v) => {
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const k = Math.min(2.4, Math.max(0.4, v.k * factor));
      // 커서 기준 확대
      const tx = mx - ((mx - v.tx) / v.k) * k;
      const ty = my - ((my - v.ty) / v.k) * k;
      return { tx, ty, k };
    });
  };

  const zoomBy = (factor) =>
    setView((v) => {
      const k = Math.min(2.4, Math.max(0.4, v.k * factor));
      const cx = size.w / 2;
      const cy = size.h / 2;
      const tx = cx - ((cx - v.tx) / v.k) * k;
      const ty = cy - ((cy - v.ty) / v.k) * k;
      return { tx, ty, k };
    });

  const fitView = useCallback(() => {
    const pts = Object.values(positions);
    if (!pts.length) {
      setView({ tx: 0, ty: 0, k: 1 });
      return;
    }
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs) - 60;
    const maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;
    const k = Math.min(2.2, Math.max(0.4, Math.min(size.w / (maxX - minX), size.h / (maxY - minY))));
    setView({
      k,
      tx: (size.w - (maxX + minX) * k) / 2,
      ty: (size.h - (maxY + minY) * k) / 2,
    });
  }, [positions, size]);

  const didFit = useRef(false);
  useEffect(() => {
    if (!didFit.current && Object.keys(positions).length === NODES.length) {
      didFit.current = true;
      fitView();
    }
  }, [positions, fitView]);

  // ── node drag / tap ──
  const nodeDragRef = useRef(null);
  const onNodePointerDown = (e, id) => {
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    nodeDragRef.current = { id, startX: e.clientX, startY: e.clientY, moved: false };
  };
  const onNodePointerMove = (e) => {
    const d = nodeDragRef.current;
    if (!d) return;
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    if (!d.moved && dist > MOVE_THRESHOLD) {
      d.moved = true;
      dragControls.start(d.id);
    }
    if (d.moved) {
      const w = toWorld(e.clientX, e.clientY);
      dragControls.move(d.id, w.x, w.y);
    }
  };
  const onNodePointerUp = (e, id) => {
    const d = nodeDragRef.current;
    nodeDragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    if (!d) return;
    if (d.moved) dragControls.end(d.id);
    else onSelect(id === selectedId ? null : id);
  };

  const neighborSet = useMemo(() => {
    if (!selectedId) return null;
    return new Set([selectedId, ...(EDGES_BY_NODE[selectedId] || [])]);
  }, [selectedId]);

  const visibleArea = (area) => !areaFilter || areaFilter === area;

  return (
    <div ref={wrapRef} className="graph-pane">
      <svg
        className="graph-svg"
        onPointerDown={onSvgPointerDown}
        onPointerMove={(e) => {
          onSvgPointerMove(e);
          onNodePointerMove(e);
        }}
        onPointerUp={onSvgPointerUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
          {/* edges */}
          {EDGES.map((e, i) => {
            const a = positions[e.from];
            const b = positions[e.to];
            if (!a || !b) return null;
            if (!visibleArea(NODE_BY_ID[e.from].area) && !visibleArea(NODE_BY_ID[e.to].area)) return null;
            const active = neighborSet && (neighborSet.has(e.from) && neighborSet.has(e.to));
            const dim = neighborSet && !active;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.cross ? "#63809e" : "#2f4359"}
                strokeWidth={active ? 2.2 : e.cross ? 1.3 : 1}
                strokeDasharray={e.cross ? "5 4" : undefined}
                opacity={dim ? 0.12 : e.cross ? 0.7 : 0.55}
              />
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            if (!visibleArea(n.area)) return null;
            const status = statuses[n.id];
            const area = AREAS[n.area];
            const selected = n.id === selectedId;
            const dim = neighborSet && !neighborSet.has(n.id);
            const shaking = shakeSeq > 0 && deltas[n.id];
            const rawVal = resolveNodeValue(n, state.facts, pipeline);
            const showVal = status === "hasValue" && n.value;
            const valStr = showVal ? formatValue(n.value.kind, rawVal) : null;

            let fill = "none";
            let stroke = "#4a5f78";
            let strokeDash;
            let textFill = "var(--text)";
            if (status === "unlearned") {
              stroke = "#4a5f78";
              strokeDash = "3 3";
            } else if (status === "learned") {
              fill = hexA(area.color, 0.18);
              stroke = area.color;
            } else {
              fill = area.color;
              stroke = area.color;
              textFill = "#fff";
            }

            return (
              <g
                key={shaking ? `${n.id}-${shakeSeq}` : n.id}
                className={`node-g${shaking ? " shaking" : ""}`}
                transform={`translate(${p.x},${p.y})`}
                opacity={dim ? 0.28 : 1}
                onPointerDown={(e) => onNodePointerDown(e, n.id)}
                onPointerUp={(e) => onNodePointerUp(e, n.id)}
              >
                {selected && (
                  <circle r={R + 7} fill="none" stroke={area.color} strokeWidth={2} opacity={0.6} />
                )}
                <circle
                  r={status === "hasValue" ? R + 1 : R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={status === "unlearned" ? 1.5 : 2.2}
                  strokeDasharray={strokeDash}
                  opacity={status === "unlearned" ? 0.6 : 1}
                />
                <text
                  className="node-label"
                  y={R + 14}
                  textAnchor="middle"
                  fill={dim ? "var(--dim)" : "var(--text)"}
                >
                  {n.label}
                </text>
                {valStr && (
                  <text className="node-value" y={4} textAnchor="middle" fill={textFill}>
                    {valStr.length > 9 ? valStr.replace("원", "") : valStr}
                  </text>
                )}
                {shakeSeq > 0 && deltas[n.id] && (
                  <text className="delta-badge" y={-R - 8} textAnchor="middle">
                    {deltas[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="graph-legend">
        <div className="row"><span className="dot" style={{ background: "transparent", border: "1.5px dashed #4a5f78" }} /> 미학습</div>
        <div className="row"><span className="dot" style={{ background: hexA("#4fd1a5", 0.25), border: "2px solid var(--glow)" }} /> 배움</div>
        <div className="row"><span className="dot" style={{ background: "var(--glow)" }} /> 내값있음</div>
        <div className="row" style={{ marginTop: 4 }}><span style={{ width: 16, borderTop: "1.3px dashed #63809e" }} /> 영역 간 연결</div>
      </div>

      <div className="graph-toolbar">
        <button onClick={() => zoomBy(1.2)} aria-label="확대">+</button>
        <button onClick={() => zoomBy(1 / 1.2)} aria-label="축소">−</button>
        <button onClick={() => { reheat(); setTimeout(fitView, 400); }} aria-label="정렬">⤢</button>
      </div>
    </div>
  );
}

function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
