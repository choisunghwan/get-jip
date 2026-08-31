// ─────────────────────────────────────────────────────────────
// 카드 덱 — 입력은 카드 한 장씩. "내가 아는 팩트"만 묻는다.
// LTV%·대출한도 같은 어려운 값은 절대 묻지 않는다(앱이 계산).
// 각 fact 카드는 그 자체가 개념 설명을 담고 있어서
// "안 배운 개념에 입력 요구" 문제가 구조적으로 안 생긴다.
//
// step.type:
//   "name"  — 온보딩. 이름 입력 → 앱 개인화
//   "learn" — 개념만 가르치고 넘어감(입력 없음). 해당 노드를 '배움'으로.
//   "fact"  — 개념 설명 + 팩트 입력. 저장 후 재계산.
//
// field.input: "bool" | "number" | "select" | "text"
// field.scale: 입력값에 곱해 기준 단위(원/개월)로 환산
// ─────────────────────────────────────────────────────────────

export const CARD_DECK = [
  {
    id: "onboarding",
    type: "name",
    title: "먼저, 이름을 알려주세요",
    body: "이 앱은 '누군가의 집 구하기'가 아니라 '당신의 집 구하기'예요. 입력한 이름이 앱 곳곳에 들어갑니다.",
    tip: "본명이 아니어도 돼요. 나중에 바꿀 수 있어요.",
    field: { key: "userName", input: "text", placeholder: "예: 성환", maxLength: 12 },
  },

  {
    id: "first_time",
    type: "fact",
    nodeId: "first_time_buyer",
    title: "생애최초로 집을 사는 건가요?",
    body:
      "본인과 세대원 전원이 과거에 집을 가진 적이 한 번도 없으면 '생애최초'예요. " +
      "대출 한도(LTV), 취득세, 청약 특별공급에서 가장 크게 우대받는 조건입니다.",
    tip: "배우자의 혼인 전 주택 이력도 걸려요. 애매하면 '주택소유확인서'로 미리 확인하세요.",
    field: { key: "firstTimeBuyer", input: "bool" },
  },
  {
    id: "income",
    type: "fact",
    nodeId: "annual_income",
    title: "세전 연소득이 얼마인가요?",
    body:
      "은행은 소득 대비 갚을 수 있는 금액(DSR)으로 대출 한도를 정해요. 소득이 사실상 한도를 결정합니다. " +
      "맞벌이면 부부 합산으로 넣으세요.",
    tip: "보너스·성과급 포함 세전 금액. 프리랜서·사업자는 소득 증빙 방식에 따라 인정액이 달라져요.",
    field: {
      key: "annualIncome",
      input: "chips",
      unit: "만원",
      scale: 10000,
      allowCustom: true,
      placeholder: "예: 6500",
      options: [
        { label: "3천만", value: 30_000_000 },
        { label: "4천만", value: 40_000_000 },
        { label: "5천만", value: 50_000_000 },
        { label: "6천만", value: 60_000_000 },
        { label: "7천만", value: 70_000_000 },
        { label: "8천만", value: 80_000_000 },
        { label: "1억", value: 100_000_000 },
        { label: "1.2억", value: 120_000_000 },
      ],
    },
  },
  {
    id: "region",
    type: "fact",
    nodeId: "interest_region",
    title: "어느 지역에서 집을 보고 있나요?",
    body:
      "규제지역인지, 시세가 어떤지, 청약 경쟁이 센지가 다 여기서 갈려요. 넓게 잡아두고 좁혀가면 됩니다.",
    tip: "규제는 시·구 단위로 지정되는 경우가 많아요. '서울'처럼 크게 시작해도 괜찮아요.",
    field: {
      key: "interestRegion",
      input: "select",
      options: ["서울", "성남 분당", "과천", "하남", "광명", "경기(그 외)", "인천", "지방"],
    },
  },
  {
    id: "deal_type",
    type: "fact",
    nodeId: "deal_type",
    title: "매매인가요, 전세인가요?",
    body:
      "어떤 대출을 쓰고 어떤 규제를 맞는지가 갈려요. 이 앱은 매매를 기준으로 자금을 계산하고, " +
      "전세를 고르면 전세대출이 막혔는지도 함께 봅니다.",
    tip: "지금 전세로 살면서 다음에 매매로 갈 계획이면, 일단 '매매'로 두고 목표를 잡아보세요.",
    field: { key: "dealType", input: "select", options: ["매매", "전세"] },
  },

  {
    id: "learn_price_loan",
    type: "learn",
    nodeId: "loan_limit",
    title: "집값은 '빌릴 수 있는 만큼'에서 거꾸로 정해져요",
    body:
      "목표 집값을 정하면 → LTV(집값 대비 비율)와 DSR(소득 대비 비율) 중 작은 쪽이 대출 한도가 되고 → " +
      "집값에서 그 한도를 뺀 나머지 + 부대비용이 '내가 지금 있어야 하는 현금'이에요. " +
      "그래서 목표 집값을 바꾸면 필요 현금이 줄줄이 다시 계산됩니다.",
    tip: "다음 카드에서 목표 집값을 넣으면, 두뇌 그래프에서 대출·종잣돈 노드가 실시간으로 채워지는 걸 보게 돼요.",
  },
  {
    id: "target_price",
    type: "fact",
    nodeId: "target_price",
    title: "목표 집값은 얼마인가요?",
    body: "지금 마음에 둔 가격대면 돼요. 정확할 필요 없어요 — 넣고 나서 조정하면서 감을 잡는 게 목적이에요.",
    tip: "호가 말고 '실거래가'로. 국토부 실거래가 공개시스템에서 같은 단지 최근 3개월 거래를 보세요.",
    field: {
      key: "targetPrice",
      input: "chips",
      unit: "억원",
      scale: 100_000_000,
      step: 0.1,
      allowCustom: true,
      placeholder: "예: 8.5",
      options: [
        { label: "4억", value: 400_000_000 },
        { label: "5억", value: 500_000_000 },
        { label: "6억", value: 600_000_000 },
        { label: "7억", value: 700_000_000 },
        { label: "8억", value: 800_000_000 },
        { label: "9억", value: 900_000_000 },
        { label: "10억", value: 1_000_000_000 },
        { label: "12억", value: 1_200_000_000 },
        { label: "15억", value: 1_500_000_000 },
      ],
    },
  },
  {
    id: "seed",
    type: "fact",
    nodeId: "seed_savings",
    title: "지금 동원할 수 있는 현금이 얼마예요?",
    body:
      "예·적금, 주식 현금화분, 확정된 부모 지원까지 '실제로 잔금에 쓸 수 있는' 돈만 세요. " +
      "지금 사는 집 전세보증금은 빼는 게 안전해요(돌려받는 시점이 어긋날 수 있어서).",
    tip: "이 돈이 필요 현금에 못 미치는 만큼이 '부족분'이고, 월 저축액으로 나누면 기간이 나와요.",
    field: {
      key: "seedSavings",
      input: "chips",
      unit: "억원",
      scale: 100_000_000,
      step: 0.1,
      allowCustom: true,
      placeholder: "예: 1.8",
      options: [
        { label: "3천만", value: 30_000_000 },
        { label: "5천만", value: 50_000_000 },
        { label: "7천만", value: 70_000_000 },
        { label: "1억", value: 100_000_000 },
        { label: "1.5억", value: 150_000_000 },
        { label: "2억", value: 200_000_000 },
        { label: "3억", value: 300_000_000 },
        { label: "4억", value: 400_000_000 },
      ],
    },
  },
  {
    id: "monthly",
    type: "fact",
    nodeId: "monthly_saving",
    title: "매달 얼마씩 모으고 있나요?",
    body: "부족분을 이 금액으로 나누면 '몇 달 뒤에 살 수 있는지'가 나와요.",
    tip: "보너스를 뺀 '확실한' 금액으로. 계획은 최저선으로 세워야 안 흔들려요.",
    field: {
      key: "monthlySaving",
      input: "chips",
      unit: "만원",
      scale: 10000,
      allowCustom: true,
      placeholder: "예: 250",
      options: [
        { label: "50만", value: 500_000 },
        { label: "100만", value: 1_000_000 },
        { label: "150만", value: 1_500_000 },
        { label: "200만", value: 2_000_000 },
        { label: "300만", value: 3_000_000 },
        { label: "400만", value: 4_000_000 },
      ],
    },
  },

  {
    id: "learn_subscription",
    type: "learn",
    nodeId: "subscription_points",
    title: "청약 가점은 3가지의 합이에요",
    body:
      "무주택 기간(최대 32점) + 청약통장 가입 기간(최대 17점) + 부양가족 수(최대 35점) = 최대 84점. " +
      "인기 단지는 60점 이상이 당첨선이에요. 다음 카드들에서 이 3가지를 넣으면 예상 가점이 계산됩니다.",
    tip: "부양가족이 1명당 5점으로 가장 커요. 점수가 낮아도 '추첨' 비중이 큰 생애최초 특별공급이 있어요.",
  },
  {
    id: "homeless",
    type: "fact",
    nodeId: "homeless_period",
    title: "무주택으로 지낸 지 얼마나 됐나요?",
    body:
      "만 30세부터(또는 혼인신고일부터) 집 없이 지낸 기간이에요. 부모님 집에 살아도 세대분리 후 만 30세가 지났으면 쌓여요.",
    tip: "잘 모르겠으면 대략만 넣으세요. 청약홈에서 정확한 무주택 기간을 조회할 수 있어요.",
    field: { key: "homelessMonths", input: "stepper", unit: "년", scale: 12, min: 0, max: 40, step: 1, default: 3 },
  },
  {
    id: "account",
    type: "fact",
    nodeId: "subscription_account",
    title: "청약통장에 가입한 지 얼마나 됐나요?",
    body: "주택청약종합저축 가입 기간이에요. 아직 없으면 0을 넣으세요 — 오늘 만들면 오늘부터 쌓입니다.",
    tip: "매달 2만~50만원 아무 금액이나 넣어도 '납입 회차'는 똑같이 1회예요. 없으면 지금 만드는 게 이득.",
    field: { key: "subscriptionMonths", input: "stepper", unit: "년", scale: 12, min: 0, max: 30, step: 1, default: 0 },
  },
  {
    id: "dependents",
    type: "fact",
    nodeId: "dependents",
    title: "부양가족은 몇 명인가요?",
    body: "같은 등본에서 내가 부양하는 배우자·자녀·부모 수예요. 본인은 빼고 세요.",
    tip: "부모님은 신청일 기준 3년 이상 같은 등본에 있어야 인정돼요. 청약 가점에서 1명당 5점.",
    field: { key: "dependents", input: "stepper", unit: "명", scale: 1, min: 0, max: 8, step: 1, default: 0 },
  },

  {
    id: "learn_official_price",
    type: "learn",
    nodeId: "official_price",
    title: "공시가격은 시세와 다른, 세금용 가격이에요",
    body:
      "정부가 매긴 공적 가격으로 보통 실거래가의 60~80%예요. 재산세·종부세·건보료, 그리고 생애최초 취득세 감면 기준이 " +
      "이 공시가격이에요. '부동산공시가격알리미'에서 주소만 넣으면 나와요.",
    tip: "몰라도 진행은 되지만, 넣어두면 취득세·부대비용 계산이 더 정확해져요.",
  },
  {
    id: "official_price",
    type: "fact",
    nodeId: "official_price",
    title: "관심 매물의 공시가격을 아나요?",
    body: "모르면 건너뛰어도 돼요. 대략 목표 집값의 70% 정도로 잡아도 감은 잡혀요.",
    tip: "'부동산공시가격알리미(realtyprice.kr)'에서 단지·동·호를 넣으면 공동주택 공시가격이 나와요.",
    field: {
      key: "officialPrice",
      input: "chips",
      unit: "억원",
      scale: 100_000_000,
      step: 0.1,
      allowCustom: true,
      optional: true,
      placeholder: "예: 5.6",
      options: [
        { label: "3억", value: 300_000_000 },
        { label: "4억", value: 400_000_000 },
        { label: "5억", value: 500_000_000 },
        { label: "6억", value: 600_000_000 },
        { label: "7억", value: 700_000_000 },
        { label: "8억", value: 800_000_000 },
      ],
    },
  },
];

/** 특정 노드로 점프할 때 쓸: nodeId -> 덱 인덱스 */
export const DECK_INDEX_BY_NODE = CARD_DECK.reduce((acc, step, i) => {
  if (step.nodeId) acc[step.nodeId] = i;
  return acc;
}, {});

/** nodeId -> fact 카드의 field 스펙 (노드 탭 인라인 편집에 재사용) */
export const FIELD_BY_NODE = CARD_DECK.reduce((acc, step) => {
  if (step.type === "fact" && step.nodeId) acc[step.nodeId] = step.field;
  return acc;
}, {});

/** 3탭 퀵스타트: 가장 개인적이고 기본값으로 못 때우는 3개만 */
export const QUICK_START = ["first_time_buyer", "annual_income", "target_price"].map((nid) => {
  const step = CARD_DECK.find((s) => s.nodeId === nid && s.type === "fact");
  return { nodeId: nid, title: step.title, body: step.body, field: step.field };
});
