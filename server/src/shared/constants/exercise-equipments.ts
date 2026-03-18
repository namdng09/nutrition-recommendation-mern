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
] as const;

export type ExerciseEquipment = (typeof EXERCISE_EQUIPMENTS)[number];
export type ExerciseEquipmentName = ExerciseEquipment['name'];

export const EXERCISE_EQUIPMENT_NAMES = EXERCISE_EQUIPMENTS.map(
  equipment => equipment.name
) as ExerciseEquipmentName[];

export const EXERCISE_EQUIPMENT_BY_NAME = Object.fromEntries(
  EXERCISE_EQUIPMENTS.map(equipment => [equipment.name, equipment])
) as Record<ExerciseEquipmentName, ExerciseEquipment>;
