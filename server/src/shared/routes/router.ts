import { Router } from 'express';

import achievementRoute from '~/features/achievements/achievement-route';
import aiRoute from '~/features/ai/ai-route';
import authRoute from '~/features/auth/auth-route';
import collectionRoute from '~/features/collections/collection-route';
import dishRoute from '~/features/dishes/dish-route';
import exerciseRouter from '~/features/exercises/exercise-route';
import groceryRoute from '~/features/groceries/grocery-route';
import ingredientRoute from '~/features/ingredients/ingredient-route';
import paymentRoute from '~/features/payments/payment-route';
import postRoute from '~/features/posts/post-route';
import scheduleRoute from '~/features/schedules/schedule-route';
import userRoute from '~/features/users/user-route';

const router = Router();

router.use('/achievements', achievementRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/ingredients', ingredientRoute);
router.use('/dishes', dishRoute);
router.use('/collections', collectionRoute);
router.use('/schedules', scheduleRoute);
router.use('/posts', postRoute);
router.use('/groceries', groceryRoute);
router.use('/ai', aiRoute);
router.use('/payments', paymentRoute);
router.use('/exercises', exerciseRouter);

export default router;
