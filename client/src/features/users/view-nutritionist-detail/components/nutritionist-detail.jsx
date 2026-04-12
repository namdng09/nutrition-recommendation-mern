import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  FileBadge2,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

import { useNutritionistDetail } from '../api/view-nutritionist-detail';

const formatDate = iso =>
  iso
    ? new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null;

export default function NutritionistDetail({ id }) {
  const { data: nutritionist } = useNutritionistDetail(id);
  const certificate = nutritionist?.certificate;
  const profile = nutritionist?.nutritionistProfile;
  const hasFileUrl = !!certificate?.fileUrl;
  const showCertificate = certificate?.showCertificate !== false;

  const certificateBadgeClass =
    certificate?.status === 'Approved'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : certificate?.status === 'Pending'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-700';

  const certificateStatusLabel =
    certificate?.status === 'Approved'
      ? 'Đã phê duyệt'
      : certificate?.status === 'Pending'
        ? 'Đang chờ'
        : 'Bị từ chối';

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12'>
        <Button
          variant='outline'
          size='sm'
          asChild
          className='mb-8 h-11 rounded-2xl border-border/70 bg-card px-4 text-sm font-semibold text-foreground shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:bg-accent hover:shadow-[0_12px_24px_rgba(15,23,42,0.10)]'
        >
          <Link to='/'>
            <span className='mr-2 flex h-7 w-7 items-center justify-center rounded-xl bg-muted text-foreground/80'>
              <ArrowLeft className='h-4 w-4' />
            </span>
            Quay lại
          </Link>
        </Button>

        <div className='overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_20px_60px_rgba(15,23,42,0.06)]'>
          <div className='border-b border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 md:px-8 md:py-10'>
            <div className='flex flex-col gap-8 md:flex-row md:items-center'>
              <div className='shrink-0 text-center md:text-left'>
                <div className='relative inline-block'>
                  <Avatar className='mx-auto h-32 w-32 ring-4 ring-background shadow-[0_14px_32px_rgba(15,23,42,0.14)] md:mx-0'>
                    <AvatarImage
                      src={nutritionist?.avatar}
                      alt={nutritionist?.name}
                    />
                    <AvatarFallback className='bg-primary/15 text-4xl font-bold text-primary'>
                      {nutritionist?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {certificate?.status === 'Approved' && (
                    <div className='absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-background bg-emerald-500 text-white shadow-lg'>
                      <ShieldCheck className='h-5 w-5' />
                    </div>
                  )}
                </div>
              </div>

              <div className='min-w-0 flex-1 space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge className='rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10'>
                    Chuyên gia dinh dưỡng
                  </Badge>

                  {certificate?.status === 'Approved' && (
                    <Badge className='rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500'>
                      <ShieldCheck className='mr-1.5 h-3.5 w-3.5' />
                      Đã xác minh
                    </Badge>
                  )}
                </div>

                <div className='space-y-2'>
                  <h1 className='text-3xl font-black tracking-tight text-foreground md:text-4xl'>
                    {nutritionist?.name}
                  </h1>
                  <p className='text-base text-muted-foreground md:text-lg'>
                    Hồ sơ chuyên gia và thông tin chứng chỉ nghề nghiệp
                  </p>
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  {profile?.workplace && (
                    <div className='flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                        <BriefcaseBusiness className='h-4 w-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                          Nơi làm việc
                        </p>
                        <p className='mt-1 font-semibold text-foreground'>
                          {profile.workplace}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile?.graduatedUniversity && (
                    <div className='flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                        <GraduationCap className='h-4 w-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                          Trường tốt nghiệp
                        </p>
                        <p className='mt-1 font-semibold text-foreground'>
                          {profile.graduatedUniversity}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px]'>
            <div className='space-y-6'>
              <div className='rounded-[28px] border border-border/70 bg-background p-5 shadow-sm md:p-6'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <ShieldCheck className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='font-bold text-foreground'>Giới thiệu</p>
                    <p className='text-sm text-muted-foreground'>
                      Thông tin chuyên môn của chuyên gia
                    </p>
                  </div>
                </div>

                {profile?.professionalBio ? (
                  <p className='leading-8 text-foreground/90'>
                    {profile.professionalBio}
                  </p>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Chưa có phần giới thiệu.
                  </p>
                )}
              </div>

              <div className='rounded-[28px] border border-border/70 bg-background p-5 shadow-sm md:p-6'>
                <div className='mb-5 flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <FileBadge2 className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='font-bold text-foreground'>
                      Chứng chỉ nghề nghiệp
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Tình trạng xác minh chứng chỉ của chuyên gia
                    </p>
                  </div>
                </div>

                {certificate ? (
                  <div className='space-y-5'>
                    <div className='flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='min-w-0'>
                        <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                          Tên chứng chỉ
                        </p>
                        <p className='mt-1 text-base font-bold text-foreground'>
                          {certificate.name}
                        </p>
                      </div>

                      <Badge
                        className={`rounded-full border px-3 py-1 hover:bg-transparent ${certificateBadgeClass}`}
                      >
                        {certificateStatusLabel}
                      </Badge>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2'>
                      {certificate.submittedAt && (
                        <div className='rounded-2xl border border-border/70 bg-background px-4 py-4'>
                          <div className='flex items-start gap-3'>
                            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
                              <CalendarDays className='h-4 w-4' />
                            </div>
                            <div>
                              <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                                Ngày nộp
                              </p>
                              <p className='mt-1 font-semibold text-foreground'>
                                {formatDate(certificate.submittedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {certificate.reviewedAt && (
                        <div className='rounded-2xl border border-border/70 bg-background px-4 py-4'>
                          <div className='flex items-start gap-3'>
                            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
                              <CalendarDays className='h-4 w-4' />
                            </div>
                            <div>
                              <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                                Ngày duyệt
                              </p>
                              <p className='mt-1 font-semibold text-foreground'>
                                {formatDate(certificate.reviewedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {hasFileUrl && showCertificate && (
                      <a
                        href={certificate.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group block overflow-hidden rounded-[24px] border border-border/70 bg-background shadow-sm transition hover:shadow-md'
                      >
                        <div className='border-b border-border/70 px-4 py-3'>
                          <p className='text-sm font-semibold text-foreground'>
                            Xem ảnh chứng chỉ
                          </p>
                        </div>
                        <div className='p-4'>
                          <img
                            src={certificate.fileUrl}
                            alt={certificate.name}
                            className='max-h-72 w-full rounded-2xl object-contain bg-muted/40'
                          />
                        </div>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground'>
                    Chưa có thông tin chứng chỉ
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-6'>
              <div className='rounded-[28px] border border-border/70 bg-background p-5 shadow-sm'>
                <p className='text-sm font-bold text-foreground'>
                  Thông tin nhanh
                </p>
                <div className='mt-4 space-y-3'>
                  <div className='rounded-2xl bg-muted/40 px-4 py-3'>
                    <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                      Họ và tên
                    </p>
                    <p className='mt-1 font-semibold text-foreground'>
                      {nutritionist?.name || '—'}
                    </p>
                  </div>

                  <div className='rounded-2xl bg-muted/40 px-4 py-3'>
                    <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                      Vai trò
                    </p>
                    <p className='mt-1 font-semibold text-foreground'>
                      Chuyên gia dinh dưỡng
                    </p>
                  </div>

                  <div className='rounded-2xl bg-muted/40 px-4 py-3'>
                    <p className='text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                      Trạng thái xác minh
                    </p>
                    <p className='mt-1 font-semibold text-foreground'>
                      {certificate?.status === 'Approved'
                        ? 'Đã xác minh'
                        : certificate?.status === 'Pending'
                          ? 'Đang chờ xác minh'
                          : certificate?.status === 'Rejected'
                            ? 'Bị từ chối'
                            : 'Chưa có'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='rounded-[28px] border border-border/70 bg-primary/5 p-5 shadow-sm'>
                <p className='font-bold text-foreground'>Hồ sơ chuyên gia</p>
                <p className='mt-2 text-sm leading-7 text-muted-foreground'>
                  Thông tin được hiển thị nhằm giúp người dùng hiểu rõ hơn về
                  chuyên môn, đơn vị công tác và chứng chỉ của chuyên gia dinh
                  dưỡng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
