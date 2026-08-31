// ─────────────────────────────────────────────────────────────
// NodeEdge 시드 — 영역 내부 연결 + 영역 간 교차 연결.
// cross:true 인 엣지가 "뇌처럼 얽힘"의 핵심. 그래프에서 점선+강조로 그린다.
// ─────────────────────────────────────────────────────────────
import { NODE_BY_ID } from "./nodes.js";

const raw = [
  // ── 종잣돈 내부 ──
  ["target_price", "required_cash"],
  ["incidental_costs", "required_cash"],
  ["required_cash", "saving_gap"],
  ["seed_savings", "saving_gap"],
  ["saving_gap", "time_to_buy"],
  ["monthly_saving", "time_to_buy"],

  // ── 청약 내부 ──
  ["homeless_period", "subscription_points"],
  ["subscription_account", "subscription_points"],
  ["dependents", "subscription_points"],
  ["subscription_points", "special_supply"],
  ["income_criteria", "special_supply"],
  ["first_time_buyer", "special_supply"],

  // ── 대출 내부 ──
  ["ltv", "ltv_loan"],
  ["ltv_loan", "loan_limit"],
  ["dsr", "loan_limit"],
  ["stress_rate", "dsr"],
  ["mortgage_rate", "dsr"],
  ["annual_income", "dsr"],
  ["deal_type", "jeonse_loan"],
  ["mortgage_rate", "loan_limit"],

  // ── 매물 내부 ──
  ["interest_region", "regulated_area"],
  ["interest_region", "market_price"],
  ["official_price", "market_price"],
  ["market_price", "jeonse_ratio"],
  ["area_pyeong", "market_price"],

  // ── 계약 내부 ──
  ["acquisition_tax", "down_payment"],
  ["brokerage_fee", "down_payment"],
  ["registry_check", "special_terms"],
  ["down_payment", "special_terms"],

  // ── 교차 연결 (cross) ──
  ["first_time_buyer", "ltv", true], // 생애최초 우대
  ["homeless_period", "first_time_buyer", true], // 무주택 → 생애최초 판정
  ["regulated_area", "ltv", true], // 규제지역 → LTV 축소
  ["regulated_area", "jeonse_loan", true], // 규제지역 → 전세대출 차단
  ["market_price", "target_price", true], // 시세 → 목표 집값
  ["loan_limit", "target_price", true], // 빌릴 수 있는 만큼 집이 정해짐
  ["loan_limit", "required_cash", true], // 대출한도 → 필요 현금
  ["market_price", "ltv_loan", true], // 담보가치 → LTV 한도
  ["official_price", "acquisition_tax", true], // 공시가격 → 세금 기준
  ["target_price", "acquisition_tax", true], // 집값 구간 → 취득세율
  ["first_time_buyer", "acquisition_tax", true], // 생애최초 → 취득세 감면
  ["acquisition_tax", "incidental_costs", true], // 세금 → 부대비용
  ["brokerage_fee", "incidental_costs", true], // 수수료 → 부대비용
  ["annual_income", "income_criteria", true], // 소득 → 특공 소득기준
  ["jeonse_ratio", "jeonse_insurance", true], // 전세가율 → 보증보험 필요성
  ["jeonse_loan", "required_cash", true], // 전세대출 가능 여부 → 필요 현금
  ["deal_type", "ltv", true], // 거래유형 → 적용 규제
];

export const EDGES = raw.map(([from, to, cross = false]) => {
  if (!NODE_BY_ID[from] || !NODE_BY_ID[to]) {
    throw new Error(`edges.js: unknown node in edge ${from} -> ${to}`);
  }
  return { from, to, cross };
});

export const EDGES_BY_NODE = EDGES.reduce((acc, e) => {
  (acc[e.from] ||= []).push(e.to);
  (acc[e.to] ||= []).push(e.from);
  return acc;
}, {});
