import {
  FaBullseye,
  FaClock,
  FaHeartbeat,
  FaIdCard,
  FaLeaf,
  FaRegCalendarAlt,
  FaUser
} from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { ACTIVITY_LEVEL_OPTIONS } from '~/constants/activity-level';
import { ALLERGEN_OPTIONS } from '~/constants/allergen';
import { BODYFAT_OPTIONS } from '~/constants/bodyfat';
import { DIET_OPTIONS } from '~/constants/diet';
import { GENDER_OPTIONS } from '~/constants/gender';
import { MEDICAL_HISTORY_OPTIONS } from '~/constants/medical';
import { USER_TARGET_OPTIONS } from '~/constants/user-target';
import { formatDateVI } from '~/lib/utils';

const FALLBACK_TEXT = 'Chưa cập nhật';

const toLabelMap = options =>
  Object.fromEntries(options.map(option => [option.value, option.label]));

const genderLabelMap = toLabelMap(GENDER_OPTIONS);
const dietLabelMap = toLabelMap(DIET_OPTIONS);
const activityLabelMap = toLabelMap(ACTIVITY_LEVEL_OPTIONS);
const bodyfatLabelMap = toLabelMap(BODYFAT_OPTIONS);
const goalLabelMap = toLabelMap(USER_TARGET_OPTIONS);
const allergenLabelMap = toLabelMap(ALLERGEN_OPTIONS);
const medicalHistoryLabelMap = toLabelMap(MEDICAL_HISTORY_OPTIONS);

const formatNumber = value => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue % 1 === 0
    ? numericValue.toString()
    : numericValue.toFixed(1).replace(/\.0$/, '');
};

const formatDateTime = value => {
  if (!value) return FALLBACK_TEXT;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return FALLBACK_TEXT;
  }

  return formatDateVI(value, "HH:mm 'ngày' dd/MM/yyyy");
};

const formatDateOnly = value => {
  if (!value) return FALLBACK_TEXT;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return FALLBACK_TEXT;
  }

  return formatDateVI(value, 'dd/MM/yyyy');
};

const formatRange = (range, unit = '') => {
  const min = formatNumber(range?.min);
  const max = formatNumber(range?.max);

  if (!min || !max) {
    return FALLBACK_TEXT;
  }

  return `${min} - ${max}${unit ? ` ${unit}` : ''}`;
};

const getLabelValue = (map, value) => {
  if (!value) return FALLBACK_TEXT;
  return map[value] || value;
};

const getLatestWeightRecord = weightRecord => {
  if (!Array.isArray(weightRecord) || weightRecord.length === 0) {
    return null;
  }

  return [...weightRecord]
    .filter(item => item && item.weight !== undefined && item.weight !== null)
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0))[0];
};

const normalizeArray = value => {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
};

const InfoItem = ({ icon, label, value }) => (
  <div className='relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm'>
    <div className='pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-teal-400/70 to-sky-400/70' />
    <div className='flex items-start justify-between gap-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
        {label}
      </p>
      <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/30 text-slate-600'>
        {icon}
      </span>
    </div>
    <p className='mt-3 break-words text-sm font-semibold leading-6 text-foreground'>
      {value}
    </p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className='grid gap-1 rounded-xl border bg-muted/20 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-4'>
    <p className='text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500'>
      {label}
    </p>
    <p className='text-sm font-semibold leading-6 text-foreground'>{value}</p>
  </div>
);

const TagList = ({ values }) => {
  if (!values.length) {
    return <p className='text-sm text-slate-600'>{FALLBACK_TEXT}</p>;
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className='inline-flex items-center rounded-full border bg-muted/20 px-3 py-1 text-xs font-medium text-foreground shadow-sm'
        >
          {value}
        </span>
      ))}
    </div>
  );
};

const ProfileSection = ({ icon, title, children, className = '' }) => (
  <section
    className={`space-y-3 rounded-2xl border bg-card p-4 shadow-sm md:p-5 ${className}`}
  >
    <div className='flex items-center gap-3'>
      <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/20 text-slate-600'>
        {icon}
      </span>
      <h3 className='text-sm font-semibold uppercase tracking-[0.1em] text-foreground'>
        {title}
      </h3>
    </div>
    <div className='space-y-2.5'>{children}</div>
  </section>
);

const SummaryMeta = ({ icon, label, value }) => (
  <div className='rounded-lg border bg-muted/20 p-3'>
    <p className='text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500'>
      {label}
    </p>
    <div className='mt-1.5 flex items-start gap-2'>
      <span className='mt-0.5 text-slate-500'>{icon}</span>
      <p className='text-sm font-semibold text-foreground'>{value}</p>
    </div>
  </div>
);

const UserProfileModal = ({ user, requestCreatedAt, requestUpdatedAt }) => {
  const profile = user?.profile || {};

  const latestWeight = getLatestWeightRecord(profile?.weightRecord);
  const latestWeightNumber = formatNumber(latestWeight?.weight);
  const latestWeightText = latestWeightNumber
    ? `${latestWeightNumber} kg${latestWeight?.date ? ` (${formatDateOnly(latestWeight.date)})` : ''}`
    : FALLBACK_TEXT;

  const heightNumber = formatNumber(profile?.height);
  const goalWeightNumber = formatNumber(profile?.goal?.weightGoal);
  const targetWeightChangeNumber = formatNumber(
    profile?.goal?.targetWeightChange
  );
  const caloriesTarget = formatNumber(profile?.nutritionTarget?.caloriesTarget);

  const allergens = normalizeArray(profile?.allergens).map(
    item => allergenLabelMap[item] || item
  );
  const medicalHistory = normalizeArray(profile?.medicalHistory).map(
    item => medicalHistoryLabelMap[item] || item
  );

  const userName = user?.name || 'Không xác định';
  const userId = user?._id || user?.id || FALLBACK_TEXT;
  const userInitial = String(userName).trim().charAt(0).toUpperCase() || 'U';

  const genderText = getLabelValue(genderLabelMap, profile?.gender);
  const dobText = formatDateOnly(profile?.dob);
  const requestCreatedText = formatDateTime(requestCreatedAt);
  const requestUpdatedText = formatDateTime(requestUpdatedAt);
  const dietText = getLabelValue(dietLabelMap, profile?.diet);
  const activityText = getLabelValue(activityLabelMap, profile?.activityLevel);
  const bodyfatText = getLabelValue(bodyfatLabelMap, profile?.bodyfat);
  const goalTargetText = getLabelValue(goalLabelMap, profile?.goal?.target);

  const hasProfileDetail = Boolean(
    profile?.gender ||
      profile?.dob ||
      profile?.diet ||
      profile?.activityLevel ||
      profile?.height ||
      profile?.bodyfat ||
      profile?.goal?.target ||
      profile?.nutritionTarget?.caloriesTarget ||
      allergens.length ||
      medicalHistory.length ||
      latestWeight
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='shrink-0 border-slate-300 bg-background/90 shadow-sm hover:bg-muted/60'
        >
          Xem hồ sơ đầy đủ
        </Button>
      </DialogTrigger>

      <DialogContent className='max-h-[92vh] max-w-5xl overflow-hidden p-0 sm:max-w-5xl'>
        <DialogHeader className='border-b bg-muted/20 px-6 py-5'>
          <DialogTitle>Thông tin hồ sơ người gửi yêu cầu</DialogTitle>
        </DialogHeader>

        <ScrollArea className='h-[74vh]'>
          <div className='space-y-5 px-5 py-5 md:px-6'>
            <section className='grid gap-4 rounded-2xl border bg-muted/10 p-4 md:grid-cols-[290px_minmax(0,1fr)]'>
              <aside className='space-y-4 rounded-xl border bg-card p-4 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-lg font-bold text-foreground'>
                    {userInitial}
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-base font-semibold text-foreground'>
                      {userName}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <SummaryMeta
                    icon={<FaRegCalendarAlt />}
                    label='Ngày gửi yêu cầu'
                    value={requestCreatedText}
                  />
                  <SummaryMeta
                    icon={<FaClock />}
                    label='Cập nhật gần nhất'
                    value={requestUpdatedText}
                  />
                </div>
              </aside>

              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                <InfoItem
                  icon={<FaUser />}
                  label='Giới tính'
                  value={genderText}
                />
                <InfoItem
                  icon={<FaRegCalendarAlt />}
                  label='Ngày sinh'
                  value={dobText}
                />
                <InfoItem
                  icon={<FaLeaf />}
                  label='Chế độ ăn'
                  value={dietText}
                />
                <InfoItem
                  icon={<FaHeartbeat />}
                  label='Mức vận động'
                  value={activityText}
                />
                <InfoItem
                  icon={<FaBullseye />}
                  label='Mục tiêu chính'
                  value={goalTargetText}
                />
                <InfoItem
                  icon={<FaIdCard />}
                  label='Body fat'
                  value={bodyfatText}
                />
              </div>
            </section>

            <div className='grid gap-4 xl:grid-cols-2'>
              <ProfileSection icon={<FaUser />} title='Thông tin cá nhân'>
                <DetailRow label='Họ và tên' value={userName} />

                <DetailRow label='Giới tính' value={genderText} />
                <DetailRow label='Ngày sinh' value={dobText} />
                <DetailRow
                  label='Ngày gửi yêu cầu'
                  value={requestCreatedText}
                />
                <DetailRow
                  label='Cập nhật yêu cầu gần nhất'
                  value={requestUpdatedText}
                />
              </ProfileSection>
              <ProfileSection icon={<FaHeartbeat />} title='Chỉ số cơ thể'>
                <DetailRow
                  label='Chiều cao'
                  value={heightNumber ? `${heightNumber} cm` : FALLBACK_TEXT}
                />
                <DetailRow label='Cân nặng gần nhất' value={latestWeightText} />
                <DetailRow label='Tỷ lệ mỡ cơ thể' value={bodyfatText} />
              </ProfileSection>

              <ProfileSection icon={<FaLeaf />} title='Chế độ ăn'>
                <DetailRow label='Chế độ ăn hiện tại' value={dietText} />
                <DetailRow label='Mức độ vận động' value={activityText} />
              </ProfileSection>

              <ProfileSection icon={<FaIdCard />} title='Dị ứng thực phẩm'>
                <div className='rounded-xl border bg-muted/20 p-3'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500'>
                    Danh sách dị ứng
                  </p>
                  <div className='mt-2'>
                    <TagList values={allergens} />
                  </div>
                </div>

                <div className='rounded-xl border bg-muted/20 p-3'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500'>
                    Tiền sử bệnh lý
                  </p>
                  <div className='mt-2'>
                    <TagList values={medicalHistory} />
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                icon={<FaBullseye />}
                title='Mục tiêu dinh dưỡng'
                className='xl:col-span-2'
              >
                <DetailRow label='Mục tiêu chính' value={goalTargetText} />
                <DetailRow
                  label='Cân nặng mục tiêu'
                  value={
                    goalWeightNumber ? `${goalWeightNumber} kg` : FALLBACK_TEXT
                  }
                />
                <DetailRow
                  label='Tốc độ thay đổi mục tiêu'
                  value={
                    targetWeightChangeNumber
                      ? `${targetWeightChangeNumber} kg/tuần`
                      : FALLBACK_TEXT
                  }
                />
                <DetailRow
                  label='Calories mục tiêu'
                  value={
                    caloriesTarget
                      ? `${caloriesTarget} kcal/ngày`
                      : FALLBACK_TEXT
                  }
                />
                <DetailRow
                  label='Carb mục tiêu'
                  value={formatRange(
                    profile?.nutritionTarget?.macros?.carbs,
                    'g'
                  )}
                />
                <DetailRow
                  label='Protein mục tiêu'
                  value={formatRange(
                    profile?.nutritionTarget?.macros?.protein,
                    'g'
                  )}
                />
                <DetailRow
                  label='Chất béo mục tiêu'
                  value={formatRange(
                    profile?.nutritionTarget?.macros?.fat,
                    'g'
                  )}
                />
              </ProfileSection>

              {/* <ProfileSection icon={<FaHeartbeat />} title='Chỉ số cơ thể'>
                <DetailRow
                  label='Chiều cao'
                  value={heightNumber ? `${heightNumber} cm` : FALLBACK_TEXT}
                />
                <DetailRow label='Cân nặng gần nhất' value={latestWeightText} />
                <DetailRow label='Tỷ lệ mỡ cơ thể' value={bodyfatText} />
              </ProfileSection> */}

              {!hasProfileDetail ? (
                <div className='rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-slate-600 xl:col-span-2'>
                  Hồ sơ người dùng chưa cung cấp đủ dữ liệu chi tiết.
                </div>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const UserDetail = ({ user, requestCreatedAt, requestUpdatedAt }) => {
  const userName = user?.name || 'Không xác định';
  const userId = user?._id || user?.id || 'Không có';
  const userInitial = String(userName).trim().charAt(0).toUpperCase() || 'U';
  const requestCreatedText = formatDateTime(requestCreatedAt);
  const requestUpdatedText = formatDateTime(requestUpdatedAt);

  return (
    <section className='relative space-y-5 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm md:p-6'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/80 via-teal-400/80 to-sky-400/80' />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
            Hồ sơ người dùng
          </p>
        </div>
        <UserProfileModal
          user={user}
          requestCreatedAt={requestCreatedAt}
          requestUpdatedAt={requestUpdatedAt}
        />
      </div>

      <div className='grid gap-4 rounded-2xl border bg-muted/15 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-foreground'>
            {userInitial}
          </div>

          <div className='min-w-0'>
            <p className='truncate text-base font-semibold text-foreground'>
              {userName}
            </p>
          </div>
        </div>

        <div className='hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 md:flex'>
          <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-slate-600'>
            <FaIdCard />
          </span>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-3'>
        <InfoItem
          icon={<FaRegCalendarAlt />}
          label='Thời điểm tạo yêu cầu'
          value={requestCreatedText}
        />
        <InfoItem
          icon={<FaClock />}
          label='Lần cập nhật gần nhất'
          value={requestUpdatedText}
        />
      </div>
    </section>
  );
};

export default UserDetail;
