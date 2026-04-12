import React from 'react';
import { FaListOl } from 'react-icons/fa';

export default function PrivateDishInstructionsSection({
  instructions,
  SectionCard
}) {
  if (!instructions?.length) return null;

  return (
    <SectionCard icon={<FaListOl />} title='Cách chế biến' iconTone='sky'>
      <div className='space-y-4'>
        {instructions.map((step, idx) => (
          <div
            key={step._id}
            className='rounded-[28px] border border-border bg-gradient-to-br from-background to-sky-50/40 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:to-sky-500/5'
          >
            <div className='flex gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'>
                {idx + 1}
              </div>

              <div className='flex-1 pt-1'>
                <p className='text-sm font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300'>
                  Bước {idx + 1}
                </p>
                <p className='mt-2 leading-7 text-foreground/90'>
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
