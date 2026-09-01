import { JOURNEY } from "../data/journey.js";
import { eok } from "../lib/format.js";
import HouseProgress from "./HouseProgress.jsx";

// 착지 화면. "지금 뭘 해야 하는지"가 한눈에. 7단계 타임라인 + 현재 단계 CTA.
export default function Roadmap({ name, state, pipeline, stepProgress, onOpenStep, onOpenMap }) {
  const currentIdx = JOURNEY.findIndex((s) => !stepProgress[s.id]?.done);
  const allDone = currentIdx === -1;

  return (
    <div className="road">
      <div className="road-hero">
        <HouseProgress stepProgress={stepProgress} size={132} />
        <h1 className="road-title">
          {allDone ? `${name}님, 집 완성! 🎉` : `${name}님의 집 구하기`}
        </h1>
        <p className="road-sub">
          {allDone ? "큰 그림은 다 봤어요. 실제 진행은 전문가와 확인하세요." : "순서대로 하나씩 하면 돼요. 지금 할 일부터 시작하세요."}
        </p>
      </div>

      <div className="road-list">
        {JOURNEY.map((s, i) => {
          const done = !!stepProgress[s.id]?.done;
          const current = i === currentIdx;
          const result = done ? shortResult(s.id, state.facts, pipeline) : null;
          return (
            <div
              key={s.id}
              className={`road-step${done ? " done" : ""}${current ? " current" : ""}${!done && !current ? " upcoming" : ""}`}
            >
              <div className="rs-rail">
                <div className="rs-dot">{done ? "✓" : s.num}</div>
                {i < JOURNEY.length - 1 && <div className="rs-line" />}
              </div>
              <button className="rs-body" onClick={() => onOpenStep(s.id)}>
                <div className="rs-head">
                  <span className="rs-title">{s.title}</span>
                  {result && <span className="rs-result">{result}</span>}
                </div>
                <p className="rs-blurb">{s.blurb}</p>
                {current && <span className="rs-cta">시작하기 →</span>}
                {done && <span className="rs-again">다시 보기</span>}
              </button>
            </div>
          );
        })}
      </div>

      <button className="guide-map-link" onClick={onOpenMap}>
        🗺️ 전체 지도로 보기 — 개념이 어떻게 얽혀 있는지
      </button>
    </div>
  );
}

function shortResult(id, f, p) {
  switch (id) {
    case "step1":
      return p.requiredCash != null ? `필요한 돈 ${eok(p.requiredCash)}` : null;
    case "step2":
      return p.savingGap != null ? (p.savingGap > 0 ? `${eok(p.savingGap)} 더 모으기` : "현금 준비됨") : null;
    case "step3":
      return p.isRegulated == null ? null : p.isRegulated ? "규제지역" : "비규제지역";
    case "step4":
      return p.subscriptionPoints != null ? `청약 ${p.subscriptionPoints}점` : null;
    default:
      return null;
  }
}
