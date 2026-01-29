import React from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='relative z-20 w-full border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <Link to='/' className='flex items-center gap-2'>
            <img
              src='/logo2.png'
              alt='Logo'
              className='h-18 w-18 object-contain scale-125'
            />

            <div className='leading-[1.05]'>
              <div className='text-base font-bold text-primary'>EatDee</div>
              <div className='text-sm text-muted-foreground'>Since 2025</div>
            </div>
          </Link>

          <span className='hidden h-1.5 w-1.5 rounded-full bg-muted-foreground sm:inline-block' />

          <span className='text-sm font-medium text-muted-foreground'>
            © 2025 EatDee. All rights reserved.
          </span>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
          <Link
            to='/'
            className='inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-primary'
          >
            Trang Chủ
          </Link>

          <Link
            to='auth/login'
            className='inline-flex items-center justify-center gap-2 rounded-full border border-border bg-accent px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-accent/80'
          >
            <FaUserPlus className='h-4 w-4 text-primary' />
            Đăng Nhập
          </Link>
        </div>
      </div>

      <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
    </footer>
  );
};

export default Footer;
