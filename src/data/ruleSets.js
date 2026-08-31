// ─────────────────────────────────────────────────────────────
// RegulationRuleSet — 규제 레이어. 절대 계산 코드에 하드코딩하지 않는다.
// 여기 값만 바꿔도 calculate() 결과(= 내 파이프라인 전체)가 다시 계산된다.
// 초기엔 정적 배열, 이후 Supabase 테이블로 이관 예정.
//
// ⚠️ 모든 수치는 데모용 근사치다. 실제 규제 수치는 시행령·은행별로 다르며
//    최종 확정은 은행 사전심사에서만 가능하다. UI에서 항상 "참고용" 명시.
// ─────────────────────────────────────────────────────────────

/** @typedef {import('../engine/calculate.js').RuleSet} RuleSet */

export const RULE_SETS = [
  {
    version: "2026-08-current",
    effectiveFrom: "2026-07-01",
    label: "현행 (비규제지역 기준)",
    ltv: {
      normal: 0.7,
      firstTime: 0.8,
      regulatedNormal: 0.5,
      regulatedFirstTime: 0.6,
    },
    dsr: { threshold: 0.4, stressRate: 0.015 },
    mortgageBaseRate: 0.04,
    loanTermYears: 30,
    jeonseLoanBlocked: false,
    regulatedAreas: [],
    acquisitionTaxRate: { under6: 0.011, sixToNine: 0.02, overNine: 0.03 },
    firstTimeAcqTaxReliefCap: 2_000_000,
    specialSupplyRatio: 0.5,
    subscriptionPointMax: 84,
    incomeThresholdByHousehold: { 1: 46_000_000, 2: 70_000_000, 3: 90_000_000, 4: 100_000_000, 5: 108_000_000 },
    note:
      "현행 기준입니다. 비규제지역은 생애최초 최대 80%까지 주택담보대출이 가능하고, " +
      "DSR 40%·스트레스 금리 1.5%p가 적용됩니다. 전세자금대출에 별도 제한은 없습니다.",
  },
  {
    version: "2026-09-regulated",
    effectiveFrom: "2026-09-01",
    label: "규제지역 지정 시나리오",
    ltv: {
      normal: 0.5,
      firstTime: 0.6,
      regulatedNormal: 0.4,
      regulatedFirstTime: 0.5,
    },
    dsr: { threshold: 0.35, stressRate: 0.03 },
    mortgageBaseRate: 0.04,
    loanTermYears: 30,
    jeonseLoanBlocked: true,
    regulatedAreas: ["서울", "성남 분당", "과천", "하남", "광명"],
    acquisitionTaxRate: { under6: 0.011, sixToNine: 0.02, overNine: 0.03 },
    firstTimeAcqTaxReliefCap: 2_000_000,
    specialSupplyRatio: 0.4,
    subscriptionPointMax: 84,
    incomeThresholdByHousehold: { 1: 42_000_000, 2: 64_000_000, 3: 82_000_000, 4: 92_000_000, 5: 100_000_000 },
    note:
      "관심 지역이 규제지역으로 지정된 상황을 가정합니다. LTV가 조여지고(생애최초도 규제지역 50%), " +
      "DSR 기준이 35%로, 스트레스 금리가 3%p로 올랐습니다. 갭투자성 전세자금대출은 막혔습니다. " +
      "입력값은 그대로인데 대출 한도·필요 현금이 줄줄이 다시 계산됩니다.",
  },
];

export const DEFAULT_RULE_SET_VERSION = RULE_SETS[0].version;

export function getRuleSet(version) {
  return RULE_SETS.find((r) => r.version === version) || RULE_SETS[0];
}
