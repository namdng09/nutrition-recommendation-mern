import { NavLink } from 'react-router';

import { cn } from '~/lib/utils';

const HeaderNav = ({ links }) => {
  return (
    <nav className='hidden md:flex items-center gap-1 flex-nowrap'>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              'whitespace-nowrap',
              'hover:bg-accent hover:text-primary',
              isActive
                ? 'bg-accent text-primary ring-1 ring-border'
                : 'text-muted-foreground'
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
