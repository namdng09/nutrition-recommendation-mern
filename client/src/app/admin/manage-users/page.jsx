import UsersFilter from '~/features/users/components/admin/users-filter';
import UsersTable from '~/features/users/components/admin/users-table';

const Page = () => {
  return (
    <div className='space-y-4'>
      <UsersFilter />
      <UsersTable />
    </div>
  );
};

export default Page;
