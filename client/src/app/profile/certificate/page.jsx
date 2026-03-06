import { Suspense } from 'react';

import CertificateStatus from '~/features/users/manage-certificate/components/certificate-status';

const Page = () => {
  return (
    <Suspense fallback={null}>
      <CertificateStatus />
    </Suspense>
  );
};

export default Page;
