import {
  Award,
  CheckCircle2,
  Crown,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

import { useUserAchievements } from '../api/view-achievements';
import { ACHIEVEMENT_ICON_COMPONENTS } from './achievement-icons';

const CATEGORY_INFO = {
  full_circle: {
    name: 'Vòng Tròn Hoàn Chỉnh',
    description: 'Thành thạo toàn bộ hệ sinh thái',
    accentClass: 'text-primary',
    bgClass: 'bg-primary/5',
    borderClass: 'border-primary/20'
  },
  diverse_palate: {
    name: 'Khẩu Vị Đa Dạng',
    description: 'Khám phá dinh dưỡng',
    accentClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200'
  },
  social: {
    name: 'Chất Xúc Tác Cộng Đồng',
    description: 'Ảnh hưởng xã hội',
    accentClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200'
  },
  target: {
    name: 'Chuyên Gia Mục Tiêu',
    description: 'Kiên trì với mục tiêu',
    accentClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200'
  },
  grocery: {
    name: 'Chuyên Gia Mua Sắm',
    description: 'Hiệu quả trong bếp',
    accentClass: 'text-pink-600',
    bgClass: 'bg-pink-50',
    borderClass: 'border-pink-200'
  }
};

function AchievementCard({ achievement, categoryInfo }) {
  const IconComponent = ACHIEVEMENT_ICON_COMPONENTS[achievement.key] || Trophy;
  const isUnlocked = achievement.unlocked;

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`group rounded-xl border transition-colors ${
        isUnlocked
          ? 'bg-background border-border hover:border-primary/30'
          : 'bg-muted/30 border-border/50'
      }`}
    >
      <CardContent className={`p-5 ${isUnlocked ? '' : 'opacity-60'}`}>
        <div className='flex items-start gap-4'>
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
              isUnlocked
                ? `${categoryInfo.bgClass} ${categoryInfo.accentClass}`
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isUnlocked ? (
              <IconComponent className='h-7 w-7' />
            ) : (
              <Lock className='h-5 w-5' />
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <h3
              className={`font-semibold text-base leading-tight ${
                isUnlocked ? categoryInfo.accentClass : 'text-muted-foreground'
              }`}
            >
              {achievement.name}
            </h3>

            <p
              className={`text-sm mt-1 leading-relaxed ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}
            >
              {achievement.description}
            </p>

            {isUnlocked && achievement.unlockedAt && (
              <p className='text-xs text-muted-foreground mt-2'>
                Đạt {formatDate(achievement.unlockedAt)}
              </p>
            )}

            {!isUnlocked && (
              <Badge variant='secondary' className='mt-2 [&_span]:text-xs'>
                Chưa mở khóa
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}

function CategorySection({ category, achievements, categoryInfo }) {
  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;
  const progress = (unlocked / total) * 100;
  const isComplete = progress === 100;

  return (
    <div className='space-y-4'>
      <div
        className={`rounded-xl border p-5 ${categoryInfo.bgClass} ${categoryInfo.borderClass}`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${categoryInfo.bgClass} border ${categoryInfo.borderClass}`}
            >
              {category === 'full_circle' && (
                <Crown className={`h-5 w-5 ${categoryInfo.accentClass}`} />
              )}
              {category === 'diverse_palate' && (
                <Sparkles className={`h-5 w-5 ${categoryInfo.accentClass}`} />
              )}
              {category === 'social' && (
                <Star className={`h-5 w-5 ${categoryInfo.accentClass}`} />
              )}
              {category === 'target' && (
                <Target className={`h-5 w-5 ${categoryInfo.accentClass}`} />
              )}
              {category === 'grocery' && (
                <Award className={`h-5 w-5 ${categoryInfo.accentClass}`} />
              )}
            </div>
            <div>
              <h2
                className={`font-semibold text-lg ${categoryInfo.accentClass}`}
              >
                {categoryInfo.name}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {categoryInfo.description}
              </p>
            </div>
          </div>

          <div className='text-right'>
            <div className='text-lg font-semibold'>
              <span className={categoryInfo.accentClass}>{unlocked}</span>
              <span className='text-muted-foreground'>/{total}</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        <div className='mt-4'>
          <div className='h-2 bg-background rounded-full overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : categoryInfo.accentClass.replace('text-', 'bg-')}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.key}
            achievement={achievement}
            categoryInfo={categoryInfo}
          />
        ))}
      </div>
    </div>
  );
}

export function AchievementsList() {
  const { data } = useUserAchievements();
  const { achievements, unlockedCount } = data;

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category =
      achievement.key.includes('PLANNER') ||
      achievement.key.includes('DISCIPLINED') ||
      achievement.key.includes('ARCHITECT')
        ? 'full_circle'
        : achievement.key.includes('INGREDIENT') ||
            achievement.key.includes('VARIETY') ||
            achievement.key.includes('NUTRITIONAL')
          ? 'diverse_palate'
          : achievement.key.includes('SPARK') ||
              achievement.key.includes('HELPFUL') ||
              achievement.key.includes('COMMUNITY')
            ? 'social'
            : achievement.key.includes('MARK') ||
                achievement.key.includes('PHASE') ||
                achievement.key.includes('UNYIELDING')
              ? 'target'
              : 'grocery';

    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  const overallProgress = (unlockedCount / achievements.length) * 100;

  return (
    <div className='w-full space-y-8 pb-12'>
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
              <Trophy className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Thành Tựu
              </h1>
              <p className='text-sm text-muted-foreground'>
                Theo dõi tiến độ chinh phục của bạn
              </p>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='px-4 py-2 rounded-lg border bg-green-50 border-green-200 text-center'>
              <div className='text-xl font-semibold text-green-600'>
                {unlockedCount}
              </div>
              <div className='text-xs text-muted-foreground'>Đã đạt</div>
            </div>
            <div className='px-4 py-2 rounded-lg border bg-muted text-center'>
              <div className='text-xl font-semibold'>{achievements.length}</div>
              <div className='text-xs text-muted-foreground'>Tổng số</div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <div className='flex-1 w-full'>
                <p className='text-sm font-medium text-muted-foreground mb-3'>
                  Tiến độ tổng thể
                </p>

                <div className='flex items-baseline gap-2 mb-4'>
                  <span className='text-4xl font-semibold text-primary'>
                    {unlockedCount}
                  </span>
                  <span className='text-lg text-muted-foreground'>
                    / {achievements.length}
                  </span>
                </div>

                <div className='space-y-2'>
                  <div className='h-2 bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary rounded-full transition-all'
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Hoàn thành {Math.round(overallProgress)}%
                  </p>
                </div>
              </div>

              <div className='relative'>
                <svg className='h-28 w-28 -rotate-90'>
                  <circle
                    cx='56'
                    cy='56'
                    r='48'
                    stroke='currentColor'
                    strokeWidth='8'
                    fill='none'
                    className='text-muted'
                  />
                  <circle
                    cx='56'
                    cy='56'
                    r='48'
                    stroke='currentColor'
                    strokeWidth='8'
                    fill='none'
                    strokeLinecap='round'
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallProgress / 100)}`}
                    className='text-primary transition-all'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-xl font-semibold text-primary'>
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-8'>
        {Object.entries(groupedAchievements).map(
          ([category, categoryAchievements]) => (
            <CategorySection
              key={category}
              category={category}
              achievements={categoryAchievements}
              categoryInfo={CATEGORY_INFO[category]}
            />
          )
        )}
      </div>
    </div>
  );
}

export default AchievementsList;
