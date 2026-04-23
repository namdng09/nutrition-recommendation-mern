import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import {
  useAIPresetOptions,
  useAITestCases,
  useCreateAITestCase,
  useDeleteAITestCase,
  useUpdateAITestCase
} from '~/features/ai-evaluation/api/ai-evaluation';

const DEFAULT_FORM = {
  name: '',
  description: '',
  endpoint: 'ask_agent',
  category: 'happy_path',
  difficulty: 'medium',
  prompt: '',
  contextPreset: '',
  contextGoal: '',
  contextDiet: '',
  contextCalories: '',
  contextAllergies: '',
  expectedContains: '',
  expectedClassification: 'positive'
};

const Page = () => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  const testCasesQuery = useAITestCases();
  const presetOptionsQuery = useAIPresetOptions();
  const createMutation = useCreateAITestCase();
  const updateMutation = useUpdateAITestCase();
  const deleteMutation = useDeleteAITestCase();

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const onSubmit = async event => {
    event.preventDefault();

    if (!form.name.trim() || !form.prompt.trim()) {
      toast.error('Tên và Prompt là bắt buộc');
      return;
    }

    if (
      !form.contextGoal.trim() ||
      !form.contextDiet.trim() ||
      !form.contextCalories
    ) {
      toast.error(
        'Context (goal, diet, calories) là bắt buộc cho semantic scoring'
      );
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      endpoint: form.endpoint,
      category: form.category,
      difficulty: form.difficulty,
      input: {
        prompt: form.prompt,
        context: {
          goal: form.contextGoal,
          diet: form.contextDiet,
          calories: parseInt(form.contextCalories, 10),
          allergies: form.contextAllergies
            ? form.contextAllergies.split(',').map(s => s.trim())
            : []
        }
      },
      preset: form.contextPreset || undefined,
      expected: form.expectedContains
        ? {
            mustInclude: [form.expectedContains],
            classification: form.expectedClassification
          }
        : {
            classification: form.expectedClassification
          }
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        toast.success('Cập nhật test case thành công');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Tạo test case thành công');
      }
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể lưu test case');
    }
  };

  const onEdit = item => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      description: item.description || '',
      endpoint: item.endpoint || 'ask_agent',
      category: item.category || 'happy_path',
      difficulty: item.difficulty || 'medium',
      prompt: item.input?.prompt || '',
      contextPreset: item.preset || '',
      contextGoal: item.input?.context?.goal || '',
      contextDiet: item.input?.context?.diet || '',
      contextCalories: String(item.input?.context?.calories || ''),
      contextAllergies: item.input?.context?.allergies?.join(', ') || '',
      expectedContains: item.expected?.mustInclude?.[0] || '',
      expectedClassification: item.expected?.classification || 'positive'
    });
  };

  const onDelete = async id => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Xóa test case thành công');
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Xóa test case thất bại');
    }
  };

  const rows = useMemo(() => testCasesQuery.data || [], [testCasesQuery.data]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Cập nhật test case' : 'Tạo test case mới'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={onSubmit}>
            {/* Input configuration section */}
            <div className='rounded-lg border bg-muted/30 p-4 space-y-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
                Input cấu hình
              </p>

              <div className='grid gap-3 md:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Tên test case
                  </label>
                  <Input
                    placeholder='Ví dụ: Meals - strict JSON match'
                    value={form.name}
                    onChange={event =>
                      setForm(prev => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Mô tả
                  </label>
                  <Input
                    placeholder='Mô tả ngắn về test case'
                    value={form.description}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        description: event.target.value
                      }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Endpoint
                  </label>
                  <Select
                    value={form.endpoint}
                    onValueChange={value =>
                      setForm(prev => ({ ...prev, endpoint: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn endpoint' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ask_agent'>ask_agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Category
                  </label>
                  <Select
                    value={form.category}
                    onValueChange={value =>
                      setForm(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='happy_path'>happy_path</SelectItem>
                      <SelectItem value='edge_case'>edge_case</SelectItem>
                      <SelectItem value='negative'>negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Difficulty
                  </label>
                  <Select
                    value={form.difficulty}
                    onValueChange={value =>
                      setForm(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn difficulty' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='easy'>easy</SelectItem>
                      <SelectItem value='medium'>medium</SelectItem>
                      <SelectItem value='hard'>hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                  Prompt
                </label>
                <Textarea
                  placeholder='Nhập prompt cho test case'
                  value={form.prompt}
                  onChange={event =>
                    setForm(prev => ({ ...prev, prompt: event.target.value }))
                  }
                />
              </div>
            </div>

            {/* Context section */}
            <div className='rounded-lg border p-4 space-y-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.16em]'>
                Context (bắt buộc cho semantic scoring)
              </p>

              <div className='grid gap-3 md:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Preset (optional)
                  </label>
                  <Select
                    value={form.contextPreset}
                    onValueChange={value =>
                      setForm(prev => ({ ...prev, contextPreset: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn preset' />
                    </SelectTrigger>
                    <SelectContent>
                      {presetOptionsQuery.data?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Goal
                  </label>
                  <Input
                    placeholder='Ví dụ: weight_loss'
                    value={form.contextGoal}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        contextGoal: event.target.value
                      }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Diet
                  </label>
                  <Input
                    placeholder='Ví dụ: vegetarian'
                    value={form.contextDiet}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        contextDiet: event.target.value
                      }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Calories
                  </label>
                  <Input
                    type='number'
                    placeholder='Ví dụ: 2000'
                    value={form.contextCalories}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        contextCalories: event.target.value
                      }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Allergies (comma-separated)
                  </label>
                  <Input
                    placeholder='Ví dụ: peanut, shellfish'
                    value={form.contextAllergies}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        contextAllergies: event.target.value
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Expected assertion section */}
            <div className='rounded-lg border p-4 space-y-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.16em]'>
                Expected assertion
              </p>

              <div className='grid gap-3 md:grid-cols-2'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Expected contains (optional)
                  </label>
                  <Input
                    placeholder='Ví dụ: meals hoặc servings'
                    value={form.expectedContains}
                    onChange={event =>
                      setForm(prev => ({
                        ...prev,
                        expectedContains: event.target.value
                      }))
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wide text-foreground/80'>
                    Expected classification
                  </label>
                  <Select
                    value={form.expectedClassification}
                    onValueChange={value =>
                      setForm(prev => ({
                        ...prev,
                        expectedClassification: value
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Expected classification' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='positive'>positive</SelectItem>
                      <SelectItem value='negative'>negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className='text-xs text-muted-foreground'>
                positive: các checks phải match. negative: các checks phải không
                match.
              </p>
            </div>

            <div className='flex gap-2'>
              <Button
                type='submit'
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Plus className='mr-2 h-4 w-4' />
                {editingId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              {editingId ? (
                <Button type='button' variant='outline' onClick={resetForm}>
                  Hủy chỉnh sửa
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách test cases</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(item => (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.endpoint}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.difficulty}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {item.expected?.classification || 'positive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.enabled ? 'secondary' : 'destructive'}>
                      {item.enabled ? 'enabled' : 'disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(item._id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!testCasesQuery.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-muted-foreground'
                  >
                    Chưa có test case.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
