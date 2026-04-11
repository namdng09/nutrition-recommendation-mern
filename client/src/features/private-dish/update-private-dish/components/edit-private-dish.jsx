import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaCheck,
  FaChevronDown,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';

import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';

import CreatePrivateDishBasicInfo from '../../create-private-dish/components/create-private-dish-basic-info';
import CreatePrivateDishInstructions from '../../create-private-dish/components/create-private-dish-instructions';
import CreatePrivateDishNutritionEstimate from '../../create-private-dish/components/create-private-dish-nutrition-estimate';
import CreatePrivateDishSelectedIngredients from '../../create-private-dish/components/create-private-dish-selected-ingredients';
import CreatePrivateDishSettings from '../../create-private-dish/components/create-private-dish-settings';
import DishIngredientPickerModal from '../../create-private-dish/components/dish-ingredient-picker-modal';
import SectionCard from '../../create-private-dish/components/section-card';
import { usePrivateDishDetail } from '../../view-private-dish-detail/api/view-private-dish-detail';
import { useUpdatePrivateDish } from '../api/update-private-dish';
import EditPrivateDishHeader from './edit-private-dish-header';
import PrivateNutritionPiePreview from './private-nutrition-pie-preview';

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

const DEFAULT_FORM = {
  name: '',
  description: '',
  categories: [],
  nutritionFocus: [],
  preparationTime: 0,
  cookTime: 0,
  servings: 1,
  tags: [],
  ingredients: [],
  instructions: [{ step: 1, description: '' }],
  nutrition: {
    nutrients: [],
    minerals: [],
    vitamins: []
  },
  isActive: true,
  image: null
};

const normalizeDishToFormData = dish => ({
  name: dish?.name || '',
  description: dish?.description || '',
  categories: dish?.categories || [],
  nutritionFocus: dish?.nutritionFocus || [],
  preparationTime: dish?.preparationTime || 0,
  cookTime: dish?.cookTime || 0,
  servings: dish?.servings || 1,
  tags: dish?.tags || [],
  ingredients:
    dish?.ingredients?.map(item => ({
      ingredientId: item.ingredientId,
      name: item.name,
      image: item.image,
      description: item.description,
      allergens: item.allergens || [],
      units: item.units || [{ quantity: 100, unit: 'g', isDefault: true }]
    })) || [],
  instructions: dish?.instructions?.map((item, index) => ({
    step: item.step ?? index + 1,
    description: item.description || ''
  })) || [{ step: 1, description: '' }],
  nutrition: dish?.nutrition || {
    nutrients: [],
    minerals: [],
    vitamins: []
  },
  isActive: dish?.isActive ?? true,
  image: null
});

const getNutrientValue = (nutrition, label) => {
  return nutrition?.nutrients?.find(item => item.label === label);
};

const roundNumber = value =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getBaseAmount = detail => {
  const fromBaseUnit =
    Number(detail?.baseUnit?.amount || detail?.baseUnit?.quantity || 0) || 0;
  if (fromBaseUnit > 0) return fromBaseUnit;

  const defaultUnit = detail?.units?.find(unit => unit?.isDefault);
  const fromDefaultUnit = Number(defaultUnit?.quantity || 0) || 0;
  if (fromDefaultUnit > 0) return fromDefaultUnit;

  return 100;
};

const mergeNutritionGroup = (ingredients, key) => {
  const map = new Map();

  ingredients.forEach(item => {
    const detail = item.detail || {};
    const quantity = Number(item.units?.[0]?.quantity || 0);
    const baseAmount = getBaseAmount(detail);
    const ratio = baseAmount > 0 ? quantity / baseAmount : 0;
    const nutritionList = detail?.nutrition?.[key] || [];

    nutritionList.forEach(nutrient => {
      const mapKey = `${nutrient.label}-${nutrient.unit}`;
      const current = map.get(mapKey) || {
        label: nutrient.label,
        unit: nutrient.unit,
        value: 0
      };

      current.value += Number(nutrient.value || 0) * ratio;
      map.set(mapKey, current);
    });
  });

  return Array.from(map.values()).map(item => ({
    ...item,
    value: roundNumber(item.value)
  }));
};

const calculateNutritionFromIngredients = ingredients => ({
  nutrients: mergeNutritionGroup(ingredients, 'nutrients'),
  minerals: mergeNutritionGroup(ingredients, 'minerals'),
  vitamins: mergeNutritionGroup(ingredients, 'vitamins')
});

export default function EditPrivateDish() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { data: dish } = usePrivateDishDetail(id);
  const { data: ingredientsData } = useIngredients({
    page: 1,
    limit: 1000
  });

  const ingredientOptions = ingredientsData?.docs || [];

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);

  const { mutate: updatePrivateDish, isPending: isUpdating } =
    useUpdatePrivateDish({
      onSuccess: () => {
        navigate(`/private-dishes/${id}`);
      }
    });

  useEffect(() => {
    if (!dish) return;

    const normalized = normalizeDishToFormData(dish);
    setFormData(normalized);
    setImagePreview(dish.image || '');
  }, [dish]);

  const selectedIngredientsDetail = useMemo(() => {
    return formData.ingredients.map(item => {
      const fullDetail =
        ingredientOptions.find(opt => opt._id === item.ingredientId) || item;

      return {
        ingredientId: item.ingredientId,
        detail: fullDetail,
        units: item.units || [{ quantity: 100, unit: 'g', isDefault: true }]
      };
    });
  }, [formData.ingredients, ingredientOptions]);

  const computedNutrition = useMemo(() => {
    if (!selectedIngredientsDetail.length) {
      return {
        nutrients: [],
        minerals: [],
        vitamins: []
      };
    }

    return calculateNutritionFromIngredients(selectedIngredientsDetail);
  }, [selectedIngredientsDetail]);

  const handleChange = e => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleDishImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDishImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) {
      setTagInput('');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmed]
    }));
    setTagInput('');
  };

  const removeTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
        .map((item, idx) => ({
          ...item,
          step: idx + 1
        }))
    }));
  };

  const handleInstructionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((item, i) =>
        i === index ? { ...item, description: value } : item
      )
    }));
  };

  const removeIngredient = index => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleQuantityChange = (index, value) => {
    const quantity = Number(value || 0);

    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) =>
        i === index
          ? {
              ...item,
              units: [
                {
                  ...(item.units?.[0] || {}),
                  quantity
                }
              ]
            }
          : item
      )
    }));
  };

  const handleSelectIngredient = item => {
    const exists = formData.ingredients.some(
      ingredient => ingredient.ingredientId === item._id
    );
    if (exists) return;

    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredientId: item._id,
          name: item.name,
          image: item.image,
          description: item.description,
          allergens: item.allergens || [],
          units: [
            {
              quantity: item.baseUnit?.amount || 100,
              unit: item.baseUnit?.unit || 'g',
              isDefault: true
            }
          ]
        }
      ]
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    updatePrivateDish({
      id,
      dishData: {
        ...formData,
        nutrition: computedNutrition,
        ingredients: formData.ingredients.map(item => ({
          ingredientId: item.ingredientId,
          units: item.units
        })),
        instructions: formData.instructions.map((item, index) => ({
          step: index + 1,
          description: item.description
        }))
      }
    });
  };

  const ingredientCount = formData.ingredients.length;
  const stepCount = formData.instructions.length;
  const servings = formData.servings || 0;

  if (!dish) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center px-6 text-center text-sm font-medium text-muted-foreground'>
        Đang tải món ăn...
      </div>
    );
  }

  return (
    <>
      <div className='light min-h-screen bg-background px-4 py-6 text-foreground md:px-6 md:py-8'>
        <div className='mx-auto w-full max-w-8xl'>
          <div className='xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8'>
            <form
              onSubmit={handleSubmit}
              className='animate-in space-y-8 fade-in duration-500'
            >
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <button
                  type='button'
                  onClick={() => navigate(-1)}
                  className='group inline-flex items-center gap-2.5 self-start rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] active:translate-y-0'
                >
                  <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition duration-200 group-hover:bg-primary/15'>
                    <FaArrowLeft className='text-xs transition duration-200 group-hover:-translate-x-0.5' />
                  </span>
                  <span className='tracking-tight'>Quay lại</span>
                </button>

                <button
                  type='submit'
                  disabled={isUpdating}
                  className='inline-flex items-center gap-2 self-start rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <FaSave className='text-xs' />
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>

              <EditPrivateDishHeader
                ingredientCount={ingredientCount}
                stepCount={stepCount}
                servings={servings}
              />

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
            </form>

            <div className='hidden xl:block xl:pt-[92px]'>
              <div className='sticky top-6'>
                <PrivateNutritionPiePreview nutrition={computedNutrition} />
              </div>
            </div>
          </div>
        </div>

        <DishIngredientPickerModal
          open={isIngredientModalOpen}
          onClose={() => setIsIngredientModalOpen(false)}
          ingredientOptions={ingredientOptions}
          selectedIngredientIds={formData.ingredients.map(
            item => item.ingredientId
          )}
          onSelect={handleSelectIngredient}
        />
      </div>
    </>
  );
}
