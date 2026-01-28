import mongoose from 'mongoose';

import { GENDER } from '~/shared/constants/gender';
import { ROLE } from '~/shared/constants/role';
import {
  AuthModel,
  CollectionModel,
  DishModel,
  GroceryModel,
  IngredientModel,
  MealModel,
  PostModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import { GROCERY_STATUS } from '~/shared/database/models/grocery-model';
import { MEAL_TYPE } from '~/shared/database/models/meal-model';
import { POST_CATEGORY } from '~/shared/database/models/post-model';

// User Seeds
export const userSeeds = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    gender: GENDER.MALE,
    role: ROLE.ADMIN,
    dob: new Date('1990-01-15'),
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?u=john',
    gender: GENDER.MALE,
    role: ROLE.USER,
    dob: new Date('1995-05-20'),
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    gender: GENDER.FEMALE,
    role: ROLE.USER,
    dob: new Date('1992-08-10'),
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    email: 'inactive.user@example.com',
    name: 'Inactive User',
    avatar: '',
    gender: GENDER.OTHER,
    role: ROLE.USER,
    dob: new Date('1988-03-25'),
    isActive: false
  }
];

// Auth Seeds
export const authSeeds = [
  {
    user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    provider: 'local',
    providerId: 'admin@example.com',
    localPassword: '$2b$10$5ysgXZUJi7MkJWhEhFcZTeer9Z6pmx2XhcqPb3gNVwPLjKfO9rTp2', // hashed "password123"
    verifyAt: new Date('2024-01-01')
  },
  {
    user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    provider: 'local',
    providerId: 'john.doe@example.com',
    localPassword: '$2b$10$5ysgXZUJi7MkJWhEhFcZTeer9Z6pmx2XhcqPb3gNVwPLjKfO9rTp2',
    verifyAt: new Date('2024-01-02')
  },
  {
    user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    provider: 'google',
    providerId: '123456789',
    verifyAt: new Date('2024-01-03')
  }
];

// Ingredient Seeds
export const ingredientSeeds = [
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439021'),
    name: 'Chicken Breast',
    category: 'Protein',
    unit: 'g',
    caloriesPer100g: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439022'),
    name: 'White Rice',
    category: 'Grains',
    unit: 'g',
    caloriesPer100g: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439023'),
    name: 'Broccoli',
    category: 'Vegetables',
    unit: 'g',
    caloriesPer100g: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4baa',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439024'),
    name: 'Almonds',
    category: 'Nuts',
    unit: 'g',
    caloriesPer100g: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12.5,
    allergens: ['nuts'],
    image: 'https://images.unsplash.com/photo-1508961802361-a520ee5fc0e1',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439025'),
    name: 'Salmon',
    category: 'Protein',
    unit: 'g',
    caloriesPer100g: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    allergens: ['fish'],
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439026'),
    name: 'Eggs',
    category: 'Protein',
    unit: 'piece',
    caloriesPer100g: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    allergens: ['eggs'],
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439027'),
    name: 'Olive Oil',
    category: 'Oils',
    unit: 'ml',
    caloriesPer100g: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439028'),
    name: 'Sweet Potato',
    category: 'Vegetables',
    unit: 'g',
    caloriesPer100g: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f3',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439029'),
    name: 'Spinach',
    category: 'Vegetables',
    unit: 'g',
    caloriesPer100g: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    allergens: [],
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439030'),
    name: 'Milk',
    category: 'Dairy',
    unit: 'ml',
    caloriesPer100g: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    allergens: ['dairy'],
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    isActive: true
  }
];

// Dish Seeds
export const dishSeeds = [
  {
    _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439031'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Grilled Chicken with Broccoli',
    description: 'Healthy and delicious grilled chicken breast with steamed broccoli',
    category: 'Main Course',
    price: 12.99,
    calories: 350,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439021'),
        name: 'Chicken Breast',
        quantity: 200,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439023'),
        name: 'Broccoli',
        quantity: 150,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439027'),
        name: 'Olive Oil',
        quantity: 10,
        unit: 'ml'
      }
    ],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791',
    allergens: [],
    isActive: true,
    preparationTime: 30,
    servings: 1,
    tags: ['healthy', 'high-protein', 'low-carb']
  },
  {
    _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439032'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Salmon Rice Bowl',
    description: 'Nutritious salmon bowl with rice and vegetables',
    category: 'Main Course',
    price: 15.99,
    calories: 520,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439025'),
        name: 'Salmon',
        quantity: 150,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439022'),
        name: 'White Rice',
        quantity: 150,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439029'),
        name: 'Spinach',
        quantity: 100,
        unit: 'g'
      }
    ],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    allergens: ['fish'],
    isActive: true,
    preparationTime: 25,
    servings: 1,
    tags: ['omega-3', 'balanced', 'nutritious']
  },
  {
    _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439033'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    name: 'Sweet Potato Breakfast Bowl',
    description: 'Energizing breakfast with sweet potato, eggs, and spinach',
    category: 'Breakfast',
    price: 9.99,
    calories: 380,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439028'),
        name: 'Sweet Potato',
        quantity: 200,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439026'),
        name: 'Eggs',
        quantity: 2,
        unit: 'piece'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439029'),
        name: 'Spinach',
        quantity: 50,
        unit: 'g'
      }
    ],
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38',
    allergens: ['eggs'],
    isActive: true,
    preparationTime: 20,
    servings: 1,
    tags: ['breakfast', 'energizing', 'vegetarian']
  },
  {
    _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439034'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    name: 'Almond Protein Smoothie',
    description: 'Quick and nutritious protein smoothie',
    category: 'Snack',
    price: 6.99,
    calories: 220,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439024'),
        name: 'Almonds',
        quantity: 30,
        unit: 'g'
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439030'),
        name: 'Milk',
        quantity: 200,
        unit: 'ml'
      }
    ],
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8',
    allergens: ['nuts', 'dairy'],
    isActive: true,
    preparationTime: 5,
    servings: 1,
    tags: ['quick', 'protein', 'snack']
  }
];

// Meal Seeds
export const mealSeeds = [
  {
    _id: new mongoose.Types.ObjectId('807f1f77bcf86cd799439041'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Protein Power Lunch',
    mealType: MEAL_TYPE.LUNCH,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439031'),
        name: 'Grilled Chicken with Broccoli',
        category: 'Main Course',
        price: 12.99,
        calories: 350,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791'
      }
    ],
    totalCalories: 350,
    totalPrice: 12.99,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('807f1f77bcf86cd799439042'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    name: 'Morning Energy Boost',
    mealType: MEAL_TYPE.BREAKFAST,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439033'),
        name: 'Sweet Potato Breakfast Bowl',
        category: 'Breakfast',
        price: 9.99,
        calories: 380,
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'
      }
    ],
    totalCalories: 380,
    totalPrice: 9.99,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('807f1f77bcf86cd799439043'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Balanced Dinner',
    mealType: MEAL_TYPE.DINNER,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439032'),
        name: 'Salmon Rice Bowl',
        category: 'Main Course',
        price: 15.99,
        calories: 520,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
      }
    ],
    totalCalories: 520,
    totalPrice: 15.99,
    isActive: true
  }
];

// Post Seeds
export const postSeeds = [
  {
    _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439051'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      name: 'Admin User',
      role: ROLE.ADMIN
    },
    title: '10 Easy High-Protein Recipes for Busy Weekdays',
    content: 'Discover delicious and nutritious high-protein recipes that you can prepare in under 30 minutes. Perfect for maintaining your fitness goals while managing a busy schedule...',
    images: ['https://images.unsplash.com/photo-1498837167922-ddd27525d352'],
    tags: ['protein', 'quick-meals', 'healthy'],
    likes: 125,
    views: 1520,
    comments: 23,
    isPublished: true,
    publishedAt: new Date('2024-01-15'),
    category: POST_CATEGORY.RECIPE,
    slug: '10-easy-high-protein-recipes'
  },
  {
    _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439052'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      name: 'Admin User',
      role: ROLE.ADMIN
    },
    title: 'Understanding Macronutrients: A Complete Guide',
    content: 'Learn everything you need to know about proteins, carbohydrates, and fats. How to balance them for optimal health and performance...',
    images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061'],
    tags: ['nutrition', 'education', 'macros'],
    likes: 89,
    views: 980,
    comments: 15,
    isPublished: true,
    publishedAt: new Date('2024-01-10'),
    category: POST_CATEGORY.NUTRITION,
    slug: 'understanding-macronutrients-complete-guide'
  },
  {
    _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439053'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe',
      role: ROLE.USER
    },
    title: 'My Journey to a Healthier Lifestyle',
    content: 'Sharing my personal experience and tips on how I transformed my eating habits and improved my overall health...',
    images: [],
    tags: ['lifestyle', 'journey', 'motivation'],
    likes: 45,
    views: 320,
    comments: 8,
    isPublished: true,
    publishedAt: new Date('2024-01-20'),
    category: POST_CATEGORY.LIFESTYLE,
    slug: 'my-journey-healthier-lifestyle'
  },
  {
    _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439054'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith',
      role: ROLE.USER
    },
    title: '5 Tips for Meal Prep Success',
    content: 'Master the art of meal prepping with these simple yet effective tips that will save you time and money...',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836'],
    tags: ['meal-prep', 'tips', 'organization'],
    likes: 67,
    views: 550,
    comments: 12,
    isPublished: true,
    publishedAt: new Date('2024-01-18'),
    category: POST_CATEGORY.TIPS,
    slug: '5-tips-meal-prep-success'
  },
  {
    _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439055'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      name: 'Admin User',
      role: ROLE.ADMIN
    },
    title: 'Draft: Upcoming Nutrition Trends 2024',
    content: 'A comprehensive look at the nutrition trends we expect to see in 2024...',
    images: [],
    tags: ['trends', 'nutrition', '2024'],
    likes: 0,
    views: 0,
    comments: 0,
    isPublished: false,
    category: POST_CATEGORY.NUTRITION,
    slug: 'upcoming-nutrition-trends-2024'
  }
];

// Collection Seeds
export const collectionSeeds = [
  {
    _id: new mongoose.Types.ObjectId('a07f1f77bcf86cd799439061'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'My Favorite High Protein Meals',
    description: 'A collection of my go-to high protein meals for muscle building',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    isPublic: true,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439031'),
        name: 'Grilled Chicken with Broccoli',
        category: 'Main Course',
        price: 12.99,
        calories: 350,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791',
        addedAt: new Date('2024-01-10')
      },
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439032'),
        name: 'Salmon Rice Bowl',
        category: 'Main Course',
        price: 15.99,
        calories: 520,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        addedAt: new Date('2024-01-11')
      }
    ],
    followers: 34,
    tags: ['protein', 'muscle-building', 'fitness'],
    slug: 'favorite-high-protein-meals'
  },
  {
    _id: new mongoose.Types.ObjectId('a07f1f77bcf86cd799439062'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    name: 'Quick Breakfast Ideas',
    description: 'Fast and nutritious breakfast options for busy mornings',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666',
    isPublic: true,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439033'),
        name: 'Sweet Potato Breakfast Bowl',
        category: 'Breakfast',
        price: 9.99,
        calories: 380,
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38',
        addedAt: new Date('2024-01-12')
      }
    ],
    followers: 18,
    tags: ['breakfast', 'quick', 'morning'],
    slug: 'quick-breakfast-ideas'
  },
  {
    _id: new mongoose.Types.ObjectId('a07f1f77bcf86cd799439063'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Private Meal Planning',
    description: 'My personal meal planning collection',
    image: '',
    isPublic: false,
    dishes: [
      {
        dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439034'),
        name: 'Almond Protein Smoothie',
        category: 'Snack',
        price: 6.99,
        calories: 220,
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8',
        addedAt: new Date('2024-01-15')
      }
    ],
    followers: 0,
    tags: ['private', 'personal'],
    slug: 'private-meal-planning'
  }
];

// Grocery Seeds
export const grocerySeeds = [
  {
    _id: new mongoose.Types.ObjectId('b07f1f77bcf86cd799439071'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Weekly Grocery List',
    date: new Date('2024-01-22'),
    status: GROCERY_STATUS.ACTIVE,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439021'),
        name: 'Chicken Breast',
        category: 'Protein',
        unit: 'g',
        quantity: 1000,
        isPurchased: false,
        estimatedCost: 15.99
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439022'),
        name: 'White Rice',
        category: 'Grains',
        unit: 'g',
        quantity: 2000,
        isPurchased: true,
        estimatedCost: 8.99
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439023'),
        name: 'Broccoli',
        category: 'Vegetables',
        unit: 'g',
        quantity: 500,
        isPurchased: false,
        estimatedCost: 4.99
      }
    ],
    totalEstimatedCost: 29.97,
    notes: 'Buy organic broccoli if available'
  },
  {
    _id: new mongoose.Types.ObjectId('b07f1f77bcf86cd799439072'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    name: 'Breakfast Ingredients',
    date: new Date('2024-01-23'),
    status: GROCERY_STATUS.ACTIVE,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439026'),
        name: 'Eggs',
        category: 'Protein',
        unit: 'piece',
        quantity: 12,
        isPurchased: false,
        estimatedCost: 5.99
      },
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439028'),
        name: 'Sweet Potato',
        category: 'Vegetables',
        unit: 'g',
        quantity: 800,
        isPurchased: false,
        estimatedCost: 6.99
      }
    ],
    totalEstimatedCost: 12.98
  },
  {
    _id: new mongoose.Types.ObjectId('b07f1f77bcf86cd799439073'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    name: 'Completed Shopping',
    date: new Date('2024-01-15'),
    status: GROCERY_STATUS.COMPLETED,
    ingredients: [
      {
        ingredientId: new mongoose.Types.ObjectId('607f1f77bcf86cd799439025'),
        name: 'Salmon',
        category: 'Protein',
        unit: 'g',
        quantity: 500,
        isPurchased: true,
        estimatedCost: 18.99
      }
    ],
    totalEstimatedCost: 18.99,
    notes: 'All items purchased'
  }
];

// Schedule Seeds
export const scheduleSeeds = [
  {
    _id: new mongoose.Types.ObjectId('c07f1f77bcf86cd799439081'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    date: new Date('2024-01-22'),
    dayOfWeek: 'Monday',
    isActive: true,
    meals: [
      {
        mealType: MEAL_TYPE.BREAKFAST,
        dishes: [
          {
            dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439033'),
            name: 'Sweet Potato Breakfast Bowl',
            category: 'Breakfast',
            price: 9.99,
            calories: 380,
            image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'
          }
        ]
      },
      {
        mealType: MEAL_TYPE.LUNCH,
        dishes: [
          {
            dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439031'),
            name: 'Grilled Chicken with Broccoli',
            category: 'Main Course',
            price: 12.99,
            calories: 350,
            image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791'
          }
        ]
      },
      {
        mealType: MEAL_TYPE.DINNER,
        dishes: [
          {
            dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439032'),
            name: 'Salmon Rice Bowl',
            category: 'Main Course',
            price: 15.99,
            calories: 520,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
          }
        ]
      }
    ],
    totalCalories: 1250,
    totalPrice: 38.97,
    notes: 'High protein day'
  },
  {
    _id: new mongoose.Types.ObjectId('c07f1f77bcf86cd799439082'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Jane Smith'
    },
    date: new Date('2024-01-23'),
    dayOfWeek: 'Tuesday',
    isActive: true,
    meals: [
      {
        mealType: MEAL_TYPE.BREAKFAST,
        dishes: [
          {
            dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439033'),
            name: 'Sweet Potato Breakfast Bowl',
            category: 'Breakfast',
            price: 9.99,
            calories: 380,
            image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'
          }
        ]
      },
      {
        mealType: MEAL_TYPE.SNACK,
        dishes: [
          {
            dishId: new mongoose.Types.ObjectId('707f1f77bcf86cd799439034'),
            name: 'Almond Protein Smoothie',
            category: 'Snack',
            price: 6.99,
            calories: 220,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8'
          }
        ]
      }
    ],
    totalCalories: 600,
    totalPrice: 16.98
  },
  {
    _id: new mongoose.Types.ObjectId('c07f1f77bcf86cd799439083'),
    user: {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'John Doe'
    },
    date: new Date('2024-01-15'),
    dayOfWeek: 'Wednesday',
    isActive: false,
    meals: [],
    totalCalories: 0,
    totalPrice: 0,
    notes: 'Rest day - no scheduled meals'
  }
];

// Seed Functions
export const seedUsers = async () => {
  await UserModel.deleteMany({});
  return await UserModel.insertMany(userSeeds);
};

export const seedAuth = async () => {
  await AuthModel.deleteMany({});
  return await AuthModel.insertMany(authSeeds);
};

export const seedIngredients = async () => {
  await IngredientModel.deleteMany({});
  return await IngredientModel.insertMany(ingredientSeeds);
};

export const seedDishes = async () => {
  await DishModel.deleteMany({});
  return await DishModel.insertMany(dishSeeds);
};

export const seedMeals = async () => {
  await MealModel.deleteMany({});
  return await MealModel.insertMany(mealSeeds);
};

export const seedPosts = async () => {
  await PostModel.deleteMany({});
  return await PostModel.insertMany(postSeeds);
};

export const seedCollections = async () => {
  await CollectionModel.deleteMany({});
  return await CollectionModel.insertMany(collectionSeeds);
};

export const seedGroceries = async () => {
  await GroceryModel.deleteMany({});
  return await GroceryModel.insertMany(grocerySeeds);
};

export const seedSchedules = async () => {
  await ScheduleModel.deleteMany({});
  return await ScheduleModel.insertMany(scheduleSeeds);
};

export const seedAll = async () => {
  await seedUsers();
  await seedAuth();
  await seedIngredients();
  await seedDishes();
  await seedMeals();
  await seedPosts();
  await seedCollections();
  await seedGroceries();
  await seedSchedules();
};

export const clearAll = async () => {
  await UserModel.deleteMany({});
  await AuthModel.deleteMany({});
  await IngredientModel.deleteMany({});
  await DishModel.deleteMany({});
  await MealModel.deleteMany({});
  await PostModel.deleteMany({});
  await CollectionModel.deleteMany({});
  await GroceryModel.deleteMany({});
  await ScheduleModel.deleteMany({});
};
