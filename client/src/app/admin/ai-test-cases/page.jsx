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
  expectedContains: ''
};

const Page = () => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  const testCasesQuery = useAITestCases();
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

    const payload = {
      name: form.name,
      description: form.description,
      endpoint: form.endpoint,
      category: form.category,
      difficulty: form.difficulty,
      input: {
        prompt: form.prompt
      },
      expected: form.expectedContains
        ? {
            mustInclude: [form.expectedContains],
            classification: 'positive'
          }
        : {
            classification: 'positive'
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
      expectedContains: item.expected?.mustInclude?.[0] || ''
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
            <div className='grid gap-3 md:grid-cols-2'>
              <Input
                placeholder='Tên test case'
                value={form.name}
                onChange={event =>
                  setForm(prev => ({ ...prev, name: event.target.value }))
                }
              />
              <Input
                placeholder='Mô tả'
                value={form.description}
                onChange={event =>
                  setForm(prev => ({
                    ...prev,
                    description: event.target.value
                  }))
                }
              />
            </div>

            <div className='grid gap-3 md:grid-cols-3'>
              <Select
                value={form.endpoint}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, endpoint: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Endpoint' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ask_agent'>ask_agent</SelectItem>
                  <SelectItem value='recommend_daily_meals'>
                    recommend_daily_meals
                  </SelectItem>
                  <SelectItem value='recommend_daily_workout'>
                    recommend_daily_workout
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={form.category}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='happy_path'>happy_path</SelectItem>
                  <SelectItem value='edge_case'>edge_case</SelectItem>
                  <SelectItem value='constraint_test'>
                    constraint_test
                  </SelectItem>
                  <SelectItem value='error_case'>error_case</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={form.difficulty}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Difficulty' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='easy'>easy</SelectItem>
                  <SelectItem value='medium'>medium</SelectItem>
                  <SelectItem value='hard'>hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder='Prompt test case...'
              className='min-h-28'
              value={form.prompt}
              onChange={event =>
                setForm(prev => ({ ...prev, prompt: event.target.value }))
              }
            />

            <Input
              placeholder='Expected contains (optional)'
              value={form.expectedContains}
              onChange={event =>
                setForm(prev => ({
                  ...prev,
                  expectedContains: event.target.value
                }))
              }
            />

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
                    colSpan={6}
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
