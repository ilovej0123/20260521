import React from "react";

interface AppHeaderProps {
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  showSettingsIcon?: boolean;
}

export default function AppHeader({
  onNotificationClick,
  onSettingsClick,
  showSettingsIcon = false,
}: AppHeaderProps) {
  return (
    <header className="flex justify-between items-center w-full px-5 h-14 sticky top-0 z-50 bg-[#fff8f3]/80 backdrop-blur-md border-b border-[#c4c9b4]/10">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#3c5500] text-[24px]">restaurant</span>
        <h1 className="text-[20px] font-bold text-[#3c5500] tracking-tight">씨마스고등학교 급식</h1>
      </div>
      <div className="flex items-center gap-1">
        {showSettingsIcon ? (
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center w-10 h-10 hover:opacity-80 active:scale-95 transition-all text-[#444939]"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        ) : (
          <button
            onClick={onNotificationClick}
            className="flex items-center justify-center w-10 h-10 hover:opacity-80 active:scale-95 transition-all text-[#444939]"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
}
