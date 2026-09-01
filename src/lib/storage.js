// 저장소 어댑터.
// - 캐시: localStorage (동기, 즉시). 새로고침 시 바로 복원.
// - 원본: Cloudflare D1 (/api/state, Worker 가 처리). 기기 간 유지.
//
// /api 가 없는 환경(로컬 `npm run dev`)에서는 loadRemote 가 undefined 를
// 돌려주고 localStorage 만 쓰인다.

const KEY = "seonghwan-house/v1";
const UID_KEY = "seonghwan-house/uid";

function getUid() {
  try {
    let u = localStorage.getItem(UID_KEY);
    if (!u) {
      u = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
      localStorage.setItem(UID_KEY, u);
    }
    return u;
  } catch {
    return "anon";
  }
}

// ── localStorage 캐시 ──
export function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 사생활 모드 등 */
  }
}

// ── 원격 (D1) ──
/** @returns {Promise<object|null|undefined>} 객체=원격값, null=행 없음, undefined=원격 사용 불가 */
export async function loadRemote() {
  try {
    const r = await fetch(`/api/state?uid=${encodeURIComponent(getUid())}`, { cache: "no-store" });
    if (!r.ok) return undefined;
    return await r.json();
  } catch {
    return undefined;
  }
}

async function saveRemote(state) {
  try {
    await fetch("/api/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uid: getUid(), data: state }),
      keepalive: true,
    });
  } catch {
    /* 오프라인 등 — localStorage 캐시는 이미 저장됨 */
  }
}

/** 로컬은 즉시, 원격은 호출부에서 디바운스해서 부른다 */
export function saveState(state, { remote = true } = {}) {
  saveLocal(state);
  if (remote) saveRemote(state);
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  saveRemote(null);
}
