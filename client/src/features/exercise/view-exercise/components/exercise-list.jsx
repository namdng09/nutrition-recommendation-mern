import { useState } from 'react';
import { GiWeightLiftingUp } from 'react-icons/gi';
import {
  HiChevronDoubleRight,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import { Link } from 'react-router';

import { getPreviewImage, isGifUrl } from '~/lib/utils';

import { useExercises } from '../api/view-exercise';
import ExerciseFilter from './exercise-filter';
import ExerciseHeader from './exercise-header';
import ExercisePagination from './exercise-pagination';

export default function ExerciseList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    difficulty: '',
    type: '',
    logType: '',
    muscle: '',
    equipment: ''
  });

  const { muscle, equipment, ...baseFilters } = filters;

  const { data } = useExercises({
    ...baseFilters,
    ...(muscle ? { 'muscles.name': muscle } : {}),
    ...(equipment ? { 'equipments.name': equipment } : {}),
    page,
    limit: 9
  });
  const exercises = data?.docs ?? [];

  const handleSearch = nextFilters => {
    setPage(1);
    setFilters(nextFilters);
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      name: '',
      difficulty: '',
      type: '',
      logType: '',
      muscle: '',
      equipment: ''
    });
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-10 space-y-12'>
      <ExerciseHeader />
      <ExerciseFilter
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {exercises.map(ex => {
          const isGif = isGifUrl(ex.tutorial);
          const preview = getPreviewImage(ex.tutorial);

          return (
            <Link
              to={`/exercises/${ex._id}`}
              key={ex._id}
              className='group flex flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.10)]'
            >
              <div className='relative aspect-video overflow-hidden bg-muted'>
                <img
                  src={preview}
                  alt={ex.name}
                  loading='lazy'
                  decoding='async'
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                  onMouseEnter={e => {
                    if (isGif) e.currentTarget.src = ex.tutorial;
                  }}
                  onMouseLeave={e => {
                    if (isGif) e.currentTarget.src = preview;
                  }}
                />

                <div className='absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent' />

                <div className='absolute left-4 top-4'>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] shadow-lg ${
                      ex.difficulty === 'Cơ bản'
                        ? 'bg-emerald-500/95 text-white'
                        : 'bg-orange-500/95 text-white'
                    }`}
                  >
                    <HiOutlineChartBar className='text-xs' />
                    {ex.difficulty}
                  </span>
                </div>
              </div>

              <div className='flex flex-1 flex-col p-5 sm:p-6'>
                <h3 className='min-h-[56px] text-[20px] font-black leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary'>
                  {ex.name}
                </h3>

                <div className='flex flex-wrap gap-2 text-sm'>
                  <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-foreground/80'>
                    <HiOutlineLightningBolt className='text-primary text-base' />
                    <span>{ex.type}</span>
                  </div>

                  <div className='inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-semibold text-muted-foreground'>
                    {ex.logType === 'Thời gian' ? (
                      <HiOutlineClock className='text-primary text-base' />
                    ) : (
                      <GiWeightLiftingUp className='text-primary text-base' />
                    )}
                    <span>{ex.logType}</span>
                  </div>
                </div>

                <div className='mt-5 flex flex-wrap gap-2'>
                  {ex.muscles?.map(muscle => (
                    <div
                      key={muscle._id}
                      className='inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/80 ring-1 ring-border/60'
                    >
                      <img
                        src={muscle.image}
                        alt={muscle.name}
                        className='h-4 w-4 object-contain'
                      />
                      {muscle.name}
                    </div>
                  ))}
                </div>

                <div className='mt-6 border-t border-border/60 pt-4'>
                  <div className='flex items-center justify-center gap-2 rounded-2xl bg-primary/6 py-3 text-sm font-black tracking-wide text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground'>
                    XEM CHI TIẾT
                    <HiChevronDoubleRight className='transition-transform duration-300 group-hover:translate-x-1' />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!exercises.length && (
        <div className='rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center'>
          <p className='text-lg font-bold text-foreground'>
            Không tìm thấy bài tập phù hợp
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Hãy thử đổi từ khóa hoặc bỏ bớt điều kiện lọc.
          </p>
        </div>
      )}

      <div className='border-border'>
        <ExercisePagination
          page={data.page}
          totalPages={data.totalPages}
          hasPrevPage={data.hasPrevPage}
          hasNextPage={data.hasNextPage}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => p + 1)}
        />
      </div>
    </div>
  );
}
