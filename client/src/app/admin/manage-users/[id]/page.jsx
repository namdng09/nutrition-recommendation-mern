import { useParams } from 'react-router';

import UserDetail from '~/features/users/view-user-detail/components/admin/user-detail';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <UserDetail id={id} />
    </div>
  );
};

export default Page;
