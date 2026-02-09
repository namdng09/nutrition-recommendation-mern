import React from 'react';

export default function GrocerySkeleton() {
  return (
    <div className='space-y-6'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className='rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4'
        >
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='h-5 w-48 rounded-lg bg-muted' />
              <div className='h-4 w-24 rounded-lg bg-muted' />
            </div>

            <div className='h-6 w-24 rounded-full bg-muted' />
          </div>

          {/* Ingredients rows */}
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className='
                  flex items-center justify-between
                  rounded-lg border border-border px-3 py-3
                '
              >
                <div className='flex items-center gap-3 flex-1'>
                  <div className='h-5 w-5 rounded-full bg-muted' />

                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-40 rounded-lg bg-muted' />
                    <div className='h-3 w-28 rounded-lg bg-muted' />
                  </div>
                </div>

                <div className='h-4 w-12 rounded-lg bg-muted' />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className='h-4 w-56 rounded-lg bg-muted' />
        </div>
      ))}
    </div>
  );
}
