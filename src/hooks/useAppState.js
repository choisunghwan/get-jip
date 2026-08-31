import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculate } from "../engine/calculate.js";
import { RULE_SETS, DEFAULT_RULE_SET_VERSION, getRuleSet } from "../data/ruleSets.js";
import { NODES } from "../data/nodes.js";
import { loadState, saveState, clearState } from "../lib/storage.js";
import { deltaLabel } from "../lib/format.js";

const DEFAULT_STATE = {
  userName: "성환",
  onboarded: false,
  facts: {},
  learned: {}, // { [nodeId]: true }
  practice: {}, // { [nodeId]: { [fieldKey]: value } }
  ruleSetVersion: DEFAULT_RULE_SET_VERSION,
};

const DECAY_MS = 2600; // 재계산 흔들림 지속 시간

/** node.value 정의로 현재 내 값을 뽑는다. 없으면 undefined. */
export function resolveNodeValue(node, facts, pipeline) {
  if (!node.value) return undefined;
  const { source, key } = node.value;
  if (source === "fact") return facts[key];
  if (source === "pipeline") return pipeline[key];
  return undefined;
}

export function nodeStatus(node, state, pipeline) {
  const v = resolveNodeValue(node, state.facts, pipeline);
  if (v !== undefined && v !== null && v !== "") return "hasValue";
  const learnedByCard = !!state.learned[node.id];
  const answeredFact =
    node.value?.source === "fact" && state.facts[node.value.key] !== undefined;
  if (learnedByCard || answeredFact) return "learned";
  return "unlearned";
}

export function useAppState() {
  const [state, setState] = useState(() => ({ ...DEFAULT_STATE, ...(loadState() || {}) }));
  const [deltas, setDeltas] = useState({}); // { [nodeId]: labelString }  재계산 배지
  const [shakeSeq, setShakeSeq] = useState(0); // 흔들림 트리거(값 바뀔 때 증가)
  const decayTimer = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const ruleSet = useMemo(() => getRuleSet(state.ruleSetVersion), [state.ruleSetVersion]);
  const pipeline = useMemo(() => calculate(state.facts, ruleSet), [state.facts, ruleSet]);

  const statuses = useMemo(() => {
    const m = {};
    for (const n of NODES) m[n.id] = nodeStatus(n, state, pipeline);
    return m;
  }, [state, pipeline]);

  const progress = useMemo(() => {
    const total = NODES.length;
    const counts = { unlearned: 0, learned: 0, hasValue: 0 };
    for (const n of NODES) counts[statuses[n.id]]++;
    return {
      total,
      ...counts,
      pct: {
        unlearned: Math.round((counts.unlearned / total) * 100),
        learned: Math.round((counts.learned / total) * 100),
        hasValue: Math.round((counts.hasValue / total) * 100),
      },
    };
  }, [statuses]);

  // ── actions ──
  const setUserName = useCallback((userName) => {
    setState((s) => ({ ...s, userName: userName?.trim() || s.userName }));
  }, []);

  const finishOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const markLearned = useCallback((nodeId) => {
    setState((s) => (s.learned[nodeId] ? s : { ...s, learned: { ...s.learned, [nodeId]: true } }));
  }, []);

  const setFact = useCallback((key, value) => {
    setState((s) => ({ ...s, facts: { ...s.facts, [key]: value } }));
  }, []);

  const setPractice = useCallback((nodeId, fieldKey, value) => {
    setState((s) => ({
      ...s,
      practice: { ...s.practice, [nodeId]: { ...(s.practice[nodeId] || {}), [fieldKey]: value } },
      learned: { ...s.learned, [nodeId]: true },
    }));
  }, []);

  /** 규칙셋 전환 = 재계산. 바뀐 노드에 delta 배지 + 흔들림. */
  const switchRuleSet = useCallback(
    (version) => {
      setState((s) => {
        if (s.ruleSetVersion === version) return s;
        const before = calculate(s.facts, getRuleSet(s.ruleSetVersion));
        const after = calculate(s.facts, getRuleSet(version));
        const nextDeltas = {};
        for (const n of NODES) {
          if (n.value?.source !== "pipeline") continue;
          const k = n.value.key;
          const label = deltaLabel(n.value.kind, before[k], after[k]);
          if (label) nextDeltas[n.id] = label;
        }
        setDeltas(nextDeltas);
        setShakeSeq((x) => x + 1);
        if (decayTimer.current) clearTimeout(decayTimer.current);
        decayTimer.current = setTimeout(() => setShakeSeq(0), DECAY_MS);
        return { ...s, ruleSetVersion: version };
      });
    },
    []
  );

  const dismissDeltas = useCallback(() => setDeltas({}), []);

  const reset = useCallback(() => {
    clearState();
    setState({ ...DEFAULT_STATE });
    setDeltas({});
  }, []);

  useEffect(() => () => decayTimer.current && clearTimeout(decayTimer.current), []);

  return {
    state,
    ruleSet,
    ruleSets: RULE_SETS,
    pipeline,
    statuses,
    progress,
    deltas,
    shakeSeq,
    actions: {
      setUserName,
      finishOnboarding,
      markLearned,
      setFact,
      setPractice,
      switchRuleSet,
      dismissDeltas,
      reset,
    },
  };
}
