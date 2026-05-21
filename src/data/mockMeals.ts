import { getWeekDates, formatKoreanDate, formatDateKey } from "../utils/dateUtils";
import { MealData } from "../types";

export interface DishItem {
  name: string;
  category: "밥류" | "국/찌개" | "반찬" | "디저트";
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl: string;
}

// 식단 메뉴에서 밥, 국/찌개, 반찬, 디저트 카테고리를 자동 분석하여 매핑하는 유틸
export function getDishCategory(dishName: string): "밥류" | "국/찌개" | "반찬" | "디저트" {
  const name = dishName.trim();
  if (name.includes("밥") || name.includes("죽") || name.includes("덮밥") || name.includes("오므라이스") || name.includes("필라프") || name.includes("스파게티") || name.includes("파스타") || name.includes("조각피자")) {
    return "밥류";
  }
  if (name.includes("국") || name.includes("탕") || name.includes("찌개") || name.includes("스프") || name.includes("조개탕") || name.includes("미역국") || name.includes("장국")) {
    return "국/찌개";
  }
  if (name.includes("음료") || name.includes("요구르트") || name.includes("에이드") || name.includes("쥬스") || name.includes("콘드레싱") || name.includes("푸딩") || name.includes("샐러드") || name.includes("피클") || name.includes("단무지") || name.includes("깍두기") || name.includes("김치") || name.includes("드레싱")) {
    return "디저트";
  }
  return "반찬";
}

// 대표 찬류별 기본 영양 및 이미지 정보 매핑 데이터베이스
const dishMetaDb: Record<string, { calories: number; nutrition: { protein: number; carbs: number; fat: number }; imageUrl: string }> = {
  "친환경현미밥": {
    calories: 300,
    nutrition: { protein: 6, carbs: 60, fat: 1.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "쇠고기미역국": {
    calories: 120,
    nutrition: { protein: 8, carbs: 6, fat: 4 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "매콤돈육강정": {
    calories: 350,
    nutrition: { protein: 18, carbs: 32, fat: 12 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "숙주미나리무침": {
    calories: 45,
    nutrition: { protein: 2, carbs: 8, fat: 0.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "배추김치": {
    calories: 30,
    nutrition: { protein: 1.5, carbs: 5, fat: 0.2 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "혼합잡곡밥": {
    calories: 290,
    nutrition: { protein: 6.5, carbs: 58, fat: 1.2 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "돈육김치찌개": {
    calories: 220,
    nutrition: { protein: 14, carbs: 12, fat: 11 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "수제함박스테이크": {
    calories: 380,
    nutrition: { protein: 22, carbs: 15, fat: 20 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMRdII2dPVI0-hOIyH3rYQ1n9cn3B_1HGgHZcm9SbQ5XoKx2LdIpTIN-MsHS1BsTIJsyrhxfUl_Ee7VsTq5zEZff58PXdEpO1ruSU093KD1YjnH69JFpK0-OybTjpdiTrSeqGNTeUmVDk8MAQHV9347vfeI74cY0o5N1_z930HCdo52SOEi8N5RIbH8-Plx7rH9FV52IZkEgzoQN_cbvLpzZ_sgMSKUJMq6o0DDrPWDQpHMpeP6_dQ5ZZg4p0O_VGC6JH74afd0cY"
  },
  "참치마요덮밥": {
    calories: 520,
    nutrition: { protein: 15, carbs: 75, fat: 16 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMRdII2dPVI0-hOIyH3rYQ1n9cn3B_1HGgHZcm9SbQ5XoKx2LdIpTIN-MsHS1BsTIJsyrhxfUl_Ee7VsTq5zEZff58PXdEpO1ruSU093KD1YjnH69JFpK0-OybTjpdiTrSeqGNTeUmVDk8MAQHV9347vfeI74cY0o5N1_z930HCdo52SOEi8N5RIbH8-Plx7rH9FV52IZkEgzoQN_cbvLpzZ_sgMSKUJMq6o0DDrPWDQpHMpeP6_dQ5ZZg4p0O_VGC6JH74afd0cY"
  },
  "미니우동": {
    calories: 180,
    nutrition: { protein: 5, carbs: 32, fat: 1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "추억의돈까스밥": {
    calories: 120,
    nutrition: { protein: 2, carbs: 26, fat: 0.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "치즈돈까스": {
    calories: 420,
    nutrition: { protein: 24, carbs: 28, fat: 23 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "가쓰오우동국": {
    calories: 90,
    nutrition: { protein: 3, carbs: 12, fat: 0.8 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "도토리묵무침": {
    calories: 65,
    nutrition: { protein: 1.2, carbs: 14, fat: 0.6 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "한방소갈비찜": {
    calories: 320,
    nutrition: { protein: 26, carbs: 12, fat: 18 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "보리밥": {
    calories: 280,
    nutrition: { protein: 5.5, carbs: 55, fat: 1.0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "춘천닭갈비": {
    calories: 280,
    nutrition: { protein: 22, carbs: 16, fat: 14 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "흑미밥": {
    calories: 295,
    nutrition: { protein: 6.2, carbs: 59, fat: 1.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "청포묵김가루무침": {
    calories: 50,
    nutrition: { protein: 0.8, carbs: 11, fat: 0.2 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "요구르트": {
    calories: 45,
    nutrition: { protein: 0.5, carbs: 11, fat: 0.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "콘드레싱": {
    calories: 80,
    nutrition: { protein: 0.5, carbs: 8, fat: 5.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "양배추샐러드": {
    calories: 40,
    nutrition: { protein: 1.1, carbs: 8, fat: 0.3 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "석박지": {
    calories: 25,
    nutrition: { protein: 1, carbs: 5, fat: 0.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "단무지": {
    calories: 15,
    nutrition: { protein: 0.2, carbs: 3.5, fat: 0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "맑은오뎅국": {
    calories: 110,
    nutrition: { protein: 6, carbs: 12, fat: 3.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "순두부맑은국": {
    calories: 85,
    nutrition: { protein: 7, carbs: 5, fat: 3.2 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "수제피클": {
    calories: 20,
    nutrition: { protein: 0.3, carbs: 4.5, fat: 0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "삼치데리야끼구이": {
    calories: 210,
    nutrition: { protein: 19, carbs: 3, fat: 12 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "김자반": {
    calories: 45,
    nutrition: { protein: 1.5, carbs: 5, fat: 2.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "총각김치": {
    calories: 25,
    nutrition: { protein: 1, carbs: 4.8, fat: 0.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "고등어구이": {
    calories: 250,
    nutrition: { protein: 21, carbs: 0, fat: 16 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "시금치나물": {
    calories: 45,
    nutrition: { protein: 2.2, carbs: 6, fat: 0.8 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "돼지고기김치찌개": {
    calories: 250,
    nutrition: { protein: 16, carbs: 10, fat: 14 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "현미밥": {
    calories: 300,
    nutrition: { protein: 6, carbs: 60, fat: 1.5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "맑은계란국": {
    calories: 80,
    nutrition: { protein: 5, carbs: 4, fat: 5 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "연두부구이": {
    calories: 90,
    nutrition: { protein: 8, carbs: 6, fat: 4 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "깍두기": {
    calories: 25,
    nutrition: { protein: 1, carbs: 5, fat: 0.1 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "복숭아에이드": {
    calories: 75,
    nutrition: { protein: 0, carbs: 18, fat: 0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  },
  "오므라이스": {
    calories: 480,
    nutrition: { protein: 14, carbs: 70, fat: 12 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "새우튀김&타르타르": {
    calories: 190,
    nutrition: { protein: 8, carbs: 14, fat: 11 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
  },
  "피클": {
    calories: 15,
    nutrition: { protein: 0.1, carbs: 3.5, fat: 0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"
  },
  "베이컨마늘파스타": {
    calories: 450,
    nutrition: { protein: 14, carbs: 68, fat: 15 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "양송이스프": {
    calories: 130,
    nutrition: { protein: 3.5, carbs: 12, fat: 8 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
  },
  "마늘빵": {
    calories: 110,
    nutrition: { protein: 3, carbs: 18, fat: 3 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y"
  },
  "감귤쥬스": {
    calories: 60,
    nutrition: { protein: 0.5, carbs: 14, fat: 0 },
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
  }
};

// 특정 식단(dishes)을 받아서 개별 찬류 DishItem[]로 변환해 주는 헬퍼
export function getMealDishesDetail(dishes: string[]): DishItem[] {
  return dishes.map(dish => {
    // 특수기호 제거 및 공백 정규화
    const normalizedName = dish.trim().replace(/\s+/g, '');
    
    // DB 조회
    let meta = dishMetaDb[normalizedName];
    
    // 키워드로 대략 매핑 시도
    if (!meta) {
      const keys = Object.keys(dishMetaDb);
      const foundKey = keys.find(k => normalizedName.includes(k) || k.includes(normalizedName));
      if (foundKey) {
        meta = dishMetaDb[foundKey];
      }
    }
    
    // 폴백 기본값 생성
    if (!meta) {
      const cat = getDishCategory(dish);
      let calTemp = 100;
      let nutTemp = { protein: 4, carbs: 15, fat: 2 };
      
      if (cat === "밥류") {
        calTemp = 300;
        nutTemp = { protein: 6, carbs: 60, fat: 1.5 };
      } else if (cat === "국/찌개") {
        calTemp = 130;
        nutTemp = { protein: 9, carbs: 10, fat: 5 };
      } else if (cat === "디저트") {
        calTemp = 50;
        nutTemp = { protein: 0.5, carbs: 12, fat: 0.1 };
      } else {
        calTemp = 110;
        nutTemp = { protein: 8, carbs: 6, fat: 6 };
      }
      
      // 적당한 기본 이미지 배정
      let fallbackImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIX3xrv0aOg423BDrUcNllUw-ESIxfs2KKyuN7ao6lTMjpyrL7NGA9h-GC3ylr1eXs3OqDTndWCpdmCFGRz6R7-n1RaE2CD65_tX3H2yFk3Spjy0jiJheDjXL8t5dD5eh6cBEsS5OKcYGvTLaVZ2u_UV48yKxzRX1j5GhYLSKDqImv7QAVn9p6e5mgrw9VqCkowQm-bYQ0v6JancvKAuET7B22btWjqYmcVFuW1Uiq6cIvH-F3PCzNQCviqYMVwzpR9fwWY4YrMo"; // 기본 시금치나물 이미지
      if (cat === "밥류") {
        fallbackImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wtJvxKrqc_VfiHgR4hCV6iGcP7GGXlj52faE-GAVtuwu-_ROi-BZofzMvYzcw3bdToURcLBZXU7ck-55g26JviGsIj3ydw8u1peMglhqxKXvv86fP7q3aDIPUZWTK6CuzvxIkqUnSmO7IPGhBfbSagDfIr4bFqFLBIUh_Pk2F2WPAguw3xY7u-9UQFM2JJWT5ndX-iaftai2GbBw2wFr8z7DWoBEL5DhlOFqDh3LWOLwtxw1m9e1uqv_L1dw01Bj84aQVxtr2-Y";
      } else if (cat === "국/찌개") {
        fallbackImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4";
      } else if (cat === "반찬" && (normalizedName.includes("구이") || normalizedName.includes("스테이크") || normalizedName.includes("갈비") || normalizedName.includes("닭갈비") || normalizedName.includes("돈육") || normalizedName.includes("튀김"))) {
        fallbackImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps";
      }
      
      meta = {
        calories: calTemp,
        nutrition: nutTemp,
        imageUrl: fallbackImg
      };
    }
    
    return {
      name: dish.trim(),
      category: getDishCategory(dish),
      calories: meta.calories,
      nutrition: meta.nutrition,
      imageUrl: meta.imageUrl
    };
  });
}

export function generateMockMeals(referenceDate: Date): MealData[] {
  const weekDates = getWeekDates(referenceDate); // [Mon, Tue, Wed, Thu, Fri]
  const daysOfWeek = ["월", "화", "수", "목", "금"];
  
  // 날짜별 메뉴 설정 템플릿 (식재료 기준 건강 컨셉트)
  const menuTemplates = [
    // 월요일
    {
      lunch: {
        title: "수제 함박스테이크 정식",
        dishes: ["혼합잡곡밥", "돈육김치찌개", "수제 함박스테이크", "숙주미나리무침", "깍두기", "콘드레싱"],
        totalCalories: 850,
        nutrition: { protein: 34, carbs: 105, fat: 28 },
        allergens: ["대두", "밀", "쇠고기", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMRdII2dPVI0-hOIyH3rYQ1n9cn3B_1HGgHZcm9SbQ5XoKx2LdIpTIN-MsHS1BsTIJsyrhxfUl_Ee7VsTq5zEZff58PXdEpO1ruSU093KD1YjnH69JFpK0-OybTjpdiTrSeqGNTeUmVDk8MAQHV9347vfeI74cY0o5N1_z930HCdo52SOEi8N5RIbH8-Plx7rH9FV52IZkEgzoQN_cbvLpzZ_sgMSKUJMq6o0DDrPWDQpHMpeP6_dQ5ZZg4p0O_VGC6JH74afd0cY"
      },
      dinner: {
        title: "참치마요덮밥 정식",
        dishes: ["참치마요덮밥", "미니우동", "단무지무침", "배추김치", "요구르트"],
        totalCalories: 720,
        nutrition: { protein: 24, carbs: 98, fat: 22 },
        allergens: ["난류", "우유", "대두", "밀"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMRdII2dPVI0-hOIyH3rYQ1n9cn3B_1HGgHZcm9SbQ5XoKx2LdIpTIN-MsHS1BsTIJsyrhxfUl_Ee7VsTq5zEZff58PXdEpO1ruSU093KD1YjnH69JFpK0-OybTjpdiTrSeqGNTeUmVDk8MAQHV9347vfeI74cY0o5N1_z930HCdo52SOEi8N5RIbH8-Plx7rH9FV52IZkEgzoQN_cbvLpzZ_sgMSKUJMq6o0DDrPWDQpHMpeP6_dQ5ZZg4p0O_VGC6JH74afd0cY"
      }
    },
    // 화요일
    {
      lunch: {
        title: "매콤 돈육강정 정식",
        dishes: ["친환경현미밥", "쇠고기미역국", "매콤돈육강정", "숙주미나리무침", "배추김치"],
        totalCalories: 845,
        nutrition: { protein: 32, carbs: 110, fat: 25 },
        allergens: ["대두", "밀", "쇠고기", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
      },
      dinner: {
        title: "치즈 닭갈비 덮밥",
        dishes: ["오므라이스", "맑은계란국", "연두부구이", "깍두기", "복숭아에이드"],
        totalCalories: 780,
        nutrition: { protein: 29, carbs: 104, fat: 24 },
        allergens: ["대두", "밀", "닭고기", "우유"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
      }
    },
    // 수요일 (급식 맛있는 맛보기 국보급 치돈)
    {
      lunch: {
        title: "치즈돈까스 정식",
        dishes: ["친환경현미밥", "돼지고기김치찌개", "시금치나물", "치즈돈까스", "배추김치", "단무지"],
        totalCalories: 895,
        nutrition: { protein: 35, carbs: 112, fat: 31 },
        allergens: ["난류", "우유", "대두", "밀", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
      },
      dinner: {
        title: "베이컨 알리오올리오",
        dishes: ["베이컨마늘파스타", "양송이스프", "마늘빵", "수제피클", "감귤쥬스"],
        totalCalories: 710,
        nutrition: { protein: 21, carbs: 90, fat: 28 },
        allergens: ["난류", "우유", "대두", "밀", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWETjYKoBwlU1fUWuBE0djllHJYqET4JXVC0oXh33v8vOhW4OCvDcVB3E92S2t96exJhbnVYW5B6YuBZbZXOvHJouGL0-16e6fEBbvQm_bVaMvwVNUglmQumohKqReSKP5CogPH06LDr2SJt2v8Cf6q11j1k2Yjm7V4fakarhdOCFdE8chQ96K1hs2XN3pkTSPQNPBaLG0F07XjJZFeaWhoEnq6VIScYCOexnHWrReQI-gymRtrMkGq3cHoa2xw6AR3OS-FThHrAE"
      }
    },
    // 목요일
    {
      lunch: {
        title: "한방 소갈비찜 정식",
        dishes: ["보리밥", "맑은오뎅국", "한방소갈비찜", "도토리묵무침", "배추김치"],
        totalCalories: 820,
        nutrition: { protein: 36, carbs: 98, fat: 22 },
        allergens: ["대두", "밀", "쇠고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
      },
      dinner: {
        title: "삼치데리야끼구이 정식",
        dishes: ["친환경현미밥", "돈육김치찌개", "삼치데리야끼구이", "김자반", "총각김치"],
        totalCalories: 750,
        nutrition: { protein: 31, carbs: 100, fat: 21 },
        allergens: ["대두", "밀", "쇠고기", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbTFpV7q3sXNTPC_kV-VsoAiTa6Zb1sfaaLohuQXIZWFJ55smfdQ8iKlFfyFjlrOwf_S0m78h6loZ1srrYtGna0kcobXT0CpbKJhSydbinwE2j0gzYIae1puUU39UZrilF5m5Twaq0QCfA-6iAitkskS8LQNhEF7-ONHBIkm-s8TLfHxJ2ajAbEkHzUHHVBnXO9dGp1lpCgeztEKtHgJXH_9H05bHHk4R8QQU4E0Wfcyf9ou0Qszu4Awdkrgn_j3Y13nVRcIpo2Ps"
      }
    },
    // 금요일
    {
      lunch: {
        title: "춘천 닭갈비 정식",
        dishes: ["흑미밥", "순두부맑은국", "춘천닭갈비", "청포묵김가루무침", "배추김치"],
        totalCalories: 810,
        nutrition: { protein: 33, carbs: 102, fat: 20 },
        allergens: ["대두", "밀", "닭고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
      },
      dinner: {
        title: "새우튀김 오므라이스",
        dishes: ["오므라이스", "팽이버섯된장국", "새우튀김&타르타르", "피클", "요구르트"],
        totalCalories: 790,
        nutrition: { protein: 26, carbs: 108, fat: 23 },
        allergens: ["난류", "우유", "대두", "밀", "새우"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1w9h1YFSiBt9u0VXOfNG7JSZ4uP0fUOzByEtKHDbN17aON3n4tA7Ne7wr80Iwr7nAeOO96-dczrWR_Fu_x-2hUgCb9J4vlglFeqcDVXAhgPK47X56xPIYK9iaI4bnG1ElUNH9b8_5Nj_HySfLPi97pBdz7188IcIk5DWW9wNVz0CRPGXQggVdwNKU178LXjvTfS8pMPzEbiLIlKl8LFVyW8z_WKm7vcOEgGKG_h8lBwIBd0V59kPd7-RVSfw4h24I092cp6WHu4"
      }
    }
  ];

  const meals: MealData[] = [];
  
  weekDates.forEach((date, index) => {
    const template = menuTemplates[index] || menuTemplates[0];
    const dateStr = formatKoreanDate(date);
    const dateKeyStr = formatDateKey(date);
    const dayName = daysOfWeek[index];
    
    // 중식 데이터 생성
    meals.push({
      id: `${dateKeyStr}-lunch`,
      schoolName: "씨마스고등학교",
      date: dateStr,
      dateKey: dateKeyStr,
      dayOfWeek: dayName,
      mealType: "중식",
      title: template.lunch.title,
      dishes: template.lunch.dishes,
      totalCalories: template.lunch.totalCalories,
      nutrition: template.lunch.nutrition,
      allergens: template.lunch.allergens,
      imageUrl: template.lunch.imageUrl
    });
    
    // 석식 데이터 생성
    meals.push({
      id: `${dateKeyStr}-dinner`,
      schoolName: "씨마스고등학교",
      date: dateStr,
      dateKey: dateKeyStr,
      dayOfWeek: dayName,
      mealType: "석식",
      title: template.dinner.title,
      dishes: template.dinner.dishes,
      totalCalories: template.dinner.totalCalories,
      nutrition: template.dinner.nutrition,
      allergens: template.dinner.allergens,
      imageUrl: template.dinner.imageUrl
    });
  });
  
  return meals;
}
