// 진행 상황을 '읽을 수 있는 HTML 리포트 + 복원용 JSON'이 든 파일 하나로.
// 더블클릭하면 리포트로 보이고, 그 파일을 앱에 올리면 state 복원.
import { NODES, AREAS } from "../data/nodes.js";
import { JOURNEY } from "../data/journey.js";
import { calculate } from "../engine/calculate.js";
import { getRuleSet } from "../data/ruleSets.js";
import { calcXp, levelFor } from "../data/levels.js";
import { resolveNodeValue } from "../hooks/useAppState.js";
import { formatValue, eok } from "./format.js";

const MARKER_ID = "jibjit-state";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function buildSessionHtml(state) {
  const pipeline = calculate(state.facts, getRuleSet(state.ruleSetVersion));
  const statuses = {};
  for (const n of NODES) {
    const v = resolveNodeValue(n, state.facts, pipeline);
    statuses[n.id] =
      v !== undefined && v !== null && v !== ""
        ? "hasValue"
        : state.learned[n.id] || (n.value?.source === "fact" && state.facts[n.value.key] !== undefined)
        ? "learned"
        : "unlearned";
  }
  const level = levelFor(calcXp(statuses, state.stepsDone, state.stepTodos));
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const num = (v, kind = "won") => (v == null ? "—" : kind === "won" ? eok(v) : formatValue(kind, v));
  const summaryRows = [
    ["목표 집값", num(state.facts.targetPrice)],
    ["살 수 있는 집(추정)", num(pipeline.affordablePrice)],
    ["빌릴 수 있는 돈", num(pipeline.loanLimit)],
    ["지금 필요한 현금", num(pipeline.requiredCash)],
    ["더 모아야", pipeline.savingGap == null ? "—" : pipeline.savingGap > 0 ? eok(pipeline.savingGap) : "충분"],
    ["청약 예상 가점", pipeline.subscriptionPoints == null ? "—" : `${pipeline.subscriptionPoints}점`],
  ];

  const doneSteps = JOURNEY.filter((s) => state.stepsDone[s.id]).map((s) => s.title);
  const factRows = NODES.filter((n) => statuses[n.id] === "hasValue" && n.value?.source === "fact").map(
    (n) => [n.label, num(resolveNodeValue(n, state.facts, pipeline), n.value.kind)]
  );
  const learnedList = NODES.filter(
    (n) => statuses[n.id] !== "unlearned" && !(statuses[n.id] === "hasValue" && n.value?.source === "fact")
  ).map((n) => `${AREAS[n.area].label} · ${n.label}`);

  const tbl = (rows) =>
    `<table>${rows.map((r) => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>`;

  const body = `
<h1>${esc(state.userName)}님의 집짓기 진행</h1>
<p class="meta">저장 시각 ${stamp} · LV ${level.lv} ${esc(level.title)}</p>

<h2>지금 상황</h2>
${tbl(summaryRows)}

<h2>완료한 단계 (${doneSteps.length} / 7)</h2>
${doneSteps.length ? `<ul>${doneSteps.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "<p>아직 없음</p>"}

<h2>입력한 값</h2>
${factRows.length ? tbl(factRows) : "<p>아직 없음</p>"}

<h2>배운 개념 (${learnedList.length})</h2>
${learnedList.length ? `<ul>${learnedList.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "<p>아직 없음</p>"}

<hr>
<p class="foot">이 파일을 <a href="https://get-jip.ttubeogi.workers.dev">집짓기</a> 첫 화면에 올리면 여기서 이어서 할 수 있어요.<br>
계산·규칙 수치는 근사치입니다. 최종 확정은 은행·공인중개사·법무사와 확인하세요.</p>
<script type="application/json" id="${MARKER_ID}">${JSON.stringify(state)}</script>`;

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>집짓기 진행 — ${esc(state.userName)} · ${stamp.slice(0, 10)}</title>
<style>
  body{font-family:-apple-system,"Segoe UI","Noto Sans KR",sans-serif;max-width:640px;margin:32px auto;padding:0 20px;color:#2c2824;line-height:1.6}
  h1{font-size:22px;margin:0 0 4px}
  h2{font-size:15px;margin:26px 0 8px;color:#8c8478}
  .meta{color:#8c8478;font-size:13px;margin:0}
  table{border-collapse:collapse;width:100%}
  th,td{border-bottom:1px solid #e7ddcd;padding:8px 4px;text-align:left;font-size:14px}
  th{color:#8c8478;font-weight:600;width:45%}
  td{font-weight:700}
  ul{margin:0;padding-left:18px}
  li{font-size:14px;margin:2px 0}
  hr{border:none;border-top:1px solid #e7ddcd;margin:26px 0 14px}
  .foot{font-size:12px;color:#8c8478}
  a{color:#1a9d73}
</style></head><body>${body}</body></html>`;
}

export function downloadSessionHtml(state) {
  const html = buildSessionHtml(state);
  const d = new Date();
  const name = `집짓기_${state.userName || "진행"}_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.html`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 업로드한 파일 텍스트에서 state 를 뽑는다. 실패 시 null */
export function parseSessionFile(text) {
  try {
    const m = text.match(
      new RegExp(`<script[^>]*id=["']${MARKER_ID}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i")
    );
    const raw = m ? m[1] : text; // 마커 없으면 순수 JSON 파일도 허용
    const obj = JSON.parse(raw.trim());
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
    if (!("facts" in obj) && !("userName" in obj)) return null;
    return obj;
  } catch {
    return null;
  }
}
