import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NODES, NODE_BY_ID, AREAS } from "../data/nodes.js";
import { EDGES, EDGES_BY_NODE } from "../data/edges.js";
import { useForceSimulation } from "../hooks/useForceSimulation.js";
import { formatValue, eok } from "../lib/format.js";
import { resolveNodeValue } from "../hooks/useAppState.js";

const R = 21;
const MOVE_THRESHOLD = 4;
const POP = { type: "spring", stiffness: 260, damping: 16 };
const MIN_K = 0.5;
const MAX_K = 2.4;
const WORLD_PAD = 40; // 노드 바깥 여백(월드 단위)

export default function BrainGraph({
  state,
  pipeline,
  statuses,
  deltas,
  shakeSeq,
  selectedId,
  onSelect,
  highlightIds, // Set<nodeId> | null — 이 노드들만 밝히고 나머지는 흐리게(숨기지 않음)
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

  const { positions, dragControls } = useForceSimulation(NODES, EDGES, size.w, size.h);

  // 노드 전체를 감싸는 월드 좌표 박스
  const bounds = useMemo(() => {
    const pts = Object.values(positions);
    if (!pts.length) return null;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    return {
      minX: Math.min(...xs) - WORLD_PAD,
      maxX: Math.max(...xs) + WORLD_PAD,
      minY: Math.min(...ys) - WORLD_PAD,
      maxY: Math.max(...ys) + WORLD_PAD,
    };
  }, [positions]);

  // view 를 범위 안으로 제한 (무한 팬/줌 방지).
  // 규칙: 화면 중앙점이 항상 노드 박스 안(또는 살짝 안쪽)에 있어야 한다
  //  → 그래프를 절대 잃어버리지 않으면서, 아무 노드나 중앙에 가져올 수 있음.
  const clampView = useCallback(
    (v) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k));
      let { tx, ty } = v;
      if (bounds) {
        const mx = Math.min(size.w, (bounds.maxX - bounds.minX) * k) * 0.2;
        const my = Math.min(size.h, (bounds.maxY - bounds.minY) * k) * 0.2;
        tx = Math.min(size.w / 2 - mx - bounds.minX * k, Math.max(size.w / 2 + mx - bounds.maxX * k, tx));
        ty = Math.min(size.h / 2 - my - bounds.minY * k, Math.max(size.h / 2 + my - bounds.maxY * k, ty));
      }
      return { tx, ty, k };
    },
    [bounds, size]
  );
  const setViewClamped = useCallback(
    (next) => setView((v) => clampView(typeof next === "function" ? next(v) : next)),
    [clampView]
  );

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
    const start = panRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setViewClamped((v) => ({ ...v, tx: start.tx + dx, ty: start.ty + dy }));
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
    setViewClamped((v) => {
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const k = Math.min(2.4, Math.max(0.4, v.k * factor));
      // 커서 기준 확대
      const tx = mx - ((mx - v.tx) / v.k) * k;
      const ty = my - ((my - v.ty) / v.k) * k;
      return { tx, ty, k };
    });
  };

  const zoomBy = (factor) =>
    setViewClamped((v) => {
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
    setViewClamped({
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

  // 선택이 있으면 이웃 강조가 우선, 없으면 highlightIds(STEP 포커스) 적용
  const focusSet = neighborSet || highlightIds || null;
  const isDim = (id) => !!focusSet && !focusSet.has(id);

  // STEP 포커스가 바뀌면 해당 노드들로 화면 이동
  useEffect(() => {
    if (!highlightIds || selectedId) return;
    const pts = [...highlightIds].map((id) => positions[id]).filter(Boolean);
    if (pts.length < 2) return;
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const minX = Math.min(...xs) - 90, maxX = Math.max(...xs) + 90;
    const minY = Math.min(...ys) - 90, maxY = Math.max(...ys) + 90;
    const k = Math.min(1.8, Math.max(0.5, Math.min(size.w / (maxX - minX), size.h / (maxY - minY))));
    setViewClamped({ k, tx: (size.w - (maxX + minX) * k) / 2, ty: (size.h - (maxY + minY) * k) / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightIds]);

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
            const both = focusSet && focusSet.has(e.from) && focusSet.has(e.to);
            const dim = focusSet && !both;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.cross ? "#bfae92" : "#d7ccb8"}
                strokeWidth={both ? 2.4 : e.cross ? 1.4 : 1.1}
                strokeDasharray={e.cross ? "5 4" : undefined}
                opacity={dim ? 0.14 : e.cross ? 0.8 : 0.7}
              />
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const status = statuses[n.id];
            const area = AREAS[n.area];
            const selected = n.id === selectedId;
            const dim = isDim(n.id);
            const shaking = shakeSeq > 0 && deltas[n.id];
            const rawVal = resolveNodeValue(n, state.facts, pipeline);
            const showVal = status === "hasValue" && n.value;
            const valStr = showVal
              ? n.value.kind === "won"
                ? eok(rawVal)
                : formatValue(n.value.kind, rawVal)
              : null;

            let fill = "none";
            let stroke = "#c2b6a0";
            let strokeDash;
            let textFill = "var(--text)";
            if (status === "unlearned") {
              stroke = "#c2b6a0";
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
                key={n.id}
                className="node-g"
                transform={`translate(${p.x},${p.y})`}
                onPointerDown={(e) => onNodePointerDown(e, n.id)}
                onPointerUp={(e) => onNodePointerUp(e, n.id)}
              >
                <motion.g
                  initial={false}
                  style={{ opacity: 1 }}
                  animate={{
                    opacity: dim ? 0.22 : 1,
                    x: shaking ? [0, -3, 3, -2, 2, 0] : 0,
                  }}
                  transition={{ opacity: { duration: 0.25 }, x: { duration: 0.5 } }}
                >
                  {selected && (
                    <circle r={R + 7} fill="none" stroke={area.color} strokeWidth={2} opacity={0.6} />
                  )}
                  <motion.circle
                    key={status}
                    initial={{ scale: status === "hasValue" ? 0.4 : 1 }}
                    animate={{ scale: 1 }}
                    transition={POP}
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
                    <motion.text
                      key={valStr}
                      className="node-value"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 4 }}
                      transition={{ duration: 0.3 }}
                      textAnchor="middle"
                      fill={textFill}
                    >
                      {valStr}
                    </motion.text>
                  )}
                  {shakeSeq > 0 && deltas[n.id] && (
                    <text className="delta-badge" y={-R - 8} textAnchor="middle">
                      {deltas[n.id]}
                    </text>
                  )}
                </motion.g>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="graph-legend">
        <div className="row"><span className="dot" style={{ background: "transparent", border: "1.5px dashed #c2b6a0" }} /> 미학습</div>
        <div className="row"><span className="dot" style={{ background: hexA("#1a9d73", 0.22), border: "2px solid var(--glow)" }} /> 배움</div>
        <div className="row"><span className="dot" style={{ background: "var(--glow)" }} /> 내값있음</div>
        <div className="row" style={{ marginTop: 4 }}><span style={{ width: 16, borderTop: "1.3px dashed #bfae92" }} /> 영역 간 연결</div>
      </div>

      <div className="graph-toolbar">
        <button onClick={() => zoomBy(1.2)} aria-label="확대">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={() => zoomBy(1 / 1.2)} aria-label="축소">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={fitView} aria-label="한눈에 보기" title="한눈에 보기">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 4 2 9 7 9" />
            <path d="M4.2 14a8 8 0 1 0 1.8-8.3L2 9" />
          </svg>
        </button>
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
