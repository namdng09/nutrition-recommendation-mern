import React from 'react';
import {
  IoBeaker,
  IoClose,
  IoFitness,
  IoFlask,
  IoLeaf,
  IoNutrition,
  IoWater
} from 'react-icons/io5';

import { Button } from '~/components/ui/button';

import NutritionDetailSection from './nutrition-detail-section';

export default function IngredientNutritionModal({ open, onClose, nutrition }) {
  if (!open) return null;

  const macroNutrients = nutrition?.nutrients
    ? Object.entries(nutrition.nutrients).map(([key, val]) => ({
        label: key,
        value: val.value,
        unit: val.unit
      }))
    : [];

  const config = {
    'Thành phần chính': {
      themeClass: 'text-emerald-light',
      icon: <IoFitness size={14} />
    },
    Vitamin: { themeClass: 'text-green-light', icon: <IoLeaf size={14} /> },
    'Khoáng chất': {
      themeClass: 'text-blue-light',
      icon: <IoBeaker size={14} />
    },
    Đường: { themeClass: 'text-orange-light', icon: <IoWater size={14} /> },
    'Chất béo': {
      themeClass: 'text-purple-light',
      icon: <IoNutrition size={14} />
    },
    'Amino acids': {
      themeClass: 'text-cyan-light',
      icon: <IoFlask size={14} />
    }
  };

  const sections = [
    { title: 'Thành phần chính', data: macroNutrients },
    { title: 'Vitamin', data: nutrition?.vitamins },
    { title: 'Khoáng chất', data: nutrition?.minerals },
    { title: 'Đường', data: nutrition?.sugars },
    { title: 'Chất béo', data: nutrition?.fats },
    { title: 'Amino acids', data: nutrition?.aminoAcids }
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border bg-background shadow-2xl animate-in fade-in zoom-in duration-200'>
        <div className='flex items-center justify-between border-b px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='rounded-xl bg-primary/10 p-2 text-primary'>
              <IoFitness size={22} />
            </div>
            <div>
              <h2 className='text-lg font-bold leading-none'>
                Thành phần dinh dưỡng
              </h2>
              <p className='mt-1 text-xs text-muted-foreground'>
                Tính trên 100g nguyên liệu
              </p>
            </div>
          </div>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <IoClose size={24} />
          </Button>
        </div>

        <div className='max-h-[65vh] overflow-y-auto p-6 space-y-8'>
          {sections.map(
            section =>
              section.data?.length > 0 && (
                <NutritionDetailSection
                  key={section.title}
                  title={section.title}
                  items={section.data}
                  themeClass={config[section.title].themeClass}
                  icon={config[section.title].icon}
                />
              )
          )}
        </div>

        <div className='border-t bg-muted/30 p-4 flex justify-center'>
          <Button
            onClick={onClose}
            className='w-full max-w-[200px] rounded-2xl font-semibold'
          >
            Đóng bảng
          </Button>
        </div>
      </div>
    </div>
  );
}
