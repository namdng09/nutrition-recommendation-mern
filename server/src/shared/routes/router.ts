import { Router } from 'express';

import authRoute from '~/features/auth/auth-route';
import ingredientRoute from '~/features/ingredients/ingredient-route';
import userRoute from '~/features/users/user-route';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/ingredients', ingredientRoute);

export default router;
