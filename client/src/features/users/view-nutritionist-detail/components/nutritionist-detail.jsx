import { ArrowLeft, Building2, GraduationCap, ShieldCheck } from 'lucide-react';
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

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <Button variant='outline' size='sm' asChild className='mb-8'>
          <Link to='/'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Quay lại
          </Link>
        </Button>

        <div className='bg-primary/5 rounded-2xl p-6 md:p-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='md:w-56 shrink-0 text-center md:text-left'>
              <div className='relative inline-block mb-4'>
                <Avatar className='h-32 w-32 mx-auto md:mx-0 ring-4 ring-background shadow-xl'>
                  <AvatarImage
                    src={nutritionist.avatar}
                    alt={nutritionist.name}
                  />
                  <AvatarFallback className='text-4xl bg-primary/20 text-primary font-bold'>
                    {nutritionist.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {certificate?.status === 'Approved' && (
                  <div className='absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg'>
                    <ShieldCheck className='h-5 w-5' />
                  </div>
                )}
              </div>

              <h1 className='text-2xl font-bold text-foreground mb-1'>
                {nutritionist.name}
              </h1>
              <p className='text-base text-muted-foreground mb-4'>
                Chuyên gia dinh dưỡng
              </p>

              {certificate?.status === 'Approved' && (
                <Badge className='bg-green-500 text-white gap-1.5 px-3 py-1'>
                  Đã xác minh
                </Badge>
              )}
            </div>

            <div className='flex-1 space-y-6'>
              {profile?.professionalBio && (
                <div className='bg-background rounded-xl p-5'>
                  <p className='text-sm font-medium text-muted-foreground mb-2'>
                    Giới thiệu
                  </p>
                  <p className='text-foreground leading-relaxed'>
                    {profile.professionalBio}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                {profile?.workplace && (
                  <div className='bg-background rounded-xl p-4'>
                    <p className='text-sm text-muted-foreground mb-1'>
                      Nơi làm việc
                    </p>
                    <p className='font-semibold text-foreground'>
                      {profile.workplace}
                    </p>
                  </div>
                )}
                {profile?.graduatedUniversity && (
                  <div className='bg-background rounded-xl p-4'>
                    <p className='text-sm text-muted-foreground mb-1'>
                      Trường tốt nghiệp
                    </p>
                    <p className='font-semibold text-foreground'>
                      {profile.graduatedUniversity}
                    </p>
                  </div>
                )}
              </div>

              <div className='bg-background rounded-xl p-5'>
                <div className='flex items-center gap-2 mb-4'>
                  <ShieldCheck className='h-5 w-5 text-primary' />
                  <p className='font-semibold text-foreground'>
                    Chứng chỉ nghề nghiệp
                  </p>
                </div>

                {certificate ? (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold text-foreground'>
                        {certificate.name}
                      </p>
                      <Badge
                        className={
                          certificate.status === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : certificate.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }
                      >
                        {certificate.status === 'Approved'
                          ? 'Đã phê duyệt'
                          : certificate.status === 'Pending'
                            ? 'Đang chờ'
                            : 'Bị từ chối'}
                      </Badge>
                    </div>

                    <div className='flex gap-6 text-sm'>
                      {certificate.submittedAt && (
                        <p className='text-muted-foreground'>
                          Ngày nộp: {formatDate(certificate.submittedAt)}
                        </p>
                      )}
                      {certificate.reviewedAt && (
                        <p className='text-muted-foreground'>
                          Ngày duyệt: {formatDate(certificate.reviewedAt)}
                        </p>
                      )}
                    </div>

                    {certificate.fileUrl && (
                      <a
                        href={certificate.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block'
                      >
                        <img
                          src={certificate.fileUrl}
                          alt={certificate.name}
                          className='max-h-56 rounded-lg'
                        />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Chưa có thông tin chứng chỉ
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
