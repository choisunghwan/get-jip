// full: 이모지 + LV n · 칭호 + XP 바.  compact: 🔑 LV 3
export default function LevelBadge({ level, compact }) {
  if (compact) {
    return (
      <span className="lv-chip" title={level.title}>
        {level.emoji} LV {level.lv}
      </span>
    );
  }
  return (
    <div className="lv-full">
      <div className="lv-full-top">
        <span className="lv-emoji">{level.emoji}</span>
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
