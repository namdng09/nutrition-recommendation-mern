import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='relative mt-7 w-full bg-gradient-to-b from-transparent to-muted/20'>
      <div className='mx-auto max-w-8xl px-4 pb-6 pt-4 sm:px-6 lg:px-8'>
        <div className='overflow-hidden rounded-[28px] border border-border/50 bg-background/80 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur supports-[backdrop-filter]:bg-background/70'>
          <div className='flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'>
            <div className='flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left'>
              <Link
                to='/'
                className='group flex items-center gap-3 rounded-2xl px-1 py-1 transition'
              >
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner sm:h-16 sm:w-16'>
                  <img
                    src='/logo2.png'
                    alt='Logo'
                    className='h-20 w-20 object-contain sm:h-12 sm:w-12'
                  />
                </div>

                <div className='leading-tight'>
                  <div className='text-base font-black tracking-tight text-primary sm:text-lg'>
                    EatDee
                  </div>
                  <div className='text-xs font-medium text-muted-foreground sm:text-sm'>
                    Healthy living since 2026
                  </div>
                </div>
              </Link>

              <div className='hidden h-8 w-px bg-border/70 sm:block' />

              <div className='space-y-0.5'>
                <p className='text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/60'>
                  Nền tảng dinh dưỡng
                </p>
                <p className='text-sm font-medium text-muted-foreground'>
                  © 2026 EatDee. All rights reserved.
                </p>
              </div>
            </div>

            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
              <Link
                to='/'
                className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30 sm:w-auto'
              >
                <FaHome className='h-4 w-4' />
                Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
