// 진행 상황을 '읽을 수 있는 HTML 리포트 + 복원용 JSON'이 든 파일 하나로.
// 더블클릭하면 리포트로 보이고, 그 파일을 앱에 올리면 state 복원.
import { buildReportModel } from "./reportModel.js";

const MARKER_ID = "jibjit-state";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function buildSessionHtml(state) {
  const m = buildReportModel(state);
  const kv = (rows) =>
    `<table>${rows.map((r) => `<tr><th>${esc(r.k)}</th><td>${esc(r.v)}</td></tr>`).join("")}</table>`;

  const stepBlocks = m.steps
    .map((s) => {
      const tag = s.done ? "완료" : m.currentStep && m.currentStep.id === s.id ? "지금 할 단계" : "아직";
      const body = s.verdict
        ? `<p class="v">${esc(s.verdict)}</p>${s.rows.length ? kv(s.rows) : ""}`
        : `<p class="dim">${esc(s.blurb)}</p>`;
      return `<div class="step"><h3><span class="n" style="background:${s.color}">${s.num}</span> ${esc(s.title)} <em>${tag}</em></h3>${body}</div>`;
    })
    .join("");

  const body = `
<h1>${esc(m.hon)}의 집짓기 리포트</h1>
<p class="meta">${esc(m.stamp)} 기준 · LV ${m.level.lv} ${esc(m.level.title)} · 집 짓기 ${m.doneCount}/7</p>

<h2>지금 상황 한눈에</h2>
${kv(m.summary)}

<h2>단계별 정리</h2>
${stepBlocks}

${
  m.nextTodos.length
    ? `<h2>다음에 실제로 할 일 (${esc(m.currentStep.title)})</h2><ul>${m.nextTodos
        .map((t) => `<li>${esc(t)}</li>`)
        .join("")}</ul>`
    : ""
}

<h2>입력한 값 (${m.facts.length})</h2>
${m.facts.length ? kv(m.facts) : "<p class='dim'>아직 없음</p>"}

<h2>배운 개념 (${m.learned.length})</h2>
${
  m.learned.length
    ? `<ul>${m.learned.map((x) => `<li>${esc(x.area)} · ${esc(x.label)}</li>`).join("")}</ul>`
    : "<p class='dim'>아직 없음</p>"
}

<hr>
<p class="foot">이 파일을 <a href="https://get-jip.ttubeogi.workers.dev">집짓기</a> 첫 화면에 올리면 여기서 이어서 할 수 있어요.<br>
계산·규칙 수치는 근사치입니다. 최종 확정은 은행 사전심사·공인중개사·법무사와 확인하세요.</p>
<script type="application/json" id="${MARKER_ID}">${JSON.stringify(state)}</script>`;

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>집짓기 리포트 — ${esc(m.name)} · ${esc(m.dateOnly)}</title>
<style>
  body{font-family:-apple-system,"Segoe UI","Noto Sans KR",sans-serif;max-width:660px;margin:32px auto;padding:0 20px;color:#2c2824;line-height:1.65}
  h1{font-size:22px;margin:0 0 4px}
  h2{font-size:15px;margin:28px 0 10px;color:#8c8478}
  h3{font-size:14px;margin:16px 0 6px;display:flex;align-items:center;gap:7px}
  h3 .n{color:#fff;width:20px;height:20px;border-radius:50%;display:inline-grid;place-items:center;font-size:12px;flex:none}
  h3 em{font-style:normal;font-size:11px;color:#8c8478;font-weight:400}
  .meta{color:#8c8478;font-size:13px;margin:0}
  .step{border-left:2px solid #e7ddcd;padding:2px 0 8px 12px;margin-bottom:6px}
  .v{font-weight:700;margin:2px 0 8px}
  .dim{color:#8c8478;margin:2px 0}
  table{border-collapse:collapse;width:100%;margin:6px 0}
  th,td{border-bottom:1px solid #e7ddcd;padding:7px 4px;text-align:left;font-size:13.5px}
  th{color:#8c8478;font-weight:600;width:52%}
  td{font-weight:700}
  ul{margin:0;padding-left:18px}
  li{font-size:13.5px;margin:2px 0}
  hr{border:none;border-top:1px solid #e7ddcd;margin:26px 0 14px}
  .foot{font-size:12px;color:#8c8478}
  a{color:#1a9d73}
</style></head><body>${body}</body></html>`;
}

export function downloadSessionHtml(state) {
  const html = buildSessionHtml(state);
  const d = new Date();
  const p2 = (x) => String(x).padStart(2, "0");
  const name = `집짓기_${state.userName || "진행"}_${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}.html`;
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
