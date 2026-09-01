import { motion } from "framer-motion";
import { JOURNEY } from "../data/journey.js";
import { AREAS } from "../data/nodes.js";
import Icon from "./Icon.jsx";

// 실제 집 구하는 순서. 각 단계는 자기 영역 색으로 표시(그래프 노드 색과 일치).
export default function StepRail({ current, stepProgress, onSelect }) {
  return (
    <div className="step-rail">
      {JOURNEY.map((s) => {
        const p = stepProgress[s.id] || {};
        const active = s.id === current;
        const state = p.done ? "done" : p.inputsReady && p.factTotal > 0 ? "ready" : "todo";
        const c = AREAS[s.area]?.color || "var(--glow)";
        return (
          <button
            key={s.id}
            className={`step-chip step-${state}${active ? " active" : ""}`}
            style={{ "--c": c, ...(active ? { borderColor: c } : null) }}
            onClick={() => onSelect(s.id)}
          >
            <span
              className="step-dot"
              style={
                p.done
                  ? { background: c, color: "#fff", borderColor: c }
                  : state === "ready"
                  ? { borderColor: c, color: c, background: "color-mix(in srgb, " + c + " 14%, transparent)" }
                  : { borderColor: c, color: c }
              }
            >
              {p.done ? <Icon name="check" size={12} strokeWidth={3} /> : s.num}
            </span>
            <span className="step-name">{s.title}</span>
            {p.factTotal > 0 && !p.done && (
              <motion.span
                className="step-frac"
                key={p.filled}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {p.filled}/{p.factTotal}
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}
