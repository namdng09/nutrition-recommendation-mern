import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { PaymentController } from './payment-controller';
import {
  createPaymentRequestSchema,
  updatePaymentStatusRequestSchema
} from './payment-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(createPaymentRequestSchema.shape),
  asyncHandler(PaymentController.createPayment)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.listMembershipPayments)
);

router.get(
  '/user',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(PaymentController.listPaymentsByUser)
);

router.get(
  '/user/:userId',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.listPaymentsByUser)
);

router.post(
  '/confirm',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(PaymentController.confirmPayment)
);

router.get(
  '/:orderCode',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.getMembershipPaymentByOrderCode)
);

router.put(
  '/:orderCode',
  authenticate(),
  authorize([ROLE.ADMIN]),
  parseFormData,
  validate(updatePaymentStatusRequestSchema.shape),
  asyncHandler(PaymentController.updatePaymentStatus)
);

export default router;
