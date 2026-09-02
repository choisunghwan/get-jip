// 화면용 리포트 뷰와 다운로드 HTML이 같은 내용을 쓰도록 하는 공용 모델.
import { NODES, AREAS } from "../data/nodes.js";
import { JOURNEY } from "../data/journey.js";
import { calculate } from "../engine/calculate.js";
import { getRuleSet } from "../data/ruleSets.js";
import { calcXp, levelFor } from "../data/levels.js";
import { STEP_GUIDE } from "../data/narration.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue, eok, months, hon } from "./format.js";

function statusOf(n, facts, pipeline, learned) {
  const v = resolveNodeValue(n, facts, pipeline);
  if (v !== undefined && v !== null && v !== "") return "hasValue";
  if (learned[n.id] || (n.value?.source === "fact" && facts[n.value.key] !== undefined)) return "learned";
  return "unlearned";
}

export function buildReportModel(state) {
  const pipeline = calculate(state.facts, getRuleSet(state.ruleSetVersion));
  const statuses = {};
  for (const n of NODES) statuses[n.id] = statusOf(n, state.facts, pipeline, state.learned);
  const level = levelFor(calcXp(statuses, state.stepsDone, state.stepTodos));

  const d = new Date();
  const p2 = (x) => String(x).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;

  const num = (v, kind = "won") => (v == null ? "—" : kind === "won" ? eok(v) : formatValue(kind, v));

  const summary = [
    { k: "목표 집값", v: num(state.facts.targetPrice) },
    { k: "지금 살 수 있는 집(추정)", v: num(pipeline.affordablePrice), strong: true },
    { k: "빌릴 수 있는 돈", v: num(pipeline.loanLimit) },
    { k: "지금 필요한 현금", v: num(pipeline.requiredCash) },
    {
      k: "더 모아야",
      v: pipeline.savingGap == null ? "—" : pipeline.savingGap > 0 ? eok(pipeline.savingGap) : "충분",
    },
    { k: "청약 예상 가점", v: pipeline.subscriptionPoints == null ? "—" : `${pipeline.subscriptionPoints}점` },
    {
      k: "지금 속도로 달성까지",
      v: pipeline.monthsToClose == null ? "—" : pipeline.monthsToClose <= 0 ? "지금 가능" : months(pipeline.monthsToClose),
    },
  ];

  const steps = JOURNEY.map((s) => {
    const done = !!state.stepsDone[s.id];
    const g = STEP_GUIDE[s.id];
    let verdict = null;
    let rows = [];
    if (g) {
      const built = g.buildSummary(state.userName, state.facts, pipeline);
      verdict = built.verdict || built.headline || null;
      rows = (built.rows || []).filter((r) => !r.head).map((r) => ({ k: r.k, v: r.v }));
    }
    return { id: s.id, num: s.num, title: s.title, color: s.color, blurb: s.blurb, done, verdict, rows };
  });

  const currentStep = JOURNEY.find((s) => !state.stepsDone[s.id]) || null;
  const nextTodos = currentStep ? currentStep.todo : [];

  const learned = NODES.filter(
    (n) => statuses[n.id] !== "unlearned" && !(statuses[n.id] === "hasValue" && n.value?.source === "fact")
  ).map((n) => ({ area: AREAS[n.area].label, label: n.label }));

  const facts = NODES.filter((n) => statuses[n.id] === "hasValue" && n.value?.source === "fact").map((n) => ({
    k: n.label,
    v: num(resolveNodeValue(n, state.facts, pipeline), n.value.kind),
  }));

  return {
    name: state.userName || "사용자",
    hon: hon(state.userName),
    stamp,
    dateOnly: stamp.slice(0, 10),
    level,
    summary,
    steps,
    currentStep,
    nextTodos,
    learned,
    facts,
    doneCount: JOURNEY.filter((s) => state.stepsDone[s.id]).length,
  };
}
