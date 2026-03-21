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

import { useExerciseDetail } from '../api/view-exercise-detail';

export default function ExerciseDetail() {
  const { id } = useParams();
  const { data: exercise } = useExerciseDetail(id);
  const navigate = useNavigate();
  const isGif = isGifUrl(exercise.tutorial);
  const preview = getPreviewImage(exercise.tutorial);

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

      <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12'>
        <div className='lg:col-span-7 space-y-10'>
          <div className='relative rounded-3xl overflow-hidden shadow-md border border-border'>
            <img
              src={preview}
              alt={exercise.name}
              loading='lazy'
              decoding='async'
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
              onMouseEnter={e => {
                if (isGif) e.currentTarget.src = exercise.tutorial;
              }}
              onMouseLeave={e => {
                if (isGif) e.currentTarget.src = preview;
              }}
            />

            <div className='absolute bottom-5 left-5'>
              <span className='flex items-center gap-2 px-4 py-1.5 bg-primary/90 backdrop-blur text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest'>
                <HiOutlinePlay className='text-xs' />
                Video hướng dẫn
              </span>
            </div>
          </div>

          <div className='bg-card rounded-3xl p-8 shadow-sm border border-border'>
            <h2 className='text-xl font-bold text-foreground mb-6 flex items-center gap-3'>
              <HiOutlineFire className='text-primary text-lg' />
              Hướng dẫn thực hiện
            </h2>

            <div className='whitespace-pre-line leading-relaxed text-muted-foreground text-base'>
              {formatInstructions(exercise.instructions)}
            </div>
          </div>
        </div>

        <div className='lg:col-span-5'>
          <div className='lg:sticky lg:top-10 space-y-8'>
            <div className='bg-card rounded-3xl p-8 shadow-sm border border-border'>
              <div className='flex items-center gap-2 mb-4'>
                <span className='px-3 py-1 bg-orange-100 text-orange-600 rounded-md text-[10px] font-bold uppercase'>
                  {exercise.difficulty || 'Trung bình'}
                </span>

                <span className='px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-[10px] font-bold uppercase'>
                  {exercise.type}
                </span>
              </div>

              <h1 className='text-3xl font-bold text-foreground leading-tight mb-8'>
                {exercise.name}
              </h1>

              <div className='grid grid-cols-2 gap-4'>
                <div className='p-5 rounded-2xl border border-border flex flex-col gap-2'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase'>
                    Kiểu ghi chép
                  </p>

                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='p-2 bg-muted rounded-lg text-primary'>
                      {exercise.logType === 'Thời gian' ? (
                        <HiOutlineClock size={20} />
                      ) : (
                        <GiWeightLiftingUp size={20} />
                      )}
                    </div>

                    {exercise.logType}
                  </div>
                </div>

                <div className='p-5 rounded-2xl border border-border flex flex-col gap-2'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase'>
                    Cường độ
                  </p>

                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='p-2 bg-muted rounded-lg text-orange-500'>
                      <HiOutlineLightningBolt size={20} />
                    </div>
                    High Intensity
                  </div>
                </div>
              </div>
            </div>

            {exercise.muscles?.length > 0 && (
              <div className='bg-card rounded-3xl p-8 shadow-sm border border-border'>
                <h2 className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6'>
                  <GiMuscleUp className='text-primary text-lg' />
                  Nhóm cơ tác động
                </h2>

                <div className='space-y-3'>
                  {exercise.muscles.map(muscle => (
                    <div
                      key={muscle._id}
                      className='flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted transition'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 rounded-lg bg-muted p-2 flex items-center justify-center'>
                          <img
                            src={muscle.image}
                            alt={muscle.name}
                            className='w-full h-full object-contain'
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
    </div>
  );
}
