# 성환이 집 구하기 — MVP

집 구하는 데 필요한 모든 개념(종잣돈·청약·대출·매물·계약)이 뇌처럼 얽힌 그래프 하나.
노드를 눌러 배우고, **아는 팩트만** 답하면 계산돼서 내 값이 박히고, **규제 규칙셋이 바뀌면 전체가 다시 계산**된다.

이 그래프가 곧 진행률이자 체크리스트이자 개념사전이다.

## 실행

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # STEP 1: 재계산 엔진을 콘솔에서 검증 (규칙셋 2개 비교)
npm run build     # 프로덕션 빌드
```

## 지금 도는 것 (MVP 범위)

| 스펙 항목 | 구현 |
|---|---|
| 재계산 엔진 `calculate(UserFacts, RuleSet) → Pipeline` (순수 함수) | [src/engine/calculate.js](src/engine/calculate.js) |
| 규칙셋 정적 데이터 2개 (현행 / 규제지역) — 하드코딩 금지 | [src/data/ruleSets.js](src/data/ruleSets.js) |
| 지식 그래프 35노드 · 5영역 · 영역 간 교차 연결 | [src/data/nodes.js](src/data/nodes.js), [src/data/edges.js](src/data/edges.js) |
| force-directed 그래프 UI, 3단계 상태(미학습/배움/내값있음), 클릭 상세 | [src/components/BrainGraph.jsx](src/components/BrainGraph.jsx), [src/components/NodeDetail.jsx](src/components/NodeDetail.jsx) |
| 카드 UX — 아는 팩트만, 안 배운 개념은 배우기 카드 먼저 | [src/components/CardFlow.jsx](src/components/CardFlow.jsx), [src/data/cardDeck.js](src/data/cardDeck.js) |
| 규칙셋 전환 → 영향받는 노드 흔들림 + 변화량(▼0.5억) 배지 | [src/hooks/useAppState.js](src/hooks/useAppState.js) `switchRuleSet`, [src/components/RuleSetSwitcher.jsx](src/components/RuleSetSwitcher.jsx) |
| 완성도 % (미학습/배움/내값있음 비율) | [src/components/ProgressStats.jsx](src/components/ProgressStats.jsx) |
| 작성 연습 — 등기부등본·특약사항·전세보증보험 미니 양식 + "왜 봐야 하는지" | [src/components/WritingPractice.jsx](src/components/WritingPractice.jsx), [src/data/writingPractice.js](src/data/writingPractice.js) |
| 온보딩 이름 입력 → "OO이 집 구하기" 개인화 | [src/components/QuickStart.jsx](src/components/QuickStart.jsx) — 3탭(생애최초·소득·목표집값)만 받고 바로 그래프 |
| "연습장입니다 / 최종 확정은 은행·전문가와" 상시 안내 | 화면 하단 disclaimer + 연습 모달 상단 note |
| STEP 레일 — 실제 집 구하는 7단계 순서 | [src/data/journey.js](src/data/journey.js), [src/components/StepRail.jsx](src/components/StepRail.jsx), [src/components/StepPanel.jsx](src/components/StepPanel.jsx) |
| 단계별 할 일 체크 + "이 단계 완료" | [src/components/StepPanel.jsx](src/components/StepPanel.jsx), useAppState `stepsDone`/`stepTodos` |
| 집 짓기 애니메이션 — STEP 완료마다 집 부위 조립 | [src/components/HouseProgress.jsx](src/components/HouseProgress.jsx) (framer-motion) |
| 노드 탭 인라인 편집 (마법사 안 거침) | [src/components/FactField.jsx](src/components/FactField.jsx) `InlineFactField`, [src/components/NodeDetail.jsx](src/components/NodeDetail.jsx) |
| 그래프 모션 — 노드 채움 팝, 재계산 흔들림, 영역 5엽 군집 | [src/components/BrainGraph.jsx](src/components/BrainGraph.jsx), [src/hooks/useForceSimulation.js](src/hooks/useForceSimulation.js) |

### 데이터 흐름

```
UserFacts (아는 것: 생애최초·소득·지역·목표집값 …)
        +
RegulationRuleSet (LTV·DSR·규제지역·취득세율 … — 데이터로 분리)
        ↓  calculate()  ← 순수 함수, 재계산 엔진의 심장
   Pipeline (LTV율·대출한도·필요현금·부족분·청약가점 …)
        ↓
KnowledgeNode.status  =  미학습 → 배움 → 내값있음
        ↓
BrainGraph (뇌 그래프 = 지도 + 체크리스트 + 개념사전)
```

규칙셋만 교체하면 같은 UserFacts로 다른 Pipeline이 나온다 → 노드가 흔들리며 새 값으로 갱신.

## 저장소

MVP는 `localStorage` ([src/lib/storage.js](src/lib/storage.js)). `loadState()` / `saveState()` 인터페이스를 그대로 Supabase 구현으로 교체하면 Phase 2 이관 완료.

## Phase 2 (미구현)

- 규제 능동 푸시 알림 (실시간 정책 감지 → 규칙셋 자동 번역)
- 캐릭터 '성환이' 성장 연출
- 랭킹 / 소셜 / 그래프 공유, 타인 성공 경로 재현 (UserProgress 완료 로그가 기반)
- 실거래가(국토부)·청약(청약홈) 실 API 연동
- Claude API로 노드 설명 동적 생성

## 검증 데모 (참고)

`reference/homebuying-brain-pipeline.jsx` — 재계산 엔진 원형 (데모 #4). 최종 엔진은 이걸 5영역 그래프로 일반화한 것.

## 두 가지 보기

- **가이드 모드 (기본)** — [src/components/GuideMode.jsx](src/components/GuideMode.jsx). 초보자용. 한 번에 개념 하나씩:
  쉬운 설명 → (필요하면) 입력 → "당신은 지금 X예요" 결과 문장. STEP 끝마다 [narration.js](src/data/narration.js)가
  숫자를 문장·표로 엮어주는 정리 화면 + 집 부위 조립.
- **전체 지도 (심화)** — 뇌 그래프. "개념이 어떻게 얽혀 있는지" 보고 싶을 때. 가이드에서 "🗺️ 전체 지도로 보기"로 전환.

## STEP (실제 집 구하는 순서)

1. 얼마짜리 집이 가능한가 (자금 파악) → 2. 종잣돈 계획 → 3. 어디서 살까 (지역·매물) →
4. 청약 노려보기 → 5. 대출 확정 준비 → 6. 계약 → 7. 잔금·등기·입주

"이 단계 완료"(또는 가이드에서 STEP 정리 후 '다음')를 누르면 [HouseProgress](src/components/HouseProgress.jsx)의
집 부위가 조립된다(기초→벽→지붕→창문→문→울타리→열쇠).

## 스택

React 18 (Vite) · d3-force · framer-motion · localStorage(→ Supabase) · Vercel 배포 대상

## 배포 (Cloudflare Pages)

정적 SPA라 빌드 산출물(`dist/`)만 올리면 된다.

1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**
2. `choisunghwan/get-jip` 선택
3. 빌드 설정 (Vite 프리셋 자동):
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - (Node 버전은 `.nvmrc`(20)로 고정)
4. Save and Deploy → `get-jip.pages.dev`

이후 `main` push마다 자동 배포, PR마다 프리뷰 URL.
SPA 폴백은 `public/_redirects`(`/* /index.html 200`)로 처리.
