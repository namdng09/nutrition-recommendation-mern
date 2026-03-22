// Exercise Type Constants (matching backend)
export const EXERCISE_TYPE = {
  STRENGTH: 'Sức mạnh',
  STRETCHING: 'Kéo giãn',
  POWER: 'Cường độ',
  OLYMPIC: 'Olympic',
  EXPLOSIVE: 'Bùng nổ',
  MOBILITY: 'Linh hoạt',
  DYNAMIC: 'Động',
  YOGA: 'Yoga'
};

export const EXERCISE_TYPE_OPTIONS = Object.values(EXERCISE_TYPE).map(
  value => ({
    value,
    label: value
  })
);

// Exercise Difficulty Constants (matching backend)
export const EXERCISE_DIFFICULTY = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao'
};

export const EXERCISE_DIFFICULTY_OPTIONS = Object.values(
  EXERCISE_DIFFICULTY
).map(value => ({
  value,
  label: value
}));

// Workout Counter Type Constants (matching backend)
export const WORKOUT_COUNTER_TYPE = {
  DISTANCE: 'Quãng đường',
  WEIGHT_AND_REPS: 'Cân nặng và số lần tập',
  DURATION: 'Thời gian'
};

export const WORKOUT_COUNTER_TYPE_OPTIONS = Object.values(
  WORKOUT_COUNTER_TYPE
).map(value => ({
  value,
  label: value
}));

// Exercise Muscles Constants (matching backend)
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
];

export const EXERCISE_MUSCLE_OPTIONS = EXERCISE_MUSCLES.map(muscle => ({
  value: muscle.name,
  label: muscle.name,
  image: muscle.image
}));

export const EXERCISE_MUSCLE_NAMES = EXERCISE_MUSCLES.map(
  muscle => muscle.name
);

// Exercise Equipments Constants (matching backend)
export const EXERCISE_EQUIPMENTS = [
  {
    name: 'Body Weight',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759603840/uploads/wzvazke52chlfxzobkff.jpg'
  },
  {
    name: 'Bands',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759603901/uploads/cdc7ustm612lynoxzx5a.jpg'
  },
  {
    name: 'Barbell',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604023/uploads/yogsxoclmfguw6cgzb9l.jpg'
  },
  {
    name: 'Bench',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604073/uploads/d8sscdnbedvihgo9mmfd.jpg'
  },
  {
    name: 'Dumbbell',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604120/uploads/g53ojedb2qaca74yrugv.jpg'
  },
  {
    name: 'Exercise Ball',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604191/uploads/zrmqnx9bbwb7idexy08c.jpg'
  },
  {
    name: 'EZ Curl Bar',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604251/uploads/ttotzelhcsxspzfzw4bf.jpg'
  },
  {
    name: 'Kettlebell',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604292/uploads/nur40dzbexgbkqihkpoh.jpg'
  },
  {
    name: 'Cardio Machine',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604352/uploads/knpfpskiotoa8lh46sbv.jpg'
  },
  {
    name: 'Strength Machine',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604440/uploads/n0ztj7kefmpftlz8tsxv.jpg'
  },
  {
    name: 'Pullup Bar',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604523/uploads/a82izpxpfjklzivgepan.jpg'
  },
  {
    name: 'Weight Plate',
    image:
      'https://res.cloudinary.com/djpv3n1e2/image/upload/v1759604584/uploads/xfeevkmernxxjymjxkdp.jpg'
  }
];

export const EXERCISE_EQUIPMENT_OPTIONS = EXERCISE_EQUIPMENTS.map(
  equipment => ({
    value: equipment.name,
    label: equipment.name,
    image: equipment.image
  })
);

export const EXERCISE_EQUIPMENT_NAMES = EXERCISE_EQUIPMENTS.map(
  equipment => equipment.name
);

// Helper to get muscle by name
export const getExerciseMuscleByName = name => {
  return EXERCISE_MUSCLES.find(muscle => muscle.name === name);
};

// Helper to get equipment by name
export const getExerciseEquipmentByName = name => {
  return EXERCISE_EQUIPMENTS.find(equipment => equipment.name === name);
};
