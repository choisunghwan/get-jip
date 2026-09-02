import { useState } from "react";
import { JOURNEY } from "../data/journey.js";
import HouseProgress from "./HouseProgress.jsx";
import LevelBadge from "./LevelBadge.jsx";
import MoreSheet from "./MoreSheet.jsx";
import Icon from "./Icon.jsx";

// 착지 화면. 한눈에: 지금 어디인지 + 다음 한 걸음 + 7단계 목록. 나머지는 전부 '더보기'로.
export default function Roadmap({
  name,
  state,
  actions,
  stepProgress,
  level,
  onOpenStep,
  onOpenReport,
  onOpenList,
  onOpenMap,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const currentIdx = JOURNEY.findIndex((s) => !stepProgress[s.id]?.done);
  const allDone = currentIdx === -1;
  const current = allDone ? null : JOURNEY[currentIdx];
  const doneCount = JOURNEY.filter((s) => stepProgress[s.id]?.done).length;

  return (
    <div className="road">
      <header className="road-top">
        <div className="road-top-row">
          <h1 className="road-title">{name}님의 집짓기</h1>
          <button className="road-more" onClick={() => setMoreOpen(true)} aria-label="더보기">
            <Icon name="dots" size={20} />
          </button>
        </div>
        <LevelBadge level={level} />
      </header>

      <div className="road-scroll">
        {allDone ? (
          <div className="road-cta done">
            <HouseProgress stepProgress={stepProgress} size={104} />
            <span className="road-cta-kick">7단계 완료</span>
            <h2 className="road-cta-title">집짓기 큰 그림을 다 봤어요</h2>
            <p className="road-cta-blurb">실제 계약·대출은 전문가와 확인하세요.</p>
            <button className="btn primary road-cta-go" onClick={onOpenReport}>
              <Icon name="scroll" size={15} /> 내 리포트 보기
            </button>
          </div>
        ) : (
          <div className="road-cta">
            <span className="road-cta-kick">지금 할 일 · STEP {current.num} / 7</span>
            <h2 className="road-cta-title">{current.title}</h2>
            <p className="road-cta-blurb">{current.blurb}</p>
            <button className="btn primary road-cta-go" onClick={() => onOpenStep(current.id)}>
              {currentIdx === 0 ? "시작하기" : "이어서 하기"} →
            </button>
          </div>
        )}

        <ol className="road-steps">
          {JOURNEY.map((s, i) => {
            const done = !!stepProgress[s.id]?.done;
            const isCurrent = i === currentIdx;
            const tag = done ? "완료" : isCurrent ? "지금" : "아직";
            const tagCls = done ? "t-done" : isCurrent ? "t-now" : "t-wait";
            return (
              <li key={s.id}>
                <button
                  className={`rstep${done ? " done" : ""}${isCurrent ? " current" : ""}`}
                  onClick={() => onOpenStep(s.id, { toReport: done })}
                >
                  <span className="rstep-dot">
                    {done ? <Icon name="check" size={13} strokeWidth={3} /> : s.num}
                  </span>
                  <span className="rstep-title">{s.title}</span>
                  <span className={`rstep-tag ${tagCls}`}>{tag}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="road-progress-note">{doneCount} / 7 단계 완료</p>
      </div>

      {moreOpen && (
        <MoreSheet
          state={state}
          actions={actions}
          onClose={() => setMoreOpen(false)}
          onOpenReport={onOpenReport}
          onOpenList={onOpenList}
          onOpenMap={onOpenMap}
        />
      )}
    </div>
  );
}
