import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '~/components/ui/command';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import {
  EXERCISE_DIFFICULTY_OPTIONS,
  EXERCISE_EQUIPMENT_OPTIONS,
  EXERCISE_MUSCLE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  getExerciseEquipmentByName,
  getExerciseMuscleByName,
  WORKOUT_COUNTER_TYPE_OPTIONS
} from '~/constants/exercise';
import { useCreateExercise } from '~/features/exercises/create-exercise/api/create-exercise';
import { createExerciseSchema } from '~/features/exercises/create-exercise/schemas/create-exercise-schemas';

const CreateExerciseForm = () => {
  const navigate = useNavigate();
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [muscleSearchOpen, setMuscleSearchOpen] = useState(false);
  const [equipmentSearchOpen, setEquipmentSearchOpen] = useState(false);

  const form = useForm({
    resolver: yupResolver(createExerciseSchema),
    defaultValues: {
      name: '',
      instructions: '',
      difficulty: '',
      type: '',
      logType: '',
      muscles: [],
      equipments: [],
      isActive: true
    }
  });

  const { mutate: createExercise, isPending } = useCreateExercise({
    onSuccess: response => {
      toast.success(response?.message || 'Tạo bài tập thành công');
      navigate('/admin/manage-exercises');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Tạo bài tập thất bại');
    }
  });

  const onSubmit = data => {
    createExercise({ data, tutorial: selectedTutorial });
  };

  const handleTutorialChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedTutorial(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeTutorial = () => {
    setSelectedTutorial(null);
    setPreviewUrl(null);
  };

  const toggleMuscle = muscleName => {
    const currentMuscles = form.getValues('muscles') || [];
    const muscleExists = currentMuscles.some(m => m.name === muscleName);

    if (muscleExists) {
      form.setValue(
        'muscles',
        currentMuscles.filter(m => m.name !== muscleName)
      );
    } else {
      const muscleData = getExerciseMuscleByName(muscleName);
      form.setValue('muscles', [
        ...currentMuscles,
        { name: muscleData.name, image: muscleData.image }
      ]);
    }
  };

  const toggleEquipment = equipmentName => {
    const currentEquipments = form.getValues('equipments') || [];
    const equipmentExists = currentEquipments.some(
      e => e.name === equipmentName
    );

    if (equipmentExists) {
      form.setValue(
        'equipments',
        currentEquipments.filter(e => e.name !== equipmentName)
      );
    } else {
      const equipmentData = getExerciseEquipmentByName(equipmentName);
      form.setValue('equipments', [
        ...currentEquipments,
        { name: equipmentData.name, image: equipmentData.image }
      ]);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate('/admin/manage-exercises')}
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Tạo bài tập mới</h1>
          <p className='text-muted-foreground'>
            Nhập thông tin để tạo bài tập mới
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Exercise Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên bài tập <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Squat' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instructions */}
              <FormField
                control={form.control}
                name='instructions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Chỉ dẫn <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập hướng dẫn chi tiết cho bài tập...'
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tutorial Image/Video */}
              <FormItem>
                <FormLabel>Hình ảnh/Video hướng dẫn</FormLabel>
                <FormControl>
                  <div className='space-y-4'>
                    {!previewUrl ? (
                      <div className='flex items-center gap-2'>
                        <Input
                          type='file'
                          accept='image/*,video/*'
                          onChange={handleTutorialChange}
                          className='flex-1'
                        />
                        <Upload className='h-5 w-5 text-muted-foreground' />
                      </div>
                    ) : (
                      <div className='relative'>
                        <img
                          src={previewUrl}
                          alt='Tutorial preview'
                          className='w-full max-h-64 object-contain rounded-md border'
                        />
                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          className='absolute top-2 right-2'
                          onClick={removeTutorial}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Tải lên hình ảnh hoặc video minh họa cách thực hiện bài tập
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>

          {/* Exercise Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Thuộc tính bài tập</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Difficulty */}
              <FormField
                control={form.control}
                name='difficulty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Độ khó <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn độ khó' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXERCISE_DIFFICULTY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại hình <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại hình' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXERCISE_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Log Type */}
              <FormField
                control={form.control}
                name='logType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại đếm <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại đếm' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORKOUT_COUNTER_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cách đo lường hiệu suất của bài tập
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Muscles & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>Nhóm cơ và Dụng cụ</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Muscles */}
              <FormField
                control={form.control}
                name='muscles'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nhóm cơ <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Popover
                      open={muscleSearchOpen}
                      onOpenChange={setMuscleSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className='w-full justify-start'
                            type='button'
                          >
                            {field.value?.length > 0 ? (
                              <div className='flex gap-1 flex-wrap'>
                                {field.value.map((muscle, idx) => (
                                  <Badge key={idx} variant='secondary'>
                                    {muscle.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              'Chọn nhóm cơ...'
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0' align='start'>
                        <Command>
                          <CommandInput placeholder='Tìm kiếm nhóm cơ...' />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy nhóm cơ</CommandEmpty>
                            <CommandGroup>
                              {EXERCISE_MUSCLE_OPTIONS.map(option => {
                                const isSelected = field.value?.some(
                                  m => m.name === option.value
                                );
                                return (
                                  <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                      toggleMuscle(option.value);
                                    }}
                                  >
                                    <div className='flex items-center gap-2 flex-1'>
                                      <img
                                        src={option.image}
                                        alt={option.label}
                                        className='h-6 w-6 object-contain'
                                      />
                                      <span>{option.label}</span>
                                    </div>
                                    {isSelected && (
                                      <Check className='h-4 w-4' />
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Chọn các nhóm cơ được tập luyện
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Equipments */}
              <FormField
                control={form.control}
                name='equipments'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dụng cụ <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Popover
                      open={equipmentSearchOpen}
                      onOpenChange={setEquipmentSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className='w-full justify-start'
                            type='button'
                          >
                            {field.value?.length > 0 ? (
                              <div className='flex gap-1 flex-wrap'>
                                {field.value.map((equipment, idx) => (
                                  <Badge key={idx} variant='secondary'>
                                    {equipment.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              'Chọn dụng cụ...'
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0' align='start'>
                        <Command>
                          <CommandInput placeholder='Tìm kiếm dụng cụ...' />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy dụng cụ</CommandEmpty>
                            <CommandGroup>
                              {EXERCISE_EQUIPMENT_OPTIONS.map(option => {
                                const isSelected = field.value?.some(
                                  e => e.name === option.value
                                );
                                return (
                                  <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                      toggleEquipment(option.value);
                                    }}
                                  >
                                    <div className='flex items-center gap-2 flex-1'>
                                      <img
                                        src={option.image}
                                        alt={option.label}
                                        className='h-6 w-6 object-contain'
                                      />
                                      <span>{option.label}</span>
                                    </div>
                                    {isSelected && (
                                      <Check className='h-4 w-4' />
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Chọn các dụng cụ cần thiết cho bài tập
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/admin/manage-exercises')}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className='mr-2 h-4 w-4' />
                  Đang tạo...
                </>
              ) : (
                'Tạo bài tập'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateExerciseForm;
