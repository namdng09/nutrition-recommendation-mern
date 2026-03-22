import { GiFruitBowl, GiMeal } from 'react-icons/gi';
import {
  IoCafeOutline,
  IoFastFoodOutline,
  IoMoonOutline,
  IoSunnyOutline
} from 'react-icons/io5';

export const getProgressColor = percent => {
  if (percent >= 120) return 'bg-destructive';
  if (percent >= 90) return 'bg-emerald-500';
  if (percent >= 70) return 'bg-amber-500';
  return 'bg-primary';
};

export const getStatusTone = percent => {
  if (percent >= 120) {
    return {
      wrap: 'border-destructive/20 bg-destructive/5',
      icon: 'text-destructive',
      text: 'Cao hơn mục tiêu'
    };
  }

  if (percent >= 90) {
    return {
      wrap: 'border-emerald-500/20 bg-emerald-500/5',
      icon: 'text-emerald-500',
      text: 'Gần đạt mục tiêu'
    };
  }

  if (percent >= 70) {
    return {
      wrap: 'border-amber-500/20 bg-amber-500/5',
      icon: 'text-amber-500',
      text: 'Tương đối phù hợp'
    };
  }

  return {
    wrap: 'border-primary/20 bg-primary/5',
    icon: 'text-primary',
    text: 'Chưa đạt mục tiêu'
  };
};

export const getMealIcon = mealType => {
  const text = String(mealType || '').toLowerCase();

  if (text.includes('sáng')) return <IoCafeOutline size={18} />;
  if (text.includes('trưa')) return <IoSunnyOutline size={18} />;
  if (text.includes('tối')) return <IoMoonOutline size={18} />;
  if (text.includes('nhẹ')) return <IoFastFoodOutline size={18} />;
  if (text.includes('tráng')) return <GiFruitBowl size={18} />;

  return <GiMeal size={18} />;
};

export const getMealIconWrapClass = mealType => {
  const text = String(mealType || '').toLowerCase();

  if (text.includes('sáng')) return 'bg-orange-500/10 text-orange-500';
  if (text.includes('trưa')) return 'bg-amber-500/10 text-amber-500';
  if (text.includes('tối')) return 'bg-indigo-500/10 text-indigo-500';
  if (text.includes('nhẹ')) return 'bg-emerald-500/10 text-emerald-500';
  if (text.includes('tráng')) return 'bg-pink-500/10 text-pink-500';

  return 'bg-primary/10 text-primary';
};
