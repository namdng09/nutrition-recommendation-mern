import { FaClock, FaIdCard, FaRegCalendarAlt, FaUser } from 'react-icons/fa';

import { formatDateVI } from '~/lib/utils';

const formatDateTime = value => {
  if (!value) return 'Chưa có';
  return formatDateVI(value, "HH:mm 'ngày' dd/MM/yyyy");
};

const InfoItem = ({ icon, label, value }) => (
  <div className='rounded-lg border bg-muted/30 p-3'>
    <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background text-slate-600'>
      {icon}
    </div>
    <p className='text-xs uppercase tracking-wider text-slate-600'>{label}</p>
    <p className='mt-1 text-sm font-semibold text-foreground'>{value}</p>
  </div>
);

const UserDetail = ({ user, requestCreatedAt, requestUpdatedAt }) => {
  const userName = user?.name || 'Không xác định';
  const userId = user?._id || user?.id || 'Không có';
  const userInitial = String(userName).trim().charAt(0).toUpperCase() || 'U';

  return (
    <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
      <h2 className='text-lg font-semibold text-foreground'>
        Người gửi yêu cầu
      </h2>

      <div className='flex items-center gap-3 rounded-lg border bg-muted/20 p-4'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground'>
          {userInitial}
        </div>

        <div className='min-w-0'>
          <p className='truncate text-base font-semibold text-foreground'>
            {userName}
          </p>
          <p className='text-xs text-slate-600'>Thông tin người tạo món ăn</p>
        </div>

        <div className='ml-auto hidden h-10 w-10 items-center justify-center rounded-md bg-background text-slate-600 sm:flex'>
          <FaUser />
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <InfoItem icon={<FaIdCard />} label='Mã người dùng' value={userId} />
        <InfoItem
          icon={<FaRegCalendarAlt />}
          label='Thời điểm tạo yêu cầu'
          value={formatDateTime(requestCreatedAt)}
        />
        <InfoItem
          icon={<FaClock />}
          label='Lần cập nhật gần nhất'
          value={formatDateTime(requestUpdatedAt)}
        />
      </div>
    </section>
  );
};

export default UserDetail;
