// 本地存储管理 - 使用 localStorage 存储所有数据

import { WrongAnswer, StudyRecord, StreakRecord, Progress, Achievement } from '@/types';

const STORAGE_KEYS = {
  WRONG_ANSWERS: 'history_wrong_answers',
  STUDY_RECORDS: 'history_study_records',
  STREAK_RECORDS: 'history_streak_records',
  PROGRESS: 'history_progress',
  DAILY_PRACTICE: 'history_daily_practice',
  CUSTOM_QUESTIONS: 'history_custom_questions',
} as const;

// 安全读取 localStorage
function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ── 错题本 ──
export function getWrongAnswers(): WrongAnswer[] {
  return safeGet<WrongAnswer[]>(STORAGE_KEYS.WRONG_ANSWERS, []);
}

export function addWrongAnswer(wa: WrongAnswer): void {
  const list = getWrongAnswers();
  // 避免重复添加完全相同的记录
  if (list.some((item) => item.id === wa.id)) return;
  list.unshift(wa);
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, list);
}

export function removeWrongAnswer(id: string): void {
  const list = getWrongAnswers().filter((wa) => wa.id !== id);
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, list);
}

export function deleteWrongAnswer(id: string): void {
  const list = getWrongAnswers().filter((wa) => wa.id !== id);
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, list);
}

export function toggleWrongAnswerReviewed(id: string): void {
  const list = getWrongAnswers().map((wa) =>
    wa.id === id ? { ...wa, reviewed: !wa.reviewed } : wa
  );
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, list);
}

export function markWrongAnswerReviewed(id: string): void {
  const list = getWrongAnswers().map((wa) =>
    wa.id === id ? { ...wa, reviewed: true } : wa
  );
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, list);
}

export function clearWrongAnswers(): void {
  safeSet(STORAGE_KEYS.WRONG_ANSWERS, []);
}

// ── 学习记录 ──
export function getStudyRecords(): StudyRecord[] {
  return safeGet<StudyRecord[]>(STORAGE_KEYS.STUDY_RECORDS, []);
}

export function addStudyRecord(record: StudyRecord): void {
  const list = getStudyRecords();
  const existing = list.find((r) => r.date === record.date);
  if (existing) {
    existing.totalQuestions += record.totalQuestions;
    existing.correctCount += record.correctCount;
    existing.studyTime += record.studyTime;
  } else {
    list.unshift(record);
  }
  safeSet(STORAGE_KEYS.STUDY_RECORDS, list.slice(0, 365));
}

// ── 打卡记录 ──
export function getStreakRecords(): StreakRecord[] {
  return safeGet<StreakRecord[]>(STORAGE_KEYS.STREAK_RECORDS, []);
}

export function markStreak(date: string): void {
  const list = getStreakRecords();
  if (!list.some((s) => s.date === date)) {
    list.push({ date, completed: true });
    safeSet(STORAGE_KEYS.STREAK_RECORDS, list);
  }
}

export function updateStreak(): void {
  const today = new Date().toISOString().slice(0, 10);
  markStreak(today);
  const progress = getProgress();
  if (progress.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (progress.lastStudyDate === yesterday) {
      progress.streak++;
    } else {
      progress.streak = 1;
    }
    progress.lastStudyDate = today;
    saveProgress(progress);
  }
}

// ── 进度 ──
const DEFAULT_PROGRESS: Progress = {
  totalPoints: 0,
  level: 1,
  streak: 0,
  lastStudyDate: '',
  achievements: [],
  totalAnswered: 0,
  totalCorrect: 0,
};

export function getProgress(): Progress {
  return safeGet<Progress>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export function saveProgress(progress: Progress): void {
  safeSet(STORAGE_KEYS.PROGRESS, progress);
}

export function addPoints(points: number): Progress {
  const progress = getProgress();
  progress.totalPoints += points;
  progress.level = Math.floor(progress.totalPoints / 100) + 1;
  saveProgress(progress);
  return progress;
}

export function recordAnswer(isCorrect: boolean): Progress {
  const progress = getProgress();
  progress.totalAnswered++;
  if (isCorrect) {
    progress.totalCorrect++;
    addPoints(10);
  } else {
    addPoints(2);
  }
  // 更新 streak
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (progress.lastStudyDate === yesterday) {
      progress.streak++;
    } else {
      progress.streak = 1;
    }
    progress.lastStudyDate = today;
    markStreak(today);
  }
  saveProgress(progress);
  return progress;
}

// ── 成就 ──
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: '初出茅庐',
    description: '完成第一道题',
    icon: '🎯',
    condition: (p) => p.totalAnswered >= 1,
  },
  {
    id: 'ten-questions',
    title: '小试牛刀',
    description: '完成10道题',
    icon: '⚔️',
    condition: (p) => p.totalAnswered >= 10,
  },
  {
    id: 'fifty-questions',
    title: '勤学苦练',
    description: '完成50道题',
    icon: '📚',
    condition: (p) => p.totalAnswered >= 50,
  },
  {
    id: 'hundred-questions',
    title: '百题斩',
    description: '完成100道题',
    icon: '💯',
    condition: (p) => p.totalAnswered >= 100,
  },
  {
    id: 'streak-3',
    title: '三日不辍',
    description: '连续学习3天',
    icon: '🔥',
    condition: (p) => p.streak >= 3,
  },
  {
    id: 'streak-7',
    title: '一周坚持',
    description: '连续学习7天',
    icon: '⚡',
    condition: (p) => p.streak >= 7,
  },
  {
    id: 'streak-30',
    title: '月度达人',
    description: '连续学习30天',
    icon: '🏆',
    condition: (p) => p.streak >= 30,
  },
  {
    id: 'level-5',
    title: '初露锋芒',
    description: '达到5级',
    icon: '⭐',
    condition: (p) => p.level >= 5,
  },
  {
    id: 'level-10',
    title: '学海无涯',
    description: '达到10级',
    icon: '🎓',
    condition: (p) => p.level >= 10,
  },
  {
    id: 'accuracy-80',
    title: '精准射手',
    description: '正确率达到80%（至少做20题）',
    icon: '🎯',
    condition: (p) => p.totalAnswered >= 20 && p.totalCorrect / p.totalAnswered >= 0.8,
  },
];

export function checkAchievements(): { newAchievements: Achievement[]; progress: Progress } {
  const progress = getProgress();
  const newAchievements: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!progress.achievements.includes(ach.id) && ach.condition(progress)) {
      progress.achievements.push(ach.id);
      newAchievements.push(ach);
    }
  }
  if (newAchievements.length > 0) {
    saveProgress(progress);
  }
  return { newAchievements, progress };
}

// ── 每日一练 ──
export function getDailyPracticeQuestions(count: number = 5): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const stored = safeGet<{ date: string; questions: string[] }>(STORAGE_KEYS.DAILY_PRACTICE, {
    date: '',
    questions: [],
  });

  if (stored.date === today && stored.questions.length > 0) {
    return stored.questions;
  }

  // 生成新的每日练习 - 使用日期作为种子
  const { QUESTIONS } = require('@/data/questions');
  const seed = today.split('-').join('');
  const seeded = [...QUESTIONS].sort((a: any, b: any) => {
    const ha = (a.id + seed).split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const hb = (b.id + seed).split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    return ha - hb;
  });
  const selected = seeded.slice(0, count).map((q: any) => q.id);

  safeSet(STORAGE_KEYS.DAILY_PRACTICE, { date: today, questions: selected });
  return selected;
}
