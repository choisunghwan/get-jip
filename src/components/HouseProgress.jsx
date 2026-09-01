import { motion } from "framer-motion";
import { JOURNEY } from "../data/journey.js";

// 처음엔 '빈 터 + 설계도(점선)', STEP 완료마다 부위가 색을 입고 채워진다.
const spring = { type: "spring", stiffness: 200, damping: 18 };

function Part({ done, delay = 0, ghost, solid }) {
  return (
    <g>
      {/* 설계도(항상 보임) */}
      <g opacity={done ? 0 : 0.5} style={{ transition: "opacity .3s" }}>{ghost}</g>
      {/* 완성된 부위 */}
      <motion.g
        initial={false}
        animate={done ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
        transition={{ ...spring, delay: done ? delay : 0 }}
        style={{ transformOrigin: "center bottom" }}
      >
        {solid}
      </motion.g>
    </g>
  );
}

export default function HouseProgress({ stepProgress, size = 150 }) {
  const done = Object.fromEntries(JOURNEY.map((s) => [s.housePart, !!stepProgress[s.id]?.done]));
  const doneCount = JOURNEY.filter((s) => stepProgress[s.id]?.done).length;
  const allDone = doneCount === JOURNEY.length;

  const dash = { fill: "none", stroke: "#c2b6a0", strokeWidth: 2, strokeDasharray: "4 4", strokeLinejoin: "round" };

  return (
    <div style={{ textAlign: "center" }}>
      <motion.svg
        viewBox="0 0 240 176"
        width="100%"
        height={size}
        style={{ maxWidth: 300, display: "block", margin: "0 auto" }}
        animate={allDone ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={allDone ? { duration: 0.7 } : {}}
      >
        {/* 잔디/땅 */}
        <rect x="0" y="152" width="240" height="24" fill="#e9e0cf" />
        <line x1="8" y1="152" x2="232" y2="152" stroke="#cdbfa2" strokeWidth="2" />

        {/* 1 기초 */}
        <Part
          done={done.foundation}
          ghost={<rect x="56" y="146" width="128" height="10" rx="2" {...dash} />}
          solid={<rect x="56" y="146" width="128" height="10" rx="2" fill="#a98a63" />}
        />
        {/* 2 벽 */}
        <Part
          done={done.walls}
          delay={0.03}
          ghost={<rect x="66" y="82" width="108" height="64" {...dash} />}
          solid={<rect x="66" y="82" width="108" height="64" rx="2" fill="#f3e7d3" stroke="#b98d5e" strokeWidth="2.5" />}
        />
        {/* 3 지붕 */}
        <Part
          done={done.roof}
          delay={0.06}
          ghost={<path d="M58 84 L120 40 L182 84 Z" {...dash} />}
          solid={<path d="M58 84 L120 40 L182 84 Z" fill="#cf7a4b" stroke="#a85f38" strokeWidth="2.5" strokeLinejoin="round" />}
        />
        {/* 4 창문 */}
        <Part
          done={done.windows}
          delay={0.09}
          ghost={<g><rect x="78" y="96" width="22" height="22" {...dash} /><rect x="140" y="96" width="22" height="22" {...dash} /></g>}
          solid={
            <g>
              <rect x="78" y="96" width="22" height="22" rx="2" fill={allDone ? "#ffe6a8" : "#bfe0f2"} stroke="#7c8b96" strokeWidth="2" />
              <rect x="140" y="96" width="22" height="22" rx="2" fill={allDone ? "#ffe6a8" : "#bfe0f2"} stroke="#7c8b96" strokeWidth="2" />
            </g>
          }
        />
        {/* 5 문 */}
        <Part
          done={done.door}
          delay={0.12}
          ghost={<rect x="108" y="118" width="24" height="28" {...dash} />}
          solid={
            <g>
              <rect x="108" y="118" width="24" height="28" rx="2" fill="#8a5a3c" stroke="#6e4630" strokeWidth="2" />
              <circle cx="127" cy="133" r="1.8" fill="#f3e7d3" />
            </g>
          }
        />
        {/* 6 울타리 */}
        <Part
          done={done.fence}
          delay={0.15}
          ghost={<g>{[24, 36, 48, 192, 204, 216].map((x) => <rect key={x} x={x} y="134" width="5" height="20" {...dash} />)}</g>}
          solid={
            <g>
              {[24, 36, 48, 192, 204, 216].map((x) => (
                <rect key={x} x={x} y="134" width="5" height="20" rx="1.5" fill="#c79a68" />
              ))}
              <line x1="22" y1="140" x2="55" y2="140" stroke="#c79a68" strokeWidth="3" />
              <line x1="190" y1="140" x2="223" y2="140" stroke="#c79a68" strokeWidth="3" />
            </g>
          }
        />
        {/* 7 굴뚝 + 연기(완성) */}
        <Part
          done={done.keys}
          delay={0.18}
          ghost={<rect x="150" y="52" width="14" height="22" {...dash} />}
          solid={
            <g>
              <rect x="150" y="52" width="14" height="24" rx="1.5" fill="#b06a45" stroke="#8a4f30" strokeWidth="1.6" />
              {allDone && (
                <motion.g
                  animate={{ y: [0, -6, 0], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  <circle cx="157" cy="46" r="5" fill="#d8d2c6" />
                  <circle cx="162" cy="38" r="4" fill="#d8d2c6" />
                </motion.g>
              )}
            </g>
          }
        />
      </motion.svg>
      <p className="muted" style={{ margin: "4px 0 0" }}>
        {allDone ? "내 집 완성!" : `집 짓기 ${doneCount} / 7`}
      </p>
    </div>
  );
}
