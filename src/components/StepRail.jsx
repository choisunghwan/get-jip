import { motion } from "framer-motion";
import { JOURNEY } from "../data/journey.js";

// 실제 집 구하는 순서. 누르면 그 단계로 포커스(그래프가 해당 노드만 밝힘).
export default function StepRail({ current, stepProgress, onSelect }) {
  return (
    <div className="step-rail">
      {JOURNEY.map((s) => {
        const p = stepProgress[s.id] || {};
        const active = s.id === current;
        const state = p.done ? "done" : p.inputsReady && p.factTotal > 0 ? "ready" : "todo";
        return (
          <button
            key={s.id}
            className={`step-chip${active ? " active" : ""} step-${state}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="step-dot">
              {p.done ? "✓" : s.num}
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
