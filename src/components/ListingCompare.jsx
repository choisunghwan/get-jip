import { useState } from "react";
import { calculate } from "../engine/calculate.js";
import { getRuleSet } from "../data/ruleSets.js";
import { eok } from "../lib/format.js";
import { InlineFactField } from "./FactField.jsx";
import Icon from "./Icon.jsx";

const PRICE_FIELD = {
  key: "price",
  input: "chips",
  unit: "억원",
  scale: 100_000_000,
  step: 0.1,
  allowCustom: true,
  placeholder: "예: 6.5",
  options: [
    { label: "4억", value: 400_000_000 },
    { label: "5억", value: 500_000_000 },
    { label: "6억", value: 600_000_000 },
    { label: "7억", value: 700_000_000 },
    { label: "8억", value: 800_000_000 },
    { label: "9억", value: 900_000_000 },
    { label: "10억", value: 1_000_000_000 },
    { label: "12억", value: 1_200_000_000 },
  ],
};

// 오늘 본 매물들을 각각 저장해서, 같은 조건(소득·종잣돈)으로 감당 가능한지 나란히 비교.
export default function ListingCompare({ state, actions, onBack, onSetTarget }) {
  const ruleSet = getRuleSet(state.ruleSetVersion);
  const listings = state.listings || [];
  const [adding, setAdding] = useState(listings.length === 0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(undefined);

  const submit = () => {
    if (price == null) return;
    actions.addListing({ name, price });
    setName("");
    setPrice(undefined);
    setAdding(false);
  };

  return (
    <div className="cmp">
      <div className="cmp-head">
        <button className="gh-back" onClick={onBack} aria-label="여정으로">
          <Icon name="back" size={18} />
        </button>
        <span className="cmp-head-title">매물 비교</span>
      </div>

      <div className="cmp-body">
        <p className="muted" style={{ margin: "0 0 16px", lineHeight: 1.6 }}>
          오늘 본 집들을 각각 저장해두면, 지금 내 소득·종잣돈 기준으로 감당 가능한지 한눈에 비교할 수 있어요.
        </p>

        {listings.length === 0 && !adding && (
          <p className="muted" style={{ textAlign: "center", padding: "26px 0" }}>
            아직 저장한 매물이 없어요. 매물을 추가해보세요.
          </p>
        )}

        {listings.map((l) => {
          const p = calculate({ ...state.facts, targetPrice: l.price }, ruleSet);
          const canAfford = p.affordablePrice != null && p.affordablePrice + 1e6 >= l.price;
          const known = p.requiredCash != null;
          return (
            <div className="cmp-card" key={l.id}>
              <div className="cmp-card-top">
                <div className="cmp-card-title">
                  <span className="cmp-name">{l.name || "매물"}</span>
                  <span className="cmp-price">{eok(l.price)}</span>
                </div>
                {known && (
                  <span className={`cmp-badge ${canAfford ? "ok" : "no"}`}>
                    {canAfford ? "감당 가능" : "부족"}
                  </span>
                )}
              </div>
              {known ? (
                <div className="cmp-rows">
                  <div className="cmp-row">
                    <span>빌릴 수 있는 돈</span>
                    <b>{p.loanLimit != null ? eok(p.loanLimit) : "—"}</b>
                  </div>
                  <div className="cmp-row">
                    <span>지금 필요한 현금</span>
                    <b>{eok(p.requiredCash)}</b>
                  </div>
                  <div className="cmp-row strong">
                    <span>{p.savingGap > 0 ? "더 모아야" : "여유"}</span>
                    <b>{p.savingGap != null ? eok(Math.abs(p.savingGap)) : "—"}</b>
                  </div>
                </div>
              ) : (
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  소득·종잣돈을 먼저 채우면 감당 가능 여부가 나와요.
                </p>
              )}
              <div className="cmp-actions">
                <button className="btn" onClick={() => onSetTarget(l.price)}>
                  이 가격으로 STEP 1 다시 보기
                </button>
                <button className="btn ghost" onClick={() => actions.removeListing(l.id)}>
                  삭제
                </button>
              </div>
            </div>
          );
        })}

        {adding ? (
          <div className="cmp-card cmp-add-form">
            <input
              className="cmp-name-input"
              placeholder="이름 (예: 래미안 84㎡ · 생략 가능)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InlineFactField field={PRICE_FIELD} value={price} onCommit={setPrice} />
            <div className="cmp-actions">
              <button className="btn primary" disabled={price == null} onClick={submit}>
                추가
              </button>
              {listings.length > 0 && (
                <button
                  className="btn ghost"
                  onClick={() => {
                    setAdding(false);
                    setName("");
                    setPrice(undefined);
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </div>
        ) : (
          <button className="btn cmp-add-btn" onClick={() => setAdding(true)}>
            + 매물 추가
          </button>
        )}
      </div>
    </div>
  );
}
