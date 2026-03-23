export const EXERCISE_MUSCLES = [
  {
    name: 'Abs',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759247138/uploads/orefhxactoxduxx6vpof.svg'
  },
  {
    name: 'Back',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759248431/uploads/l0073zvfqpkbefo8wl4h.svg'
  },
  {
    name: 'Biceps',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283288/uploads/q9vl4xsfinank06ffyx2.svg'
  },
  {
    name: 'Cardio',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283350/uploads/gkcfjnjawlhwu2jt3b8d.svg'
  },
  {
    name: 'Chest',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283368/uploads/wf3mknvjntycateorth2.svg'
  },
  {
    name: 'Forearms',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283398/uploads/hl7dfcmgwc7jnubtt5gr.svg'
  },
  {
    name: 'Glutes',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283418/uploads/bcig2hn1fk9zfgfho5sc.svg'
  },
  {
    name: 'Shoulders',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283437/uploads/oxcwxcw0dxeg5qi8a7ya.svg'
  },
  {
    name: 'Triceps',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283464/uploads/rrl7lhxivfmgnwegtv5f.svg'
  },
  {
    name: 'Upper Legs',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283485/uploads/oqzqueb36ekrihlyyyjv.svg'
  },
  {
    name: 'Lower Legs',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759283573/uploads/rsswjowixyhwfke90axu.svg'
  }
] as const;

export type ExerciseMuscle = (typeof EXERCISE_MUSCLES)[number];
export type ExerciseMuscleName = ExerciseMuscle['name'];

export const EXERCISE_MUSCLE_NAMES = EXERCISE_MUSCLES.map(
  muscle => muscle.name
) as ExerciseMuscleName[];

export const EXERCISE_MUSCLE_BY_NAME = Object.fromEntries(
  EXERCISE_MUSCLES.map(muscle => [muscle.name, muscle])
) as Record<ExerciseMuscleName, ExerciseMuscle>;
