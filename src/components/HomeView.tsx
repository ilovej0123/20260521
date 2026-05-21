import React from "react";
import { MealData, UserAllergy } from "../types";
import { getTodayKST, formatKoreanDate, formatDateKey, getDefaultSelectedDate } from "../utils/dateUtils";

interface HomeViewProps {
  meals: MealData[];
  userAllergies: UserAllergy[];
  onTabChange: (tab: "home" | "schedule" | "nutrition" | "profile") => void;
}

export default function HomeView({ meals, userAllergies, onTabChange }: HomeViewProps) {
  const today = getTodayKST();
  const dayOfWeek = today.getDay(); // 0: 일, 1: 월, ..., 6: 토
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 주말 처리 (방식 B): 주말인 경우 다음 급식일인 월요일 식단을 보여줌
  const targetDate = getDefaultSelectedDate(today);
  const targetDateKey = formatDateKey(targetDate);

  // 해당 일자 급식 찾기
  const lunchMeal = meals.find(
    (m) => m.dateKey === targetDateKey && m.mealType === "중식"
  );
  const dinnerMeal = meals.find(
    (m) => m.dateKey === targetDateKey && m.mealType === "석식"
  );

  // 만약의 경우(Fallback)를 위한 첫 날 데이터 배정
  const displayLunch = lunchMeal || meals[0];
  const displayDinner = dinnerMeal || meals[1];

  // 알레르기 항목 일치 여부 조사 헬퍼
  const checkAllergyWarning = (mealAllergens: string[]) => {
    const activeAllergies = userAllergies
      .filter((a) => a.enabled)
      .map((a) => a.name);
    return mealAllergens.some((allergen) => activeAllergies.includes(allergen));
  };

  const hasLunchAllergy = displayLunch ? checkAllergyWarning(displayLunch.allergens) : false;
  const hasDinnerAllergy = displayDinner ? checkAllergyWarning(displayDinner.allergens) : false;

  // 오늘 단백질 달성 상태 계산
  const totalProtein = (displayLunch?.nutrition.protein || 0) + (displayDinner?.nutrition.protein || 0);
  const proteinTarget = 65; // 고교생 하루 권장량 예시
  const proteinPercent = Math.min(Math.round((totalProtein / proteinTarget) * 100), 100);

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-32">
      {/* Hero Card: 추천 급식 */}
      <section className="relative group px-5 pt-4">
        <div className="relative w-full h-[280px] rounded-[32px] overflow-hidden custom-shadow bg-[#f8ecdc] border border-[#c4c9b4]/20">
          <img
            alt={displayLunch?.title || "급식 이미지"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={
              displayLunch?.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop"
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-[#c9f17c] text-[#141f00] text-[13px] font-semibold px-4 py-1.5 rounded-full shadow-sm">
              오늘의 추천 급식
            </span>
            {isWeekend && (
              <span className="bg-[#ffdad6] text-[#93000a] text-[13px] font-semibold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[14px]">event_busy</span>
                다음 급식일
              </span>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white/80 text-[13px] font-medium mb-1">
              {isWeekend ? `다음 급식일 공지 (${displayLunch?.date})` : formatKoreanDate(today)}
            </p>
            <div className="flex items-end justify-between">
              <h2 className="text-white text-[24px] font-bold leading-tight tracking-tight">
                {displayLunch?.title || "맛있는 급식 정식"}
              </h2>
              <span className="text-[#c9f07c] text-[14px] font-bold bg-[#4f6f00]/40 backdrop-blur-md px-3 py-1 rounded-lg">
                {displayLunch?.totalCalories || 845} kcal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lunch (중식) Card */}
      <section className="space-y-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-[#3c5500] rounded-full"></div>
            <h3 className="text-[20px] font-bold text-[#201b11]">중식</h3>
          </div>
          <span className="text-[#444939] text-[14px] font-bold">{displayLunch?.totalCalories || 845} kcal</span>
        </div>

        <div className="bg-white rounded-[24px] p-5 custom-shadow border border-[#c4c9b4]/10 transition-transform hover:scale-[1.01]">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#3c5500] text-[20px] mt-1">restaurant_menu</span>
              <p className="text-[17px] leading-relaxed text-[#201b11] font-medium">
                {displayLunch?.dishes.join(", ") || "친환경현미밥, 쇠고기미역국, 매콤돈육강정, 숙주미나리무침, 배추김치"}
              </p>
            </div>
            
            <div className="h-[1px] bg-[#c4c9b4]/20 my-1"></div>
            
            <div className="flex flex-wrap gap-1.5">
              {displayLunch?.allergens.map((allergen, i) => (
                <span key={i} className="bg-[#d5ed7d] text-[#3e4c00] text-[12px] font-semibold px-2.5 py-1 rounded-md">
                  #{allergen}
                </span>
              ))}
              
              {hasLunchAllergy && (
                <span className="bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  알러지 주의
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dinner (석식) Card */}
      <section className="space-y-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-[#536500] rounded-full"></div>
            <h3 className="text-[20px] font-bold text-[#201b11]">석식</h3>
          </div>
          <span className="text-[#444939] text-[14px] font-bold">{displayDinner?.totalCalories || 720} kcal</span>
        </div>

        <div className="bg-white rounded-[24px] p-5 custom-shadow border border-[#c4c9b4]/10 transition-transform hover:scale-[1.01]">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#536500] text-[20px] mt-1">dinner_dining</span>
              <p className="text-[17px] leading-relaxed text-[#201b11] font-medium">
                {displayDinner?.dishes.join(", ") || "참치마요덮밥, 미니우동, 단무지무침, 배추김치, 요구르트"}
              </p>
            </div>
            
            <div className="h-[1px] bg-[#c4c9b4]/20 my-1"></div>
            
            <div className="flex flex-wrap gap-1.5">
              {displayDinner?.allergens.map((allergen, i) => (
                <span key={i} className="bg-[#dde8b2] text-[#414b23] text-[12px] font-semibold px-2.5 py-1 rounded-md">
                  #{allergen}
                </span>
              ))}
              
              {hasDinnerAllergy && (
                <span className="bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  알러지 주의
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Nutritional Analysis / Action Section */}
      <section className="px-5">
        <div className="bg-[#3c5500]/10 rounded-[24px] p-5 flex items-center justify-between border border-[#3c5500]/10">
          <div>
            <h4 className="text-[14px] font-bold text-[#3c5500]">영양 성분 분석</h4>
            <p className="text-[12px] text-[#444939] mt-1 font-medium">
              {proteinPercent >= 80 
                ? "오늘 하루 단백질 섭취 조건이 충분하고 훌륭합니다!" 
                : `금일 권장 단백질 섭취 달성률 ${proteinPercent}% 기록 중입니다.`}
            </p>
          </div>
          <button 
            onClick={() => onTabChange("nutrition")}
            className="bg-[#3c5500] text-white w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
          </button>
        </div>
      </section>
    </div>
  );
}
