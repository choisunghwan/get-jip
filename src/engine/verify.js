// STEP 1 검증용 콘솔 스크립트: `npm run verify`
// 같은 UserFacts 로 규칙셋 2개를 돌려 결과가 실제로 달라지는지(= 재계산) 확인한다.
import { calculate } from "./calculate.js";
import { RULE_SETS } from "../data/ruleSets.js";

/** @type {import('./calculate.js').UserFacts} */
const facts = {
  firstTimeBuyer: true,
  annualIncome: 60_000_000,
  interestRegion: "서울",
  dealType: "매매",
  targetPrice: 800_000_000,
  seedSavings: 150_000_000,
  monthlySaving: 2_000_000,
  homelessMonths: 60,
  hasSubscriptionAccount: true,
  subscriptionMonths: 48,
  dependents: 1,
  officialPrice: 560_000_000,
};

const eok = (n) => (n == null ? "—" : `${(n / 1e8).toFixed(2)}억`);
const pct = (n) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`);

console.log("입력(UserFacts):");
console.table({
  생애최초: facts.firstTimeBuyer,
  연소득: eok(facts.annualIncome),
  관심지역: facts.interestRegion,
  거래유형: facts.dealType,
  목표집값: eok(facts.targetPrice),
  종잣돈: eok(facts.seedSavings),
});

const rows = RULE_SETS.map((rs) => {
  const p = calculate(facts, rs);
  return {
    규칙셋: rs.label,
    규제지역: p.isRegulated,
    "LTV율": pct(p.ltvRate),
    "LTV한도": eok(p.ltvLoan),
    "DSR한도": eok(p.dsrLoanLimit),
    "실대출한도": eok(p.loanLimit),
    병목: p.bindingConstraint,
    취득세: eok(p.acquisitionTax),
    부대비용: eok(p.incidentalCosts),
    필요현금: eok(p.requiredCash),
    부족분: eok(p.savingGap),
    "달성까지(개월)": p.monthsToClose,
    전세대출: p.jeonseLoanAvailable,
    청약가점: p.subscriptionPoints,
  };
});

console.log("\n같은 입력 · 규칙셋만 교체 → 재계산 결과:");
console.table(rows);

const [a, b] = rows;
const changed = Object.keys(a).filter((k) => a[k] !== b[k]);
console.log(`\n규칙셋 전환으로 값이 바뀐 항목 ${changed.length}개:`, changed.join(", "));
if (changed.length === 0) {
  console.error("❌ 재계산이 아무것도 안 바꿈 — 엔진 또는 규칙셋 확인 필요");
  process.exit(1);
}
console.log("✅ 재계산 엔진 동작 확인");
