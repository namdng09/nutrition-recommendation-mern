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
  '/membership',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.listMembershipPayments)
);

router.get(
  '/membership/:orderCode',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.getMembershipPaymentByOrderCode)
);

router.put(
  '/membership/:orderCode/status',
  authenticate(),
  authorize([ROLE.ADMIN]),
  parseFormData,
  validate(updatePaymentStatusRequestSchema.shape),
  asyncHandler(PaymentController.updateMembershipPaymentStatus)
);

router.get(
  '/user',
  authenticate(),
  asyncHandler(PaymentController.listPaymentsByUser)
);

router.get(
  '/user/:userId',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(PaymentController.listPaymentsByUser)
);

export default router;
