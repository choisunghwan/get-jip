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
  seed: { key: "seed", label: "종잣돈", color: "#15803d" },
  apply: { key: "apply", label: "청약", color: "#0891b2" },
  loan: { key: "loan", label: "대출", color: "#1d4ed8" },
  listing: { key: "listing", label: "매물", color: "#7c3aed" },
  deal: { key: "deal", label: "계약", color: "#dc2626" },
};

export const NODES = [
  // ── 종잣돈 ──
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

  // ── 청약 ──
  {
    id: "first_time_buyer",
    area: "apply",
    label: "생애최초 여부",
    desc: "나와 같이 사는 가족 모두가 지금까지 집을 가진 적이 한 번도 없으면 '생애최초'예요. 대출 한도, 세금, 청약에서 가장 크게 혜택을 받는 조건이에요.",
    tip: "배우자가 결혼 전에 집이 있었던 것도 걸려요. 헷갈리면 '주택소유확인서'를 미리 떼어 확인하세요. 생애최초라면 디딤돌대출 같은 정책대출 대상일 수 있어요 — 시중은행 주담대보다 금리가 낮은 경우가 많으니 이것부터 확인하세요.",
    value: { source: "fact", key: "firstTimeBuyer", kind: "bool" },
  },
  {
    id: "homeless_period",
    area: "apply",
    label: "무주택 기간",
    desc: "내 이름으로 된 집 없이 지낸 기간이에요. 만 30세부터(결혼했으면 결혼신고일부터) 세요. 청약 점수에서 가장 큰 부분(최대 32점)을 차지해요.",
    tip: "부모님 집에 얹혀살아도 괜찮아요. '세대분리'(주민등록을 부모님과 따로 하는 것)를 하고 만 30세가 지났으면 이 기간이 쌓여요.",
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
    desc: "청약(아파트 분양 신청)에 당첨될 확률을 정하는 점수예요. 무주택 기간(최대 32점) + 청약통장 가입 기간(최대 17점) + 부양가족 수(최대 35점)를 더해서 최대 84점. 인기 있는 단지는 보통 60점은 넘어야 당첨돼요.",
    tip: "부양가족 점수가 1명당 5점으로 제일 커요. 부모님을 3년 넘게 나와 같은 주민등록에 올려두면(부양가족으로) 점수가 인정돼요.",
    value: { source: "pipeline", key: "subscriptionPoints", kind: "points" },
  },
  {
    id: "special_supply",
    area: "apply",
    label: "특별공급 자격",
    desc: "청약 물량 중 일부를 생애최초·신혼부부·다자녀·부모부양 가정에 따로 떼어주는 제도예요(줄여서 '특공'). 다른 사람들과 다 같이 경쟁하는 '일반공급'보다 훨씬 덜 치열해요.",
    tip: "생애최초 특별공급은 점수가 아니라 '추첨'(제비뽑기)으로 많이 뽑아요. 그래서 가점이 낮아도 도전해볼 만해요.",
  },
  {
    id: "income_criteria",
    area: "apply",
    label: "소득 기준",
    desc: "특별공급이나 저금리 정책대출은 '가족 수 대비 소득이 이 이하여야 신청 가능'한 상한선이 있어요. 이걸 넘으면 아무리 조건이 좋아도 자격에서 빠져요.",
    tip: "맞벌이는 둘이 버는 돈을 합치니까 기준을 넘기 쉬워요. 대신 맞벌이는 기준을 더 넉넉하게 봐주는(예: 140%) 전형도 있으니 그걸 찾아보세요.",
    value: { source: "pipeline", key: "incomeCriteriaPass", kind: "bool" },
  },
  {
    id: "dependents",
    area: "apply",
    label: "부양가족",
    desc: "나와 같이 살면서 내가 책임지고 있는 가족 수예요(배우자·자녀·부모). 나 자신은 세지 않아요. 청약 가점에서 1명당 5점씩 붙어요.",
    tip: "부모님은 청약 신청일 기준으로 3년 넘게 계속 나와 같은 주민등록(등본)에 있어야 부양가족으로 인정돼요.",
    value: { source: "fact", key: "dependents", kind: "people" },
  },

  // ── 대출 ──
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
    tip: "카드론·학자금·자동차 할부도 전부 여기 포함돼요. 집 사기 전에 이런 대출부터 정리하면 한도가 늘어나요. 반대로 대출 심사가 끝나기 전에 새로 카드 할부나 신용대출을 만들면, 계산했던 한도가 갑자기 줄어들 수 있어요.",
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
    desc: "전세보증금(집주인에게 맡기는 큰 돈)을 은행에서 빌리는 대출이에요. 정부가 '갭투자'(전세를 끼고 집을 여러 채 사는 투자)를 막으려 할 때 이 대출부터 조이거나 막아요.",
    tip: "전세로 집을 알아보는 중이라면, 규제 뉴스가 뜰 때 '전세대출이 막혔는지'부터 제일 먼저 확인하세요.",
    value: { source: "pipeline", key: "jeonseLoanAvailable", kind: "bool" },
  },
  {
    id: "mortgage_rate",
    area: "loan",
    label: "주담대 금리",
    desc: "'주택담보대출'(집을 담보로 잡고 받는 대출) 이자율이에요. 금리가 안 변하는 '고정'과, 시장에 따라 바뀌는 '변동', 그 중간인 '혼합형'이 있고, 은행마다 달라요. 이 %가 매달 갚는 돈을 정해요.",
    tip: "0.3%p 차이여도 30년 갚으면 수천만원 차이가 나요. 최소 3개 은행은 비교하고, 고정·변동·혼합형까지 같이 보세요. '원리금균등'(매달 같은 금액)과 '원금균등'(처음엔 많이, 갈수록 적게 — 총이자는 더 적음) 상환방식도 같이 비교하세요. 1금융권(은행)에서 한도가 안 나오면 보험사·상호금융도 있는데, 금리와 중도상환수수료를 꼭 같이 따져보세요.",
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
    desc: "집을 사는 건지(매매), 전세로 들어가는 건지예요. 어떤 대출을 쓰고 어떤 규제를 맞는지가 여기서 갈려요.",
    tip: "이 앱은 매매를 기본으로 계산해요. 전세를 고르면 전세자금대출이 막혔는지도 함께 봐요.",
    value: { source: "fact", key: "dealType", kind: "text" },
  },

  // ── 매물 ──
  {
    id: "regulated_area",
    area: "listing",
    label: "규제지역 여부",
    desc: "정부가 '이 동네는 집값이 너무 많이 뛴다'고 판단해서 특별 관리하는 지역이에요. 지정되면 대출 한도가 낮아지고, 산 집을 되파는 것도 일정 기간 제한되는 등 여러 규칙이 한꺼번에 빡빡해져요.",
    tip: "정부가 수시로 지정하거나 풀어요. 내 관심 지역이 어느 날 갑자기 새로 지정되면 대출 계획이 흔들릴 수 있어요.",
    value: { source: "pipeline", key: "isRegulated", kind: "bool" },
  },
  {
    id: "interest_region",
    area: "listing",
    label: "관심 지역",
    desc: "집을 보고 있는 동네예요. 규제지역인지, 시세가 어떤지, 청약 경쟁이 센지가 다 여기서 갈려요.",
    tip: "'서울'처럼 넓게 잡아두고 좁혀가세요. 규제는 보통 시·구 단위로 지정돼요.",
    value: { source: "fact", key: "interestRegion", kind: "text" },
  },
  {
    id: "official_price",
    area: "listing",
    label: "공시가격",
    desc: "정부가 세금 매기려고 정해놓은 '공식 집값'이에요. 실제 거래되는 가격(실거래가)보다 보통 낮아서, 대략 60~80% 정도예요. 재산세 같은 세금을 계산할 때 이 가격을 기준으로 삼아요.",
    tip: "'부동산공시가격알리미' 사이트에서 주소만 넣으면 바로 나와요. 생애최초 취득세 할인도 이 공시가격을 기준으로 정해요.",
    value: { source: "fact", key: "officialPrice", kind: "won" },
  },
  {
    id: "market_price",
    area: "listing",
    label: "실거래가",
    desc: "실제로 그 가격에 사고 팔린 기록이에요. 부동산에 붙어있는 희망 가격(호가)과는 다르고, 국토부 실거래가 공개시스템에서 누구나 볼 수 있어요. 호가와 실거래가 사이 차이가 '깎을 수 있는 여지'예요.",
    tip: "같은 아파트 단지, 같은 평수여도 몇 층인지·어느 방향인지에 따라 수천만원씩 차이 나요. 최근 3개월 안의 거래만 참고하세요.",
  },
  {
    id: "jeonse_ratio",
    area: "listing",
    label: "전세가율",
    desc: "집값 대비 전세보증금이 몇 %인지예요(전세가 ÷ 집값). 80%를 넘으면 위험 신호예요 — 집값이 조금만 떨어져도 집주인이 내 보증금을 다 못 돌려줄 수 있어요(이런 상황을 '깡통전세'라고 불러요).",
    tip: "전세로 들어갈 땐 반드시 확인하세요. 전세가율이 높을수록 다음에 나오는 '전세보증보험'이 꼭 필요해요.",
  },
  {
    id: "area_pyeong",
    area: "listing",
    label: "전용면적",
    desc: "현관문 안쪽, 내가 실제로 쓰는 공간 넓이예요(단위: ㎡, 제곱미터). '국민주택규모'라 부르는 기준이 전용 85㎡ 이하인데, 청약이나 세금 혜택이 이 기준으로 갈리는 경우가 많아요.",
    tip: "'공급면적'은 복도·계단까지 포함돼서 전용면적보다 더 커요. 세금·청약은 전용면적 기준으로 따져요. 헷갈리지 마세요.",
  },

  // ── 계약 ──
  {
    id: "acquisition_tax",
    area: "deal",
    label: "취득세",
    desc: "집을 살 때 나라(지방자치단체)에 내는 세금이에요. 대략 6억 이하면 1.1%, 6~9억이면 그 사이, 9억 넘으면 3.3% 정도예요(근사치). 생애최초면 일부 깎아줘요.",
    tip: "잔금 치르는 날 현금으로 같이 준비해야 해요. 대출로는 안 나와요. 부대비용 중에 제일 큰 항목이에요.",
    value: { source: "pipeline", key: "acquisitionTax", kind: "won" },
  },
  {
    id: "brokerage_fee",
    area: "deal",
    label: "중개보수",
    desc: "집을 연결해준 공인중개사(부동산 사장님)에게 드리는 수수료예요. 거래 금액에 따라 '최대 얼마까지'라는 상한이 법으로 정해져 있어요.",
    tip: "그 상한은 '최대치'일 뿐이에요. 계약 전에 얼마를 받으실 건지 미리 확실히 정하고, 나중에 현금영수증도 받으세요.",
    value: { source: "pipeline", key: "brokerageFee", kind: "won" },
  },
  {
    id: "down_payment",
    area: "deal",
    label: "계약금",
    desc: "계약서에 도장 찍을 때 먼저 내는 돈이에요. 보통 집값의 10% 정도예요. 이후에 내가 계약을 취소하면 이 돈은 못 돌려받아요(집주인이 취소하면 오히려 2배로 물어줘야 해요).",
    tip: "계약금을 넣기 전에 등기부등본(다음 개념)을 '그날 아침에' 다시 한번 떼서 확인하세요. 하루 사이에도 빚(근저당)이 새로 생길 수 있어요.",
  },
  {
    id: "registry_check",
    area: "deal",
    label: "등기부등본 확인",
    desc: "그 집의 '진짜 주인이 누구인지'와 '그 집을 담보로 은행 빚이 얼마나 있는지'가 적힌 공식 서류예요(인터넷등기소에서 뗄 수 있어요). 계약 전에 반드시 봐야 해요.",
    tip: "빚(근저당)이 집값에 육박할 만큼 크면 위험해요. 계약서에 도장 찍는 사람이 등기부에 적힌 주인과 같은 사람인지 신분증으로 꼭 확인하세요.",
    practice: "registry_check",
  },
  {
    id: "special_terms",
    area: "deal",
    label: "특약사항",
    desc: "계약서 아래쪽에 파는 사람과 사는 사람이 서로 따로 정하는 약속이에요. '잔금일까지 은행 빚 다 갚기', '물 새면 파는 사람이 고치기' 같은 걸 적어서 나를 지켜요.",
    tip: "입으로 한 약속은 나중에 효력이 없어요. 반드시 특약란에 글로 적고 양쪽이 서명해야만 진짜예요.",
    practice: "special_terms",
  },
  {
    id: "jeonse_insurance",
    area: "deal",
    label: "전세보증보험",
    desc: "전세 계약이 끝났는데 집주인이 보증금을 안 돌려주면, 보증 회사(HUG·SGI 같은 곳)가 대신 내 돈을 돌려주는 보험이에요.",
    tip: "전세가율이 높거나 집주인 빚이 많으면 꼭 가입하세요. 오히려 가입 자체가 거절되는 집이라면, 그게 바로 위험 신호예요.",
    practice: "jeonse_insurance",
  },
];

export const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
