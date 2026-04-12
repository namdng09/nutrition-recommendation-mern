import { FaClock, FaFire, FaPlus, FaTimes, FaUsers } from 'react-icons/fa';

export default function CreatePrivateDishSettings({
  SectionCard,
  FieldLabel,
  TextInput,
  formData,
  tagInput,
  setTagInput,
  handleChange,
  addTag,
  removeTag
}) {
  const handleNumberFocus = name => {
    if (formData[name] === 0) {
      handleChange({
        target: {
          name,
          value: ''
        }
      });
    }
  };

  const handleNumberBlur = name => {
    if (formData[name] === '') {
      handleChange({
        target: {
          name,
          value: 0
        }
      });
    }
  };

  return (
    <SectionCard
      title='Thiết lập công thức'
      description='Thêm thời gian chuẩn bị, thời gian nấu, khẩu phần và tag.'
    >
      <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
        <div>
          <FieldLabel>Thời gian chuẩn bị</FieldLabel>
          <div className='relative'>
            <FaClock className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary' />
            <TextInput
              type='number'
              name='preparationTime'
              value={formData.preparationTime}
              onFocus={() => handleNumberFocus('preparationTime')}
              onBlur={() => handleNumberBlur('preparationTime')}
              onChange={handleChange}
              className='pl-11'
            />
          </div>
        </div>

        <div>
          <FieldLabel>Thời gian nấu</FieldLabel>
          <div className='relative'>
            <FaFire className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary' />
            <TextInput
              type='number'
              name='cookTime'
              value={formData.cookTime}
              onFocus={() => handleNumberFocus('cookTime')}
              onBlur={() => handleNumberBlur('cookTime')}
              onChange={handleChange}
              className='pl-11'
            />
          </div>
        </div>

        <div>
          <FieldLabel>Khẩu phần</FieldLabel>
          <div className='relative'>
            <FaUsers className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary' />
            <TextInput
              type='number'
              name='servings'
              value={formData.servings}
              onFocus={() => handleNumberFocus('servings')}
              onBlur={() => handleNumberBlur('servings')}
              onChange={handleChange}
              className='pl-11'
            />
          </div>
        </div>

        <div className='md:col-span-3'>
          <FieldLabel>Tags</FieldLabel>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <TextInput
              type='text'
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder='Nhập tag, ví dụ: nhanh'
              className='flex-1'
            />

            <button
              type='button'
              onClick={addTag}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90'
            >
              <FaPlus className='text-xs' />
              Thêm tag
            </button>
          </div>

          {formData.tags.length > 0 ? (
            <div className='mt-4 flex flex-wrap gap-2'>
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary'
                >
                  {tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='text-primary transition hover:opacity-70'
                  >
                    <FaTimes className='text-[10px]' />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className='mt-3 text-sm text-muted-foreground'>
              Chưa có tag nào. Hãy thêm tag để mô tả món ăn rõ hơn.
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
