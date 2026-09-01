import { JOURNEY } from "../data/journey.js";
import { eok } from "../lib/format.js";
import HouseProgress from "./HouseProgress.jsx";
import LevelBadge from "./LevelBadge.jsx";
import Icon from "./Icon.jsx";

// 착지 화면. "지금 뭘 해야 하는지"가 한눈에. 7단계 타임라인 + 현재 단계 CTA.
export default function Roadmap({ name, state, pipeline, stepProgress, level, onOpenStep, onOpenMap, onOpenList }) {
  const currentIdx = JOURNEY.findIndex((s) => !stepProgress[s.id]?.done);
  const allDone = currentIdx === -1;

  return (
    <div className="road">
      <div className="road-hero">
        <HouseProgress stepProgress={stepProgress} size={128} />
        <h1 className="road-title">
          {allDone ? `${name}님의 집짓기 완성!` : `${name}님의 집짓기`}
        </h1>
        <LevelBadge level={level} />
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
                <div className="rs-dot">{done ? <Icon name="check" size={15} strokeWidth={3} /> : s.num}</div>
                {i < JOURNEY.length - 1 && <div className="rs-line" />}
              </div>
              <button className="rs-body" onClick={() => onOpenStep(s.id, { toReport: done })}>
                <div className="rs-head">
                  <span className="rs-title">{s.title}</span>
                  {result && <span className="rs-result">{result}</span>}
                </div>
                <p className="rs-blurb">{s.blurb}</p>
                {current && <span className="rs-cta">시작하기 →</span>}
                {done && <span className="rs-again"><Icon name="list" size={11} /> 리포트 다시 보기</span>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="guide-view-links">
        <button onClick={onOpenList}><Icon name="list" size={13} /> 전체 항목 목록</button>
        <button onClick={onOpenMap}><Icon name="map" size={13} /> 전체 지도</button>
      </div>
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
