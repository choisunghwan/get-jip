// ─────────────────────────────────────────────────────────────
// 가이드 모드에서 숫자를 '말'로 풀어주는 내레이션.
// 각 STEP: intro(왜/뭘) + buildSummary(내 숫자를 문장·표로).
// buildSummary -> { headline, rows:[{k,v,strong?}], soWhat, note? }
// ─────────────────────────────────────────────────────────────
import { eok, percent, months, hon } from "../lib/format.js";

export const HOUSE_PART_KO = {
  foundation: "기초",
  walls: "벽",
  roof: "지붕",
  windows: "창문",
  door: "문",
  fence: "울타리",
  keys: "열쇠",
};

export const STEP_GUIDE = {
  step1: {
    intro:
      "집값은 '내 돈 + 은행 돈 + 세금·수수료'로 채워져요. 이 단계에선 은행이 얼마까지 빌려주는지, " +
      "그래서 내가 현금이 얼마 있어야 하는지를 봅니다.",
    buildSummary(name, f, p) {
      if (p.loanLimit == null || p.requiredCash == null) {
        return {
          headline: "생애최초 여부·소득·목표 집값을 채우면 여기서 대출 가능액과 필요 현금이 나와요.",
          rows: [],
          soWhat: "",
        };
      }
      const reason =
        p.bindingConstraint === "DSR"
          ? "규정상으로는 더 빌릴 수 있지만, 소득으로 갚을 수 있는 한도(DSR)가 더 낮아서 그게 실제 한도가 됐어요."
          : "집값 대비 비율(LTV)이 소득 한도보다 빡빡해서 그게 한도를 정했어요.";
      const canBuy = p.affordablePrice != null;
      return {
        verdict: canBuy
          ? `지금 ${hon(name)} 살 수 있는 집은 약 ${eok(p.affordablePrice)}이에요.`
          : `${hon(name)} 빌릴 수 있는 돈은 약 ${eok(p.loanLimit)}이에요.`,
        verdictSub: canBuy
          ? `종잣돈 ${eok(f.seedSavings)} + 빌릴 수 있는 돈 ${eok(p.loanLimit)} − 세금·수수료 ${eok(p.incidentalCosts)}`
          : reason,
        headline: canBuy ? "" : reason,
        rows: [
          { k: `목표한 ${eok(f.targetPrice)} 집을 사려면`, v: "", head: true },
          { k: "집값", v: eok(f.targetPrice) },
          { k: "− 빌릴 수 있는 돈", v: eok(p.loanLimit) },
          { k: "＋ 세금·수수료", v: eok(p.incidentalCosts) },
          { k: "지금 있어야 하는 현금", v: eok(p.requiredCash), strong: true },
        ],
        soWhat: canBuy
          ? p.affordablePrice + 1e6 >= f.targetPrice
            ? `목표한 ${eok(f.targetPrice)} 집, 지금 조건으로 살 수 있어요! 다음 단계에서 종잣돈·저축 계획을 점검해요.`
            : `목표(${eok(f.targetPrice)})보다 낮아요. ${eok(p.affordablePrice)}대 매물을 보거나, 종잣돈을 더 모으거나, 소득을 올려 대출 한도를 키워야 해요.`
          : "다음 단계에서 내 종잣돈을 넣으면 '살 수 있는 집값'이 딱 나와요.",
        note: canBuy
          ? "가진 돈을 계약금·잔금에 전부 넣지 마세요. 이사·수리비 등 예상 못한 지출에 대비할 비상자금은 남겨두세요."
          : undefined,
      };
    },
  },

  step2: {
    intro:
      "STEP 1에서 나온 '부족분'을 매달 저축으로 언제 다 채우는지 계산해요. " +
      "청약통장이 없다면 이 단계에서 만듭니다.",
    buildSummary(name, f, p) {
      if (p.savingGap == null) {
        return {
          headline: "지금 가진 현금과 매달 저축액을 넣으면 부족분과 걸리는 기간이 나와요.",
          rows: [],
          soWhat: "",
        };
      }
      const enough = p.savingGap <= 0;
      const rows = [
        { k: "지금 필요한 현금", v: eok(p.requiredCash) },
        { k: "− 내 종잣돈", v: eok(f.seedSavings) },
        { k: "부족분", v: enough ? "없음" : eok(p.savingGap), strong: true },
      ];
      if (f.monthlySaving) rows.push({ k: "매달 저축", v: eok(f.monthlySaving) });
      return {
        verdict: enough
          ? "필요한 현금이 이미 준비돼 있어요. 바로 집을 알아봐도 돼요."
          : p.monthsToClose
          ? `지금 속도로 약 ${months(p.monthsToClose)} 뒤에 살 수 있어요.`
          : `${eok(p.savingGap)}을 더 모아야 해요.`,
        verdictSub: enough
          ? `종잣돈 ${eok(f.seedSavings)}이 필요한 현금 ${eok(p.requiredCash)}보다 많아요.`
          : `부족분 ${eok(p.savingGap)}${f.monthlySaving ? ` ÷ 월 저축 ${eok(f.monthlySaving)}` : ""}`,
        headline: "",
        rows,
        soWhat: enough
          ? "여유가 있으면 목표 집값을 조금 올려보거나, 더 좋은 위치를 봐도 돼요."
          : p.monthsToClose
          ? `지금 속도면 약 ${months(p.monthsToClose)} 걸려요. 기간이 길면 STEP 1로 돌아가 목표 집값을 낮춰보세요. 소득이 오르면 대출 한도가 늘어 부족분도 줄어요.`
          : "매달 저축액을 넣으면 걸리는 기간이 계산돼요.",
        note:
          f.subscriptionMonths == null || f.subscriptionMonths === 0
            ? "아직 청약통장이 없다면 오늘 만드세요 — 가입 기간이 곧 점수예요."
            : undefined,
      };
    },
  },

  step3: {
    intro:
      "같은 집이라도 어디냐에 따라 대출·세금·청약이 달라져요. 관심 지역이 규제지역인지, " +
      "시세와 전세가율은 어떤지 봅니다.",
    buildSummary(name, f, p) {
      const region = f.interestRegion || "미정";
      const rows = [];
      if (f.officialPrice != null) rows.push({ k: "공시가격", v: eok(f.officialPrice) });
      return {
        headline:
          p.isRegulated === true
            ? `관심 지역(${region})이 규제지역이에요. 대출 한도가 더 낮고, 자금조달계획서 같은 절차가 늘어요.`
            : `관심 지역(${region})은 지금은 비규제지역이에요. 대출·전매 제한이 상대적으로 느슨해요.`,
        rows,
        soWhat:
          "시세는 국토부 실거래가 공개시스템으로 확인하세요. 호가는 보통 그보다 높아요. " +
          "전세로 들어간다면 전세가율(전세가 ÷ 매매가)이 80%를 넘는지 꼭 보세요 — 넘으면 보증금을 못 돌려받을 위험이 커요.",
      };
    },
  },

  step4: {
    intro:
      "청약은 무주택 기간·청약통장 가입 기간·부양가족 수, 이 셋의 점수 싸움이에요. " +
      "내 예상 가점을 계산하고, 경쟁이 훨씬 약한 특별공급 자격을 봅니다.",
    buildSummary(name, f, p) {
      if (p.subscriptionPoints == null) {
        return {
          headline: "무주택 기간·청약통장 기간·부양가족을 넣으면 예상 가점이 나와요.",
          rows: [],
          soWhat: "",
        };
      }
      const pts = p.subscriptionPoints;
      const read =
        pts >= 60
          ? " 인기 단지도 노려볼 만한 점수예요."
          : pts >= 45
          ? " 비인기 단지나 특별공급을 노리는 게 현실적이에요."
          : " 일반공급 가점으로는 당첨이 어려워요. 대신 추첨 비중이 큰 '생애최초 특별공급'을 노리세요.";
      return {
        headline: `${hon(name)} 예상 청약 가점은 약 ${pts}점이에요 (최대 84점).` + read,
        rows: [
          { k: "무주택 기간", v: f.homelessMonths != null ? months(f.homelessMonths) : "—" },
          { k: "청약통장 기간", v: f.subscriptionMonths != null ? months(f.subscriptionMonths) : "—" },
          { k: "부양가족", v: `${f.dependents ?? 0}명` },
          { k: "예상 가점", v: `${pts}점`, strong: true },
        ],
        soWhat:
          p.incomeCriteriaPass === false
            ? "소득이 특별공급 기준을 넘어요. 맞벌이 완화 기준(예: 140%)이 있는 전형을 찾아보세요."
            : "특별공급은 경쟁이 훨씬 약해요. 자격이 되는 유형이 있는지 청약홈에서 꼭 확인하세요.",
      };
    },
  },

  step5: {
    intro:
      "여기까지 계산은 전부 '참고용 근사치'예요. 실제 한도는 은행 사전심사에서 정해져요. " +
      "그 전에 DSR에 잡히는 잔챙이 대출을 정리하고 금리를 비교합니다.",
    buildSummary(name, f, p) {
      const rows = [];
      if (p.loanLimit != null) rows.push({ k: "앱 예상 한도", v: eok(p.loanLimit), strong: true });
      if (p.stressAppliedRate != null)
        rows.push({ k: "적용 심사금리(근사)", v: percent(p.stressAppliedRate) });
      return {
        headline: p.loanLimit
          ? `앱 계산으로는 약 ${eok(p.loanLimit)}이지만, 이건 참고치예요. 은행 사전심사(가심사)를 꼭 받아 실제 한도를 확인하세요.`
          : "앞 단계 값을 채우면 예상 한도가 나와요. 최종 한도는 은행 사전심사에서 정해집니다.",
        rows,
        soWhat:
          "카드론·학자금·자동차 할부는 전부 DSR에 잡혀요. 집 사기 전에 정리하면 한도가 늘어요. " +
          "금리는 최소 3개 은행을 비교하고 정책상품(디딤돌·보금자리 등)·우대금리 조건도 확인하세요. " +
          "사전심사가 끝날 때까지는 새 대출이나 카드 할부를 만들지 마세요 — 계산된 한도가 줄어들 수 있어요." +
          (f.dealType === "전세" && p.jeonseLoanAvailable === false
            ? " 지금 규칙에선 전세자금대출이 막혀 있어요 — 매매 방향을 다시 봐야 해요."
            : ""),
      };
    },
  },

  step6: {
    intro:
      "계약은 되돌리기 어려워요. 등기부등본으로 '진짜 주인'과 '빚'을 확인하고, " +
      "특약으로 나를 지킬 조항을 넣은 뒤 계약금을 냅니다.",
    buildSummary(name, f, p) {
      const rows = [];
      if (p.acquisitionTax != null) rows.push({ k: "취득세 (잔금 때 현금)", v: eok(p.acquisitionTax) });
      if (p.brokerageFee != null) rows.push({ k: "중개보수", v: eok(p.brokerageFee) });
      if (p.incidentalCosts != null) rows.push({ k: "부대비용 합계", v: eok(p.incidentalCosts), strong: true });
      return {
        headline:
          "취득세·부대비용은 대출로 안 나와요. 잔금일에 현금으로 준비하세요. 계약서 특약란이 나를 지키는 방어선이에요.",
        rows,
        soWhat:
          "특약에는 최소 세 가지를 글로 넣으세요 — ① 잔금일까지 근저당 말소 ② 입주 후 하자는 매도인 책임 ③ 대출이 예상보다 적게 나오면 계약 해제. " +
          "옆의 '연습해보기'로 등기부등본·특약을 미리 채워볼 수 있어요.",
      };
    },
  },

  step7: {
    intro:
      "거의 다 왔어요. 잔금을 치르고 소유권 이전 등기를 마치면 내 집이에요. " +
      "마지막까지 등기부 확인과 전입신고를 놓치지 않습니다.",
    buildSummary(name, f, p) {
      return {
        headline: `${hon(name)}, 여기까지가 집 구하기의 큰 그림이에요.`,
        rows: [],
        soWhat:
          "잔금일 아침에 등기부를 마지막으로 다시 떼서 새 근저당이 없는지 확인한 뒤 잔금을 보내세요. " +
          "등기는 법무사에게 맡기고, 이사 당일 바로 전입신고(전세면 확정일자까지)를 하세요. 하루만 늦어도 그날 생긴 권리에 밀려요.",
        note:
          "실제 진행은 각 단계에서 은행·공인중개사·법무사와 확인하며 하세요. 이 앱의 숫자는 준비를 돕는 근사치예요.",
      };
    },
  },
};
