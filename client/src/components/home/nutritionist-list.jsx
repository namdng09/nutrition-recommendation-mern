import { ArrowRight, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useNutritionists } from '~/features/users/view-nutritionist/api/view-nutritionist';

const NutritionistCard = ({ nutritionist }) => {
  const profile = nutritionist.nutritionistProfile;

  return (
    <Card className='flex flex-col h-full hover:shadow-md transition-shadow max-w-xs mx-auto w-full'>
      <div className='pt-8 px-6'>
        <Avatar className='h-28 w-28 mx-auto mb-4 ring-4 ring-background shadow-lg'>
          <AvatarImage src={nutritionist.avatar} alt={nutritionist.name} />
          <AvatarFallback className='bg-primary/10 text-primary font-bold text-4xl'>
            {nutritionist.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className='font-semibold text-center text-lg mb-4'>
          {nutritionist.name}
        </h3>
      </div>
      <CardContent className='flex-1 flex flex-col justify-between pt-0 px-6 pb-6'>
        <div className='space-y-3'>
          {profile?.workplace && (
            <div className='flex items-start gap-2'>
              <Building2 className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
              <span className='text-muted-foreground'>{profile.workplace}</span>
            </div>
          )}
          {profile?.graduatedUniversity && (
            <div className='flex items-start gap-2'>
              <GraduationCap className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
              <span className='text-muted-foreground'>
                {profile.graduatedUniversity}
              </span>
            </div>
          )}
          {profile?.professionalBio && (
            <p className='text-muted-foreground line-clamp-3 leading-relaxed'>
              {profile.professionalBio}
            </p>
          )}
        </div>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='w-full mt-4 text-primary'
        >
          <Link to={`/nutritionists/${nutritionist._id}`}>
            <span>Xem hồ sơ</span>
            <ArrowRight className='h-4 w-4 ml-2' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const NutritionistList = () => {
  const { data } = useNutritionists({ page: 1, limit: 4 });
  const docs = data?.docs ?? [];

  if (docs.length === 0) {
    return null;
  }

  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14'>
      <div className='mb-6'>
        <h2 className='text-xl sm:text-2xl font-semibold text-foreground'>
          Đội ngũ chuyên gia của chúng tôi
        </h2>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
        {docs.map(nutritionist => (
          <NutritionistCard
            key={nutritionist._id}
            nutritionist={nutritionist}
          />
        ))}
      </div>
    </section>
  );
};

export default NutritionistList;
