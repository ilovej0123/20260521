import React from "react";
import { TabType } from "../types";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: "home" as TabType, label: "홈", icon: "home" },
    { id: "schedule" as TabType, label: "식단표", icon: "calendar_month" },
    { id: "nutrition" as TabType, label: "영양계산", icon: "calculate" },
    { id: "profile" as TabType, label: "프로필", icon: "person" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-[#fff8f3]/90 backdrop-blur-lg border-t border-[#c4c9b4]/20 shadow-lg rounded-t-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-[#3c5500] text-white rounded-full px-5 py-1.5 shadow-md scale-105"
                : "text-[#444939] px-4 py-1.5 hover:bg-[#ede1d1]/50 rounded-full"
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span className="text-[12px] font-medium mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
