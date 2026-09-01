// ─────────────────────────────────────────────────────────────
// 레벨/경험치 — 학생도 재미있게. 노드 배움·내값·단계 완료·할 일 체크가 XP.
// ─────────────────────────────────────────────────────────────

export const LEVELS = [
  { lv: 1, min: 0, title: "집짓기 알", emoji: "🥚" },
  { lv: 2, min: 10, title: "종잣돈 병아리", emoji: "🐣" },
  { lv: 3, min: 25, title: "대출 견습생", emoji: "🔑" },
  { lv: 4, min: 45, title: "청약 도전자", emoji: "🎯" },
  { lv: 5, min: 70, title: "임장 탐험가", emoji: "🧭" },
  { lv: 6, min: 100, title: "계약의 달인", emoji: "📜" },
  { lv: 7, min: 135, title: "내 집 마련 마스터", emoji: "🏆" },
];

const XP = { learned: 1, hasValue: 2, step: 8, todo: 1 };

export function calcXp(statuses, stepsDone, stepTodos) {
  let xp = 0;
  for (const id in statuses) {
    if (statuses[id] === "hasValue") xp += XP.hasValue;
    else if (statuses[id] === "learned") xp += XP.learned;
  }
  for (const sid in stepsDone || {}) if (stepsDone[sid]) xp += XP.step;
  for (const sid in stepTodos || {}) {
    xp += Object.values(stepTodos[sid]).filter(Boolean).length * XP.todo;
  }
  return xp;
}

export function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  const next = LEVELS.find((l) => l.min > xp) || null;
  const span = next ? next.min - cur.min : 1;
  return {
    ...cur,
    xp,
    next,
    progress: next ? Math.min(1, (xp - cur.min) / span) : 1,
    toNext: next ? next.min - xp : 0,
  };
}
