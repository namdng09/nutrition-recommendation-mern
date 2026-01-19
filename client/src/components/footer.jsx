import React from 'react';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='relative z-20 w-full border-t border-[#6B8F71]/50 bg-white/80 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.08)]'>
      <div className='container mx-auto flex flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between'>
        <div className='flex items-center gap-3'>
          <Link
            to='/'
            className='
          font-pixel
          rounded-full
          border border-[#6B8F71]/60
          bg-white/80 backdrop-blur-md
          px-4 py-2
          text-sm uppercase tracking-widest
          text-black
          shadow-[0_8px_20px_rgba(0,0,0,0.08)]
          transition
          hover:bg-[#9FE870]/25
        '
          >
            Trang chủ
          </Link>

          <span className='font-pixel text-sm uppercase tracking-widest text-gray-800'>
            HAZY ROBUX © 2025
          </span>
        </div>

        <a
          href='https://discord.com/invite/wavycrew'
          target='hazy_robux_discord'
          rel='noopener noreferrer'
          className='
        flex items-center gap-2
        rounded-full
        border border-[#6B8F71]/60
        bg-white/80 backdrop-blur-md
        px-4 py-2
        font-pixel text-sm uppercase tracking-widest
        text-black
        shadow-[0_8px_20px_rgba(0,0,0,0.08)]
        transition
        hover:bg-[#9FE870]/25
      '
        >
          <FaDiscord className='h-4 w-4 text-[#2F7D32]' />
          Discord
        </a>
      </div>
    </footer>
  );
};

export default Footer;
