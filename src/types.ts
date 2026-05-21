export interface MealNutrition {
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
}

export interface MealData {
  id: string;
  schoolName: string; // "씨마스고등학교"
  date: string;       // "M월 D일 요일" 형태 (동적 생성)
  dateKey: string;    // "YYYYMMDD"
  dayOfWeek: string;  // "월" | "화" | "수" | "목" | "금"
  mealType: "중식" | "석식";
  title: string;
  dishes: string[];
  totalCalories: number;
  nutrition: MealNutrition;
  allergens: string[];
  imageUrl?: string;
}

export type TabType = "home" | "schedule" | "nutrition" | "profile";

export interface UserAllergy {
  name: string;
  enabled: boolean;
}
