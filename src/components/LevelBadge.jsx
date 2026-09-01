import Icon from "./Icon.jsx";

// full: 아이콘 + LV n · 칭호 + XP 바.  compact: [아이콘] LV 3
export default function LevelBadge({ level, compact }) {
  if (compact) {
    return (
      <span className="lv-chip" title={level.title}>
        <Icon name={level.icon} size={12} /> LV {level.lv}
      </span>
    );
  }
  return (
    <div className="lv-full">
      <div className="lv-full-top">
        <Icon name={level.icon} size={20} className="lv-emoji" />
        <span className="lv-name">
          LV {level.lv} · {level.title}
        </span>
      </div>
      <div className="lv-bar">
        <span style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </div>
      <p className="lv-hint">
        {level.next ? `다음 레벨까지 ${level.toNext} XP` : "최고 레벨 달성!"}
      </p>
    </div>
  );
}
