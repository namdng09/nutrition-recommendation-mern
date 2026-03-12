// src/features/users/view-achievements/components/achievements-list.jsx
import {
  Award,
  CheckCircle2,
  Crown,
  Sparkles,
  Star,
  Trophy
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';

import { useUserAchievements } from '../api/view-achievements';
import { ACHIEVEMENT_ICON_COMPONENTS } from './achievement-icons';

// Enhanced Category metadata with more vibrant colors
const CATEGORY_INFO = {
  full_circle: {
    name: 'Vòng Tròn Hoàn Chỉnh',
    description: 'Thành thạo toàn bộ hệ sinh thái',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    bgGradient:
      'bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-600/10',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-gradient-to-br from-blue-500 to-purple-600',
    glowColor: 'shadow-blue-500/30',
    icon: Crown,
    accentColor: 'text-blue-500'
  },
  diverse_palate: {
    name: 'Khẩu Vị Đa Dạng',
    description: 'Khám phá dinh dưỡng',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    bgGradient:
      'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-600/10',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-cyan-600',
    glowColor: 'shadow-emerald-500/30',
    icon: Sparkles,
    accentColor: 'text-emerald-500'
  },
  social: {
    name: 'Chất Xúc Tác Cộng Đồng',
    description: 'Ảnh hưởng xã hội',
    gradient: 'from-purple-500 via-pink-500 to-rose-600',
    bgGradient:
      'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-600/10',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    glowColor: 'shadow-purple-500/30',
    icon: Star,
    accentColor: 'text-purple-500'
  },
  target: {
    name: 'Chuyên Gia Mục Tiêu',
    description: 'Kiên trì với mục tiêu',
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    bgGradient:
      'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-600/10',
    borderColor: 'border-orange-500/30',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    glowColor: 'shadow-orange-500/30',
    icon: Award,
    accentColor: 'text-orange-500'
  },
  grocery: {
    name: 'Chuyên Gia Mua Sắm',
    description: 'Hiệu quả trong bếp',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    bgGradient:
      'bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-600/10',
    borderColor: 'border-pink-500/30',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/30',
    icon: Trophy,
    accentColor: 'text-pink-500'
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
      className={`group relative overflow-hidden transition-all duration-700 border-2 ${
        isUnlocked
          ? `hover:shadow-2xl ${categoryInfo.glowColor} hover:-translate-y-3 hover:scale-105 cursor-pointer ${categoryInfo.borderColor} bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50`
          : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-80 border-border bg-muted/30'
      }`}
    >
      {/* Enhanced animated gradient background */}
      {isUnlocked && (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700`}
          />
          <div className='absolute -inset-2 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500' />

          {/* Decorative corner accent */}
          <div
            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${categoryInfo.gradient} opacity-10 rounded-bl-full`}
          />
        </>
      )}

      <CardContent className='p-7 relative z-10'>
        <div className='flex items-start gap-6'>
          {/* Enhanced Icon with character image */}
          <div className='relative flex-shrink-0'>
            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl transition-all duration-700 ${
                isUnlocked
                  ? `${categoryInfo.iconBg} group-hover:scale-125 group-hover:rotate-12 shadow-2xl ring-4 ring-white/20`
                  : 'bg-muted/70 ring-2 ring-muted'
              }`}
            >
              <div className={isUnlocked ? 'scale-110' : 'opacity-50'}>
                <IconComponent className='h-14 w-14' />
              </div>

              {/* Enhanced pulse animation */}
              {isUnlocked && (
                <>
                  <div
                    className={`absolute inset-0 rounded-3xl ${categoryInfo.iconBg} animate-ping opacity-30`}
                  />
                  <div
                    className={`absolute -inset-1 rounded-3xl ${categoryInfo.iconBg} blur-xl opacity-40 group-hover:opacity-60 transition-opacity`}
                  />
                </>
              )}
            </div>

            {/* Enhanced unlocked badge with animation */}
            {isUnlocked && (
              <div className='absolute -top-2 -right-2 animate-bounce'>
                <div className='relative'>
                  <div className='absolute inset-0 h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 blur-md opacity-70 animate-pulse' />
                  <div className='relative h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg ring-2 ring-white'>
                    <CheckCircle2 className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
            )}

            {/* Locked indicator */}
            {!isUnlocked && (
              <div className='absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center'>
                <span className='text-xs'>🔒</span>
              </div>
            )}
          </div>

          {/* Enhanced Content */}
          <div className='flex-1 space-y-4'>
            <div className='flex items-start justify-between gap-3'>
              <h3
                className={`font-black text-xl leading-tight transition-all duration-500 ${
                  isUnlocked
                    ? 'bg-gradient-to-r ' +
                      categoryInfo.gradient +
                      ' bg-clip-text text-transparent group-hover:scale-105 origin-left'
                    : 'text-foreground/70'
                }`}
              >
                {achievement.name}
              </h3>
              {isUnlocked && (
                <Badge
                  variant='secondary'
                  className={`shrink-0 px-3 py-1 bg-gradient-to-r ${categoryInfo.gradient} text-white border-0 shadow-lg font-bold text-xs ring-2 ring-white/30`}
                >
                  ✓ Đã hoàn thành
                </Badge>
              )}
            </div>

            <p
              className={`text-sm leading-relaxed ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}
            >
              {achievement.description}
            </p>

            {isUnlocked && achievement.unlockedAt && (
              <div className='flex items-center gap-3 pt-3 border-t border-border/50'>
                <div className='relative'>
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${categoryInfo.iconBg} shadow-lg`}
                  />
                  <div
                    className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${categoryInfo.iconBg} animate-ping opacity-75`}
                  />
                </div>
                <p className='text-xs text-muted-foreground font-semibold flex items-center gap-1.5'>
                  <span>🎉</span>
                  Đạt được vào {formatDate(achievement.unlockedAt)}
                </p>
              </div>
            )}

            {!isUnlocked && (
              <div className='flex items-center gap-3 pt-3 border-t border-dashed border-border'>
                <div className='h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center backdrop-blur'>
                  <span className='text-lg'>❓</span>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground font-medium'>
                    Chưa mở khóa
                  </p>
                  <p className='text-xs text-muted-foreground/70 italic'>
                    Tiếp tục cố gắng để đạt được!
                  </p>
                </div>
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
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className='space-y-7'>
      {/* Enhanced Category Header */}
      <div
        className={`relative overflow-hidden p-10 rounded-[2rem] border-2 ${categoryInfo.borderColor} ${categoryInfo.bgGradient} shadow-2xl ${categoryInfo.glowColor} backdrop-blur-sm`}
      >
        {/* Animated background layers */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient} opacity-[0.07]`}
        />
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl' />

        <div className='relative z-10'>
          <div className='flex items-start justify-between gap-6 mb-8'>
            <div className='flex items-start gap-4'>
              {/* Category icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${categoryInfo.iconBg} shadow-xl`}
              >
                <CategoryIcon className='h-7 w-7 text-white' />
              </div>

              <div>
                <h2
                  className={`text-4xl font-black mb-3 bg-gradient-to-r ${categoryInfo.gradient} bg-clip-text text-transparent tracking-tight`}
                >
                  {categoryInfo.name}
                </h2>
                <p className='text-base text-muted-foreground font-semibold flex items-center gap-2'>
                  <span className={categoryInfo.accentColor}>●</span>
                  {categoryInfo.description}
                </p>
              </div>
            </div>

            <Badge
              variant='outline'
              className={`shrink-0 px-6 py-3 text-lg font-black border-2 ${categoryInfo.borderColor} bg-background/80 backdrop-blur-sm shadow-lg`}
            >
              {unlocked}
              <span className='text-muted-foreground mx-1'>/</span>
              {total}
            </Badge>
          </div>

          {/* Enhanced Progress Bar with milestones */}
          <div className='space-y-4'>
            <div className='relative h-5 bg-background/60 rounded-full overflow-hidden backdrop-blur-sm border-2 border-border/50 shadow-inner'>
              <div
                className={`h-full bg-gradient-to-r ${categoryInfo.gradient} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${progress}%` }}
              >
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer' />
                <div
                  className='absolute inset-0 bg-white/20'
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }}
                />
              </div>

              {/* Progress indicator dot */}
              {progress > 0 && (
                <div
                  className='absolute top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white shadow-lg border-2 border-white transition-all duration-1000'
                  style={{ left: `calc(${progress}% - 14px)` }}
                >
                  <div
                    className={`h-full w-full rounded-full ${categoryInfo.iconBg} animate-pulse`}
                  />
                </div>
              )}
            </div>

            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                <p className='text-sm font-bold text-foreground'>
                  {Math.round(progress)}% hoàn thành
                </p>
                {progress > 0 && progress < 100 && (
                  <p className='text-xs text-muted-foreground'>
                    • Còn {total - unlocked} thành tựu nữa
                  </p>
                )}
              </div>

              {progress === 100 && (
                <div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg animate-pulse'>
                  <Trophy className='h-5 w-5' />
                  <span className='text-sm font-black'>Hoàn thành!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid with stagger animation */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {achievements.map((achievement, index) => (
          <div
            key={achievement.key}
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            <AchievementCard
              achievement={achievement}
              categoryInfo={categoryInfo}
            />
          </div>
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
    <div className='w-full space-y-12 pb-12'>
      {/* Enhanced Hero Header */}
      <div className='space-y-8'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
          <div className='flex items-center gap-5'>
            <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 shadow-2xl shadow-orange-500/40'>
              <Trophy className='h-10 w-10 text-white' />
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500 to-red-600 animate-ping opacity-20' />
              <div className='absolute -inset-2 rounded-3xl bg-gradient-to-br from-amber-500 to-red-600 blur-xl opacity-30' />
            </div>
            <div>
              <h1 className='text-5xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 bg-clip-text text-transparent'>
                Thành Tựu Của Bạn
              </h1>
              <p className='text-muted-foreground text-lg mt-2 font-medium'>
                Khám phá và mở khóa các thành tựu đặc biệt 🏆✨
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className='flex gap-3'>
            <div className='px-5 py-3 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20'>
              <p className='text-2xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
                {unlockedCount}
              </p>
              <p className='text-xs text-muted-foreground font-semibold'>
                Đã mở
              </p>
            </div>
            <div className='px-5 py-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20'>
              <p className='text-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent'>
                {achievements.length}
              </p>
              <p className='text-xs text-muted-foreground font-semibold'>
                Tổng số
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Overall Progress Card */}
        <Card className='overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-background via-primary/5 to-purple-500/5'>
          <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
          <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl' />

          <CardContent className='p-10 relative z-10'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8'>
              <div className='flex-1 w-full'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='h-2 w-2 rounded-full bg-gradient-to-r from-primary to-purple-600 animate-pulse' />
                  <p className='text-sm font-black text-muted-foreground uppercase tracking-wider'>
                    Tiến độ tổng thể
                  </p>
                </div>

                <div className='flex items-baseline gap-3 mb-8'>
                  <p className='text-6xl font-black'>
                    <span className='bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent'>
                      {unlockedCount}
                    </span>
                  </p>
                  <p className='text-3xl text-muted-foreground font-bold'>
                    / {achievements.length}
                  </p>
                  <p className='text-lg text-muted-foreground font-medium ml-2'>
                    thành tựu
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='relative h-6 bg-muted/50 rounded-full overflow-hidden border-2 border-border/50 shadow-inner'>
                    <div
                      className='h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative overflow-hidden'
                      style={{ width: `${overallProgress}%` }}
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer' />
                      <div
                        className='absolute inset-0'
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)'
                        }}
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold text-muted-foreground'>
                      Bạn đã hoàn thành{' '}
                      <span className='font-black text-foreground text-lg'>
                        {Math.round(overallProgress)}%
                      </span>{' '}
                      tổng số thành tựu
                    </p>

                    {overallProgress === 100 && (
                      <div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg'>
                        <Crown className='h-5 w-5' />
                        <span className='text-sm font-black'>
                          Hoàn thành 100%!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Circular Progress */}
              <div className='relative flex items-center justify-center'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full blur-2xl animate-pulse' />

                <svg className='h-40 w-40 -rotate-90 drop-shadow-2xl'>
                  <circle
                    cx='80'
                    cy='80'
                    r='70'
                    stroke='currentColor'
                    strokeWidth='10'
                    fill='none'
                    className='text-muted/20'
                  />
                  <circle
                    cx='80'
                    cy='80'
                    r='70'
                    stroke='url(#progress-gradient)'
                    strokeWidth='10'
                    fill='none'
                    strokeLinecap='round'
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallProgress / 100)}`}
                    className='transition-all duration-1000 drop-shadow-lg'
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

                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black bg-gradient-to-br from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent'>
                    {Math.round(overallProgress)}%
                  </span>
                  {overallProgress === 100 && (
                    <span className='text-xs font-bold text-green-600 mt-1'>
                      Perfect!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories with enhanced spacing */}
      <div className='space-y-20 mt-16'>
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
