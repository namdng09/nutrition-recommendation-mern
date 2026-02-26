import { Input } from '~/components/ui/input';

export default function CreateGroceryInput({ value, onChange }) {
  return (
    <div className='space-y-2.5'>
      <label className='text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1'>
        Tên danh sách
      </label>

      <Input
        placeholder='Ví dụ: Tiệc cuối tuần, Đồ dùng hàng ngày...'
        value={value}
        onChange={onChange}
        className='h-12 px-4 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl text-base'
      />
    </div>
  );
}
