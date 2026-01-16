import { Link } from 'react-router';

import { Button } from '~/components/ui/button';

const ErrorComponent = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] px-4'>
      <img
        src='/404.png'
        alt='404 Not Found'
        className='max-w-md w-full h-auto mb-8'
      />
      <h1 className='text-3xl font-bold mb-2'>Not Found</h1>
      <p className='text-muted-foreground mb-6'>
        The page you're looking for cannot be found.
      </p>
      <Button asChild className='rounded-full px-8'>
        <Link to='/'>Back to Home</Link>
      </Button>
    </div>
  );
};

export default ErrorComponent;
