import { FaLeaf } from 'react-icons/fa';

export default function EmptyIngredientsState() {
  return (
    <div className='rounded-[28px] border border-dashed border-border bg-muted/40 px-6 py-14 text-center'>
      <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
        <FaLeaf />
      </div>
      <h3 className='text-lg font-black text-foreground'>
        Chưa có nguyên liệu nào
      </h3>
      <p className='mt-2 text-sm text-muted-foreground'>
        Hãy thêm nguyên liệu để bắt đầu xây dựng món ăn của bạn.
      </p>
    </div>
  );
}
