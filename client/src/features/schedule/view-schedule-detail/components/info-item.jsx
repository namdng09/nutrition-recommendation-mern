export default function InfoItem({ icon, label, value, colorClass }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 ${colorClass}`}
    >
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-background/70'>
        {icon}
      </div>
      <div>
        <p className='text-[10px] uppercase tracking-wider font-bold'>
          {label}
        </p>
        <p className='font-semibold'>{value}</p>
      </div>
    </div>
  );
}
