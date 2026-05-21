import React, { useState, useEffect } from "react";
import { MealData } from "../types";
import { getTodayKST, formatDateKey, getDefaultSelectedDate } from "../utils/dateUtils";
import { getMealDishesDetail, DishItem } from "../data/mockMeals";

interface NutritionViewProps {
  meals: MealData[];
}

export default function NutritionView({ meals }: NutritionViewProps) {
  const today = getTodayKST();
  const targetDate = getDefaultSelectedDate(today);
  const targetDateKey = formatDateKey(targetDate);

  // 오늘(혹은 다음 급식일)의 중식 메뉴 가져오기
  const todayLunch = meals.find(
    (m) => m.dateKey === targetDateKey && m.mealType === "중식"
  ) || meals[0];

  // 중식 메뉴 dishes 분해하여 개별 반찬 목록 생성
  const [dishItems, setDishItems] = useState<DishItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (todayLunch) {
      const details = getMealDishesDetail(todayLunch.dishes);
      setDishItems(details);
      // 기본적으로 오늘날짜 중식의 모든 메뉴를 기본 선택 상태로 구성
      setSelectedItems(details.map((d) => d.name));
    }
  }, [meals, targetDateKey]);

  // 선택된 메뉴들의 실시간 영양 합계 계산
  const totals = dishItems.reduce(
    (acc, cur) => {
      if (selectedItems.includes(cur.name)) {
        acc.calories += cur.calories;
        acc.protein += cur.nutrition.protein;
        acc.carbs += cur.nutrition.carbs;
        acc.fat += cur.nutrition.fat;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 영양 목표 (고등학생 1식 권장 타겟 예시 - 프로틴 25g, 탄수 100g, 지방 20g)
  const targetNutrition = {
    protein: 35,
    carbs: 110,
    fat: 25,
  };

  const getPercent = (value: number, target: number) => {
    return Math.min(Math.round((value / target) * 100), 100);
  };

  const toggleItem = (name: string) => {
    if (selectedItems.includes(name)) {
      setSelectedItems(selectedItems.filter((item) => item !== name));
    } else {
      setSelectedItems([...selectedItems, name]);
    }
  };

  // 카테고리 필터링
  const filteredDishes = dishItems.filter((dish) => {
    if (selectedCategory === "전체") return true;
    return dish.category === selectedCategory;
  });

  const handleSaveResult = () => {
    // 로컬스토리지 저장 및 완료 피드백
    const saveObj = {
      date: formatDateKey(targetDate),
      calories: totals.calories,
      nutrition: {
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
      },
      savedAt: new Date().toISOString()
    };
    localStorage.setItem("nutri_calc_result", JSON.stringify(saveObj));
    
    setToastMessage("계산 결과가 성공적으로 저장되었습니다!");
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-40">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3c5500] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="text-[14px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Summary Bento Card */}
      <section className="px-5 pt-4">
        <div className="bg-white rounded-[32px] p-6 card-shadow border border-[#c4c9b4]/10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[14px] font-semibold text-[#444939] mb-1">오늘의 선택 영양</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-bold text-[#3c5500] leading-none">{totals.calories}</span>
                <span className="text-[14px] font-semibold text-[#444939]">kcal</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#d2ea7a] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[#576a00] text-[24px]">calculate</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#444939]">단백질 {totals.protein}g</span>
              <div className="h-1.5 w-full bg-[#f8ecdc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3c5500] rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(totals.protein, targetNutrition.protein)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#444939]">탄수 {totals.carbs}g</span>
              <div className="h-1.5 w-full bg-[#f8ecdc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#536500] rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(totals.carbs, targetNutrition.carbs)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#444939]">지방 {totals.fat}g</span>
              <div className="h-1.5 w-full bg-[#f8ecdc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#606a3f] rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(totals.fat, targetNutrition.fat)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips Scroll */}
      <section className="overflow-x-auto custom-scrollbar px-5">
        <div className="flex gap-2 whitespace-nowrap">
          {["전체", "밥류", "국/찌개", "반찬", "디저트"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 active:scale-95 ${
                selectedCategory === cat
                  ? "bg-[#3c5500] text-white shadow-sm"
                  : "bg-[#f3e6d7] text-[#444939] hover:bg-[#ede1d1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Cards Grid */}
      <section className="flex flex-col gap-4 px-5">
        {filteredDishes.length > 0 ? (
          filteredDishes.map((dish) => {
            const isSelected = selectedItems.includes(dish.name);
            return (
              <div
                key={dish.name}
                onClick={() => toggleItem(dish.name)}
                className={`p-5 rounded-[24px] card-shadow flex justify-between items-center transition-all cursor-pointer active:scale-[0.98] border-2 ${
                  isSelected
                    ? "bg-white border-[#3c5500]"
                    : "bg-white border-[#c4c9b4]/10 hover:border-[#3c5500]/35"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#f8ecdc] flex items-center justify-center overflow-hidden border border-[#c4c9b4]/10">
                    <img
                      alt={dish.name}
                      className="w-full h-full object-cover"
                      src={dish.imageUrl}
                    />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[#201b11]">{dish.name}</h3>
                    <p className="text-[12px] font-semibold text-[#444939] mt-0.5">
                      {dish.calories} kcal / 단백질 {dish.nutrition.protein}g / 탄수 {dish.nutrition.carbs}g
                    </p>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-[#3c5500] text-white scale-110"
                      : "border border-[#c4c9b4]"
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-[#444939] bg-white rounded-2xl border border-[#c4c9b4]/10">
            해당 카테고리의 밥 반찬류가 없습니다.
          </div>
        )}
      </section>

      {/* Sticky Bottom Storage Button */}
      <div className="fixed bottom-24 left-0 w-full px-5 z-40">
        <button
          onClick={handleSaveResult}
          className="w-full bg-[#3c5500] text-white h-14 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-95 transition-all focus:outline-none"
        >
          <span className="material-symbols-outlined font-bold">save</span>
          계산 결과 저장하기
        </button>
      </div>
    </div>
  );
}
