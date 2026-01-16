import { Router } from 'express';

import authRoute from '~/features/auth/auth-route';
import userRoute from '~/features/users/user-route';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);

export default router;
