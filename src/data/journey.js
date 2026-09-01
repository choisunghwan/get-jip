// ─────────────────────────────────────────────────────────────
// 실제 집 구하는 순서(척추). 그래프는 "왜 다 얽혀 있는지",
// JOURNEY 는 "그래서 지금 뭘 해야 하는지".
//
// step.nodeIds  — 이 단계에서 밝히는 그래프 노드(입력칸 + 배울 개념)
// step.todo     — 앱 밖에서 실제로 해야 하는 행동 체크리스트
// step.housePart — 이 단계 완료 시 조립되는 집 부위(HouseProgress)
// ─────────────────────────────────────────────────────────────

export const JOURNEY = [
  {
    id: "step1",
    num: 1,
    title: "얼마짜리 집이 가능한가",
    blurb: "생애최초·소득·목표 집값·내 종잣돈으로, 지금 얼마짜리 집을 살 수 있는지 계산해요.",
    nodeIds: [
      "first_time_buyer",
      "annual_income",
      "seed_savings",
      "target_price",
      "ltv",
      "ltv_loan",
      "dsr",
      "loan_limit",
      "incidental_costs",
      "required_cash",
    ],
    todo: [
      "생애최초 여부 확인 (애매하면 주택소유확인서)",
      "세전 연소득 확인 (맞벌이면 합산)",
      "동원 가능한 현금 정리 (전세보증금은 빼기)",
      "목표 집값 대략 정하기 — 호가 말고 실거래가 기준",
    ],
    housePart: "foundation",
    area: "seed",
  },
  {
    id: "step2",
    num: 2,
    title: "종잣돈 계획",
    blurb: "부족분을 언제까지 어떻게 채울지 계획하고, 청약통장이 없으면 만들어요.",
    nodeIds: ["monthly_saving", "saving_gap", "time_to_buy", "subscription_account"],
    todo: [
      "매달 확실히 저축하는 금액 정하기",
      "청약통장 개설 — 없다면 오늘",
    ],
    housePart: "walls",
    area: "seed",
  },
  {
    id: "step3",
    num: 3,
    title: "어디서 살까",
    blurb: "관심 지역이 규제지역인지, 시세·전세가율·공시가격은 어떤지 확인해요.",
    nodeIds: ["interest_region", "deal_type", "regulated_area", "market_price", "official_price", "jeonse_ratio", "area_pyeong"],
    todo: [
      "관심 지역 좁히기",
      "국토부 실거래가 공개시스템에서 최근 3개월 시세 확인",
      "규제지역(투기과열·조정대상) 지정 여부 확인",
      "(전세) 전세가율 80% 넘는지 확인",
    ],
    housePart: "roof",
    area: "listing",
  },
  {
    id: "step4",
    num: 4,
    title: "청약 노려보기",
    blurb: "무주택기간·부양가족으로 청약 가점을 계산하고 특별공급 자격을 봐요.",
    nodeIds: ["homeless_period", "dependents", "subscription_points", "special_supply", "income_criteria"],
    todo: [
      "청약홈에서 무주택 기간 정확히 조회",
      "부양가족 수 확인 (부모는 등본 3년 이상)",
      "특별공급 유형·소득기준 확인",
    ],
    housePart: "windows",
    area: "apply",
  },
  {
    id: "step5",
    num: 5,
    title: "대출 확정 준비",
    blurb: "은행·금리를 비교하고, DSR에 잡히는 잔챙이 대출을 정리한 뒤 사전심사를 받아요.",
    nodeIds: ["mortgage_rate", "stress_rate", "jeonse_loan", "dsr", "loan_limit"],
    todo: [
      "3개 이상 은행 금리 비교 + 정책상품(보금자리 등) 확인",
      "카드론·학자금·자동차 할부 등 기존 대출 정리",
      "은행 대출 사전심사(가심사) 받기 — 최종 한도는 여기서만 확정",
    ],
    housePart: "door",
    area: "loan",
  },
  {
    id: "step6",
    num: 6,
    title: "계약",
    blurb: "등기부등본을 확인하고 특약으로 방어선을 만든 뒤 계약금을 넣어요.",
    nodeIds: ["registry_check", "special_terms", "down_payment", "acquisition_tax", "brokerage_fee", "jeonse_insurance"],
    todo: [
      "계약 당일 아침 등기부등본 다시 떼서 확인",
      "특약 직접 작성 — 근저당 말소, 하자 책임, 대출 미승인 시 해제",
      "취득세·부대비용 현금 잔금 준비 (대출로 안 나옴)",
    ],
    housePart: "fence",
    area: "deal",
  },
  {
    id: "step7",
    num: 7,
    title: "잔금·등기·입주",
    blurb: "잔금을 치르고 소유권 이전 등기를 마치면 드디어 내 집이에요.",
    nodeIds: [],
    todo: [
      "잔금일에 등기부 최종 확인 후 잔금 지급",
      "법무사에 소유권이전등기 위임",
      "전입신고 + (전세라면) 확정일자 즉시",
    ],
    housePart: "keys",
    area: "deal",
  },
];

export const JOURNEY_BY_ID = Object.fromEntries(JOURNEY.map((s) => [s.id, s]));

/** nodeId -> 그 노드가 처음 등장하는 step id */
export const STEP_BY_NODE = JOURNEY.reduce((acc, s) => {
  for (const nid of s.nodeIds) if (!(nid in acc)) acc[nid] = s.id;
  return acc;
}, {});
