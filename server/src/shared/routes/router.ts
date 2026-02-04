import { Router } from 'express';

import authRoute from '~/features/auth/auth-route';
import collectionRoute from '~/features/collections/collection-route';
import dishRoute from '~/features/dishes/dish-route';
import ingredientRoute from '~/features/ingredients/ingredient-route';
import postRoute from '~/features/posts/post-route';
import scheduleRoute from '~/features/schedules/schedule-route';
import userRoute from '~/features/users/user-route';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/ingredients', ingredientRoute);
router.use('/dishes', dishRoute);
router.use('/collections', collectionRoute);
router.use('/schedules', scheduleRoute);
router.use('/posts', postRoute);

export default router;
