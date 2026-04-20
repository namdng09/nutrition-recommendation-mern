import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import {
  HiOutlineChevronLeft,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineLightningBolt,
  HiOutlinePlay
} from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router';

import { formatInstructions, getPreviewImage, isGifUrl } from '~/lib/utils';

import { useExercises } from '../../view-exercise/api/view-exercise';
import { useExerciseDetail } from '../api/view-exercise-detail';
import RelatedExercisesHorizontal from './related-exercises-horizontal';

export default function ExerciseDetail() {
  const { id } = useParams();
  const { data: exercise } = useExerciseDetail(id);
  const { data: exercisesData } = useExercises();
  const navigate = useNavigate();
  if (!exercise) return null;

  const isGif = isGifUrl(exercise.tutorial);
  const preview = getPreviewImage(exercise.tutorial);

  const allExercises = exercisesData?.docs || exercisesData || [];

  return (
    <div className='min-h-screen pb-20'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6'>
        <button
          onClick={() => navigate(-1)}
          className='group inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
        >
          <HiOutlineChevronLeft className='text-lg transition-transform duration-300 group-hover:-translate-x-1' />
          Quay lại danh sách
        </button>
      </div>

      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-12'>
        <div className='space-y-10 lg:col-span-7'>
          <div className='relative overflow-hidden rounded-3xl border border-border shadow-md'>
            <img
              src={preview || '/logo2.png'}
              alt={exercise.name}
              loading='lazy'
              decoding='async'
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              onMouseEnter={e => {
                if (isGif) e.currentTarget.src = exercise.tutorial;
              }}
              onMouseLeave={e => {
                if (isGif) e.currentTarget.src = preview;
              }}
            />

            <div className='absolute bottom-5 left-5'>
              <span className='flex items-center gap-2 rounded-lg bg-primary/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground backdrop-blur'>
                <HiOutlinePlay className='text-xs' />
                Video hướng dẫn
              </span>
            </div>
          </div>

          <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
            <h2 className='mb-6 flex items-center gap-3 text-xl font-bold text-foreground'>
              <HiOutlineFire className='text-lg text-primary' />
              Hướng dẫn thực hiện
            </h2>

            <div className='whitespace-pre-line text-base leading-relaxed text-muted-foreground'>
              {formatInstructions(exercise.instructions)}
            </div>
          </div>
        </div>

        <div className='lg:col-span-5'>
          <div className='space-y-8 lg:sticky lg:top-10'>
            <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
              <div className='mb-4 flex items-center gap-2'>
                <span className='rounded-md bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase text-orange-600'>
                  {exercise.difficulty || 'Trung bình'}
                </span>

                <span className='rounded-md bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase text-blue-600'>
                  {exercise.type}
                </span>
              </div>

              <h1 className='mb-8 text-3xl font-bold leading-tight text-foreground'>
                {exercise.name}
              </h1>

              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-2 rounded-2xl border border-border p-5'>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Kiểu ghi chép
                  </p>

                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='rounded-lg bg-muted p-2 text-primary'>
                      {exercise.logType === 'Thời gian' ? (
                        <HiOutlineClock size={20} />
                      ) : (
                        <GiWeightLiftingUp size={20} />
                      )}
                    </div>

                    {exercise.logType}
                  </div>
                </div>

                <div className='flex flex-col gap-2 rounded-2xl border border-border p-5'>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Cường độ
                  </p>

                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='rounded-lg bg-muted p-2 text-orange-500'>
                      <HiOutlineLightningBolt size={20} />
                    </div>
                    High Intensity
                  </div>
                </div>
              </div>
            </div>

            {exercise.muscles?.length > 0 && (
              <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
                <h2 className='mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  <GiMuscleUp className='text-lg text-primary' />
                  Nhóm cơ tác động
                </h2>

                <div className='space-y-3'>
                  {exercise.muscles.map(muscle => (
                    <div
                      key={muscle._id}
                      className='flex items-center justify-between rounded-xl border border-border p-4 transition hover:bg-muted'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2'>
                          <img
                            src={muscle.image || '/logo2.png'}
                            alt={muscle.name}
                            className='h-full w-full object-contain'
                          />
                        </div>
                        <span className='font-semibold'>{muscle.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-6'>
        <RelatedExercisesHorizontal
          title='Bài tập liên quan'
          description='Một số bài tập bạn có thể thử tiếp theo'
          currentExercise={exercise}
          allExercises={allExercises}
        />
      </div>
    </div>
  );
}
