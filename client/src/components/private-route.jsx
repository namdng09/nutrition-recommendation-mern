import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useSelector(state => state.auth);

  if (loading) {
    return <Spinner size='lg' />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4'>
        <h2 className='text-xl font-semibold'>Access Denied</h2>
        <p className='text-gray-600'>
          You need to be logged in to access this page.
        </p>
        <Button className='rounded-full px-8'>
          <Link to='/'>Back to Home</Link>
        </Button>{' '}
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
