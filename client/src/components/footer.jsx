import React from 'react';
import { FaHome, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='relative z-20 w-full border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div
        className='
        mx-auto
        max-w-7xl
        flex flex-col
        gap-4
        px-4 py-4
        sm:flex-row sm:items-center sm:justify-between
        sm:px-6
        lg:px-8
      '
      >
        <div
          className='
          flex flex-col items-center text-center
          gap-2
          sm:flex-row sm:items-center sm:text-left sm:gap-3
        '
        >
          <Link to='/' className='flex items-center gap-2'>
            <img
              src='/logo2.png'
              alt='Logo'
              className='
                h-12 w-12
                sm:h-14 sm:w-14
                object-contain
              '
            />

            <div className='leading-tight'>
              <div className='text-sm sm:text-base font-bold text-primary'>
                EatDee
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                Since 2025
              </div>
            </div>
          </Link>

          <span className='hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground' />

          <span
            className='
            text-xs sm:text-sm font-medium
            text-muted-foreground
          '
          >
            © 2026 EatDee
          </span>
        </div>

        <div
          className='
          flex flex-col w-full
          gap-2
          sm:w-auto sm:flex-row sm:items-center
        '
        >
          <Link
            to='/'
            className='
              w-full sm:w-auto
              text-center
              inline-flex items-center justify-center gap-2
              rounded-full
              border border-border
              bg-accent
              px-4 py-2
              text-sm font-medium
              text-primary
              shadow-sm
              transition
              hover:bg-accent/80
            '
          >
            <FaHome className='h-4 w-4' />
            Trang Chủ
          </Link>
        </div>
      </div>

      <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
    </footer>
  );
};

export default Footer;
