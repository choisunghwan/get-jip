import SessionFile from "./SessionFile.jsx";
import ShareButton from "./ShareButton.jsx";
import Icon from "./Icon.jsx";

// 홈 화면을 깔끔하게 두기 위해 부가 기능을 전부 담는 바텀 시트.
export default function MoreSheet({ state, actions, onClose, onOpenReport, onOpenList, onOpenMap }) {
  const go = (fn) => () => {
    onClose();
    fn();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        <button className="sheet-row" onClick={go(onOpenReport)}>
          <Icon name="scroll" size={17} /> 전체 리포트 보기·받기
        </button>
        <ShareButton className="sheet-row" label="친구에게 링크 공유" size={17} />

        <div className="sheet-sep" />
        <p className="sheet-label">진행 저장</p>
        <div className="sheet-pad">
          <SessionFile state={state} onLoad={actions.replaceState} mode="both" compact />
        </div>
        <label className="sheet-check">
          <input
            type="checkbox"
            checked={!!state.localOnly}
            onChange={(e) => actions.setLocalOnly(e.target.checked)}
          />
          <span>서버에 저장 안 함 (이 브라우저 + 내 파일로만)</span>
        </label>

        <div className="sheet-sep" />
        <p className="sheet-label">다른 방식으로 보기 · 심화</p>
        <button className="sheet-row" onClick={go(onOpenMap)}>
          <Icon name="map" size={17} /> 개념 지도 (그래프)
        </button>
        <button className="sheet-row" onClick={go(onOpenList)}>
          <Icon name="list" size={17} /> 개념 전체 목록
        </button>

        <div className="sheet-sep" />
        <button
          className="sheet-row danger"
          onClick={() => {
            if (window.confirm("입력한 값과 진행 상황을 모두 지우고 처음부터 시작할까요?")) {
              actions.reset();
              onClose();
            }
          }}
        >
          처음부터 다시 시작 (초기화)
        </button>

        <p className="sheet-foot">입력값은 로그인 없이 익명으로만 쓰여요. 개인정보 수집·공유 없음.</p>
      </div>
    </div>
  );
}
