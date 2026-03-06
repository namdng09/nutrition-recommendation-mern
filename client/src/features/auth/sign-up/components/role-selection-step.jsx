import { HiOutlineAcademicCap, HiOutlineUser } from 'react-icons/hi2';

import { Button } from '~/components/ui/button';
import { ROLE } from '~/constants/role';

const roleCards = [
  {
    role: ROLE.USER,
    title: 'Người dùng',
    description: 'Tôi muốn nhận gợi ý dinh dưỡng và theo dõi sức khỏe cá nhân.',
    Icon: HiOutlineUser
  },
  {
    role: ROLE.NUTRITIONIST,
    title: 'Chuyên gia dinh dưỡng',
    description:
      'Tôi là chuyên gia dinh dưỡng và muốn đóng góp nội dung cho nền tảng.',
    Icon: HiOutlineAcademicCap
  }
];

const RoleSelectionStep = ({ onSelect }) => {
  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground text-center'>
        Vui lòng chọn vai trò của bạn để tiếp tục đăng ký
      </p>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {roleCards.map(({ role, title, description, Icon }) => (
          <button
            key={role}
            type='button'
            onClick={() => onSelect(role)}
            className='flex flex-col items-center gap-3 rounded-xl border border-border bg-background/60 p-5 text-center transition-all duration-150 hover:border-primary hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent'>
              <Icon className='h-6 w-6 text-primary' />
            </div>
            <div>
              <p className='font-semibold text-foreground'>{title}</p>
              <p className='mt-1 text-xs text-muted-foreground leading-relaxed'>
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelectionStep;
