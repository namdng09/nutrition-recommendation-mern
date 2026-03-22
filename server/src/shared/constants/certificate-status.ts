export const CERTIFICATE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const;

export type CertificateStatus =
  (typeof CERTIFICATE_STATUS)[keyof typeof CERTIFICATE_STATUS];
