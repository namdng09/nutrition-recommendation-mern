import { FaPlus } from 'react-icons/fa';

export default function CreatePrivateDishInstructions({
  SectionCard,
  TextArea,
  instructions,
  addInstruction,
  removeInstruction,
  handleInstructionChange
}) {
  return (
    <SectionCard
      title='Các bước thực hiện'
      description='Viết từng bước ngắn gọn, rõ ràng để công thức dễ theo dõi.'
      rightAction={
        <button
          type='button'
          onClick={addInstruction}
          className='inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90'
        >
          <FaPlus className='text-xs' />
          Thêm bước
        </button>
      }
    >
      <div className='space-y-4'>
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className='rounded-[28px] border border-border bg-card p-5 text-card-foreground shadow-sm'
          >
            <div className='mb-4 flex items-center justify-between'>
              <div className='inline-flex items-center gap-3'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-sm'>
                  {index + 1}
                </div>
                <span className='text-sm font-black uppercase tracking-[0.16em] text-muted-foreground'>
                  Bước {index + 1}
                </span>
              </div>

              <button
                type='button'
                onClick={() => removeInstruction(index)}
                className='rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive transition hover:bg-destructive/15'
              >
                Xóa
              </button>
            </div>

            <TextArea
              value={instruction.description}
              onChange={e => handleInstructionChange(index, e.target.value)}
              placeholder={`Mô tả chi tiết bước ${index + 1}`}
              rows={4}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
