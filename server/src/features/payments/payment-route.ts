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
  payOSWebhookRequestSchema,
  updatePaymentStatusRequestSchema
} from './payment-dto';

const router = Router();

router.post(
  '/webhook',
  validate(payOSWebhookRequestSchema.shape),
  asyncHandler(PaymentController.handleWebhook)
);

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
  asyncHandler(PaymentController.viewPayments)
);

router.get(
  '/me',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(PaymentController.getPaymentsHistory)
);

router.post(
  '/confirm',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(PaymentController.confirmPayment)
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
