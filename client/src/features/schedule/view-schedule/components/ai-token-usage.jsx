export default function AITokenUsage({ remainingTokens, dailyTokenLimit }) {
  if (typeof remainingTokens !== 'number') return null;

  return (
    <p className='mt-1 text-[11px] font-semibold text-primary/80'>
      AI tokens còn lại: {remainingTokens.toLocaleString('vi-VN')}
      {typeof dailyTokenLimit === 'number'
        ? ` / ${dailyTokenLimit.toLocaleString('vi-VN')}`
        : ''}
    </p>
  );
}
