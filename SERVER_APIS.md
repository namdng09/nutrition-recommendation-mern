# Server API Documentation

**Base URL:** `/api`

---

## Table of Contents

1. [Achievements](#achievements)
2. [Auth](#auth)
3. [Users](#users)
4. [Dashboard](#dashboard)
5. [Ingredients](#ingredients)
6. [Dishes](#dishes)
7. [Collections](#collections)
8. [Schedules](#schedules)
9. [Posts](#posts)
10. [Groceries](#groceries)
11. [AI](#ai)
12. [Payments](#payments)
13. [Exercises](#exercises)

---

## Achievements

**Base Path:** `/api/achievements`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| GET | `/` | ❌ | - | Get all achievement definitions (Public) |
| GET | `/sse` | ✅ | - | Subscribe to achievement updates (SSE) |
| GET | `/me` | ✅ | USER | Get user's achievements |

---

## Auth

**Base Path:** `/api/auth`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/login` | ❌ | - | Login with email and password |
| GET | `/google` | ❌ | - | Initiate Google OAuth authentication |
| GET | `/google/callback` | ❌ | - | Google OAuth callback |
| POST | `/sign-up` | ❌ | - | Register new user account |
| POST | `/logout` | ✅ | - | Logout user |
| POST | `/refresh-access-token` | ✅ | - | Refresh access token |
| POST | `/forgot-password` | ❌ | - | Request password reset link |
| POST | `/reset-password` | ❌ | - | Reset password with token |

---

## Users

**Base Path:** `/api/users`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | ADMIN | Create user (Admin only) |
| GET | `/` | ✅ | ADMIN | Get all users (Admin only) |
| DELETE | `/` | ✅ | ADMIN | Delete multiple users (Admin only) |
| GET | `/me` | ✅ | - | Get current user profile |
| POST | `/me/onboarding` | ✅ | - | Complete user onboarding |
| POST | `/me/nutrition-target` | ✅ | - | Calculate nutrition target |
| PUT | `/me/profile` | ✅ | - | Update user profile |
| PUT | `/me/physical-stats` | ✅ | - | Update physical statistics |
| PUT | `/me/nutrition-target` | ✅ | - | Update nutrition target |
| PUT | `/me/restrictions` | ✅ | - | Update dietary restrictions |
| PUT | `/me/allergens` | ✅ | - | Update allergens |
| PUT | `/me/schedule-settings` | ✅ | - | Update schedule settings |
| PUT | `/me/nutritionist-profile` | ✅ | - | Update nutritionist profile |
| POST | `/me/favorites/dishes` | ✅ | - | Add favorite dish |
| DELETE | `/me/favorites/dishes` | ✅ | - | Remove favorite dish |
| POST | `/me/favorites/ingredients` | ✅ | - | Add favorite ingredient |
| DELETE | `/me/favorites/ingredients` | ✅ | - | Remove favorite ingredient |
| POST | `/me/favorites/collections` | ✅ | - | Add favorite collection |
| DELETE | `/me/favorites/collections` | ✅ | - | Remove favorite collection |
| POST | `/me/blocks/dishes` | ✅ | - | Block dish from recommendations |
| DELETE | `/me/blocks/dishes` | ✅ | - | Unblock dish |
| POST | `/me/blocks/ingredients` | ✅ | - | Block ingredient |
| DELETE | `/me/blocks/ingredients` | ✅ | - | Unblock ingredient |
| POST | `/me/certificate` | ✅ | NUTRITIONIST | Upload nutritionist certificate |
| PUT | `/me/certificate/visibility` | ✅ | NUTRITIONIST | Toggle certificate visibility |
| GET | `/pending-certificates/count` | ✅ | ADMIN | Get pending certificates count (Admin only) |
| PUT | `/:id/certificate/approve` | ✅ | ADMIN | Approve user certificate (Admin only) |
| PUT | `/:id/certificate/reject` | ✅ | ADMIN | Reject user certificate (Admin only) |
| GET | `/nutritionists` | ❌ | - | Get all nutritionists (Public) |
| GET | `/:id/profile` | ❌ | - | Get nutritionist profile (Public) |
| GET | `/:id` | ✅ | ADMIN | Get user detail (Admin only) |
| PUT | `/:id` | ✅ | ADMIN | Update user details (Admin only) |

---

## Dashboard

**Base Path:** `/api/dashboard`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| GET | `/admin` | ✅ | ADMIN | View admin dashboard |
| GET | `/nutritionist` | ✅ | NUTRITIONIST | View nutritionist dashboard |

---

## Ingredients

**Base Path:** `/api/ingredients`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | NUTRITIONIST | Create ingredient |
| GET | `/` | ❌ | - | Get all ingredients (Public) |
| DELETE | `/` | ✅ | NUTRITIONIST, ADMIN | Delete multiple ingredients |
| GET | `/:id` | ❌ | - | Get ingredient detail (Public) |
| PUT | `/:id` | ✅ | NUTRITIONIST | Update ingredient |
| DELETE | `/:id` | ✅ | NUTRITIONIST, ADMIN | Delete ingredient |

---

## Dishes

**Base Path:** `/api/dishes`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | NUTRITIONIST | Create dish |
| GET | `/` | ❌ | - | Get all dishes (Public) |
| DELETE | `/` | ✅ | NUTRITIONIST, ADMIN | Delete multiple dishes |
| GET | `/:id` | ❌ | - | Get dish detail (Public) |
| PUT | `/:id` | ✅ | NUTRITIONIST, ADMIN | Update dish |
| DELETE | `/:id` | ✅ | NUTRITIONIST, ADMIN | Delete dish |

---

## Collections

**Base Path:** `/api/collections`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | NUTRITIONIST | Create collection |
| GET | `/` | ❌ | - | View collections (Public) |
| DELETE | `/` | ✅ | NUTRITIONIST, ADMIN | Delete multiple collections |
| GET | `/:id` | ❌ | - | View collection detail (Public) |
| PUT | `/:id` | ✅ | NUTRITIONIST | Update collection |
| DELETE | `/:id` | ✅ | NUTRITIONIST, ADMIN | Delete collection |
| POST | `/:id/dishes` | ✅ | NUTRITIONIST | Add dishes to collection |
| DELETE | `/:id/dishes` | ✅ | NUTRITIONIST | Remove dishes from collection |

---

## Schedules

**Base Path:** `/api/schedules`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | USER, NUTRITIONIST, ADMIN | Create schedule |
| GET | `/` | ✅ | - | Get all schedules |
| GET | `/:id` | ✅ | - | Get schedule detail |
| PUT | `/:id` | ✅ | USER, NUTRITIONIST, ADMIN | Update schedule |
| POST | `/:id/workout/exercises` | ✅ | USER | Add workout exercise to schedule |
| PUT | `/:id/workout/exercises/:exerciseId` | ✅ | USER | Update workout exercise |
| PUT | `/:id/meals` | ✅ | USER | Update schedule meals |
| PUT | `/:id/meals/:mealType/dishes/:dishId/is-eaten` | ✅ | USER | Mark dish as eaten |
| DELETE | `/:id` | ✅ | USER | Delete schedule |
| DELETE | `/:id/workout/exercises/:exerciseId` | ✅ | USER | Remove workout exercise |
| DELETE | `/:id/meals/:mealType/dishes/:dishId` | ✅ | USER | Remove dish from meals |
| DELETE | `/:id/meals/:mealType/dishes` | ✅ | USER | Clear all dishes from meal type |

---

## Posts

**Base Path:** `/api/posts`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | USER, NUTRITIONIST, ADMIN | Create post |
| GET | `/` | ❌ | - | Get all posts (Public) |
| GET | `/:id` | ❌ | - | Get post detail (Public) |
| GET | `/slug/:slug` | ❌ | - | Get post by slug (Public, Not used) |
| PUT | `/:id` | ✅ | USER, NUTRITIONIST, ADMIN | Update post |
| DELETE | `/:id` | ✅ | USER, NUTRITIONIST, ADMIN | Delete post |
| POST | `/:id/like` | ✅ | USER, NUTRITIONIST, ADMIN | Like post |
| POST | `/:id/comments` | ✅ | USER, NUTRITIONIST, ADMIN | Add comment to post |
| DELETE | `/:id/comments/:commentId` | ✅ | USER, NUTRITIONIST, ADMIN | Delete comment |

---

## Groceries

**Base Path:** `/api/groceries`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | USER | Create grocery list |
| GET | `/` | ✅ | USER | Get all grocery lists |
| GET | `/:id` | ✅ | USER | Get grocery list detail (Not used) |
| PUT | `/:id` | ✅ | USER | Update grocery list |
| DELETE | `/:id` | ✅ | USER | Delete grocery list |
| POST | `/:id/ingredients` | ✅ | USER | Add ingredients to grocery list |
| PUT | `/:id/ingredients/:ingredientId` | ✅ | USER | Update ingredient in grocery list |
| DELETE | `/:id/ingredients` | ✅ | USER | Remove ingredients from grocery list |

---

## AI

**Base Path:** `/api/ai`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/ask` | ❌ | - | Ask AI agent (Public) |
| POST | `/recommend-daily-meals` | ✅ | USER, NUTRITIONIST, ADMIN | Get AI daily meal recommendations |

---

## Payments

**Base Path:** `/api/payments`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | USER | Create payment |
| GET | `/` | ✅ | ADMIN | List all payments (Admin only) |
| GET | `/user` | ✅ | USER | Get current user's payments |
| GET | `/user/:userId` | ✅ | ADMIN | Get user's payments by ID (Admin only) |
| POST | `/confirm` | ✅ | USER | Confirm payment |
| GET | `/:orderCode` | ✅ | ADMIN | Get payment by order code (Admin only) |
| PUT | `/:orderCode` | ✅ | ADMIN | Update payment status (Admin only) |

---

## Exercises

**Base Path:** `/api/exercises`

| Method | Endpoint | Auth | Authorization | Description |
|--------|----------|------|---------------|-------------|
| POST | `/` | ✅ | NUTRITIONIST, ADMIN | Create exercise |
| GET | `/` | ❌ | - | Get all exercises (Public) |
| GET | `/:id` | ❌ | - | Get exercise detail (Public) |
| PUT | `/:id` | ✅ | NUTRITIONIST, ADMIN | Update exercise |
| DELETE | `/:id` | ✅ | NUTRITIONIST, ADMIN | Delete exercise |

---

## Legend

- **Auth**: ✅ = Authentication required, ❌ = No authentication required
- **Authorization**: Specifies roles required for access (USER, NUTRITIONIST, ADMIN, or empty for no role restriction)
- **ROLE Types**:
  - `USER`: Regular user role
  - `NUTRITIONIST`: Nutritionist role
  - `ADMIN`: Administrator role

---

**Generated:** March 22, 2026
