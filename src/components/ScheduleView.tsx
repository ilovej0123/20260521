import React, { useState, useEffect } from "react";
import { MealData } from "../types";
import {
  getTodayKST,
  getWeekDates,
  getWeekOfMonth,
  getDefaultSelectedDate,
  getKoreanDayOfWeek,
  formatDateKey,
} from "../utils/dateUtils";

interface ScheduleViewProps {
  meals: MealData[];
}

export default function ScheduleView({ meals }: ScheduleViewProps) {
  const today = getTodayKST();
  
  // 기본 선택 일자 구하기 (평일은 오늘, 주말인 경우 월요일)
  const initialDate = getDefaultSelectedDate(today);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const activeDateKey = formatDateKey(selectedDate);

  // 이번 주의 월요일~금요일 구하기 (selectedDate 기준 혹은 오늘 기준)
  // 사용자의 요소를 만족하기 위해, 오늘을 기점으로 한 '이번 주' 고정 월~금을 구합니다.
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    // 오늘 날짜가 속한 주의 월요일부터 금요일까지 5일치 구하기
    const dates = getWeekDates(today);
    setWeekDates(dates);
  }, []);

  // 피선택일의 중식/석식 데이터 필터링
  const selectedLunch = meals.find(
    (m) => m.dateKey === activeDateKey && m.mealType === "중식"
  );
  const selectedDinner = meals.find(
    (m) => m.dateKey === activeDateKey && m.mealType === "석식"
  );

  // M월 N주차 계산
  const weekTitle = getWeekOfMonth(selectedDate);

  // 단백질 권장 달성률 계산 (한 끼 목표 단백질량 대략 30g 기준)
  const calcProteinRate = (protein: number) => {
    const rate = Math.round((protein / 30) * 100);
    return Math.min(rate, 100);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn px-5 pt-4 pb-32">
      {/* 주간 헤더 정보 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#444939] font-semibold">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span className="text-[14px]">주간 식단표</span>
        </div>
        <h2 className="text-[32px] font-bold text-[#201b11] leading-tight tracking-tight">
          {weekTitle}
        </h2>
      </section>

      {/* Date Selector (월~금 동적 생성) */}
      <nav className="flex justify-between items-center bg-[#fef2e2] p-2 rounded-xl border border-[#c4c9b4]/10">
        {weekDates.map((dateObj) => {
          const isSelected = formatDateKey(dateObj) === activeDateKey;
          const dayName = getKoreanDayOfWeek(dateObj);
          const dayNum = dateObj.getDate();

          return (
            <button
              key={formatDateKey(dateObj)}
              onClick={() => setSelectedDate(dateObj)}
              className={`flex flex-col items-center justify-center w-14 py-3 rounded-lg transition-all duration-300 ${
                isSelected
                  ? "bg-[#3c5500] text-white shadow-md transform scale-105"
                  : "text-[#444939] hover:bg-[#ede1d1]/50"
              }`}
            >
              <span className="text-[12px] font-semibold">{dayName}</span>
              <span className="text-[20px] font-bold mt-0.5">{dayNum}</span>
            </button>
          );
        })}
      </nav>

      {/* 중식 카드 */}
      {selectedLunch ? (
        <article className="bg-[#ffffff] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(79,111,0,0.08)] flex flex-col gap-4 border border-[#c4c9b4]/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[13px] font-bold text-[#3c5500] px-3.5 py-1.5 bg-[#d2ea7a] rounded-full">
                중식
              </span>
              <h3 className="text-[20px] font-bold text-[#201b11] mt-3">
                {selectedLunch.title}
              </h3>
            </div>
            <span className="text-[14px] font-semibold text-[#444939]">
              {selectedLunch.totalCalories} kcal
            </span>
          </div>

          <div className="h-px bg-[#c4c9b4]/20 w-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-[15px] text-[#201b11] leading-relaxed font-medium">
                {selectedLunch.dishes.join(", ")}
              </p>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedLunch.allergens.map((allergen, idx) => (
                  <span
                    key={idx}
                    className="text-[12px] font-semibold bg-[#f8ecdc] px-2.5 py-1 rounded-full text-[#444939] border border-[#c4c9b4]/20"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>

            {selectedLunch.imageUrl && (
              <div className="relative rounded-xl overflow-hidden aspect-video h-28 hidden xs:block self-center">
                <img
                  alt={selectedLunch.title}
                  className="object-cover w-full h-full"
                  src={selectedLunch.imageUrl}
                />
              </div>
            )}
          </div>

          {/* Protein Progress */}
          <div className="bg-[#fff8f3] rounded-xl p-3 border border-[#c4c9b4]/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-semibold text-[#3c5500]">단백질 달성률</span>
              <span className="text-[12px] font-bold text-[#3c5500]">
                {calcProteinRate(selectedLunch.nutrition.protein)}% ({selectedLunch.nutrition.protein}g)
              </span>
            </div>
            <div className="w-full bg-[#c4c9b4]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#3c5500] h-full rounded-full transition-all duration-500"
                style={{ width: `${calcProteinRate(selectedLunch.nutrition.protein)}%` }}
              ></div>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-[#444939] shadow-sm border border-[#c4c9b4]/10">
          이 날은 급식 중식 일정이 없습니다.
        </div>
      )}

      {/* 석식 카드 */}
      {selectedDinner ? (
        <article className="bg-[#ffffff] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(79,111,0,0.08)] flex flex-col gap-4 border border-[#c4c9b4]/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[13px] font-bold text-[#485229] px-3.5 py-1.5 bg-[#dde8b2] rounded-full">
                석식
              </span>
              <h3 className="text-[20px] font-bold text-[#201b11] mt-3">
                {selectedDinner.title}
              </h3>
            </div>
            <span className="text-[14px] font-semibold text-[#444939]">
              {selectedDinner.totalCalories} kcal
            </span>
          </div>

          <div className="h-px bg-[#c4c9b4]/20 w-full"></div>

          <div className="space-y-3">
            <p className="text-[15px] text-[#201b11]/90 leading-relaxed font-medium">
              {selectedDinner.dishes.join(", ")}
            </p>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedDinner.allergens.map((allergen, idx) => (
                <span
                  key={idx}
                  className="text-[12px] font-semibold bg-[#f8ecdc] px-2.5 py-1 rounded-full text-[#444939] border border-[#c4c9b4]/20"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>

          {/* Protein Progress */}
          <div className="bg-[#fff8f3] rounded-xl p-3 border border-[#c4c9b4]/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-semibold text-[#485229]">단백질 달성률</span>
              <span className="text-[12px] font-bold text-[#485229]">
                {calcProteinRate(selectedDinner.nutrition.protein)}% ({selectedDinner.nutrition.protein}g)
              </span>
            </div>
            <div className="w-full bg-[#c4c9b4]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#485229] h-full rounded-full transition-all duration-500"
                style={{ width: `${calcProteinRate(selectedDinner.nutrition.protein)}%` }}
              ></div>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-[#444939] shadow-sm border border-[#c4c9b4]/10">
          이 날은 급식 석식 일정이 없습니다.
        </div>
      )}
    </div>
  );
}
