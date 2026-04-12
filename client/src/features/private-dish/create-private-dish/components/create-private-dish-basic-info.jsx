import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { DISH_CATEGORY_OPTIONS, NUTRITION_FOCUS_OPTIONS } from '~/lib/utils';

function FieldLabel({ children }) {
  return (
    <label className='mb-2.5 block text-sm font-bold tracking-tight text-foreground'>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 ${props.className || ''}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 ${props.className || ''}`}
    />
  );
}

export default function CreatePrivateDishBasicInfo({
  SectionCard,
  MultiSelectDropdown,
  fileInputRef,
  imagePreview,
  formData,
  handleChange,
  handleDishImageClick,
  handleDishImageChange,
  setFormData
}) {
  return (
    <SectionCard
      title='Thông tin cơ bản'
      description='Nhập tên món ăn, mô tả, ảnh đại diện, danh mục và định hướng dinh dưỡng.'
    >
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]'>
        <div className='flex justify-center lg:justify-start'>
          <div className='w-full max-w-[260px]'>
            <div
              className='group relative cursor-pointer'
              onClick={handleDishImageClick}
            >
              <div className='rounded-[32px] border border-border bg-card p-3 shadow-sm transition group-hover:border-primary/40'>
                <Avatar className='h-[240px] w-full rounded-[24px]'>
                  <AvatarImage
                    src={imagePreview || undefined}
                    alt={formData.name || 'dish-image'}
                    className='object-cover'
                  />
                  <AvatarFallback className='rounded-[24px] bg-primary/10 text-5xl font-semibold text-primary'>
                    {formData.name?.charAt(0)?.toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='absolute -bottom-1 -right-1 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-xl transition group-hover:scale-105'>
                <Camera className='h-5 w-5' />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleDishImageChange}
            />

            <p className='mt-4 text-center text-xs leading-relaxed text-muted-foreground'>
              Nhấn vào ảnh để tải ảnh món ăn lên hoặc thay đổi ảnh hiện tại
            </p>
          </div>
        </div>

        <div className='relative z-20 grid grid-cols-1 gap-5 md:grid-cols-2'>
          <div className='md:col-span-2'>
            <FieldLabel>Tên món ăn</FieldLabel>
            <TextInput
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Ví dụ: Gà xào rau củ sốt tiêu xanh'
            />
          </div>

          <div className='md:col-span-2'>
            <FieldLabel>Mô tả</FieldLabel>
            <TextArea
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder='Viết vài dòng mô tả ngắn để món ăn trông hấp dẫn hơn...'
            />
          </div>

          <MultiSelectDropdown
            label='Danh mục món ăn'
            options={DISH_CATEGORY_OPTIONS}
            value={formData.categories}
            onChange={selectedValues =>
              setFormData(prev => ({
                ...prev,
                categories: selectedValues
              }))
            }
            placeholder='Chọn danh mục món ăn'
          />

          <MultiSelectDropdown
            label='Định hướng dinh dưỡng'
            options={NUTRITION_FOCUS_OPTIONS}
            value={formData.nutritionFocus}
            onChange={selectedValues =>
              setFormData(prev => ({
                ...prev,
                nutritionFocus: selectedValues
              }))
            }
            placeholder='Chọn định hướng dinh dưỡng'
          />
        </div>
      </div>
    </SectionCard>
  );
}
