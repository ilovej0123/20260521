/**
 * KST (Korea Standard Time) Date utility functions
 */

// KST 시간 기준으로 오늘 날짜 반환
export function getTodayKST(): Date {
  const d = new Date();
  // UTC 시간으로 환산 후 KST (+9시간) 오프셋 가산
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 60 * 60000);
}

// "M월 D일 요일" 형식으로 포맷팅 (예: "5월 15일 금요일")
export function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const dayName = dayNames[date.getDay()];
  return `${month}월 ${day}일 ${dayName}`;
}

// "YYYYMMDD" 형식으로 포맷팅 (예: "20260515")
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 해당 날짜가 포함된 주의 월요일~금요일 Date 5개 배열 반환
export function getWeekDates(date: Date): Date[] {
  const currentDay = date.getDay(); // 0: 일, 1: 월, ..., 6: 토
  // 월요일과의 일수 차이 계산
  // 일요일(0)인 경우 월요일은 -6일 차이, 그 외는 1 - currentDay 차이
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

// 해당 날짜가 해당 월의 몇 주차인지 계산 (예: "5월 3주차")
export function getWeekOfMonth(date: Date): string {
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  
  // 1일 구하기
  const firstDayOfMonth = new Date(currentYear, date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
  
  // 월요일 시작 기준으로 요일 인덱스 변환 (월:0, 화:1, ..., 일:6)
  const adjustedDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const weekNumber = Math.ceil((date.getDate() + adjustedDay) / 7);
  
  return `${currentMonth}월 ${weekNumber}주차`;
}

// 기본 선택 날짜 구하기 (평일은 오늘, 주말인 경우 다음 월요일 반환 - 방식 B에 최적화)
export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay();
  if (day === 6) { // 토요일 -> 다음 월요일 (+2일)
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + 2);
    return nextMonday;
  } else if (day === 0) { // 일요일 -> 다음 월요일 (+1일)
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + 1);
    return nextMonday;
  }
  return today;
}

// 요일(0~6)을 한 글자 한글 요일로 변환
export function getKoreanDayOfWeek(date: Date): string {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return dayNames[date.getDay()];
}
