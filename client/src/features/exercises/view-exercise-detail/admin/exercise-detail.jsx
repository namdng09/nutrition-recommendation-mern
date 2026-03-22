import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Dumbbell, Save, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import {
  EXERCISE_DIFFICULTY_OPTIONS,
  EXERCISE_EQUIPMENT_OPTIONS,
  EXERCISE_MUSCLE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  WORKOUT_COUNTER_TYPE_OPTIONS
} from '~/constants/exercise';
import DeleteExerciseDialog from '~/features/exercises/delete-exercise/components/admin/delete-exercise-dialog';
import { useUpdateExercise } from '~/features/exercises/update-exercise/api/update-exercise';
import { updateExerciseSchema } from '~/features/exercises/update-exercise/schemas/update-exercise-schema';
import { useExerciseDetail } from '~/features/exercises/view-exercise-detail/api/view-exercise-detail';

const ExerciseDetail = ({ id }) => {
  const navigate = useNavigate();

  const { data: exercise } = useExerciseDetail(id);
  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise({
    onSuccess: response => {
      toast.success(response.message || 'Cap nhat bai tap thanh cong');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Cap nhat bai tap that bai');
    }
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: yupResolver(updateExerciseSchema),
    values: exercise
      ? {
          name: exercise.name || '',
          instructions: exercise.instructions || '',
          difficulty: exercise.difficulty || '',
          type: exercise.type || '',
          logType: exercise.logType || '',
          muscles: exercise.muscles || [],
          equipments: exercise.equipments || [],
          isActive: exercise.isActive ?? true
        }
      : undefined
  });

  const handleSave = data => {
    updateExercise({ id, data, tutorial: selectedTutorial });
  };

  const handleToggleActive = () => {
    updateExercise({ id, data: { isActive: !exercise.isActive } });
  };

  const handleBack = () => {
    navigate('/admin/manage-exercises');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-exercises');
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

  const handleMuscleToggle = (muscleName, muscleImage, checked) => {
    const currentMuscles = form.getValues('muscles') || [];
    if (checked) {
      form.setValue('muscles', [
        ...currentMuscles,
        { name: muscleName, image: muscleImage }
      ]);
    } else {
      form.setValue(
        'muscles',
        currentMuscles.filter(m => m.name !== muscleName)
      );
    }
  };

  const handleEquipmentToggle = (equipmentName, equipmentImage, checked) => {
    const currentEquipments = form.getValues('equipments') || [];
    if (checked) {
      form.setValue('equipments', [
        ...currentEquipments,
        { name: equipmentName, image: equipmentImage }
      ]);
    } else {
      form.setValue(
        'equipments',
        currentEquipments.filter(e => e.name !== equipmentName)
      );
    }
  };

  if (!exercise) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Khong tim thay bai tap</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentTutorialUrl = previewUrl || exercise?.tutorial;

  return (
    <div className='max-w-4xl mx-auto'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-center'>
        <div className='flex items-center justify-center h-24 w-24 rounded-full bg-muted'>
          <Dumbbell className='h-12 w-12 text-muted-foreground' />
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <h2 className='text-2xl font-bold'>{exercise?.name}</h2>
            <Badge variant={exercise?.isActive ? 'default' : 'secondary'}>
              {exercise?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className='text-muted-foreground'>{exercise?.type}</p>
          <Badge variant='outline' className='mt-1'>
            {exercise?.difficulty}
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={exercise?.isActive ? 'secondary' : 'default'}
            size='sm'
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {exercise?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button
            size='sm'
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner className='h-4 w-4 mr-1' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            Luu
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Thông tin bài tập</h2>
        <Form {...form}>
          <form className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-muted-foreground'>
                      Tên bài tập <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Nhap ten bai tap' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='difficulty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-muted-foreground'>
                      Độ khó <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={exercise?._id + '-difficulty-' + (field.value ?? '')}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chon do kho' />
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

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-muted-foreground'>
                      Loại bài tập <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={exercise?._id + '-type-' + (field.value ?? '')}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chon loai bai tap' />
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

              <FormField
                control={form.control}
                name='logType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-muted-foreground'>
                      Loại ghi nhận <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={exercise?._id + '-logType-' + (field.value ?? '')}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chon loai ghi nhan' />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-muted-foreground'>
                      Trạng thái
                    </FormLabel>
                    <Select
                      key={exercise?._id + '-isActive-' + (field.value ?? '')}
                      value={field.value?.toString()}
                      onValueChange={value => field.onChange(value === 'true')}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chon trang thai' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='true'>Active</SelectItem>
                        <SelectItem value='false'>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='instructions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Chỉ dẫn <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập hướng dẫn thực hiện bài tập'
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className='text-muted-foreground'>
                Hình ảnh/Video hướng dẫn
              </FormLabel>
              <FormControl>
                <div className='space-y-4'>
                  {currentTutorialUrl ? (
                    <div className='relative'>
                      <img
                        src={currentTutorialUrl}
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
                  ) : (
                    <div className='flex items-center gap-2'>
                      <Input
                        type='file'
                        accept='image/*,video/*'
                        onChange={handleTutorialChange}
                        className='flex-1'
                      />
                      <Upload className='h-5 w-5 text-muted-foreground' />
                    </div>
                  )}
                  {currentTutorialUrl && (
                    <div className='flex items-center gap-2'>
                      <Input
                        type='file'
                        accept='image/*,video/*'
                        onChange={handleTutorialChange}
                        className='flex-1'
                      />
                      <Upload className='h-5 w-5 text-muted-foreground' />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Tải lên hình ảnh hoặc video minh họa cách thực hiện bài tập
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name='muscles'
              render={() => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Nhóm cơ tập luyện
                  </FormLabel>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {EXERCISE_MUSCLE_OPTIONS.map(muscle => {
                      const isChecked = (form.watch('muscles') || []).some(
                        m => m.name === muscle.value
                      );
                      return (
                        <label
                          key={muscle.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/50 border-transparent hover:bg-muted'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={checked =>
                              handleMuscleToggle(
                                muscle.value,
                                muscle.image,
                                checked
                              )
                            }
                          />
                          {muscle.image && (
                            <img
                              src={muscle.image}
                              alt={muscle.label}
                              className='h-5 w-5 object-contain'
                            />
                          )}
                          <span className='text-sm'>{muscle.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='equipments'
              render={() => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Dụng cụ sử dụng
                  </FormLabel>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {EXERCISE_EQUIPMENT_OPTIONS.map(equipment => {
                      const isChecked = (form.watch('equipments') || []).some(
                        e => e.name === equipment.value
                      );
                      return (
                        <label
                          key={equipment.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/50 border-transparent hover:bg-muted'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={checked =>
                              handleEquipmentToggle(
                                equipment.value,
                                equipment.image,
                                checked
                              )
                            }
                          />
                          {equipment.image && (
                            <img
                              src={equipment.image}
                              alt={equipment.label}
                              className='h-5 w-5 object-contain'
                            />
                          )}
                          <span className='text-sm'>{equipment.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa bài tập
          </Button>
        </div>
      </div>

      <DeleteExerciseDialog
        exercise={exercise}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ExerciseDetail;
