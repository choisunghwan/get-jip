// ─────────────────────────────────────────────────────────────
// 재계산 엔진의 심장.
//   calculate(userFacts, ruleSet) -> pipeline
// 순수 함수. 부수효과 없음. 같은 입력이면 같은 출력.
// ruleSet만 바꾸면 같은 userFacts에서 다른 pipeline이 나온다 → 자동 재계산.
//
// 모든 결과는 근사치다. pipeline.disclaimer 를 UI에 항상 노출할 것.
// 값을 아직 계산할 수 없으면(선행 팩트 없음) 해당 키는 null → 노드는 '배움' 상태 유지.
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} RuleSet
 * @property {string} version
 * @property {{normal:number, firstTime:number, regulatedNormal:number, regulatedFirstTime:number}} ltv
 * @property {{threshold:number, stressRate:number}} dsr
 * @property {number} mortgageBaseRate
 * @property {number} loanTermYears
 * @property {boolean} jeonseLoanBlocked
 * @property {string[]} regulatedAreas
 * @property {{under6:number, sixToNine:number, overNine:number}} acquisitionTaxRate
 * @property {number} firstTimeAcqTaxReliefCap
 * @property {Object<number, number>} incomeThresholdByHousehold
 */

/**
 * @typedef {Object} UserFacts   사용자가 실제로 "아는 것"만.
 * @property {boolean} [firstTimeBuyer]
 * @property {number}  [annualIncome]     세전 연소득(원)
 * @property {string}  [interestRegion]   관심 지역(예: "서울")
 * @property {"매매"|"전세"} [dealType]
 * @property {number}  [targetPrice]      목표 집값(원)
 * @property {number}  [seedSavings]      보유 종잣돈(원)
 * @property {number}  [monthlySaving]    월 저축액(원)
 * @property {number}  [homelessMonths]   무주택 기간(개월)
 * @property {boolean} [hasSubscriptionAccount]
 * @property {number}  [subscriptionMonths] 청약통장 가입기간(개월)
 * @property {number}  [dependents]       부양가족 수
 * @property {number}  [officialPrice]    공시가격(원)
 */

const LEGAL_FEE = 700_000; // 법무사 등기 대행 근사
const MOVING_MISC = 1_500_000; // 이사·중개 부대 잡비 근사

const num = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : null);

function isRegulatedRegion(region, ruleSet) {
  if (!region) return null;
  return ruleSet.regulatedAreas.some(
    (a) => region.includes(a) || a.includes(region)
  );
}

function pickLtvRate(firstTimeBuyer, regulated, ruleSet) {
  if (firstTimeBuyer == null || regulated == null) return null;
  if (regulated) return firstTimeBuyer ? ruleSet.ltv.regulatedFirstTime : ruleSet.ltv.regulatedNormal;
  return firstTimeBuyer ? ruleSet.ltv.firstTime : ruleSet.ltv.normal;
}

/** 원리금균등 30년 기준, 월상환액 1원당 필요 원금(역수) */
function annuityPrincipalPerMonthlyPayment(annualRate, years) {
  const i = annualRate / 12;
  const n = years * 12;
  if (i === 0) return n;
  const factor = i / (1 - Math.pow(1 + i, -n));
  return 1 / factor;
}

function acqTaxRate(price, ruleSet) {
  if (price <= 600_000_000) return ruleSet.acquisitionTaxRate.under6;
  if (price <= 900_000_000) return ruleSet.acquisitionTaxRate.sixToNine;
  return ruleSet.acquisitionTaxRate.overNine;
}

/** 매매 중개보수 상한요율 근사 */
function brokerageFee(price) {
  let rate;
  if (price < 200_000_000) rate = 0.005;
  else if (price < 900_000_000) rate = 0.004;
  else if (price < 1_200_000_000) rate = 0.005;
  else if (price < 1_500_000_000) rate = 0.006;
  else rate = 0.007;
  return Math.round(price * rate);
}

function subscriptionPoints(f) {
  const hasAny =
    num(f.homelessMonths) != null ||
    num(f.subscriptionMonths) != null ||
    num(f.dependents) != null;
  if (!hasAny) return null;
  // 무주택기간: 1년당 2점 + 기본 2점, 최대 32
  const homeless = Math.min(32, 2 + Math.floor((num(f.homelessMonths) ?? 0) / 12) * 2);
  // 청약통장 가입기간: 1년당 1점 + 기본 1점, 최대 17
  const account = Math.min(17, 1 + Math.floor((num(f.subscriptionMonths) ?? 0) / 12));
  // 부양가족: 기본 5점 + 1명당 5점, 최대 35
  const deps = Math.min(35, 5 + (num(f.dependents) ?? 0) * 5);
  return homeless + account + deps;
}

/**
 * @param {UserFacts} facts
 * @param {RuleSet} ruleSet
 */
export function calculate(facts, ruleSet) {
  const f = facts || {};

  const regulated = isRegulatedRegion(f.interestRegion, ruleSet);
  const ltvRate = pickLtvRate(f.firstTimeBuyer, regulated, ruleSet);

  const targetPrice = num(f.targetPrice);
  const annualIncome = num(f.annualIncome);
  const seedSavings = num(f.seedSavings);
  const monthlySaving = num(f.monthlySaving);

  // ── 대출 갈래 ──
  const ltvLoan =
    ltvRate != null && targetPrice != null ? Math.round(targetPrice * ltvRate) : null;

  const stressAppliedRate = ruleSet.mortgageBaseRate + ruleSet.dsr.stressRate;
  let dsrLoanLimit = null;
  if (annualIncome != null) {
    const perPay = annuityPrincipalPerMonthlyPayment(stressAppliedRate, ruleSet.loanTermYears);
    const maxMonthly = (annualIncome * ruleSet.dsr.threshold) / 12;
    dsrLoanLimit = Math.round(maxMonthly * perPay);
  }

  const caps = [ltvLoan, dsrLoanLimit].filter((v) => v != null);
  const loanLimit = caps.length ? Math.min(...caps) : null;
  const bindingConstraint =
    loanLimit == null ? null : loanLimit === ltvLoan ? "LTV" : "DSR";

  let jeonseLoanAvailable = null;
  if (f.dealType === "전세") jeonseLoanAvailable = !ruleSet.jeonseLoanBlocked;

  // ── 계약(세금·수수료) 갈래 ──
  let acquisitionTax = null;
  if (targetPrice != null) {
    const rate = acqTaxRate(targetPrice, ruleSet);
    let tax = targetPrice * rate;
    if (f.firstTimeBuyer) tax = Math.max(0, tax - ruleSet.firstTimeAcqTaxReliefCap);
    acquisitionTax = Math.round(tax);
  }
  const brokerage = targetPrice != null ? brokerageFee(targetPrice) : null;

  let incidentalCosts = null;
  if (acquisitionTax != null && brokerage != null) {
    incidentalCosts = acquisitionTax + brokerage + LEGAL_FEE + MOVING_MISC;
  }

  // ── 종잣돈 갈래 ──
  let requiredCash = null;
  if (targetPrice != null && loanLimit != null && incidentalCosts != null) {
    requiredCash = targetPrice - loanLimit + incidentalCosts;
  }
  let savingGap = null;
  if (requiredCash != null && seedSavings != null) savingGap = requiredCash - seedSavings;

  // 지금 현실적으로 살 수 있는 집값(근사): 종잣돈 + 대출한도 − 부대비용
  let affordablePrice = null;
  if (seedSavings != null && loanLimit != null && incidentalCosts != null) {
    affordablePrice = Math.max(0, seedSavings + loanLimit - incidentalCosts);
  }

  let monthsToClose = null;
  if (savingGap != null && monthlySaving) {
    monthsToClose = savingGap > 0 ? Math.ceil(savingGap / monthlySaving) : 0;
  }

  // ── 청약 갈래 ──
  const points = subscriptionPoints(f);
  let incomeCriteriaPass = null;
  if (annualIncome != null) {
    const household = (num(f.dependents) ?? 0) + 1;
    const table = ruleSet.incomeThresholdByHousehold;
    const threshold = table[household] ?? table[5] ?? table[Object.keys(table).length];
    incomeCriteriaPass = annualIncome <= threshold;
  }

  return {
    ruleSetVersion: ruleSet.version,
    // meta
    isRegulated: regulated,
    bindingConstraint,
    stressAppliedRate,
    // 대출
    ltvRate,
    ltvLoan,
    dsrLoanLimit,
    loanLimit,
    jeonseLoanAvailable,
    // 계약
    acquisitionTax,
    brokerageFee: brokerage,
    incidentalCosts,
    // 종잣돈
    requiredCash,
    savingGap,
    monthsToClose,
    affordablePrice,
    // 청약
    subscriptionPoints: points,
    incomeCriteriaPass,
    disclaimer:
      "근사치입니다. 최종 확정은 은행 사전심사·공인중개사·세무사와 확인하세요. " +
      "이 앱은 계약 전 감을 잡고 준비하는 도구이지 최종 의사결정 도구가 아닙니다.",
  };
}
