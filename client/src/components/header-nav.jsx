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
              'hover:bg-(--brand-600-10) hover:text-(--brand-text)',
              isActive
                ? 'bg-(--brand-600-15) text-(--brand-text) ring-1 ring-(--brand-600-25)'
                : 'text-(--brand-muted)'
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
