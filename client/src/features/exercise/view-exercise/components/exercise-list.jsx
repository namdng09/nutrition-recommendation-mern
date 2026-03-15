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
import ExerciseHeader from './exercise-header';
import ExercisePagination from './exercise-pagination';

export default function ExerciseList() {
  const [page, setPage] = useState(1);
  const { data } = useExercises({
    page,
    limit: 9
  });
  const exercises = data?.docs ?? [];

  return (
    <div className='max-w-7xl mx-auto px-4 py-10 space-y-12'>
      <ExerciseHeader />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {exercises.map(ex => {
          const isGif = isGifUrl(ex.tutorial);
          const preview = getPreviewImage(ex.tutorial);

          return (
            <Link
              to={`/exercises/${ex._id}`}
              key={ex._id}
              className='group flex flex-col rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden'
            >
              <div className='relative aspect-video overflow-hidden'>
                <img
                  src={preview}
                  alt={ex.name}
                  loading='lazy'
                  decoding='async'
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  onMouseEnter={e => {
                    if (isGif) e.currentTarget.src = ex.tutorial;
                  }}
                  onMouseLeave={e => {
                    if (isGif) e.currentTarget.src = preview;
                  }}
                />

                <div className='absolute top-3 left-3'>
                  <span
                    className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide shadow ${
                      ex.difficulty === 'Cơ bản'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-orange-500/90 text-white'
                    }`}
                  >
                    <HiOutlineChartBar className='text-xs' />
                    {ex.difficulty}
                  </span>
                </div>
              </div>

              <div className='p-6 flex flex-col flex-1 space-y-4'>
                <h3 className='text-lg font-semibold text-foreground group-hover:text-primary transition'>
                  {ex.name}
                </h3>

                <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1.5'>
                    <HiOutlineLightningBolt className='text-primary text-lg' />
                    <span>{ex.type}</span>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    {ex.logType === 'Thời gian' ? (
                      <HiOutlineClock className='text-primary text-lg' />
                    ) : (
                      <GiWeightLiftingUp className='text-primary text-lg' />
                    )}
                    <span>{ex.logType}</span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2 pt-2'>
                  {ex.muscles?.map(muscle => (
                    <div
                      key={muscle._id}
                      className='flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted text-xs font-medium'
                    >
                      <img
                        src={muscle.image}
                        alt={muscle.name}
                        className='w-3.5 h-3.5 object-contain'
                      />
                      {muscle.name}
                    </div>
                  ))}
                </div>
              </div>

              <button className='flex items-center justify-center gap-2 py-4 font-semibold text-sm border-t border-border bg-muted/40 hover:bg-primary hover:text-primary-foreground transition'>
                XEM CHI TIẾT
                <HiChevronDoubleRight className='transition-transform group-hover:translate-x-1' />
              </button>
            </Link>
          );
        })}
      </div>

      <div className='border-t border-border'>
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
