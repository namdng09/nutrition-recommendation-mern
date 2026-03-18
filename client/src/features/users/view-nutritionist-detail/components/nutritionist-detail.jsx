import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CheckCircle,
  FileText,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';

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
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <Button variant='ghost' size='sm' asChild className='mb-8'>
          <Link to='/'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Quay lại trang chủ
          </Link>
        </Button>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='sticky top-8'>
              <div className='bg-card border border-border rounded-3xl p-6 md:p-8 text-center'>
                <div className='relative inline-block mb-6'>
                  <Avatar className='h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-xl'>
                    <AvatarImage
                      src={nutritionist.avatar}
                      alt={nutritionist.name}
                    />
                    <AvatarFallback className='text-3xl md:text-4xl bg-primary/10 text-primary font-bold'>
                      {nutritionist.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {certificate?.status === 'Approved' && (
                    <div className='absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1.5 border-4 border-background'>
                      <CheckCircle className='h-4 w-4' />
                    </div>
                  )}
                </div>

                <h1 className='text-xl md:text-2xl font-black text-foreground mb-1'>
                  {nutritionist.name}
                </h1>
                <p className='text-sm text-muted-foreground mb-4'>
                  Chuyên gia dinh dưỡng
                </p>

                {certificate?.status === 'Approved' && (
                  <Badge className='bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 gap-1.5'>
                    <CheckCircle className='h-3 w-3' />
                    Đã xác minh
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 space-y-6'>
            {profile?.professionalBio && (
              <Card className='border-border/50 bg-gradient-to-br from-primary/5 via-background to-transparent'>
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-3'>
                    <div className='p-2 rounded-xl bg-primary/10 shrink-0'>
                      <FileText className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <h2 className='font-bold text-foreground mb-2'>
                        Về chuyên gia
                      </h2>
                      <p className='text-muted-foreground leading-relaxed'>
                        {profile.professionalBio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {profile?.workplace && (
                <Card className='border-border/50'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 rounded-lg bg-blue-500/10 shrink-0'>
                        <Building2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                      </div>
                      <div>
                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                          Nơi làm việc
                        </p>
                        <p className='font-semibold text-foreground'>
                          {profile.workplace}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile?.graduatedUniversity && (
                <Card className='border-border/50'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 rounded-lg bg-purple-500/10 shrink-0'>
                        <GraduationCap className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                      </div>
                      <div>
                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                          Trường tốt nghiệp
                        </p>
                        <p className='font-semibold text-foreground'>
                          {profile.graduatedUniversity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 rounded-lg bg-orange-500/10'>
                    <FileText className='h-5 w-5 text-orange-600 dark:text-orange-400' />
                  </div>
                  <div>
                    <h2 className='font-bold text-foreground'>
                      Chứng chỉ nghề nghiệp
                    </h2>
                  </div>
                </div>

                {certificate ? (
                  <div className='space-y-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-2xl'>
                      <div className='flex-1'>
                        <p className='text-sm text-muted-foreground mb-1'>
                          Tên chứng chỉ
                        </p>
                        <p className='font-bold text-lg text-foreground'>
                          {certificate.name}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          certificate.status === 'Approved'
                            ? 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800'
                            : certificate.status === 'Pending'
                              ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800'
                        } gap-1.5`}
                      >
                        <CheckCircle className='h-3 w-3' />
                        {certificate.status === 'Approved'
                          ? 'Đã phê duyệt'
                          : certificate.status === 'Pending'
                            ? 'Đang chờ'
                            : 'Bị từ chối'}
                      </Badge>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      {certificate.submittedAt && (
                        <div className='p-4 bg-muted/30 rounded-2xl'>
                          <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                            <CalendarCheck className='h-4 w-4' />
                            <span className='text-xs font-medium uppercase tracking-wide'>
                              Ngày nộp
                            </span>
                          </div>
                          <p className='font-semibold text-foreground'>
                            {formatDate(certificate.submittedAt)}
                          </p>
                        </div>
                      )}
                      {certificate.reviewedAt && (
                        <div className='p-4 bg-muted/30 rounded-2xl'>
                          <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                            <CalendarCheck className='h-4 w-4' />
                            <span className='text-xs font-medium uppercase tracking-wide'>
                              Ngày duyệt
                            </span>
                          </div>
                          <p className='font-semibold text-foreground'>
                            {formatDate(certificate.reviewedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {certificate.fileUrl && (
                      <a
                        href={certificate.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block'
                      >
                        <div className='relative overflow-hidden rounded-2xl border border-border group cursor-pointer'>
                          <img
                            src={certificate.fileUrl}
                            alt={certificate.name}
                            className='w-full h-auto max-h-80 object-contain bg-muted/50 transition-transform duration-300 group-hover:scale-[1.02]'
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4'>
                            <span className='text-white font-medium flex items-center gap-2'>
                              <FileText className='h-4 w-4' />
                              Xem chứng chỉ
                            </span>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <FileText className='h-12 w-12 mx-auto mb-3 opacity-30' />
                    <p>Chuyên gia chưa nộp chứng chỉ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
