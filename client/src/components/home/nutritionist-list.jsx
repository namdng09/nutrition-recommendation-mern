import { ArrowRight, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { useNutritionists } from '~/features/users/view-nutritionist/api/view-nutritionist';

const NutritionistCard = ({ nutritionist }) => {
  const profile = nutritionist.nutritionistProfile;

  return (
    <Card className='flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
      <CardHeader className='flex flex-row items-center gap-4 pb-3'>
        <Avatar className='h-14 w-14 border-2 border-border'>
          <AvatarImage src={nutritionist.avatar} alt={nutritionist.name} />
          <AvatarFallback className='bg-muted text-muted-foreground font-semibold'>
            {nutritionist.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <p className='font-bold text-base truncate'>{nutritionist.name}</p>
          <p className='text-xs text-muted-foreground'>Chuyên gia dinh dưỡng</p>
        </div>
      </CardHeader>
      <CardContent className='flex-1 space-y-3'>
        {profile?.workplace && (
          <div className='flex items-start gap-2 text-sm'>
            <Building2 className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
            <span className='text-muted-foreground truncate'>
              {profile.workplace}
            </span>
          </div>
        )}
        {profile?.graduatedUniversity && (
          <div className='flex items-start gap-2 text-sm'>
            <GraduationCap className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
            <span className='text-muted-foreground truncate'>
              {profile.graduatedUniversity}
            </span>
          </div>
        )}
        {profile?.professionalBio && (
          <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed italic'>
            "{profile.professionalBio}"
          </p>
        )}
        <Button asChild variant='outline' className='w-full mt-2 group/btn'>
          <Link to={`/nutritionists/${nutritionist._id}`}>
            <span>Xem hồ sơ</span>
            <ArrowRight className='h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1' />
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
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16'>
      <div className='mb-8 md:mb-12'>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight'>
          Đội ngũ chuyên gia của chúng tôi
        </h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
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
