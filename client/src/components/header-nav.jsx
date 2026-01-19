import { NavLink } from 'react-router';

import { cn } from '~/lib/utils';

const HeaderNav = ({ links }) => {
  return (
    <nav className='hidden items-center gap-1 md:flex'>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              'hover:bg-[#2E7D32]/10 hover:text-[#1B5E20]',
              isActive
                ? 'bg-[#2E7D32]/15 text-[#1B5E20] ring-1 ring-[#2E7D32]/25'
                : 'text-[#1B5E20]/70'
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default HeaderNav;
