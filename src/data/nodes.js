// ─────────────────────────────────────────────────────────────
// KnowledgeNode 시드 — 29노드 / 5영역. 영역 간 교차 연결은 edges.js.
// 데모 homebuying-brain-map.jsx 의 22노드를 확장.
//
// node.value:
//   { source: "fact",     key, kind }  → userFacts[key] 가 그대로 내 값
//   { source: "pipeline",  key, kind }  → calculate() 결과가 내 값
//   없음                                → 개념만 있는 노드(배움까지만 가능)
// kind: "won" | "percent" | "months" | "bool" | "points"
// ─────────────────────────────────────────────────────────────

export const AREAS = {
  seed: { key: "seed", label: "종잣돈", color: "#16a34a", emoji: "🟢" },
  apply: { key: "apply", label: "청약", color: "#2563eb", emoji: "🔵" },
  loan: { key: "loan", label: "대출", color: "#d97706", emoji: "🟡" },
  listing: { key: "listing", label: "매물", color: "#9333ea", emoji: "🟣" },
  deal: { key: "deal", label: "계약", color: "#dc2626", emoji: "🔴" },
};

export const NODES = [
  // ── 🟢 종잣돈 ──
  {
    id: "seed_savings",
    area: "seed",
    label: "종잣돈",
    desc: "지금 당장 집 사는 데 쓸 수 있는 내 현금. 예·적금, 주식 현금화분, 부모 지원 확정분까지 포함해 '실제로 동원 가능한' 돈만 센다.",
    tip: "전세보증금은 빼는 게 안전하다 — 돌려받는 시점과 잔금 치르는 시점이 어긋나면 없는 돈이다.",
    value: { source: "fact", key: "seedSavings", kind: "won" },
  },
  {
    id: "target_price",
    area: "seed",
    label: "목표 집값",
    desc: "내가 사려는 집의 가격대. 대출 한도가 정해지면 여기서 거꾸로 '살 수 있는 집'이 좁혀진다.",
    tip: "매물 가격이 아니라 '실거래가'로 잡아라. 호가는 보통 실거래가보다 높다.",
    value: { source: "fact", key: "targetPrice", kind: "won" },
  },
  {
    id: "incidental_costs",
    area: "seed",
    label: "부대비용",
    desc: "집값 외에 계약 때 실제로 나가는 돈. 취득세 + 중개보수 + 법무사 등기비 + 이사·잡비. 보통 집값의 3~6%.",
    tip: "대출로 못 메우는 순수 현금이다. 종잣돈에서 이 몫을 먼저 떼어놓고 나머지로 집을 봐라.",
    value: { source: "pipeline", key: "incidentalCosts", kind: "won" },
  },
  {
    id: "required_cash",
    area: "seed",
    label: "필요 현금",
    desc: "집을 사려면 계약~잔금까지 있어야 하는 총 현금 = 집값 − 대출한도 + 부대비용.",
    tip: "이 숫자가 '지금 얼마 모아야 하나'의 정답이다. 종잣돈과의 차이가 '부족분'.",
    value: { source: "pipeline", key: "requiredCash", kind: "won" },
  },
  {
    id: "saving_gap",
    area: "seed",
    label: "부족분",
    desc: "필요 현금 − 종잣돈. 양수면 더 모아야 하고, 0 이하면 지금 조건으로 집을 살 수 있다는 뜻.",
    tip: "부족분이 크면 두 가지 레버가 있다 — 목표 집값을 낮추거나, 대출 한도를 늘리거나(소득·거래유형).",
    value: { source: "pipeline", key: "savingGap", kind: "won" },
  },
  {
    id: "monthly_saving",
    area: "seed",
    label: "월 저축액",
    desc: "매달 종잣돈에 보태는 금액. 부족분을 이걸로 나누면 '몇 달 뒤에 살 수 있는지'가 나온다.",
    tip: "보너스·성과급을 뺀 '확실한' 금액으로 잡아라. 계획은 최저선으로 세워야 안 흔들린다.",
    value: { source: "fact", key: "monthlySaving", kind: "won" },
  },
  {
    id: "time_to_buy",
    area: "seed",
    label: "달성까지 기간",
    desc: "지금 저축 속도로 부족분을 다 메우는 데 걸리는 개월 수.",
    tip: "이 기간이 3년 넘게 나오면 목표 집값이나 지역을 재조정할 신호다.",
    value: { source: "pipeline", key: "monthsToClose", kind: "months" },
  },

  // ── 🔵 청약 ──
  {
    id: "first_time_buyer",
    area: "apply",
    label: "생애최초 여부",
    desc: "본인과 세대원 전원이 과거에 집을 소유한 적이 한 번도 없는 상태. 대출·취득세·특별공급에서 가장 강력한 우대 조건이다.",
    tip: "배우자의 혼인 전 주택 이력도 걸린다. 애매하면 '주택소유확인서'로 미리 확인해라.",
    value: { source: "fact", key: "firstTimeBuyer", kind: "bool" },
  },
  {
    id: "homeless_period",
    area: "apply",
    label: "무주택 기간",
    desc: "세대주가 집 없이 지낸 기간. 만 30세부터(또는 혼인신고일부터) 계산한다. 청약 가점의 큰 축(최대 32점).",
    tip: "부모님 집에 얹혀살아도, 세대분리하고 만 30세가 지났으면 무주택 기간이 쌓인다.",
    value: { source: "fact", key: "homelessMonths", kind: "months" },
  },
  {
    id: "subscription_account",
    area: "apply",
    label: "청약통장",
    desc: "주택청약종합저축. 가입 기간과 납입 횟수가 가점·1순위 자격을 만든다.",
    tip: "매달 2만~50만원 중 아무 금액이나 넣어도 '납입 인정 회차'는 똑같이 1회. 다만 공공분양은 인정 금액 한도가 있다.",
    value: { source: "fact", key: "subscriptionMonths", kind: "months" },
  },
  {
    id: "subscription_points",
    area: "apply",
    label: "청약 가점",
    desc: "무주택기간(32) + 청약통장 가입기간(17) + 부양가족(35) = 최대 84점. 인기 단지는 60점 이상이 당첨선.",
    tip: "부양가족 1명당 5점이라 가장 크다. 부모님을 3년 이상 부양(주민등록 동일)하면 인정된다.",
    value: { source: "pipeline", key: "subscriptionPoints", kind: "points" },
  },
  {
    id: "special_supply",
    area: "apply",
    label: "특별공급 자격",
    desc: "생애최초·신혼부부·다자녀·노부모부양 등에 물량을 따로 빼주는 제도. 일반공급보다 경쟁이 훨씬 약하다.",
    tip: "생애최초 특공은 '가점'이 아니라 '추첨'이 큰 비중이다 — 점수가 낮아도 도전 가치가 있다.",
  },
  {
    id: "income_criteria",
    area: "apply",
    label: "소득 기준",
    desc: "특별공급·특례대출은 가구원 수별 소득 상한이 있다. 초과하면 자격에서 빠진다.",
    tip: "맞벌이는 부부 합산이라 넘기 쉽다. 대신 맞벌이용 완화 기준(예: 140%)이 따로 있는 전형을 노려라.",
    value: { source: "pipeline", key: "incomeCriteriaPass", kind: "bool" },
  },
  {
    id: "dependents",
    area: "apply",
    label: "부양가족",
    desc: "같은 세대에서 내가 부양하는 가족 수(배우자·자녀·부모). 청약 가점에서 1명당 5점.",
    tip: "청약 신청일 기준 3년 이상 계속 같은 등본에 올라 있어야 부모가 부양가족으로 인정된다.",
    value: { source: "fact", key: "dependents", kind: "points" },
  },

  // ── 🟡 대출 ──
  {
    id: "ltv",
    area: "loan",
    label: "LTV",
    desc: "집값 대비 빌릴 수 있는 비율. 8억 집에 LTV 70%면 최대 5.6억. 생애최초·비규제지역일수록 높다.",
    tip: "LTV는 '집값 기준'이라 규제지역으로 묶이면 같은 집인데 한도가 뚝 떨어진다.",
    value: { source: "pipeline", key: "ltvRate", kind: "percent" },
  },
  {
    id: "ltv_loan",
    area: "loan",
    label: "LTV 기준 한도",
    desc: "목표 집값 × LTV율. 담보(집) 가치만 본 최대 대출액.",
    tip: "이 값과 DSR 한도 중 '작은 쪽'이 실제 한도가 된다.",
    value: { source: "pipeline", key: "ltvLoan", kind: "won" },
  },
  {
    id: "dsr",
    area: "loan",
    label: "DSR",
    desc: "연소득 대비 '모든 대출'의 연간 원리금 상환액 비율. 보통 40%(규제 시 35%)를 넘으면 안 된다. 소득이 한도를 정한다.",
    tip: "카드론·학자금·자동차 할부도 다 DSR에 잡힌다. 집 사기 전에 잔챙이 대출부터 정리해라.",
    value: { source: "pipeline", key: "dsrLoanLimit", kind: "won" },
  },
  {
    id: "stress_rate",
    area: "loan",
    label: "스트레스 금리",
    desc: "DSR 심사할 때 실제 금리에 얹는 가산 금리. 금리 오를 때를 대비해 한도를 보수적으로 잡게 만든다.",
    tip: "스트레스 금리가 1.5%p→3%p로 오르면, 금리는 그대로여도 대출 한도가 줄어든다.",
  },
  {
    id: "loan_limit",
    area: "loan",
    label: "실제 대출 한도",
    desc: "min(LTV 기준 한도, DSR 기준 한도). 파이프라인의 병목. 어느 쪽이 한도를 눌렀는지가 중요하다.",
    tip: "DSR이 병목이면 소득을 올리거나 대출 기간을 늘려라. LTV가 병목이면 지역·거래유형을 봐라.",
    value: { source: "pipeline", key: "loanLimit", kind: "won" },
  },
  {
    id: "jeonse_loan",
    area: "loan",
    label: "전세자금대출",
    desc: "전세보증금을 빌리는 대출. 규제 국면에서는 갭투자 차단을 위해 조건이 막히거나 좁아진다.",
    tip: "전세로 알아보는 중이라면, 규제 뉴스가 뜰 때 '전세대출 차단' 여부를 제일 먼저 확인해라.",
    value: { source: "pipeline", key: "jeonseLoanAvailable", kind: "bool" },
  },
  {
    id: "mortgage_rate",
    area: "loan",
    label: "주담대 금리",
    desc: "주택담보대출에 실제 적용되는 이자율. 고정/변동, 은행별로 다르다. 월 상환액을 좌우한다.",
    tip: "0.3%p 차이도 30년이면 수천만원이다. 최소 3개 은행은 비교하고 특례보금자리 같은 정책상품도 확인해라.",
  },
  {
    id: "annual_income",
    area: "loan",
    label: "연소득",
    desc: "세전 연소득. DSR 계산의 분모라 대출 한도를 사실상 여기서 정한다.",
    tip: "인정소득에는 소득증빙 방식(원천징수·건강보험료 환산 등)에 따라 차이가 난다. 프리랜서·사업자는 특히.",
    value: { source: "fact", key: "annualIncome", kind: "won" },
  },
  {
    id: "deal_type",
    area: "loan",
    label: "거래 유형",
    desc: "매매냐 전세냐. 어떤 대출을 쓰는지, 어떤 규제를 맞는지가 갈린다.",
    tip: "이 앱은 매매를 기본으로 계산한다. 전세를 고르면 전세대출 차단 여부를 함께 본다.",
  },

  // ── 🟣 매물 ──
  {
    id: "regulated_area",
    area: "listing",
    label: "규제지역 여부",
    desc: "투기과열지구·조정대상지역 등. 지정되면 LTV·DSR·전매제한·자금조달계획서 등이 한꺼번에 조여진다.",
    tip: "정부가 수시로 지정·해제한다. 관심 지역이 목록에 새로 들어오는 순간 내 대출 계획이 흔들린다.",
    value: { source: "pipeline", key: "isRegulated", kind: "bool" },
  },
  {
    id: "interest_region",
    area: "listing",
    label: "관심 지역",
    desc: "내가 집을 보고 있는 동네. 규제지역 판정, 시세, 청약 경쟁률의 기준.",
    tip: "'서울'처럼 넓게 잡아두고 좁혀가라. 규제는 시·구 단위로 지정되는 경우가 많다.",
  },
  {
    id: "official_price",
    area: "listing",
    label: "공시가격",
    desc: "정부가 매긴 주택의 공적 가격. 보통 실거래가의 60~80%. 재산세·종부세·건보료 산정 기준.",
    tip: "'부동산공시가격알리미'에서 주소만 넣으면 나온다. 취득세 감면 기준(생애최초)도 공시가격으로 본다.",
    value: { source: "fact", key: "officialPrice", kind: "won" },
  },
  {
    id: "market_price",
    area: "listing",
    label: "실거래가",
    desc: "실제로 사고팔린 가격. 국토부 실거래가 공개시스템에서 확인. 호가와의 차이가 협상 여지다.",
    tip: "같은 단지·같은 평형이라도 층·향·동에 따라 수천만원 차이. 최근 3개월 것만 봐라.",
  },
  {
    id: "jeonse_ratio",
    area: "listing",
    label: "전세가율",
    desc: "매매가 대비 전세가 비율. 80%를 넘으면 깡통전세 위험 신호 — 집값이 조금만 빠져도 보증금을 못 돌려받을 수 있다.",
    tip: "전세로 들어갈 때 반드시 확인. 전세가율이 높을수록 전세보증보험이 필수다.",
  },
  {
    id: "area_pyeong",
    area: "listing",
    label: "전용면적",
    desc: "실제 거주 공간 면적(㎡). 국민주택규모는 전용 85㎡ 이하. 청약·세제 혜택 기준이 되는 경우가 많다.",
    tip: "'공급면적'은 복도·계단까지 포함이라 더 크다. 세금·청약은 전용면적으로 따진다.",
  },

  // ── 🔴 계약 ──
  {
    id: "acquisition_tax",
    area: "deal",
    label: "취득세",
    desc: "집을 살 때 내는 지방세. 6억 이하 1.1%, 6~9억 구간, 9억 초과 3.3% (근사). 생애최초는 일정액 감면.",
    tip: "잔금일에 맞춰 현금으로 준비해야 한다. 대출로 안 나온다. 부대비용의 가장 큰 항목.",
    value: { source: "pipeline", key: "acquisitionTax", kind: "won" },
  },
  {
    id: "brokerage_fee",
    area: "deal",
    label: "중개보수",
    desc: "공인중개사에게 내는 수수료. 거래금액 구간별 상한요율이 정해져 있다. 협의로 낮출 수 있다.",
    tip: "상한요율은 '최대'다. 계약 전에 '얼마 받으시냐' 명확히 하고 현금영수증을 받아라.",
    value: { source: "pipeline", key: "brokerageFee", kind: "won" },
  },
  {
    id: "down_payment",
    area: "deal",
    label: "계약금",
    desc: "계약 체결 시 먼저 내는 돈. 보통 매매가의 10%. 계약을 깨면 못 돌려받는다(배액배상).",
    tip: "계약금 넣기 전에 등기부등본을 '그날 아침에' 다시 떼서 확인해라. 하루 사이 근저당이 생기기도 한다.",
  },
  {
    id: "registry_check",
    area: "deal",
    label: "등기부등본 확인",
    desc: "그 집의 진짜 주인이 누구인지, 빚(근저당)이 얼마나 잡혀 있는지 적힌 공적 장부. 계약 전 필수 확인.",
    tip: "'채권최고액'이 매매가에 육박하면 위험. 소유자 이름이 계약 상대와 같은지 신분증으로 대조해라.",
    practice: "registry_check",
  },
  {
    id: "special_terms",
    area: "deal",
    label: "특약사항",
    desc: "계약서 하단에 당사자끼리 따로 정하는 조항. '잔금일까지 근저당 말소', '누수 시 매도인 책임' 등 내 방어선.",
    tip: "말로 한 약속은 없는 거다. 반드시 특약란에 글로 적고 양쪽이 서명해야 효력이 있다.",
    practice: "special_terms",
  },
  {
    id: "jeonse_insurance",
    area: "deal",
    label: "전세보증보험",
    desc: "전세 만기에 집주인이 보증금을 안 돌려주면 보증기관이 대신 내주는 보험(HUG·SGI).",
    tip: "전세가율이 높거나 집주인 빚이 많으면 필수. 가입 거절되는 매물은 그 자체가 위험 신호다.",
    practice: "jeonse_insurance",
  },
];

export const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
