// 값 표시 포맷 + 재계산 변화량(delta) 라벨.

export function won(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const neg = n < 0;
  const abs = Math.round(Math.abs(n));
  const eok = Math.floor(abs / 1e8);
  const man = Math.round((abs % 1e8) / 1e4);
  let s = "";
  if (eok) s += `${eok.toLocaleString()}억`;
  if (man) s += `${eok ? " " : ""}${man.toLocaleString()}만`;
  if (!s) s = "0";
  return `${neg ? "-" : ""}${s}원`;
}

export function percent(r) {
  return r == null ? "—" : `${Math.round(r * 1000) / 10}%`;
}

/** 이름 존칭. 이름 없거나 기본값이면 "나". */
export function hon(name) {
  return name && name !== "나" ? `${name}님` : "나";
}

/** 짧은 금액 표기: 3.5억 / 5,000만 / 0 */
export function eok(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  if (abs >= 1e8) {
    const v = abs / 1e8;
    return `${sign}${abs % 1e8 ? v.toFixed(1) : v.toFixed(0)}억`;
  }
  if (abs >= 1e4) return `${sign}${Math.round(abs / 1e4).toLocaleString()}만`;
  return `${sign}${abs}`;
}

export function months(m) {
  if (m == null) return "—";
  if (m === 0) return "지금 가능";
  const y = Math.floor(m / 12);
  const mm = m % 12;
  return [y ? `${y}년` : "", mm ? `${mm}개월` : ""].filter(Boolean).join(" ") || "0개월";
}

export function bool(b) {
  return b == null ? "—" : b ? "예" : "아니오";
}

export function points(p) {
  return p == null ? "—" : `${p}점`;
}

export function people(v) {
  return v == null ? "—" : `${v}명`;
}

export function formatValue(kind, v) {
  switch (kind) {
    case "won": return won(v);
    case "percent": return percent(v);
    case "months": return months(v);
    case "bool": return bool(v);
    case "points": return points(v);
    case "people": return people(v);
    default: return v == null ? "—" : String(v);
  }
}

/** 재계산 전/후 값 차이를 사람이 읽는 배지 문자열로. 변화 없으면 null. */
export function deltaLabel(kind, prev, next) {
  if (prev == null || next == null) {
    if (prev == null && next != null) return "새 값";
    return null;
  }
  if (kind === "bool") {
    if (prev === next) return null;
    return next ? "→ 예" : "→ 아니오";
  }
  if (typeof prev !== "number" || typeof next !== "number") return null;
  const d = next - prev;
  const eps = kind === "percent" ? 0.0005 : kind === "points" ? 0.5 : 1;
  if (Math.abs(d) < eps) return null;
  const arrow = d > 0 ? "▲" : "▼";
  if (kind === "percent") return `${arrow}${Math.abs(Math.round(d * 1000) / 10)}%p`;
  if (kind === "points") return `${arrow}${Math.abs(Math.round(d))}점`;
  if (kind === "people") return `${arrow}${Math.abs(Math.round(d))}명`;
  if (kind === "months") return `${arrow}${months(Math.abs(d))}`;
  return `${arrow}${won(Math.abs(d))}`;
}
