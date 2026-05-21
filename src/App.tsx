import React, { useState, useMemo } from "react";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import HomeView from "./components/HomeView";
import ScheduleView from "./components/ScheduleView";
import NutritionView from "./components/NutritionView";
import ProfileView from "./components/ProfileView";
import { TabType, UserAllergy } from "./types";
import { generateMockMeals } from "./data/mockMeals";
import { getTodayKST } from "./utils/dateUtils";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  
  // 알레르기 관리 기본 상태 정의 (우유, 땅콩을 기본 알레르기로 설정)
  const [userAllergies, setUserAllergies] = useState<UserAllergy[]>([
    { name: "우유", enabled: true },
    { name: "땅콩", enabled: true },
  ]);

  // 실행 시점의 당일 날짜(KST)를 기준으로 5일치 동적 급식 식단 생성
  const today = useMemo(() => getTodayKST(), []);
  const meals = useMemo(() => generateMockMeals(today), [today]);

  // 활성화된 탭 화면을 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            meals={meals}
            userAllergies={userAllergies}
            onTabChange={setActiveTab}
          />
        );
      case "schedule":
        return <ScheduleView meals={meals} />;
      case "nutrition":
        return <NutritionView meals={meals} />;
      case "profile":
        return (
          <ProfileView
            userAllergies={userAllergies}
            setUserAllergies={setUserAllergies}
          />
        );
      default:
        return <HomeView meals={meals} userAllergies={userAllergies} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#201b11] font-sans antialiased flex justify-center">
      {/* 390px ~ 420px 모바일 피포트 레이아웃 최적화 */}
      <div className="w-full max-w-[420px] bg-[#fff8f3] min-h-screen relative shadow-2xl overflow-x-hidden border-x border-[#c4c9b4]/10">
        
        {/* 공통 AppHeader (프로필 탭일 때만 우측 톱니바퀴 설정 아이콘 노출) */}
        <AppHeader
          showSettingsIcon={activeTab === "profile"}
          onNotificationClick={() => alert("جديد! 알림 내역이 비어 있습니다.")}
          onSettingsClick={() => alert("설정 메뉴 정보 수정 기능은 차기 업데이트에 적용됩니다.")}
        />

        {/* 탭 컨텐츠 */}
        <main className="w-full min-h-[calc(100vh-112px)]">
          {renderTabContent()}
        </main>

        {/* 하단 단독 알약 탭 내비게이션 바 */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
