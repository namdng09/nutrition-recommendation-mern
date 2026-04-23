# AI Evaluation System - Complete Plan

## Overview

System để đánh giá LLM output cho meal recommendation. Client yêu cầu:

- Xác định output đúng/sai, tốt/xấu bằng True/False, Positive/Negative
- Đánh giá AI Agent theo 5 tiêu chí: Accuracy, Latency, Cost, Stability, Security
- Admin dashboard để view metrics và run evaluations

**Two Metric Sources:**

| Type                   | Source             | Tracked By                     |
| ---------------------- | ------------------ | ------------------------------ |
| **Evaluation Metrics** | Running test cases | Manual trigger (test dataset)  |
| **Production Metrics** | Real user requests | Auto-collect on every API call |

**Why Both:**

- Evaluation might pass but production might fail (different real-world data)
- Production metrics show real latency/cost under load
- Compare test accuracy vs real accuracy to detect drift

**Simplified:** Prompt stored in code/config, no prompt management UI.

**Context:**

- LLM: Gemini
- Integration: LangChain
- Test dataset: Chưa có (cần build)
- Validation: Human check (cần automate)
- UI: Full dashboard (3 pages)
- Priority: Accuracy

---

## 1. Validation Engine

### 2.1 Rule-based Validator

**File:** `server/src/features/ai-evaluation/validators/meal-validator.ts`

```typescript
interface ValidationRule {
  id: string;
  name: string;
  check: (output: LLMOutput, context: ValidationContext) => ValidationResult;
}

interface ValidationResult {
  passed: boolean;
  score: number; // 0-1
  message: string;
  details?: any;
}

class MealRecommendationValidator {
  rules: ValidationRule[] = [
    // Hard checks
    this.jsonSchemaValid,
    this.allDishIdsExist,
    this.noAllergenDishes,
    this.servingsInRange,
    this.noDuplicateDishes,
    this.mealTypeMatch,
    this.mealCountMatch,

    // Soft checks
    this.macroTargetMet,
    this.nutritionVariety,
    this.cookingTimeFeasibility
  ];

  async validate(
    output: LLMOutput,
    context: ValidationContext
  ): Promise<ValidationReport> {
    const results = await Promise.all(
      this.rules.map(rule => rule.check(output, context))
    );

    const hardResults = results.filter(r => r.type === 'hard');
    const softResults = results.filter(r => r.type === 'soft');

    return {
      overallScore: this.calculateScore(hardResults, softResults),
      hard_checks: hardResults,
      soft_checks: softResults,
      passed: hardResults.every(r => r.passed)
    };
  }

  private calculateScore(hard: Result[], soft: Result[]): number {
    const hardScore = hard.filter(r => r.passed).length / hard.length;
    const softScore = soft.reduce((sum, r) => sum + r.score, 0) / soft.length;
    return hardScore * 0.6 + softScore * 0.4;
  }
}
```

### 2.2 Semantic Validator (LLM Judge)

**File:** `server/src/features/ai-evaluation/validators/semantic-validator.ts`

Use Gemini Flash (cheaper model) to score:

```typescript
const SEMANTIC_EVALUATION_PROMPT = `You are an expert nutrition evaluator. 
Score the meal recommendation from 0-100 on:

1. NUTRITION_BALANCE: How well macros are balanced across meals
2. MEAL_VARIETY: Diversity of dishes and cooking methods
3. CONSTRAINT_SATISFACTION: How well user goal/diet is respected

Context:
- User goal: {goal}
- Diet: {diet}
- Calories target: {calories}

Output JSON:
{{
  "nutrition_balance": 85,
  "meal_variety": 70,
  "constraint_satisfaction": 90,
  "reasoning": "Brief explanation"
}}`;

class SemanticValidator {
  async evaluate(
    output: LLMOutput,
    context: ValidationContext
  ): Promise<SemanticScore> {
    const prompt = fillTemplate(SEMANTIC_EVALUATION_PROMPT, context);
    const response = await this.llm.invoke(prompt);
    return parseJsonResponse(response);
  }
}
```

### 2.3 Combined Accuracy Formula

```
Accuracy = (RuleScore × 0.6) + (SemanticScore × 0.4)

Trong đó:
- RuleScore = passed_hard_checks / total_hard_checks × 100
- SemanticScore = avg(nutrition_balance, meal_variety, constraint_satisfaction)

Threshold đánh giá:
- >= 85%: Excellent
- 70-84%: Good
- 50-69%: Needs improvement
- < 50%: Poor
```

---

## 2. Metrics Collection

### 3.1 Per-Request Metrics

**File:** `server/src/features/ai/metrics/ai-metrics.ts`

```typescript
interface AIMetrics {
  // Request identification
  request_id: string;
  source_type: 'evaluation' | 'production'; // NEW: Distinguish metric source
  timestamp: Date;

  // Accuracy
  validation_score: number; // 0-100
  rule_score: number; // 0-100
  semantic_score: number; // 0-100
  passed_hard_checks: number;
  total_hard_checks: number;
  validation_details: CheckResult[];

  // Latency
  total_latency_ms: number;
  time_to_first_token_ms: number;
  generation_time_ms: number;

  // Cost
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number; // Gemini pricing: $0.001-0.005/1k tokens

  // Stability
  output_hash: string; // SHA256 of output
  is_retry: boolean;
  retry_count: number;

  // Security
  pii_detected: boolean;
  prompt_injection_detected: boolean;
  sanitized_input: boolean;
}

interface MetricsAggregate {
  period: string; // "2024-W01", "2024-01-15"
  source_type: 'evaluation' | 'production'; // NEW: Distinguish metric source

  // Averaged metrics
  avg_accuracy: number;
  avg_latency_ms: number;
  avg_cost_usd: number;

  // Counts
  total_requests: number;
  successful_requests: number;
  failed_requests: number;

  // Stability
  variance_score: number; // Lower = more stable
}
```

### 3.2 Metrics Collection Middleware

```typescript
// Middleware to collect metrics on every LLM call
class MetricsMiddleware {
  async invoke(
    prompt: string,
    context: any
  ): Promise<{ output: any; metrics: AIMetrics }> {
    const startTime = Date.now();
    const requestId = generateUUID();

    try {
      // Call LLM
      const output = await this.llm.invoke(prompt);
      const firstTokenTime = Date.now();

      // Validate
      const validation = await this.validator.validate(output, context);
      const semantic = await this.semanticValidator.evaluate(output, context);

      const metrics: AIMetrics = {
        request_id: requestId,
        timestamp: new Date(),

        validation_score: validation.overallScore,
        rule_score: validation.hardScore,
        semantic_score: semantic.overallScore,

        total_latency_ms: Date.now() - startTime,
        time_to_first_token_ms: firstTokenTime - startTime,

        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        estimated_cost_usd: this.calculateCost(usage),

        output_hash: hash(output),
        pii_detected: false,
        prompt_injection_detected: false
      };

      // Save to DB
      await this.metricsRepository.save(metrics);

      return { output, metrics };
    } catch (error) {
      await this.metricsRepository.save({
        request_id: requestId,
        error: error.message,
        failed: true
      });
      throw error;
    }
  }
}
```

### 3.3 Production Metrics Collection (Auto-collect on Real API Calls)

**NEW:** Track metrics on every real production request automatically.

```typescript
// In meal recommendation service - auto-capture production metrics
class MealRecommendationService {
  async generateMeal(input: IInputGenerateMeal): Promise<MealRecommendation> {
    const startTime = Date.now();
    const requestId = generateUUID();

    try {
      // Existing logic...
      const output = await this.generateMealRecommendation(input);

      // Auto-validate (rule-based only for production - skip expensive semantic)
      const validation = await this.validator.validate(output, context);

      // Log metrics with source_type = "production"
      await this.metricsService.log({
        request_id: requestId,
        source_type: 'production', // Auto-mark as production
        timestamp: new Date(),
        validation_score: validation.overallScore,
        latency_ms: Date.now() - startTime,
        tokens_used: usage.total_tokens,
        cost_usd: this.calculateCost(usage),
        status: 'success'
      });

      return output;
    } catch (error) {
      // Log failed request
      await this.metricsService.log({
        request_id: requestId,
        source_type: 'production',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }
}
```

**Key difference:**

| Source     | Validation                 | Metrics Collected            |
| ---------- | -------------------------- | ---------------------------- |
| Production | Rule-based only (fast)     | Basic (score, latency, cost) |
| Evaluation | Rule + Semantic (thorough) | Full (with semantic scores)  |

---

## 3. Test Dataset Builder

### 4.1 Test Case Structure

**File:** `server/src/features/ai/test-data/test-case.ts`

```typescript
interface TestCase {
  id: string;
  name: string;
  description: string;

  // Input
  input: {
    user_profile: IUserProfile;
    meal_slots: IMealSlot[];
    dish_catalog: IDishCatalog;
  };

  // Expected output (ground truth)
  expected_output: {
    meals: IMeal[];
    total_calories?: number;
    macro_breakdown?: MacroBreakdown;
  };

  // Validation rules for this test case
  validation_rules: string[]; // IDs of rules to apply

  // Metadata
  category: 'happy_path' | 'edge_case' | 'constraint_test' | 'error_case';
  difficulty: 'easy' | 'medium' | 'hard';
  created_by: 'synthetic' | 'human';
  tags: string[];
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  test_cases: string[]; // TestCase IDs
  created_at: Date;
}
```

### 4.2 Synthetic Test Data Generation

**Strategy:**

1. **Happy Path (40%)**

   - Normal user profiles
   - Standard meal slots
   - Full dish catalog available

2. **Edge Cases (30%)**

   - Extreme calorie goals (very low/high)
   - Multiple allergens
   - Very limited dish catalog

3. **Constraint Tests (20%)**

   - Vegan diet + low carb
   - Muscle gain + calorie deficit (conflict)
   - All slots same meal type

4. **Error Cases (10%)**
   - Empty catalog
   - Invalid user profile
   - Missing required fields

**Generation Script:**

```typescript
class TestDataGenerator {
  async generateTestSuite(count: number): Promise<TestCase[]> {
    const cases: TestCase[] = [];

    // Generate happy path cases
    for (let i = 0; i < count * 0.4; i++) {
      cases.push(this.generateHappyPath());
    }

    // Generate edge cases
    for (let i = 0; i < count * 0.3; i++) {
      cases.push(this.generateEdgeCase());
    }

    // ... etc

    return cases;
  }

  private generateHappyPath(): TestCase {
    return {
      // Random valid user profile
      // Standard meal slots (breakfast, lunch, dinner)
      // Full catalog (100+ dishes)
      // Expected: valid meal plan meeting all constraints
    };
  }
}
```

---

## 4. Database Models

### 5.1 Test Case Collection

```typescript
// mongoose model: TestCase
{
  _id: ObjectId,
  name: String,
  description: String,

  // Input
  input: {
    user_profile: Object,
    meal_slots: [Object],
    dish_catalog: [Object]
  },

  // Expected output
  expected_output: Object,
  validation_rules: [String],

  // Metadata
  category: String,
  difficulty: String,
  created_by: String,
  tags: [String],

  created_at: Date
}
```

### 5.3 Evaluation Result Collection

```typescript
// mongoose model: EvaluationResult
{
  _id: ObjectId,

  // References
  test_case_id: ObjectId,
  evaluation_run_id: ObjectId,

  // Input
  input_hash: String,

  // Output
  llm_output: Object,
  output_hash: String,

  // Validation
  validation_score: Number,
  rule_score: Number,
  semantic_score: Number,
  hard_check_results: [{
    rule_name: String,
    passed: Boolean,
    message: String
  }],
  soft_check_results: [{
    metric_name: String,
    score: Number,
    reasoning: String
  }],

  // Metrics
  latency_ms: Number,
  tokens_used: Number,
  cost_usd: Number,

  // Status
  status: String,           // "success" | "failed" | "error"
  error_message: String?,

  created_at: Date
}
```

### 5.4 Metrics Aggregate Collection

```typescript
// mongoose model: MetricsAggregate
{
  _id: ObjectId,

  period: String,           // "daily", "weekly", "monthly"
  period_key: String,       // "2024-01-15", "2024-W03"

  // Aggregated values
  total_requests: Number,
  success_count: Number,
  failure_count: Number,

  avg_accuracy: Number,
  avg_latency_ms: Number,
  avg_cost_usd: Number,

  // Distribution
  accuracy_histogram: [Number],   // Count by score ranges
  latency_p50: Number,
  latency_p95: Number,
  latency_p99: Number,

  // Stability
  unique_outputs: Number,
  output_variance: Number,

  created_at: Date,
  updated_at: Date
}
```

---

## 5. API Endpoints

### 6.1 Masterdata APIs

```
Test Cases:
GET    /api/admin/test-cases           - List test cases
POST   /api/admin/test-cases           - Create test case
PUT    /api/admin/test-cases/:id       - Update test case
DELETE /api/admin/test-cases/:id       - Delete test case
POST   /api/admin/test-cases/bulk      - Bulk import test cases
GET    /api/admin/test-cases/generate  - Generate synthetic test cases
```

### 6.2 Evaluation APIs

```
Evaluation Runs:
POST   /api/admin/evaluations                    - Start evaluation batch
GET    /api/admin/evaluations                     - List evaluation runs
GET    /api/admin/evaluations/:id                 - Get evaluation run detail
GET    /api/admin/evaluations/:id/results         - Get all results for a run
POST   /api/admin/evaluations/:id/cancel          - Cancel running evaluation

Single Evaluation:
POST   /api/ai/evaluate                           - Evaluate single request (real-time)
GET    /api/ai/validate                           - Validate output against rules
```

### 6.3 Metrics APIs

```
GET    /api/admin/metrics/summary                 - Get metrics summary
GET    /api/admin/metrics/trends                  - Get metrics trends (time series)
GET    /api/admin/metrics/distribution             - Get accuracy/cost distribution
GET    /api/admin/metrics/dashboard               - Dashboard data (aggregated)
GET    /api/admin/metrics/by-source               - NEW: Compare evaluation vs production
```

**NEW: By Source Query Parameter**

All metrics APIs support `?source=evaluation|production|both`

```
GET    /api/admin/metrics/summary?source=production  - Production only
GET    /api/admin/metrics/summary?source=evaluation - Test evaluation only
GET    /api/admin/metrics/summary?source=both       - Combined view
```

### 6.4 Response Examples

```json
// POST /api/admin/evaluations
{
  "id": "eval_001",
  "status": "running",
  "progress": {
    "total": 100,
    "completed": 45,
    "failed": 2
  },
  "started_at": "2024-01-20T10:00:00Z"
}

// GET /api/admin/metrics/summary
{
  "period": "2024-01-20",
  "source_type": "evaluation",
  "accuracy": {
    "avg": 82.5,
    "min": 45,
    "max": 98,
    "p50": 85,
    "p95": 92
  },
  "latency": {
    "avg_ms": 2500,
    "p50_ms": 2200,
    "p95_ms": 4500
  },
  "cost": {
    "avg_usd": 0.003,
    "total_usd": 15.50,
    "total_requests": 5000
  },
  "stability": {
    "variance_score": 0.12
  },
  "security": {
    "pii_detected": 0,
    "injection_attempts": 0
  }
}

// GET /api/admin/metrics/compare
{
  "versions": ["1.0.0", "2.0.0"],
  "comparison": {
    "accuracy": {
      "1.0.0": 75.2,
      "2.0.0": 82.5,
      "improvement": "+7.3%"
    },
    "latency": {
      "1.0.0": 2800,
      "2.0.0": 2500,
      "improvement": "-10.7%"
    },
    "cost": {
      "1.0.0": 0.004,
      "2.0.0": 0.003,
      "improvement": "-25%"
    }
  }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1)

- [ ] Create database models (TestCase, EvaluationResult, MetricsAggregate, EvaluationRun)
- [ ] Implement Rule-based Validator
- [ ] Add metrics collection middleware to existing LLM calls (production auto-track)
- [ ] Create evaluation API

### Phase 2: Test Data (Week 2)

- [ ] Build Test Data Generator (synthetic cases)
- [ ] Create human curation flow for test cases
- [ ] Implement Semantic Validator (LLM judge)
- [ ] Build evaluation batch processing

### Phase 3: Analytics (Week 3)

- [ ] Implement metrics aggregation (daily/weekly)
- [ ] Build trend analysis
- [ ] Create metrics dashboard APIs

### Phase 4: UI Dashboard (Week 4)

- [ ] Build Dashboard AI page
- [ ] Build Evaluations page
- [ ] Build Test Cases page
- [ ] Polish + styling

---

## 7. File Structure

```
server/src/features/ai/
├── validators/
│   ├── meal-validator.ts           # Rule-based validator
│   ├── semantic-validator.ts       # LLM-based semantic scoring
│   └── validation-rules.ts         # Individual rule implementations
├── metrics/
│   ├── ai-metrics.ts              # Metrics interface & collection
│   ├── metrics-middleware.ts       # Middleware for auto-collection
│   └── metrics-aggregator.ts      # Aggregation logic
├── evaluation/
│   ├── evaluation-runner.ts       # Batch evaluation processor
│   ├── evaluation-service.ts      # Evaluation business logic
│   └── evaluation-controller.ts   # REST APIs
├── test-data/
│   ├── test-case.ts               # Test case model
│   └── test-generator.ts          # Synthetic test generation
└── admin/
    ├── admin-metrics-controller.ts # Metrics APIs
    └── admin-evaluation-controller.ts   # Evaluation + Test Case APIs
```

---

## 8. Evaluation Criteria Reference

### Hard Constraints (Must Pass)

| Rule                | Check                                | Pass Condition             |
| ------------------- | ------------------------------------ | -------------------------- |
| json_schema_valid   | Output is valid JSON matching schema | JSON parses + schema match |
| dish_existence      | All dishIds exist in catalog         | 100% exist                 |
| allergen_check      | No dishes contain user allergens     | 0 allergen dishes          |
| servings_range      | All servings are 1-5                 | 100% in range              |
| no_duplicate_dishes | No repeat dishId in same day         | 0 duplicates               |
| meal_type_match     | mealType matches slot.mealType       | 100% match                 |

### Soft Constraints (Scored 0-100)

| Metric                   | Weight | Good         | Fair   | Poor |
| ------------------------ | ------ | ------------ | ------ | ---- |
| macro_balance            | 35%    | >=80% target | 60-79% | <60% |
| nutrition_variety        | 25%    | >=70         | 50-69  | <50  |
| constraint_satisfaction  | 25%    | >=90         | 70-89  | <70  |
| cooking_time_feasibility | 15%    | >=80         | 60-79  | <60  |

### Overall Rating

| Score | Rating     | Action             |
| ----- | ---------- | ------------------ |
| >= 85 | Excellent  | Ship/Deploy        |
| 70-84 | Good       | Minor improvements |
| 50-69 | Needs Work | Major improvements |
| < 50  | Poor       | Do not deploy      |

---

## 9. Cost Estimation (Gemini)

| Operation           | Input Tokens | Output Tokens | Est. Cost  |
| ------------------- | ------------ | ------------- | ---------- |
| Meal Generation     | ~2000        | ~500          | $0.0025    |
| Semantic Validation | ~1500        | ~200          | $0.0015    |
| Total per request   | ~3500        | ~700          | **$0.004** |

**Monthly estimate:** 10,000 requests × $0.004 = **$40/month**

---

## 10. Admin UI Dashboard

### 11.1 Tech Stack

- **React 19 + Vite + Tailwind CSS 4**
- **shadcn/ui** (Radix UI components)
- **TanStack Query** (React Query v5)
- **Recharts** for charts
- **Lucide React** icons
- Pattern: Same as existing admin dashboard

### 11.2 Sidebar Integration

**File:** `client/src/components/admin/admin-sidebar.jsx`

Add new section "Quản lý AI" to adminNavSections:

```javascript
{
  title: 'Quản lý AI',
  items: [
    {
      title: 'Dashboard AI',
      url: '/admin/ai-dashboard',
      icon: Cpu
    },
    {
      title: 'Đánh giá',
      url: '/admin/ai-evaluations',
      icon: FlaskConical
    },
    {
      title: 'Test Cases',
      url: '/admin/ai-test-cases',
      icon: TestTube
    }
  ]
}
```

### 11.3 Page Structure

```
client/src/
├── app/admin/
│   ├── ai-dashboard/
│   │   └── page.jsx              # Main metrics dashboard
│   ├── ai-evaluations/
│   │   └── page.jsx              # Run evaluations + results
│   └── ai-test-cases/
│       └── page.jsx              # Test case list
└── features/ai-evaluation/
    ├── api/
    │   ├── use-evaluations.js    # TanStack Query hooks
    │   └── use-metrics.js
    ├── components/
    │   ├── metrics-cards.jsx     # 4 metric cards (Accuracy, Latency, Cost, Stability)
    │   ├── metrics-chart.jsx     # Recharts line/bar charts
    │   ├── evaluation-runner.jsx # Run evaluation form
    │   └── evaluation-results.jsx # Results table
    └── hooks/
```

### 11.4 Dashboard AI Page (`/admin/ai-dashboard`)

**Layout:** Similar to existing admin dashboard (payment status breakdown)

**Components:**

1. **Metric Cards** (4 cards in grid):

   - **Accuracy**: Score 0-100% with color badge (Green >=85, Yellow 70-84, Red <70)
   - **Latency**: Average ms with p50/p95
   - **Cost**: Total spend ($) + per-request cost
   - **Stability**: Variance score (0-1, lower = more stable)

2. **Source Toggle**: Show metrics for:

   - **Evaluation** (test runs)
   - **Production** (real user requests)
   - **Both** (combined comparison)

3. **Main Chart**: Line chart - Accuracy trend over time (daily/weekly)
4. **Secondary Chart**: Bar chart - Compare evaluation vs production

**Interaction:**

- Range selector (today, last7days, last30days, thisMonth, etc.)
- Source filter (Evaluation / Production / Both)
- Manual refresh button "Làm mới" (like existing dashboard)
- Manual polling (not real-time)

### 11.5 Evaluations Page (`/admin/ai-evaluations`)

**Layout:** Two sections (top + bottom)

**Top Section - Run Evaluation:**

- Select Test Suite (Dropdown)
- Button "Chạy đánh giá"
- Progress bar (when running)

**Bottom Section - Results Table:**
| Column | Description |
|--------|-------------|
| Test Case | Name of test case |
| Score | 0-100 |
| Latency | ms |
| Cost | $ |
| Status | Success / Failed |
| Actions | View Detail |

**Filters:**

- By date range
- By status

### 11.6 Test Cases Page (`/admin/ai-test-cases`)

**Table Columns:**
| Column | Description |
|--------|-------------|
| Name | Test case name |
| Category | happy_path, edge_case, constraint_test, error_case |
| Difficulty | easy, medium, hard |
| Created | Date |
| Actions | View, Delete |

**Actions:**

- Button "Tạo test case mới"
- Bulk delete

### 11.7 API Hooks Pattern

Following existing pattern (like `useAdminDashboard`):

```javascript
// features/ai-evaluation/api/use-metrics.js
export const useAIMetrics = (params, options) => {
  return useQuery({
    queryKey: ['ai-metrics', params],
    queryFn: () => fetchAIMetrics(params),
    ...options
  });
};
```

### 11.9 Color Scheme for Metrics

| Metric    | Green (Good) | Yellow (Fair) | Red (Poor) |
| --------- | ------------ | ------------- | ---------- |
| Accuracy  | >= 85%       | 70-84%        | < 70%      |
| Latency   | < 2000ms     | 2000-4000ms   | > 4000ms   |
| Cost      | < $0.005     | $0.005-$0.01  | > $0.01    |
| Stability | < 0.2        | 0.2-0.5       | > 0.5      |

### 10.8 Implementation Priority

1. **Phase 1**: Backend APIs first (Evaluation, Metrics, Test Cases endpoints)
2. **Phase 2**: API hooks + Dashboard AI page
3. **Phase 3**: Evaluations page (run + view results)
4. **Phase 4**: Test Cases page (list + add + delete)
5. **Phase 5**: Polish + styling

---

## Summary

System này provide:

1. **Dual Metric Sources**: Track both Evaluation (test) + Production (real) metrics
2. **Output Validation**: Rule-based + Semantic = Combined Accuracy
3. **Metrics Tracking**: Accuracy, Latency, Cost, Stability, Security per request
4. **Admin APIs**: Evaluation runs, test cases, metrics endpoints with source filter
5. **Admin UI Dashboard**: 3 pages (Dashboard AI, Đánh giá, Test Cases)
6. **Test Data**: Synthetic generation + human curation
7. **Documentation**: Criteria, thresholds, and explanations

All UI follows existing admin pattern with shadcn/ui components.

**Simplified:** No prompt management (stored in code/config). Focus on output validation only.
**Key insight:** Compare test accuracy vs production accuracy to detect drift.
