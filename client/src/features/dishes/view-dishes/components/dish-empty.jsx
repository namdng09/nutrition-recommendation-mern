import { FaUtensils } from 'react-icons/fa';

export default function DishEmpty() {
  return (
    <div className='flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border bg-muted/20 py-20 text-center'>
      <div className='mb-4 rounded-full bg-background p-6 shadow-sm'>
        <FaUtensils className='text-4xl text-muted-foreground/40' />
      </div>

      <h3 className='text-xl font-bold'>Chưa có món ăn nào</h3>

      <p className='text-muted-foreground'>
        Hãy là người đầu tiên chia sẻ công thức của bạn!
      </p>
    </div>
  );
}
