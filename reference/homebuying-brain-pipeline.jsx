// ─────────────────────────────────────────────────────────────
// DEMO #4 (검증 완료) — 내 집 마련 두뇌: 파이프라인 재계산
// 최종 MVP의 재계산 엔진 원형. src/engine/calculate.js 가 이걸 일반화한 것.
//   - computePipeline(facts, rules) 은 순수 함수
//   - 규칙셋(RULESETS)은 코드가 아니라 데이터
//   - 규칙셋 전환 시 before/after diff → 바뀐 노드에 delta 배지
//   - 규제 카드뉴스(rules.note) + 내 영향(전세대출 차단 등)
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo } from "react";

const C = {
  bg: "#0f1720", panel: "#16212e", panelSoft: "#1c2a3a", line: "#2a3b50",
  text: "#e8eef5", dim: "#8ea3ba", locked: "#33465c",
  glow: "#4fd1a5", glowSoft: "#2f8f74", accent: "#ffcb6b", warn: "#ff8c69",
};

const RULESETS = {
  base: {
    id: "base", label: "현행 (2026.08 기준)",
    ltv: { firstHome: 80, normal: 70 },
    dsrLimit: 40, dsrRate: 7.0,
    regulatedArea: false,
    jeonseLoanBlocked: false,
    note: null,
  },
  regulated: {
    id: "regulated", label: "규제지역 지정 후",
    ltv: { firstHome: 60, normal: 50 },
    dsrLimit: 40, dsrRate: 7.5,
    regulatedArea: true,
    jeonseLoanBlocked: true,
    note: "관심 지역이 규제지역으로 묶였어요. LTV가 깎이고 심사금리가 올라 대출 한도가 줄어듭니다.",
  },
};

function computePipeline(facts, rules) {
  const { goal, income, firstHome, deal } = facts;
  const out = {};
  out.goal = { label: "목표집값", value: goal, display: `${(goal / 10000).toFixed(1)}억` };
  const ltvPct = firstHome ? rules.ltv.firstHome : rules.ltv.normal;
  const ltvLoan = Math.round(goal * ltvPct / 100);
  out.ltv = { label: "LTV 한도", value: ltvLoan, display: `${(ltvLoan / 10000).toFixed(2)}억`, sub: `LTV ${ltvPct}%` };
  const annualPay = income * 0.4;
  const dsrLoan = Math.round(annualPay / (rules.dsrRate / 100 * 1.3));
  out.dsr = { label: "DSR 한도", value: dsrLoan, display: `${(dsrLoan / 10000).toFixed(2)}억`, sub: `소득기준 · 심사금리 ${rules.dsrRate}%` };
  const realLoan = Math.min(ltvLoan, dsrLoan);
  const bottleneck = ltvLoan <= dsrLoan ? "ltv" : "dsr";
  out.loan = { label: "실제 대출한도", value: realLoan, display: `${(realLoan / 10000).toFixed(2)}억`, sub: `${bottleneck === "ltv" ? "LTV" : "DSR"}가 결정`, bottleneck };
  const needSeed = goal - realLoan;
  out.seed = { label: "필요 종잣돈", value: needSeed, display: `${(needSeed / 10000).toFixed(2)}억`, sub: "목표 − 대출" };
  const extra = Math.round(goal * 0.05);
  out.extra = { label: "부대비용", value: extra, display: `${extra.toLocaleString()}만`, sub: "취득세·중개보수 등" };
  out.cash = { label: "총 필요 현금", value: needSeed + extra, display: `${((needSeed + extra) / 10000).toFixed(2)}억`, sub: "종잣돈 + 부대비용", highlight: true };
  out._jeonseBlocked = deal === "jeonse" && rules.jeonseLoanBlocked;
  return out;
}

// (원본 UI 코드는 최종 앱에서 src/components/* 로 재구성됨 — 참고용으로 엔진부만 보존)
export { RULESETS, computePipeline };
