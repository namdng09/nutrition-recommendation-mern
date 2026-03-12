// src/features/users/view-achievements/components/achievements-list.jsx
import { CheckCircle2, Trophy } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';

import { useUserAchievements } from '../api/view-achievements';
import { ACHIEVEMENT_ICON_COMPONENTS } from './achievement-icons';

// Category metadata với màu sắc sặc sỡ hơn
const CATEGORY_INFO = {
  full_circle: {
    name: 'Vòng Tròn Hoàn Chỉnh',
    description: 'Thành thạo toàn bộ hệ sinh thái',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    bgGradient:
      'bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-gradient-to-br from-blue-500 to-purple-600',
    glowColor: 'shadow-blue-500/20'
  },
  diverse_palate: {
    name: 'Khẩu Vị Đa Dạng',
    description: 'Khám phá dinh dưỡng',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient:
      'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-cyan-600',
    glowColor: 'shadow-emerald-500/20'
  },
  social: {
    name: 'Chất Xúc Tác Cộng Đồng',
    description: 'Ảnh hưởng xã hội',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    bgGradient:
      'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    glowColor: 'shadow-purple-500/20'
  },
  target: {
    name: 'Chuyên Gia Mục Tiêu',
    description: 'Kiên trì với mục tiêu',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    bgGradient:
      'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10',
    borderColor: 'border-orange-500/30',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    glowColor: 'shadow-orange-500/20'
  },
  grocery: {
    name: 'Chuyên Gia Mua Sắm',
    description: 'Hiệu quả trong bếp',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    bgGradient:
      'bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10',
    borderColor: 'border-pink-500/30',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/20'
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
    <Card
      className={`group relative overflow-hidden transition-all duration-500 border-2 ${
        isUnlocked
          ? `hover:shadow-2xl ${categoryInfo.glowColor} hover:-translate-y-2 cursor-pointer ${categoryInfo.borderColor}`
          : 'opacity-50 grayscale border-border'
      }`}
    >
      {/* Animated gradient background for unlocked */}
      {isUnlocked && (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          />
          <div className='absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
        </>
      )}

      <CardContent className='p-6 relative z-10'>
        <div className='flex items-start gap-5'>
          {/* Enhanced Icon with gradient background */}
          <div className='relative flex-shrink-0'>
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 ${
                isUnlocked
                  ? `${categoryInfo.iconBg} group-hover:scale-110 group-hover:rotate-6 shadow-xl`
                  : 'bg-muted/50'
              }`}
            >
              <div
                className={isUnlocked ? 'text-white' : 'text-muted-foreground'}
              >
                <IconComponent className='h-8 w-8' />
              </div>

              {/* Pulse animation for unlocked */}
              {isUnlocked && (
                <div
                  className={`absolute inset-0 rounded-2xl ${categoryInfo.iconBg} animate-ping opacity-20`}
                />
              )}
            </div>

            {/* Unlocked badge */}
            {isUnlocked && (
              <div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce'>
                <CheckCircle2 className='h-3.5 w-3.5 text-white' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 space-y-3'>
            <div className='flex items-start justify-between gap-2'>
              <h3
                className={`font-bold text-lg leading-tight transition-colors ${
                  isUnlocked
                    ? 'bg-gradient-to-r ' +
                      categoryInfo.gradient +
                      ' bg-clip-text text-transparent'
                    : 'text-foreground'
                }`}
              >
                {achievement.name}
              </h3>
              {isUnlocked && (
                <Badge
                  variant='secondary'
                  className={`shrink-0 bg-gradient-to-r ${categoryInfo.gradient} text-white border-0 shadow-lg`}
                >
                  ✓ Hoàn thành
                </Badge>
              )}
            </div>

            <p className='text-sm text-muted-foreground leading-relaxed'>
              {achievement.description}
            </p>

            {isUnlocked && achievement.unlockedAt && (
              <div className='flex items-center gap-2 pt-2 border-t border-border/50'>
                <div
                  className={`h-2 w-2 rounded-full ${categoryInfo.iconBg} shadow-lg animate-pulse`}
                />
                <p className='text-xs text-muted-foreground font-medium'>
                  Đạt được vào {formatDate(achievement.unlockedAt)}
                </p>
              </div>
            )}

            {!isUnlocked && (
              <div className='flex items-center gap-2 pt-2'>
                <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
                  <span className='text-xs font-bold text-muted-foreground'>
                    ?
                  </span>
                </div>
                <p className='text-xs text-muted-foreground italic'>
                  Chưa mở khóa - Tiếp tục cố gắng!
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({ category, achievements, categoryInfo }) {
  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;
  const progress = (unlocked / total) * 100;

  return (
    <div className='space-y-6'>
      {/* Category Header with gradient */}
      <div
        className={`relative overflow-hidden p-8 rounded-3xl border-2 ${categoryInfo.borderColor} ${categoryInfo.bgGradient} shadow-xl ${categoryInfo.glowColor}`}
      >
        {/* Animated background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient} opacity-5`}
        />

        <div className='relative z-10'>
          <div className='flex items-start justify-between gap-4 mb-6'>
            <div>
              <h2
                className={`text-3xl font-black mb-2 bg-gradient-to-r ${categoryInfo.gradient} bg-clip-text text-transparent`}
              >
                {categoryInfo.name}
              </h2>
              <p className='text-sm text-muted-foreground font-medium'>
                {categoryInfo.description}
              </p>
            </div>
            <Badge
              variant='outline'
              className={`shrink-0 px-4 py-2 text-sm font-bold border-2 ${categoryInfo.borderColor} bg-background/50 backdrop-blur`}
            >
              {unlocked}/{total}
            </Badge>
          </div>

          {/* Enhanced Progress Bar */}
          <div className='space-y-3'>
            <div className='relative h-4 bg-background/50 rounded-full overflow-hidden backdrop-blur border border-border/50'>
              <div
                className={`h-full bg-gradient-to-r ${categoryInfo.gradient} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${progress}%` }}
              >
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer' />
              </div>
            </div>
            <div className='flex justify-between items-center'>
              <p className='text-sm font-semibold text-muted-foreground'>
                {Math.round(progress)}% hoàn thành
              </p>
              {progress === 100 && (
                <span className='text-xs font-bold text-green-600 flex items-center gap-1.5'>
                  <Trophy className='h-4 w-4' />
                  Hoàn thành danh mục!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
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

  // Group achievements by category
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
    <div className='w-full space-y-10'>
      {/* Hero Header with gradient */}
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <div className='relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/30'>
            <Trophy className='h-8 w-8 text-white' />
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 animate-ping opacity-20' />
          </div>
          <div>
            <h1 className='text-4xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent'>
              Thành tựu của bạn
            </h1>
            <p className='text-muted-foreground text-lg mt-1'>
              Khám phá và mở khóa các thành tựu đặc biệt !
            </p>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className='overflow-hidden border-2 shadow-xl'>
          <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
          <CardContent className='p-8 relative z-10'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
                  Tổng tiến độ thành tựu
                </p>
                <p className='text-4xl font-black mb-6'>
                  <span className='bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
                    {unlockedCount}
                  </span>
                  <span className='text-muted-foreground text-2xl'>
                    /{achievements.length}
                  </span>
                  <span className='text-lg ml-2 text-muted-foreground font-normal'>
                    thành tựu
                  </span>
                </p>

                <div className='space-y-3'>
                  <div className='relative h-5 bg-muted/50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative overflow-hidden'
                      style={{ width: `${overallProgress}%` }}
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer' />
                    </div>
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Bạn đã hoàn thành{' '}
                    <span className='font-bold text-foreground'>
                      {Math.round(overallProgress)}%
                    </span>{' '}
                    tổng số thành tựu
                  </p>
                </div>
              </div>

              {/* Circular Progress */}
              <div className='relative flex items-center justify-center'>
                <svg className='h-32 w-32 -rotate-90'>
                  <circle
                    cx='64'
                    cy='64'
                    r='56'
                    stroke='currentColor'
                    strokeWidth='8'
                    fill='none'
                    className='text-muted/30'
                  />
                  <circle
                    cx='64'
                    cy='64'
                    r='56'
                    stroke='url(#progress-gradient)'
                    strokeWidth='8'
                    fill='none'
                    strokeLinecap='round'
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallProgress / 100)}`}
                    className='transition-all duration-1000'
                  />
                  <defs>
                    <linearGradient
                      id='progress-gradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='100%'
                    >
                      <stop offset='0%' stopColor='#8b5cf6' />
                      <stop offset='50%' stopColor='#ec4899' />
                      <stop offset='100%' stopColor='#f97316' />
                    </linearGradient>
                  </defs>
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-3xl font-black bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent'>
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className='space-y-16'>
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
