import { motion } from "framer-motion";
import { JOURNEY } from "../data/journey.js";

// STEP 완료마다 집 부위가 스프링으로 조립된다.
const spring = { type: "spring", stiffness: 220, damping: 18 };

function Part({ show, delay = 0, children }) {
  return (
    <motion.g
      initial={false}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.8 }}
      transition={{ ...spring, delay: show ? delay : 0 }}
      style={{ transformOrigin: "center bottom" }}
    >
      {children}
    </motion.g>
  );
}

export default function HouseProgress({ stepProgress }) {
  const done = Object.fromEntries(JOURNEY.map((s) => [s.housePart, !!stepProgress[s.id]?.done]));
  const allDone = JOURNEY.every((s) => stepProgress[s.id]?.done);
  const doneCount = JOURNEY.filter((s) => stepProgress[s.id]?.done).length;

  return (
    <div className="panel-box" style={{ textAlign: "center" }}>
      <p className="panel-title" style={{ margin: 0 }}>내 집 짓기 {doneCount}/7</p>
      <motion.svg
        viewBox="0 0 200 176"
        width="100%"
        height="150"
        style={{ marginTop: 6, maxWidth: 260 }}
        animate={allDone ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={allDone ? { duration: 0.6 } : {}}
      >
        {/* 빈 대지(항상) */}
        <line x1="12" y1="158" x2="188" y2="158" stroke="var(--line)" strokeWidth="2" />

        {/* 1 기초 */}
        <Part show={done.foundation}>
          <rect x="42" y="150" width="116" height="10" rx="2" fill="#5b6b7d" />
        </Part>

        {/* 2 벽 */}
        <Part show={done.walls} delay={0.04}>
          <rect x="52" y="86" width="96" height="64" rx="2" fill={allDone ? "#2f6d55" : "#26374a"} stroke="var(--glow)" strokeWidth="2" />
        </Part>

        {/* 3 지붕 */}
        <Part show={done.roof} delay={0.08}>
          <path d="M44 88 L100 44 L156 88 Z" fill="#3a4d63" stroke="var(--glow)" strokeWidth="2" strokeLinejoin="round" />
        </Part>

        {/* 4 창문 */}
        <Part show={done.windows} delay={0.12}>
          <rect x="62" y="98" width="20" height="20" rx="1.5" fill={allDone ? "#ffd98a" : "#0f1720"} stroke="var(--glow)" strokeWidth="1.6" />
          <rect x="118" y="98" width="20" height="20" rx="1.5" fill={allDone ? "#ffd98a" : "#0f1720"} stroke="var(--glow)" strokeWidth="1.6" />
        </Part>

        {/* 5 문 */}
        <Part show={done.door} delay={0.16}>
          <rect x="90" y="120" width="20" height="30" rx="1.5" fill="#3a4d63" stroke="var(--glow)" strokeWidth="1.6" />
          <circle cx="105" cy="135" r="1.6" fill="var(--glow)" />
        </Part>

        {/* 6 울타리 */}
        <Part show={done.fence} delay={0.2}>
          {[20, 30, 40, 160, 170, 180].map((x) => (
            <rect key={x} x={x} y="142" width="4" height="16" rx="1" fill="#5b6b7d" />
          ))}
          <line x1="18" y1="147" x2="44" y2="147" stroke="#5b6b7d" strokeWidth="2.5" />
          <line x1="158" y1="147" x2="184" y2="147" stroke="#5b6b7d" strokeWidth="2.5" />
        </Part>

        {/* 7 열쇠 / 완성 */}
        <Part show={done.keys} delay={0.24}>
          <g transform="translate(150 128)">
            <circle cx="0" cy="0" r="6" fill="none" stroke="var(--accent)" strokeWidth="2.4" />
            <line x1="4" y1="4" x2="14" y2="14" stroke="var(--accent)" strokeWidth="2.4" />
            <line x1="11" y1="11" x2="14" y2="8" stroke="var(--accent)" strokeWidth="2.4" />
          </g>
        </Part>
      </motion.svg>

      <p className="muted" style={{ margin: "2px 0 0" }}>
        {allDone ? "🎉 내 집 완성 — 실제 계약은 전문가와 확인하세요" : "단계를 완료하면 집이 지어져요"}
      </p>
    </div>
  );
}
