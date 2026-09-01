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
    desc: "지금 당장 집 사는 데 쓸 수 있는 내 현금이에요. 예금·적금, 팔 수 있는 주식, 확실히 받기로 한 부모님 지원까지 '진짜 쓸 수 있는' 돈만 세요.",
    tip: "지금 사는 집의 전세보증금은 빼고 계산하는 게 안전해요. 그 돈이 언제 돌아올지 정확히 모르니까요.",
    value: { source: "fact", key: "seedSavings", kind: "won" },
  },
  {
    id: "target_price",
    area: "seed",
    label: "목표 집값",
    desc: "사고 싶은 집이 대략 얼마인지예요. 정확하지 않아도 돼요 — 이 값을 넣으면 '그럼 현금이 얼마 있어야 하나'가 바로 계산돼요.",
    tip: "부동산에 붙은 가격(호가)보다 실제로 거래된 가격이 보통 더 낮아요. 국토부 실거래가 사이트에서 확인하세요.",
    value: { source: "fact", key: "targetPrice", kind: "won" },
  },
  {
    id: "incidental_costs",
    area: "seed",
    label: "부대비용",
    desc: "집값 말고도 계약할 때 따로 나가는 돈이에요. 취득세(집 살 때 내는 세금) + 중개 수수료 + 등기 비용 + 이사비. 보통 집값의 3~6%예요.",
    tip: "이 돈은 대출이 안 나와요. 전부 현금이라, 종잣돈에서 이만큼은 미리 빼두고 나머지로 집을 봐야 해요.",
    value: { source: "pipeline", key: "incidentalCosts", kind: "won" },
  },
  {
    id: "required_cash",
    area: "seed",
    label: "필요 현금",
    desc: "집을 사려면 손에 쥐고 있어야 하는 총 현금이에요. 계산법은 간단해요: 집값 − 빌릴 수 있는 돈 + 부대비용.",
    tip: "이 숫자가 '나 지금 얼마 모아야 해?'의 답이에요. 내 종잣돈이 여기 못 미치는 만큼이 '부족분'이고요.",
    value: { source: "pipeline", key: "requiredCash", kind: "won" },
  },
  {
    id: "saving_gap",
    area: "seed",
    label: "부족분",
    desc: "필요 현금에서 내 종잣돈을 뺀 금액이에요. 0보다 크면 그만큼 더 모아야 하고, 0 이하면 지금 조건으로 집을 살 수 있다는 뜻이에요.",
    tip: "부족분이 크면 방법은 둘이에요 — 목표 집값을 낮추거나, 소득을 늘려 빌릴 수 있는 돈을 키우거나.",
    value: { source: "pipeline", key: "savingGap", kind: "won" },
  },
  {
    id: "monthly_saving",
    area: "seed",
    label: "월 저축액",
    desc: "매달 꾸준히 모으는 금액이에요. 부족분을 이 금액으로 나누면 '몇 달 뒤에 살 수 있는지'가 나와요.",
    tip: "보너스는 빼고 '매달 확실히' 모으는 금액으로 잡으세요. 계획은 넉넉하게 잡을수록 안 흔들려요.",
    value: { source: "fact", key: "monthlySaving", kind: "won" },
  },
  {
    id: "time_to_buy",
    area: "seed",
    label: "달성까지 기간",
    desc: "지금 저축 속도로 부족분을 다 모으는 데 걸리는 시간이에요.",
    tip: "이 기간이 3년을 넘어가면, 목표 집값을 조금 낮추거나 지역을 바꿔볼 신호예요.",
    value: { source: "pipeline", key: "monthsToClose", kind: "months" },
  },

  // ── 🔵 청약 ──
  {
    id: "first_time_buyer",
    area: "apply",
    label: "생애최초 여부",
    desc: "나와 같이 사는 가족 모두가 지금까지 집을 가진 적이 한 번도 없으면 '생애최초'예요. 대출 한도, 세금, 청약에서 가장 크게 혜택을 받는 조건이에요.",
    tip: "배우자가 결혼 전에 집이 있었던 것도 걸려요. 헷갈리면 '주택소유확인서'를 미리 떼어 확인하세요.",
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
    desc: "아파트 분양(청약)을 넣으려면 꼭 있어야 하는 통장이에요. 가입한 지 오래될수록, 매달 넣은 횟수가 많을수록 당첨에 유리해요.",
    tip: "아직 없으면 오늘 만드세요. 매달 2만~50만원 아무 금액이나 넣어도 '넣은 횟수'는 똑같이 1회로 쳐줘요.",
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
    value: { source: "fact", key: "dependents", kind: "people" },
  },

  // ── 🟡 대출 ──
  {
    id: "ltv",
    area: "loan",
    label: "LTV (집값 대비 대출 비율)",
    desc: "집값의 몇 %까지 빌려주는지예요. 8억 집에 LTV 70%면 최대 5.6억까지요. 생애최초이거나 규제지역이 아니면 이 비율이 높아져요.",
    tip: "관심 지역이 '규제지역'으로 묶이면 같은 집인데도 이 비율이 확 낮아져요.",
    value: { source: "pipeline", key: "ltvRate", kind: "percent" },
  },
  {
    id: "ltv_loan",
    area: "loan",
    label: "집값으로 본 대출 한도",
    desc: "목표 집값 × LTV 비율이에요. '집을 담보로 이만큼까지'라는 뜻이죠.",
    tip: "이 금액과 '소득으로 본 한도(DSR)' 중에서 더 작은 쪽이 실제로 빌릴 수 있는 돈이 돼요.",
    value: { source: "pipeline", key: "ltvLoan", kind: "won" },
  },
  {
    id: "dsr",
    area: "loan",
    label: "DSR (소득으로 본 대출 한도)",
    desc: "은행은 '내 연소득으로 1년에 갚을 수 있는 돈'을 정해놓고, 그 안에서만 빌려줘요. 보통 연소득의 40%(규제 시 35%)까지예요. 그래서 소득이 사실상 한도를 정해요.",
    tip: "카드론·학자금·자동차 할부도 전부 여기 포함돼요. 집 사기 전에 이런 대출부터 정리하면 한도가 늘어나요.",
    value: { source: "pipeline", key: "dsrLoanLimit", kind: "won" },
  },
  {
    id: "stress_rate",
    area: "loan",
    label: "스트레스 금리",
    desc: "은행이 대출 한도를 계산할 때, 실제 금리에 살짝 얹어서 계산하는 '가상의 높은 금리'예요. 나중에 금리가 올라도 갚을 수 있는지 미리 확인하려는 장치죠.",
    tip: "이 얹는 폭이 커지면, 실제 금리는 그대로여도 빌릴 수 있는 돈이 줄어들어요.",
  },
  {
    id: "loan_limit",
    area: "loan",
    label: "실제 빌릴 수 있는 돈",
    desc: "'집값으로 본 한도'와 '소득으로 본 한도' 중 더 작은 쪽이에요. 둘 중 낮은 쪽이 내 발목을 잡는 셈이죠.",
    tip: "소득 쪽이 낮으면 → 기존 대출을 정리하거나 소득을 늘리세요. 집값 비율 쪽이 낮으면 → 지역이나 매매/전세를 다시 보세요.",
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
    desc: "세금 떼기 전 1년 소득이에요. 은행은 이 소득을 기준으로 '얼마까지 빌려줄지'를 정하기 때문에, 대출 한도가 사실상 여기서 결정돼요.",
    tip: "맞벌이면 부부 소득을 합쳐서 넣으세요. 프리랜서·사업자는 소득을 증명하는 방식에 따라 인정 금액이 달라질 수 있어요.",
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
