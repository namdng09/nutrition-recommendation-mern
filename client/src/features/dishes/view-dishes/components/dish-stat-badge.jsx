import React from 'react';
const StatBadge = ({ icon, value, theme = 'emerald', className = '' }) => {
  const themes = {
    orange: 'bg-orange-50/60 text-orange-700 ring-orange-200/50',
    emerald: 'bg-emerald-50/60 text-emerald-700 ring-emerald-200/50',
    sky: 'bg-sky-50/60 text-sky-700 ring-sky-200/50',
    gray: 'bg-gray-50/60 text-gray-600 ring-gray-200/50'
  };

  const themeClass = themes[theme] || themes.gray;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 
        text-[10px] font-bold uppercase tracking-wide ring-1 
        transition-colors duration-300
        ${themeClass} 
        ${className}
      `}
    >
      {icon && <span className='shrink-0'>{icon}</span>}
      <span>{value}</span>
    </span>
  );
};

export default StatBadge;
