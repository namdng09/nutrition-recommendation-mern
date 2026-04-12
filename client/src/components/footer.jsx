import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='mt-auto w-full border-t border-border/70 bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 rounded-[28px] border border-border/70 bg-card/70 px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7'>
          <div className='flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:text-left'>
            <Link
              to='/'
              className='group flex items-center justify-center gap-3 rounded-2xl transition sm:justify-start'
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/10 transition group-hover:bg-primary/15'>
                <img
                  src='/logo2.png'
                  alt='Logo'
                  className='h-9 w-9 object-contain'
                />
              </div>

              <div className='leading-tight'>
                <div className='text-base font-black tracking-tight text-foreground'>
                  EatDee
                </div>
                <div className='text-sm text-muted-foreground'>
                  Healthy living since 2026
                </div>
              </div>
            </Link>

            <div className='hidden h-10 w-px bg-border/70 sm:block' />

            <div className='space-y-0.5'>
              <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70'>
                Nền tảng dinh dưỡng
              </p>
              <p className='text-sm text-muted-foreground'>
                © 2026 EatDee. All rights reserved.
              </p>
            </div>
          </div>

          <Link
            to='/'
            className='inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-accent'
          >
            <FaHome className='h-4 w-4 text-primary' />
            Trang chủ
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
