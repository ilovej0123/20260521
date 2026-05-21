import React, { useState } from "react";
import { UserAllergy } from "../types";

interface ProfileViewProps {
  userAllergies: UserAllergy[];
  setUserAllergies: React.Dispatch<React.SetStateAction<UserAllergy[]>>;
}

export default function ProfileView({ userAllergies, setUserAllergies }: ProfileViewProps) {
  const [allergyAlert, setAllergyAlert] = useState<boolean>(true);
  const [dailyAlert, setDailyAlert] = useState<boolean>(true);
  
  // 알러지 풀 (추가 가능 품목)
  const allergyCandidates = ["대두", "밀", "쇠고기", "돼지고기", "닭고기", "난류", "새우", "복숭아", "토마토"];
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const toggleAllergy = (name: string) => {
    setUserAllergies((prev) =>
      prev.map((a) => (a.name === name ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const removeAllergy = (name: string) => {
    setUserAllergies((prev) => prev.filter((a) => a.name !== name));
  };

  const addAllergy = (name: string) => {
    if (userAllergies.some((a) => a.name === name)) {
      // 이미 존재하는 경우 활성화만 시킴
      setUserAllergies((prev) =>
        prev.map((a) => (a.name === name ? { ...a, enabled: true } : a))
      );
    } else {
      setUserAllergies((prev) => [...prev, { name, enabled: true }]);
    }
    setShowAddMenu(false);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn px-5 pt-4 pb-32">
      {/* Profile Card */}
      <section className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-[#d5ed7d] to-[#add463] shadow-lg border border-[#c4c9b4]/10">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <img
              alt="김학생 Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white/50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK5u4QLNAuiD0fd6nuzbSEC2Wg8JllLuirgI-Yc9H6gkw9K_QoNzic1B2DuGJt_hXXrjnMIibnunG5RFSUzLmvxv1XSiJXxtXhmOl_QQrlHGwhZCzDZ2IPAewnrnlNsCyOe9xShnynTh6gjS9b1bwP3X0CkW-FUIn5J-lVH_EMSurIoGJxIIGPZlbthmIdZ4nQCN7Q31x5ARP8Sc6RQ-TIeJc7OBsqQuhQHghwd8N1dkCZUQqONQpc1Q15Og2GUWDH2kHhjIRcS1s"
            />
            <button className="absolute bottom-0 right-0 bg-white text-[#3c5500] p-1 rounded-full shadow-md flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform focus:outline-none">
              <span className="material-symbols-outlined !text-[18px]">edit</span>
            </button>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[24px] font-bold text-[#141f00]">김학생</h2>
            <p className="text-[15px] text-[#364e00] opacity-80 font-medium">2학년 3반 15번</p>
          </div>
        </div>
      </section>

      {/* Settings Panel */}
      <section className="space-y-4">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#c4c9b4]/10 space-y-5">
          {/* Allergy Notification Settings */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#201b11] font-semibold">
                <span className="material-symbols-outlined text-[#3c5500]">warning</span>
                <span className="text-[14px]">알레르기 경고 알림</span>
              </div>
              <button
                onClick={() => setAllergyAlert(!allergyAlert)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  allergyAlert ? "bg-[#3c5500]" : "bg-[#c4c9b4]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                    allergyAlert ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Allergy Chips List */}
            {allergyAlert && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {userAllergies.map((allergy) => (
                  <span
                    key={allergy.name}
                    onClick={() => toggleAllergy(allergy.name)}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer border transition-all duration-200 ${
                      allergy.enabled
                        ? "bg-[#d2ea7a] text-[#576a00] border-transparent shadow-sm"
                        : "bg-[#f8ecdc]/50 text-[#444939]/50 border-[#c4c9b4]/20"
                    }`}
                  >
                    {allergy.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAllergy(allergy.name);
                      }}
                      className="hover:text-red-500 font-bold flex items-center justify-center focus:outline-none"
                    >
                      <span className="material-symbols-outlined !text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="border border-[#c4c9b4] text-[#747967] px-3.5 py-1 rounded-full text-[12px] font-bold hover:bg-[#f3e6d7] transition-colors focus:outline-none"
                >
                  + 추가
                </button>
              </div>
            )}

            {/* Allergy Selector dropdown popup inline */}
            {showAddMenu && (
              <div className="bg-[#fff8f3] border border-[#c4c9b4]/30 rounded-xl p-3 mt-2 grid grid-cols-3 gap-1.5 animate-fadeIn">
                {allergyCandidates
                  .filter((name) => !userAllergies.some((ua) => ua.name === name && ua.enabled))
                  .map((name) => (
                    <button
                      key={name}
                      onClick={() => addAllergy(name)}
                      className="bg-white hover:bg-[#d5ed7d] hover:text-[#3c5500] text-[#444939] text-[12px] font-semibold py-2 px-1.5 rounded-lg border border-[#c4c9b4]/10 text-center transition-all focus:outline-none"
                    >
                      {name}
                    </button>
                  ))}
                {allergyCandidates.filter((name) => !userAllergies.some((ua) => ua.name === name && ua.enabled)).length === 0 && (
                  <p className="text-[12px] text-gray-400 text-center col-span-3 py-2">추가할 수 있는 항목이 없습니다.</p>
                )}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-[#c4c9b4]/20"></div>

          {/* Daily Alert Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#201b11] font-semibold">
              <span className="material-symbols-outlined text-[#3c5500]">notifications_active</span>
              <span className="text-[14px]">일일 식단 알림</span>
            </div>
            <button
              onClick={() => setDailyAlert(!dailyAlert)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                dailyAlert ? "bg-[#3c5500]" : "bg-[#c4c9b4]"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                  dailyAlert ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* List Menu Action Buttons */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#c4c9b4]/10">
          <button className="w-full flex items-center justify-between p-5 hover:bg-[#fff8f3] transition-colors active:scale-[0.99] focus:outline-none">
            <div className="flex items-center gap-2 text-[#201b11] font-semibold">
              <span className="material-symbols-outlined text-[#444939]">support_agent</span>
              <span className="text-[14px]">고객센터 / 문의하기</span>
            </div>
            <span className="material-symbols-outlined text-[#747967]">chevron_right</span>
          </button>
          
          <div className="mx-5 h-[1px] bg-[#c4c9b4]/20"></div>
          
          <button className="w-full flex items-center justify-between p-5 hover:bg-[#fff8f3] transition-colors active:scale-[0.99] focus:outline-none">
            <div className="flex items-center gap-2 text-[#201b11] font-semibold">
              <span className="material-symbols-outlined text-[#444939]">description</span>
              <span className="text-[14px]">이용약관</span>
            </div>
            <span className="material-symbols-outlined text-[#747967]">chevron_right</span>
          </button>
          
          <div className="mx-5 h-[1px] bg-[#c4c9b4]/20"></div>
          
          <button className="w-full flex items-center justify-between p-5 hover:bg-[#fff8f3] transition-colors active:scale-[0.99] focus:outline-none text-red-600">
            <div className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-red-500">logout</span>
              <span className="text-[14px]">로그아웃</span>
            </div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-12 text-center">
        <p className="text-[12px] font-semibold text-[#747967]/75 px-5 leading-relaxed">
          © 2026 씨마스고등학교 급식. <br />
          건강하고 안전하며 맛있는 학교 식생활 환경을 지원합니다.
        </p>
      </footer>
    </div>
  );
}
