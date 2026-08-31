// 저장소 어댑터.
// MVP: localStorage. Phase 2: 아래 인터페이스 그대로 Supabase 구현으로 교체.
//   loadState(): AppState | null
//   saveState(state): void
// (Supabase 이관 시 async 로 바꾸고 App 에서 await/effect 처리)

const KEY = "seonghwan-house/v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 사생활 모드 등 — 저장 실패해도 앱은 동작
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
