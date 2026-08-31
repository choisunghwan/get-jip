// ─────────────────────────────────────────────────────────────
// WritingPractice — 계약 단계 노드의 '작성 연습'.
// 실제 서류 전체가 아니라 핵심 필드만 뽑은 미니 양식.
// 각 필드 옆 why = "왜 이걸 봐야 하는지".
// 저장값은 UserProgress.practice 에만 — 실제 서류 아님, 연습 기록.
// 화면에 "연습장" 문구 상시 노출(컴포넌트에서 처리).
// ─────────────────────────────────────────────────────────────

export const WRITING_PRACTICE = {
  registry_check: {
    nodeId: "registry_check",
    title: "등기부등본 확인 연습",
    intro:
      "계약 전에 '등기사항전부증명서'를 떼서 이 세 가지만 먼저 봐요. 인터넷등기소(iros.go.kr)에서 700원에 뗄 수 있어요.",
    fields: [
      {
        key: "owner_name",
        label: "소유자(등기부상) 이름",
        input: "text",
        why: "계약서에 도장 찍는 사람과 등기부상 소유자가 같은 사람인지 신분증으로 대조해야 해요. 대리인이면 위임장·인감증명서 확인.",
      },
      {
        key: "has_mortgage",
        label: "근저당권(빚) 설정이 있나요?",
        input: "bool",
        why: "'을구'에 근저당이 잡혀 있으면 그 집은 담보로 대출이 걸린 상태예요. 잔금 때 말소 조건을 특약에 넣어야 해요.",
      },
      {
        key: "max_claim",
        label: "채권최고액 (근저당이 있다면)",
        input: "number",
        unit: "만원",
        why: "실제 빚의 약 120%로 잡혀요. 이 금액이 매매가에 육박하면 잔금으로 빚을 다 못 갚을 수 있어 위험해요.",
        optional: true,
      },
      {
        key: "other_rights",
        label: "가압류·가처분·전세권 등 다른 권리",
        input: "text",
        why: "'갑구'의 가압류·가처분, '을구'의 전세권은 인수 대상이 될 수 있어요. 하나라도 있으면 계약 보류하고 전문가와 확인.",
        optional: true,
      },
    ],
  },

  special_terms: {
    nodeId: "special_terms",
    title: "특약사항 작성 연습",
    intro:
      "계약서 하단 특약란은 내 방어선이에요. 말로 한 약속은 효력이 없어요 — 아래를 글로 적고 양쪽이 서명해야 해요.",
    fields: [
      {
        key: "mortgage_clear",
        label: "근저당 말소 조항",
        input: "text",
        why: "'매도인은 잔금일까지 등기부상 근저당권을 전액 말소한다'를 명시. 안 지키면 계약 해제·손해배상 근거가 돼요.",
        placeholder: "예: 매도인은 잔금일까지 ○○은행 근저당권(채권최고액 ○억)을 말소하기로 한다.",
      },
      {
        key: "defect_liability",
        label: "하자 담보 책임 조항",
        input: "text",
        why: "입주 후 누수·결로·보일러 고장이 나올 때 누가 책임지는지. 보통 '잔금 후 6개월 내 발견된 주요 하자는 매도인 부담'.",
        placeholder: "예: 잔금일로부터 6개월 내 발견되는 누수·난방 하자는 매도인이 수리한다.",
      },
      {
        key: "handover_state",
        label: "인도 상태·관리비 정산",
        input: "text",
        why: "짐 다 빼고 청소된 상태로 넘기는지, 미납 관리비·공과금은 매도인이 잔금일 기준으로 정산하는지 명시.",
        placeholder: "예: 매도인은 잔금일 기준 관리비·공과금을 정산하고, 내부 짐을 모두 반출한 상태로 인도한다.",
        optional: true,
      },
      {
        key: "loan_contingency",
        label: "대출 미승인 시 조항",
        input: "text",
        why: "은행 대출이 예상보다 적게 나오거나 거절되면 계약금을 돌려받고 해제할 수 있게. 안 넣으면 계약금 날려요.",
        placeholder: "예: 매수인의 주택담보대출이 ○억 미만 승인 시 본 계약은 무효로 하고 계약금을 반환한다.",
        optional: true,
      },
    ],
  },

  jeonse_insurance: {
    nodeId: "jeonse_insurance",
    title: "전세보증보험 점검 연습",
    intro:
      "전세로 들어갈 때, 만기에 보증금을 못 돌려받는 상황을 대비하는 보험이에요(HUG·SGI). 가입 가능한 매물인지 미리 따져봐요.",
    fields: [
      {
        key: "deposit",
        label: "전세보증금",
        input: "number",
        unit: "만원",
        why: "보증 한도(수도권 기준 대략 7억)와 보증료 계산의 기준이에요.",
      },
      {
        key: "sale_price",
        label: "이 집의 매매 시세(추정)",
        input: "number",
        unit: "만원",
        why: "전세가율(보증금 ÷ 매매가)이 80%를 넘으면 깡통전세 위험. 보증보험 가입이 거절될 수도 있어요.",
      },
      {
        key: "landlord_tax_arrears",
        label: "집주인 세금 체납·선순위 채권 확인했나요?",
        input: "bool",
        why: "집주인이 세금을 체납했거나 앞선 근저당이 크면, 경매 시 내 보증금이 뒤로 밀려요. 국세완납증명·등기부로 확인.",
      },
      {
        key: "move_in_plan",
        label: "전입신고 + 확정일자 받을 날짜",
        input: "text",
        why: "이사 당일에 전입신고하고 확정일자를 받아야 '대항력'이 생겨요. 하루만 늦어도 그날 생긴 근저당에 밀립니다.",
        optional: true,
      },
    ],
  },
};
