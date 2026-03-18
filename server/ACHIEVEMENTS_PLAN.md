# Achievement Module Plan - USER Role

This document outlines the planned achievement categories and milestones for the **USER** role, focusing on meaningful milestones that track user behavior across the platform's core features (Schedules, Groceries, Posts, and Targets).

---

## 1. Category: The "Full Circle" (Ecosystem Mastery)

_Tracks the completion of the entire nutrition loop: Planning → Shopping → Executing._

| Achievement             | Requirement                            |
| :---------------------- | :------------------------------------- |
| **The Planner**         | Successfully complete 5 "Full Cycles"  |
| **The Disciplined**     | Successfully complete 20 "Full Cycles" |
| **Lifestyle Architect** | Successfully complete 50 "Full Cycles" |

- **Logic:** A "Full Cycle" is counted when a dish added to a **Schedule** has its ingredients checked off in the **Grocery** list and is finally marked as **"Completed"** in the schedule.

---

## 2. Category: The "Diverse Palate" (Nutritional Exploration)

_Tracks the variety of nutrients and recipes the user interacts with._

| Achievement              | Requirement                                                    |
| :----------------------- | :------------------------------------------------------------- |
| **Ingredient Explorer**  | Use 20 **unique** ingredients across all logged meals          |
| **Variety Seeker**       | Log meals from 5 different dish categories (e.g., Vegan, Keto) |
| **Nutritional Polymath** | Use 50 **unique** ingredients across all logged meals          |

- **Logic:** Tracks cumulative unique identifiers (IDs) for ingredients and category strings.

---

## 3. Category: The "Social Catalyst" (Community Influence)

_Tracks the value the user provides to the community through interactions._

| Achievement           | Requirement                                                |
| :-------------------- | :--------------------------------------------------------- |
| **Spark of Interest** | Your posts receive a total of 50 likes                     |
| **Helpful Peer**      | Your comments on others' posts receive a total of 10 likes |
| **Community Beacon**  | Your posts receive a total of 200 likes and 50 comments    |

- **Logic:** Tracks aggregate engagement received on the user's contributions (Posts/Comments).

---

## 4. Category: The "Target Specialist" (Goal Adherence)

_Tracks consistency relative to the active `USER_TARGET` (Lose Fat, Build Muscle, etc.)._

| Achievement             | Requirement                                               |
| :---------------------- | :-------------------------------------------------------- |
| **On the Mark**         | Hit your target macro/calorie range for 7 total days      |
| **Phase Master**        | Hit your target macro/calorie range for 30 total days     |
| **Unyielding Progress** | Maintain a 14-day streak of hitting your nutrition target |

- **Logic:** Compares daily logged nutrients against the ranges defined for the user's current target.

---

## 5. Category: The "Grocery Guru" (Kitchen Efficiency) - Optional

_Tracks the management of the kitchen through the grocery feature._

| Achievement         | Requirement                                                  |
| :------------------ | :----------------------------------------------------------- |
| **Kitchen Manager** | Successfully clear/complete 10 full grocery lists            |
| **Bulk Organizer**  | Add and check off a total of 100 items in the grocery module |

---

## Implementation Notes:

### Metrics to Track (Counters)

To power these achievements, you will need to implement or increment the following counters in your database:

1. `unique_ingredient_ids`: A Set or array of unique Ingredient ObjectIDs.
2. `received_likes_count`: Total likes received on user-owned content.
3. `target_aligned_days`: Total count of days meeting nutritional targets.
4. `loop_completion_count`: Incremented when the `Schedule -> Grocery -> Complete` flow is finalized.
