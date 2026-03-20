import { GiMedicines } from 'react-icons/gi';
import {
  HiArrowLeft,
  HiFire,
  HiOutlineBeaker,
  HiOutlineChartPie,
  HiOutlineCube,
  HiOutlineExclamation,
  HiOutlineHeart,
  HiOutlineInformationCircle,
  HiOutlineLightningBolt,
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineTable,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import {
  IoHeartOutline,
  IoLeaf,
  IoNutritionOutline,
  IoRestaurantOutline,
  IoWaterOutline
} from 'react-icons/io5';
import { MdOutlineLocalDining, MdOutlineMonitorWeight } from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router';

import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { findByLabel, formatDateVI, formatValue } from '~/lib/utils';

import { useScheduleDetail } from '../api/view-schedule-detail';
import {
  MealEnergyCard,
  NutritionComparisonCard,
  NutritionHighlightCard,
  NutritionInsightCard,
  NutritionMacroCard,
  NutritionOverviewAlert,
  NutritionStatCard,
  NutritionSummaryChip
} from './nutrition-cards';
import NutritionSectionHeader from './nutrition-section-header';
import { NutritionTable, TopDishesCard } from './nutrition-tables';

export default function ScheduleNutritionContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: schedule } = useScheduleDetail(id);
  const { data: profile } = useProfile();

  const targetCalories = profile?.nutritionTarget?.caloriesTarget ?? 0;
  const targetProtein = profile?.nutritionTarget?.proteinTarget ?? 0;
  const targetFat = profile?.nutritionTarget?.fatTarget ?? 0;
  const targetCarbs = profile?.nutritionTarget?.carbsTarget ?? 0;

  const nutrition = schedule?.totalNutrition || {};
  const nutrients = nutrition?.nutrients || [];
  const minerals = nutrition?.minerals || [];
  const vitamins = nutrition?.vitamins || [];

  const energy = findByLabel(nutrients, 'Năng lượng')?.value ?? 0;
  const protein = findByLabel(nutrients, 'Protein')?.value ?? 0;
  const fat = findByLabel(nutrients, 'Chất béo')?.value ?? 0;
  const carbs = findByLabel(nutrients, 'Tinh bột')?.value ?? 0;
  const fiber = findByLabel(nutrients, 'Chất xơ')?.value ?? 0;
  const water = findByLabel(nutrients, 'Nước')?.value ?? 0;
  const sugar = findByLabel(nutrients, 'Đường')?.value ?? 0;
  const cholesterol = findByLabel(nutrients, 'Cholesterol')?.value ?? 0;

  const sodium = findByLabel(minerals, 'Natri')?.value ?? 0;
  const calcium = findByLabel(minerals, 'Calci')?.value ?? 0;
  const iron = findByLabel(minerals, 'Sắt')?.value ?? 0;
  const potassium = findByLabel(minerals, 'Kali')?.value ?? 0;

  const vitaminA = findByLabel(vitamins, 'Vitamin A')?.value ?? 0;
  const vitaminC = findByLabel(vitamins, 'Vitamin C')?.value ?? 0;
  const vitaminE = findByLabel(vitamins, 'Vitamin E')?.value ?? 0;
  const folat = findByLabel(vitamins, 'Folat')?.value ?? 0;

  const meals = schedule?.meals || [];
  const totalMeals = meals.length;
  const totalDishes = meals.reduce(
    (sum, meal) => sum + (meal?.dishes?.length || 0),
    0
  );

  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPercent = (proteinKcal / totalMacroKcal) * 100;
  const carbsPercent = (carbsKcal / totalMacroKcal) * 100;
  const fatPercent = (fatKcal / totalMacroKcal) * 100;

  const caloriesPercent = targetCalories ? (energy / targetCalories) * 100 : 0;

  const allDishes = meals.flatMap(meal => meal?.dishes || []);
  const topDishes = [...allDishes]
    .sort((a, b) => Number(b.energy || 0) - Number(a.energy || 0))
    .slice(0, 5);

  const highestMeal = [...meals]
    .map(meal => ({
      ...meal,
      totalEnergy: (meal?.dishes || []).reduce(
        (sum, dish) => sum + Number(dish?.energy || 0),
        0
      )
    }))
    .sort((a, b) => b.totalEnergy - a.totalEnergy)[0];

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <div>
            <div className='mb-3'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-bold text-foreground shadow-sm transition hover:bg-muted'
              >
                <HiArrowLeft size={16} />
                Quay lại lịch ăn
              </button>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary'>
                Nutrition Overview
              </span>
            </div>

            <h1 className='mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl'>
              Phân tích dinh dưỡng
            </h1>

            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDateVI(schedule?.date, 'EEEE, dd/MM/yyyy')}
            </p>

            <div className='mt-4 flex flex-wrap gap-2'>
              <NutritionSummaryChip
                icon={<MdOutlineLocalDining size={15} />}
                label='Bữa ăn'
                value={totalMeals}
              />
              <NutritionSummaryChip
                icon={<IoRestaurantOutline size={15} />}
                label='Tổng món'
                value={totalDishes}
              />
              <NutritionSummaryChip
                icon={<HiFire size={15} />}
                label='Tổng kcal'
                value={Math.round(energy)}
              />
            </div>
          </div>

          {targetCalories > 0 && (
            <div className='rounded-[24px] border border-[#2D6A4F]/20 bg-[#F0F7F4] px-4 py-4 shadow-sm'>
              <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D6A4F]/60'>
                Mục tiêu ngày
              </p>

              <div className='mt-2 flex items-center gap-2'>
                <HiFire className='text-[#2D6A4F]' size={16} />
                <p className='text-[16px] font-black text-[#1B4332]'>
                  {targetCalories}{' '}
                  <span className='text-[11px] font-bold opacity-60'>kcal</span>
                </p>
              </div>

              <div className='mt-3 h-2.5 w-52 overflow-hidden rounded-full bg-[#d8e9e0]'>
                <div
                  className='h-full rounded-full bg-[#2D6A4F] transition-all'
                  style={{ width: `${Math.min(caloriesPercent || 0, 100)}%` }}
                />
              </div>

              <p className='mt-2 text-[12px] text-[#2D6A4F]/80'>
                Đạt khoảng {Math.round(caloriesPercent)}% mục tiêu
              </p>
            </div>
          )}
        </div>

        <NutritionOverviewAlert
          percent={caloriesPercent}
          targetCalories={targetCalories}
          energy={energy}
        />

        <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <NutritionStatCard
            icon={<HiFire size={20} />}
            title='Tổng năng lượng'
            value={energy}
            unit='kcal'
            note={
              targetCalories
                ? `Khoảng ${Math.round(caloriesPercent)}% mục tiêu hằng ngày`
                : 'Chưa thiết lập mục tiêu calo'
            }
            className='bg-gradient-to-br from-orange-50 to-white dark:from-orange-500/10 dark:to-background'
          />

          <NutritionStatCard
            icon={<IoNutritionOutline size={20} />}
            title='Tổng món ăn'
            value={totalDishes}
            unit='món'
            note='Tổng số món trong lịch ăn'
            className='bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-background'
          />

          <NutritionStatCard
            icon={<IoWaterOutline size={20} />}
            title='Nước'
            value={water}
            unit='g'
            note='Lượng nước ước tính từ thực phẩm'
            className='bg-gradient-to-br from-sky-50 to-white dark:from-sky-500/10 dark:to-background'
          />

          <NutritionStatCard
            icon={<HiOutlineShieldCheck size={20} />}
            title='Chất xơ'
            value={fiber}
            unit='g'
            note='Hỗ trợ tiêu hoá và no lâu'
            className='bg-gradient-to-br from-violet-50 to-white dark:from-violet-500/10 dark:to-background'
          />
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <NutritionSectionHeader
              icon={<HiOutlineChartPie size={18} />}
              title='Phân bố đa lượng'
              desc='Tính theo năng lượng từ protein, chất béo và tinh bột'
              badge='Macros'
            />

            <div className='grid gap-4 md:grid-cols-3'>
              <NutritionMacroCard
                label='Protein'
                value={protein}
                unit='g'
                kcal={proteinKcal}
                percent={proteinPercent}
                icon={<HiOutlineLightningBolt size={18} />}
                accent='bg-blue-500/10 text-blue-500'
              />
              <NutritionMacroCard
                label='Chất béo'
                value={fat}
                unit='g'
                kcal={fatKcal}
                percent={fatPercent}
                icon={<IoLeaf size={18} />}
                accent='bg-amber-500/10 text-amber-500'
              />
              <NutritionMacroCard
                label='Tinh bột'
                value={carbs}
                unit='g'
                kcal={carbsKcal}
                percent={carbsPercent}
                icon={<HiOutlineCube size={18} />}
                accent='bg-emerald-500/10 text-emerald-500'
              />
            </div>

            <div className='mt-5 grid gap-4 md:grid-cols-3'>
              <NutritionComparisonCard
                title='Protein'
                current={protein}
                target={targetProtein}
                unit='g'
                icon={<HiOutlineLightningBolt size={18} />}
                accent='bg-blue-500/10 text-blue-500'
              />
              <NutritionComparisonCard
                title='Chất béo'
                current={fat}
                target={targetFat}
                unit='g'
                icon={<IoLeaf size={18} />}
                accent='bg-amber-500/10 text-amber-500'
              />
              <NutritionComparisonCard
                title='Tinh bột'
                current={carbs}
                target={targetCarbs}
                unit='g'
                icon={<HiOutlineCube size={18} />}
                accent='bg-emerald-500/10 text-emerald-500'
              />
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <NutritionSectionHeader
              icon={<HiOutlineSparkles size={18} />}
              title='Chỉ số nổi bật'
              desc='Một số thành phần đáng chú ý trong ngày'
              badge='Highlights'
            />

            <div className='grid gap-3'>
              <NutritionHighlightCard
                label='Đường'
                value={sugar}
                unit='g'
                accent='text-pink-500'
                icon={<HiOutlineSparkles size={20} />}
              />
              <NutritionHighlightCard
                label='Natri'
                value={sodium}
                unit='mg'
                accent='text-sky-500'
                icon={<HiOutlineBeaker size={20} />}
              />
              <NutritionHighlightCard
                label='Calci'
                value={calcium}
                unit='mg'
                accent='text-emerald-500'
                icon={<MdOutlineMonitorWeight size={20} />}
              />
              <NutritionHighlightCard
                label='Vitamin C'
                value={vitaminC}
                unit='mg'
                accent='text-orange-500'
                icon={<IoHeartOutline size={20} />}
              />
            </div>
          </div>
        </div>

        <div className='mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          <NutritionStatCard
            icon={<HiOutlineHeart size={20} />}
            title='Cholesterol'
            value={cholesterol}
            unit='mg'
            note='Chỉ số chất béo liên quan tim mạch'
          />

          <NutritionStatCard
            icon={<HiOutlineBeaker size={20} />}
            title='Natri'
            value={sodium}
            unit='mg'
            note='Liên quan cân bằng nước và huyết áp'
          />

          <NutritionStatCard
            icon={<HiOutlineScale size={20} />}
            title='Sắt'
            value={iron}
            unit='mg'
            note='Hỗ trợ tạo máu và vận chuyển oxy'
          />

          <NutritionStatCard
            icon={<HiOutlineLightningBolt size={20} />}
            title='Kali'
            value={potassium}
            unit='mg'
            note='Hỗ trợ thần kinh và co cơ'
          />
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-3'>
          <NutritionTable
            title='Tổng dưỡng chất'
            items={nutrients}
            tone='default'
            icon={<HiOutlineTable size={16} />}
          />
          <NutritionTable
            title='Khoáng chất'
            items={minerals}
            tone='mineral'
            icon={<GiMedicines size={16} />}
          />
          <NutritionTable
            title='Vitamin'
            items={vitamins}
            tone='vitamin'
            icon={<IoLeaf size={16} />}
          />
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4'>
          <NutritionStatCard
            icon={<HiOutlineShieldCheck size={20} />}
            title='Vitamin A'
            value={vitaminA}
            unit='μg'
            note='Hỗ trợ thị lực và miễn dịch'
          />
          <NutritionStatCard
            icon={<HiOutlineSparkles size={20} />}
            title='Vitamin E'
            value={vitaminE}
            unit='mg'
            note='Chống oxy hoá'
          />
          <NutritionStatCard
            icon={<IoHeartOutline size={20} />}
            title='Folat'
            value={folat}
            unit='μg'
            note='Quan trọng cho quá trình tạo tế bào'
          />
          <NutritionStatCard
            icon={<HiOutlineBeaker size={20} />}
            title='Vitamin C'
            value={vitaminC}
            unit='mg'
            note='Hỗ trợ miễn dịch và chống oxy hoá'
          />
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <NutritionSectionHeader
              icon={<MdOutlineLocalDining size={18} />}
              title='Năng lượng theo bữa'
              desc='Tổng hợp năng lượng của từng bữa ăn trong ngày'
              badge='Meals'
            />

            <div className='grid gap-4 lg:grid-cols-2'>
              {meals.map(meal => (
                <MealEnergyCard key={meal._id || meal.mealType} meal={meal} />
              ))}
            </div>
          </div>

          <TopDishesCard
            dishes={topDishes}
            icon={<HiOutlineTrendingUp size={18} />}
          />
        </div>

        <div className='mt-6 rounded-[28px] border border-border bg-card p-5 shadow-sm'>
          <NutritionSectionHeader
            icon={<HiOutlineInformationCircle size={18} />}
            title='Nhận xét nhanh'
            desc='Tóm tắt một vài điểm đáng chú ý từ lịch ăn hiện tại'
            badge='Insights'
          />

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <NutritionInsightCard
              icon={<HiOutlineTrendingUp size={20} />}
              accent='text-primary'
              title='Bữa nhiều năng lượng nhất'
              desc={
                highestMeal
                  ? `${highestMeal.mealType} là bữa có năng lượng cao nhất với khoảng ${Math.round(
                      highestMeal.totalEnergy
                    )} kcal.`
                  : 'Chưa có dữ liệu bữa ăn.'
              }
            />

            <NutritionInsightCard
              icon={<HiOutlineExclamation size={20} />}
              accent='text-amber-500'
              title='Theo dõi natri'
              desc={`Tổng natri hiện tại là ${formatValue(
                sodium,
                'mg'
              )} mg. Đây là chỉ số nên được chú ý nếu bạn đang kiểm soát huyết áp hoặc giữ nước.`}
            />

            <NutritionInsightCard
              icon={<HiOutlineHeart size={20} />}
              accent='text-pink-500'
              title='Quan tâm tim mạch'
              desc={`Cholesterol hiện tại là ${formatValue(
                cholesterol,
                'mg'
              )} mg. Có thể theo dõi thêm cùng chất béo và natri để đánh giá tổng quan hơn.`}
            />

            <NutritionInsightCard
              icon={<IoWaterOutline size={20} />}
              accent='text-sky-500'
              title='Nước từ thực phẩm'
              desc={`Tổng nước ước tính từ thực phẩm là ${formatValue(
                water,
                'g'
              )} g. Đây chỉ là phần nước đến từ món ăn, không thay thế lượng nước uống trong ngày.`}
            />

            <NutritionInsightCard
              icon={<HiOutlineShieldCheck size={20} />}
              accent='text-emerald-500'
              title='Vai trò chất xơ'
              desc={`Chất xơ hiện tại là ${formatValue(
                fiber,
                'g'
              )} g, góp phần hỗ trợ tiêu hoá, kiểm soát cảm giác no và ổn định hấp thu.`}
            />

            <NutritionInsightCard
              icon={<HiOutlineSparkles size={20} />}
              accent='text-violet-500'
              title='Vi chất đáng chú ý'
              desc={`Vitamin C: ${formatValue(
                vitaminC,
                'mg'
              )} mg, Calci: ${formatValue(calcium, 'mg')} mg, Sắt: ${formatValue(
                iron,
                'mg'
              )} mg.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
