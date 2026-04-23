# AI Prompt Design and Evaluation Guide

## Purpose

Build prompt **p = {goal, constraints, instructions, format, expected outcome}** with concrete context anchor.
Then evaluate output with **True/False** and **Positive/Negative** labels.
Then score AI Agent on **Accuracy, Latency, Cost, Stability, Security**.

Anchored to current implementation in:

- [server/src/features/ai/ai-service.ts](server/src/features/ai/ai-service.ts)
- [server/src/features/ai-evaluation/ai-evaluation-service.ts](server/src/features/ai-evaluation/ai-evaluation-service.ts)
- [server/src/shared/database/models/ai-metric-model.ts](server/src/shared/database/models/ai-metric-model.ts)
- [client/src/app/admin/ai-dashboard/page.jsx](client/src/app/admin/ai-dashboard/page.jsx)
- [client/src/app/admin/ai-evaluations/page.jsx](client/src/app/admin/ai-evaluations/page.jsx)
- [client/src/app/admin/ai-test-cases/page.jsx](client/src/app/admin/ai-test-cases/page.jsx)

---

## 1) How to design prompt p (context-anchored)

Design principle: separate intent, hard rules, procedure, and output contract.

### p.goal

- Target optimization objective.
- Example: generate daily meal plan for fat loss at 1800 kcal.

### p.constraints

- Hard rules. Any violation = fail.
- Example: allergies, diet type, servings range, valid dish IDs, meal slot mapping.

### p.instructions

- How model should reason/process.
- Example: use provided catalog only, avoid duplicates, match each slot mealType.

### p.format

- Strict output contract.
- Example: JSON only, fixed schema, no free text.

### p.expected_outcome

- Measurable acceptance criteria.
- Example: schema valid, IDs exist, no allergen hit, macro tolerance met.

### Context anchor rule

- Inject real structured context (user profile, slots, catalog subset, constraints).
- Avoid generic requests like "make healthy meals".
- Specific context reduces hallucination and improves consistency.

---

## 2) Prompt blueprint template

Use one stable template and fill with runtime context.

```text
Goal:
Generate one-day meal recommendation aligned with user objective.

Constraints:
1. Use only dish IDs from provided catalog.
2. Respect allergies and diet restrictions.
3. Servings must be within 1-5.
4. No duplicate dish in same day.
5. Slot mealType must match exactly.

Instructions:
1. Build plan in slot order.
2. Prioritize calorie target and macro balance.
3. If impossible, return explicit reason in error field.

Format:
1. Return JSON only.
2. Schema:
{
  "meals": [
    {
      "mealType": "...",
      "dishes": [{ "dishId": "...", "servings": 1 }]
    }
  ]
}

Expected Outcome:
1. All hard checks pass.
2. Soft score reaches target threshold.
3. Backend can parse and execute output directly.
```

---

## 3) How to decide output is correct (True/False, Positive/Negative)

Use two-layer evaluation.

### Layer A: Deterministic rule checks

- JSON/schema validity.
- Entity existence checks (dish IDs, exercise IDs).
- Constraint checks (allergen, servings range, slot-type match, duplicates).

### Layer B: Semantic quality checks

- Nutrition balance.
- Meal/workout variety.
- Goal and restriction satisfaction.

### Label mapping

- **True** if final score >= threshold.
- **False** if below threshold.
- **Positive** if True.
- **Negative** if False.

Current behavior in code:

- Production meals: pass around rule-score threshold (75).
- Production workout: pass around rule-score threshold (67).
- Evaluation batch: combined score threshold (70).

---

## 4) Accuracy formula

Recommended combined metric:

```text
Accuracy = (RuleScore × 0.6) + (SemanticScore × 0.4)
```

Where:

```text
RuleScore = (passed_hard_checks / total_hard_checks) × 100
SemanticScore = average(semantic sub-scores)
```

### Rating bands

- **85-100**: Excellent
- **70-84**: Good
- **50-69**: Needs improvement
- **0-49**: Poor

### Binary decision

- True/Positive when Accuracy >= 70
- False/Negative when Accuracy < 70

### Strong recommendation

Add confusion matrix tracking:

- TP, TN, FP, FN

This gives better signal than average score only.

---

## 5) How to evaluate AI Agent (5 pillars)

### 1. Accuracy

Primary correctness signal.
Track:

- average accuracy
- pass rate
- true rate
- false negative rate

### 2. Latency

User experience signal.
Track:

- average latency
- p50, p95, p99

### 3. Cost

Efficiency signal.
Track:

- cost per request
- total spend
- token usage/request

### 4. Stability

Reliability signal.
Track:

- success rate
- retry rate
- output variance for same input

### 5. Security

Risk/compliance signal.
Track:

- PII detection count
- prompt injection detection count
- blocked attempt rate

---

## 6) AI working flow and evaluation flow

### Production flow

1. Receive request.
2. Build prompt from context.
3. Invoke model.
4. Run fast validation.
5. Log production metric.
6. Return response.

### Evaluation flow

1. Load enabled test cases.
2. Run prompt batch.
3. Evaluate expected match (exact/mustInclude/regex).
4. Compute rule + semantic + final accuracy.
5. Assign True/False and Positive/Negative.
6. Store evaluation metric.
7. Visualize in admin dashboard.

API route reference:

- [server/src/features/ai-evaluation/ai-evaluation-route.ts](server/src/features/ai-evaluation/ai-evaluation-route.ts)

---

## 7) Most important indicators (good vs bad)

Priority stack:

1. Accuracy average and true rate
2. False negative rate
3. p95 latency
4. Average cost per successful request
5. Stability success rate
6. Security incident count

---

## 8) Gaps to close next

1. Expected classification currently underused in pass/fail logic.
2. Security detection mostly placeholder flags; need real detectors.
3. Stability variance metric still weak; add repeated-input consistency test.
4. Semantic scoring still heuristic in some paths; can upgrade with judge model.

---

## Quick answer to original Vietnamese request (English)

How to design prompt p?

- Build p with 5 parts: goal, constraints, instructions, format, expected outcome.
- Anchor p with concrete runtime context (profile, constraints, catalog, slots).

How to know output is right?

- Use deterministic rule checks + semantic checks.
- Convert score to True/False and Positive/Negative with threshold.

How to judge AI Agent good or bad?

- Evaluate 5 pillars: Accuracy, Latency, Cost, Stability, Security.
- Use numeric indicators and thresholds per pillar.
- Decision quality shown most clearly by Accuracy, FN rate, p95 latency, cost/request, and security incidents.
