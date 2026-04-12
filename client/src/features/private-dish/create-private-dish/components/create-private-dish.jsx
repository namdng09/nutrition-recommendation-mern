import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowRight, FaCheck, FaChevronDown, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router';

import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';

import { useCreatePrivateDish } from '../api/create-private-dish';
import CreatePrivateDishBasicInfo from './create-private-dish-basic-info';
import CreatePrivateDishHeader from './create-private-dish-header';
import CreatePrivateDishInstructions from './create-private-dish-instructions';
import CreatePrivateDishNutritionEstimate from './create-private-dish-nutrition-estimate';
import CreatePrivateDishSelectedIngredients from './create-private-dish-selected-ingredients';
import CreatePrivateDishSettings from './create-private-dish-settings';
import DishIngredientPickerModal from './dish-ingredient-picker-modal';
import NutritionPiePreview from './nutrition-pie-preview';

const getNutrientValue = (nutrition, label) => {
  return nutrition?.nutrients?.find(item => item.label === label);
};

const roundNumber = value => Math.round((value + Number.EPSILON) * 100) / 100;

const mergeNutritionGroup = (items = [], ratio = 1, accumulator = {}) => {
  items.forEach(item => {
    const key = `${item.label}__${item.unit}`;

    if (!accumulator[key]) {
      accumulator[key] = {
        label: item.label,
        value: 0,
        unit: item.unit
      };
    }

    accumulator[key].value += Number(item.value || 0) * ratio;
  });

  return accumulator;
};

const buildNutritionFromIngredients = (ingredients = []) => {
  const nutrientsMap = {};
  const mineralsMap = {};
  const vitaminsMap = {};

  ingredients.forEach(ingredient => {
    const quantity = Number(ingredient?.units?.[0]?.quantity || 0);
    const baseAmount =
      Number(ingredient?.detail?.baseUnit?.amount || 100) || 100;
    const ratio = quantity / baseAmount;

    mergeNutritionGroup(
      ingredient?.detail?.nutrition?.nutrients || [],
      ratio,
      nutrientsMap
    );

    mergeNutritionGroup(
      ingredient?.detail?.nutrition?.minerals || [],
      ratio,
      mineralsMap
    );

    mergeNutritionGroup(
      ingredient?.detail?.nutrition?.vitamins || [],
      ratio,
      vitaminsMap
    );
  });

  return {
    nutrients: Object.values(nutrientsMap).map(item => ({
      ...item,
      value: roundNumber(item.value)
    })),
    minerals: Object.values(mineralsMap).map(item => ({
      ...item,
      value: roundNumber(item.value)
    })),
    vitamins: Object.values(vitaminsMap).map(item => ({
      ...item,
      value: roundNumber(item.value)
    }))
  };
};

function PageShell({ children }) {
  return (
    <div className='min-h-screen px-4 py-8 md:px-6'>
      <div className='mx-auto max-w-[1600px]'>{children}</div>
    </div>
  );
}

function SectionCard({ title, description, rightAction, children }) {
  return (
    <section className='rounded-[32px] border border-border bg-card text-card-foreground shadow-[0_8px_30px_rgba(15,23,42,0.06)]'>
      <div className='border-b border-border px-6 py-5 md:px-7'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-lg font-black tracking-tight text-foreground md:text-[20px]'>
              {title}
            </h2>
            {description ? (
              <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                {description}
              </p>
            ) : null}
          </div>
          {rightAction}
        </div>
      </div>

      <div className='px-6 py-6 md:px-7'>{children}</div>
    </section>
  );
}

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

function MultiSelectDropdown({
  label,
  options,
  value = [],
  onChange,
  placeholder = 'Chọn mục'
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = optionValue => {
    const exists = value.includes(optionValue);

    if (exists) {
      onChange(value.filter(item => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  const removeOption = optionValue => {
    onChange(value.filter(item => item !== optionValue));
  };

  const getOptionLabel = optionValue => {
    return options.find(opt => opt.value === optionValue)?.label || optionValue;
  };

  return (
    <div ref={wrapperRef} className='relative z-20'>
      {label ? <FieldLabel>{label}</FieldLabel> : null}

      <button
        type='button'
        onClick={() => setOpen(prev => !prev)}
        className={`flex min-h-12 w-full items-center justify-between rounded-2xl border bg-background px-4 py-3 text-left shadow-sm transition ${
          open
            ? 'border-primary ring-4 ring-primary/10'
            : 'border-border hover:border-primary/30'
        }`}
      >
        <div className='flex min-h-6 flex-1 flex-wrap gap-2 pr-3'>
          {value.length > 0 ? (
            value.map(item => (
              <span
                key={item}
                className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'
              >
                {getOptionLabel(item)}
                <span
                  onClick={e => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                  className='cursor-pointer text-primary transition hover:opacity-70'
                >
                  <FaTimes className='text-[10px]' />
                </span>
              </span>
            ))
          ) : (
            <span className='text-sm text-muted-foreground'>{placeholder}</span>
          )}
        </div>

        <FaChevronDown
          className={`shrink-0 text-sm text-muted-foreground transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div className='absolute left-0 right-0 top-full z-[80] mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_20px_50px_rgba(15,23,42,0.18)]'>
          {options.map(option => {
            const selected = value.includes(option.value);

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => toggleOption(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <span>{option.label}</span>
                {selected ? <FaCheck className='text-xs' /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function CreatePrivateDish() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const { data: ingredientRes } = useIngredients({ limit: 1000 });
  const ingredientOptions = ingredientRes?.docs || [];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    categories: ['Món chính'],
    ingredients: [],
    nutritionFocus: [],
    instructions: [{ step: 1, description: '' }],
    nutrition: {
      nutrients: [],
      minerals: [],
      vitamins: []
    },
    preparationTime: 0,
    cookTime: 0,
    servings: 1,
    tags: [],
    isActive: true
  });

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const { mutate: createPrivateDish, isPending } = useCreatePrivateDish({
    onSuccess: dish => {
      navigate(`/private-dishes/${dish._id}`);
    }
  });

  const selectedIngredientIds = useMemo(
    () => formData.ingredients.map(item => item.ingredientId),
    [formData.ingredients]
  );

  const selectedIngredientsDetail = useMemo(() => {
    return formData.ingredients.map(item => {
      const detail =
        item.detail ||
        ingredientOptions.find(ing => ing._id === item.ingredientId);

      return {
        ...item,
        detail
      };
    });
  }, [formData.ingredients, ingredientOptions]);

  const computedNutrition = useMemo(() => {
    return buildNutritionFromIngredients(selectedIngredientsDetail);
  }, [selectedIngredientsDetail]);

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'preparationTime' || name === 'cookTime' || name === 'servings'
          ? value === ''
            ? ''
            : Number(value)
          : value
    }));
  };
  const handleDishImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDishImageChange = e => {
    const file = e.target.files?.[0];
    if (!(file instanceof File)) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const addIngredientFromList = ingredient => {
    const existed = formData.ingredients.some(
      item => item.ingredientId === ingredient._id
    );

    if (existed) return;

    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredientId: ingredient._id,
          detail: ingredient,
          units: [
            {
              quantity: ingredient?.baseUnit?.amount || 1,
              unit: 'g',
              isDefault: true
            }
          ]
        }
      ]
    }));
  };

  const removeIngredient = index => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleQuantityChange = (ingredientIndex, value) => {
    setFormData(prev => {
      const nextIngredients = [...prev.ingredients];
      const currentIngredient = nextIngredients[ingredientIndex];

      if (!currentIngredient) return prev;

      const currentUnits = currentIngredient.units || [
        {
          quantity: 1,
          unit: 'g',
          isDefault: true
        }
      ];

      currentUnits[0] = {
        ...currentUnits[0],
        quantity: Number(value),
        unit: 'g'
      };

      nextIngredients[ingredientIndex] = {
        ...currentIngredient,
        units: currentUnits
      };

      return {
        ...prev,
        ingredients: nextIngredients
      };
    });
  };

  const handleInstructionChange = (index, value) => {
    setFormData(prev => {
      const nextInstructions = [...prev.instructions];
      nextInstructions[index] = {
        ...nextInstructions[index],
        step: index + 1,
        description: value
      };

      return {
        ...prev,
        instructions: nextInstructions
      };
    });
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        {
          step: prev.instructions.length + 1,
          description: ''
        }
      ]
    }));
  };

  const removeInstruction = index => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          step: i + 1
        }))
    }));
  };

  const addTag = () => {
    const newTag = tagInput.trim();

    if (!newTag) return;

    const existed = formData.tags.some(
      tag => tag.toLowerCase() === newTag.toLowerCase()
    );

    if (existed) {
      setTagInput('');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));

    setTagInput('');
  };

  const removeTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      ...formData,
      image: formData.image instanceof File ? formData.image : null,
      nutrition: computedNutrition,
      categories: formData.categories.filter(Boolean),
      nutritionFocus: formData.nutritionFocus.filter(Boolean),
      tags: formData.tags.filter(Boolean),
      ingredients: formData.ingredients
        .filter(item => item.ingredientId)
        .map(item => ({
          ingredientId: item.ingredientId,
          units: item.units.map(unit => ({
            ...unit,
            unit: 'g'
          }))
        })),
      instructions: formData.instructions
        .filter(item => item.description.trim())
        .map((item, index) => ({
          ...item,
          step: index + 1
        }))
    };

    createPrivateDish(payload);
  };

  return (
    <>
      <DishIngredientPickerModal
        open={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        ingredientOptions={ingredientOptions}
        selectedIngredientIds={selectedIngredientIds}
        onSelect={addIngredientFromList}
      />

      <PageShell>
        <div className='grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]'>
          <div className='space-y-8'>
            <CreatePrivateDishHeader
              ingredientCount={formData.ingredients.length}
              stepCount={formData.instructions.length}
              servings={formData.servings}
            />

            <form onSubmit={handleSubmit} className='space-y-8'>
              <CreatePrivateDishBasicInfo
                SectionCard={SectionCard}
                MultiSelectDropdown={MultiSelectDropdown}
                fileInputRef={fileInputRef}
                imagePreview={imagePreview}
                formData={formData}
                handleChange={handleChange}
                handleDishImageClick={handleDishImageClick}
                handleDishImageChange={handleDishImageChange}
                setFormData={setFormData}
              />

              <CreatePrivateDishNutritionEstimate
                SectionCard={SectionCard}
                nutrition={computedNutrition}
              />

              <CreatePrivateDishSelectedIngredients
                SectionCard={SectionCard}
                FieldLabel={FieldLabel}
                TextInput={TextInput}
                selectedIngredientsDetail={selectedIngredientsDetail}
                getNutrientValue={getNutrientValue}
                removeIngredient={removeIngredient}
                handleQuantityChange={handleQuantityChange}
                onOpenIngredientModal={() => setIsIngredientModalOpen(true)}
              />

              <CreatePrivateDishInstructions
                SectionCard={SectionCard}
                TextArea={TextArea}
                instructions={formData.instructions}
                addInstruction={addInstruction}
                removeInstruction={removeInstruction}
                handleInstructionChange={handleInstructionChange}
              />

              <CreatePrivateDishSettings
                SectionCard={SectionCard}
                FieldLabel={FieldLabel}
                TextInput={TextInput}
                formData={formData}
                tagInput={tagInput}
                setTagInput={setTagInput}
                handleChange={handleChange}
                addTag={addTag}
                removeTag={removeTag}
              />

              <div className='sticky bottom-4 z-20'>
                <div className='rounded-[28px] border border-border bg-card/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <p className='text-sm font-bold text-foreground'>
                        Sẵn sàng tạo món ăn?
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Kiểm tra lại thông tin trước khi lưu công thức riêng tư
                        của bạn.
                      </p>
                    </div>

                    <button
                      type='submit'
                      disabled={isPending}
                      className='inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {isPending ? 'Đang tạo món ăn...' : 'Tạo món ăn'}
                      {!isPending ? <FaArrowRight className='text-xs' /> : null}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className='hidden xl:block'>
            <NutritionPiePreview nutrition={computedNutrition} />
          </div>
        </div>
      </PageShell>
    </>
  );
}
