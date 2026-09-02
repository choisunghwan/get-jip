import { JOURNEY } from "../data/journey.js";
import { eok } from "../lib/format.js";
import HouseProgress from "./HouseProgress.jsx";
import LevelBadge from "./LevelBadge.jsx";
import SessionFile from "./SessionFile.jsx";
import ShareButton from "./ShareButton.jsx";
import Icon from "./Icon.jsx";

// 착지 화면. "지금 뭘 해야 하는지"가 한눈에. 7단계 타임라인 + 현재 단계 CTA.
export default function Roadmap({ name, state, actions, pipeline, stepProgress, level, onOpenStep, onOpenReport }) {
  const currentIdx = JOURNEY.findIndex((s) => !stepProgress[s.id]?.done);
  const allDone = currentIdx === -1;

  return (
    <div className="road has-tabbar">
      <div className="road-hero">
        <HouseProgress stepProgress={stepProgress} size={128} />
        <h1 className="road-title">
          {allDone ? `${name}님의 집짓기 완성!` : `${name}님의 집짓기`}
        </h1>
        <LevelBadge level={level} />
        <p className="road-sub">
          {allDone ? "큰 그림은 다 봤어요. 실제 진행은 전문가와 확인하세요." : "순서대로 하나씩 하면 돼요. 지금 할 일부터 시작하세요."}
        </p>
        <div className="road-legend">
          <span><i className="rl-dot rl-done" /> 완료</span>
          <span><i className="rl-dot rl-current" /> 지금 할 단계</span>
          <span><i className="rl-dot rl-upcoming" /> 아직</span>
        </div>
        <div className="road-hero-btns">
          <button className="btn road-report-btn" onClick={onOpenReport}>
            <Icon name="scroll" size={14} /> 전체 리포트 보기·받기
          </button>
          <ShareButton className="btn ghost road-share-btn" label="친구에게 공유" size={13} />
        </div>
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
              style={{ "--c": s.color }}
            >
              <div className="rs-rail">
                <div className="rs-dot" style={done || current ? { background: done ? s.color : "transparent", borderColor: s.color, color: done ? "#fff" : s.color } : undefined}>
                  {done ? <Icon name="check" size={15} strokeWidth={3} /> : s.num}
                </div>
                {i < JOURNEY.length - 1 && (
                  <div className={`rs-line${done ? " on" : ""}`} style={done ? { background: s.color } : undefined} />
                )}
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

      <div className="road-tools">
        <SessionFile state={state} onLoad={actions.replaceState} mode="both" compact />
        <label className="road-localonly">
          <input
            type="checkbox"
            checked={!!state.localOnly}
            onChange={(e) => actions.setLocalOnly(e.target.checked)}
          />
          <span>서버에 저장 안 함 (이 브라우저 + 내 파일로만)</span>
        </label>
        <p className="muted" style={{ fontSize: 11, margin: "6px 0 0", lineHeight: 1.6 }}>
          입력값은 로그인 없이 익명으로만 쓰여요. 개인정보 수집·공유 없음.
        </p>
        <button
          className="btn ghost road-reset"
          onClick={() => {
            if (window.confirm("입력한 값과 진행 상황을 모두 지우고 처음부터 시작할까요?")) actions.reset();
          }}
        >
          처음부터 다시 시작 (초기화)
        </button>
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
