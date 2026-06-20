// 数据导出/导入功能

import { WrongAnswer, StudyRecord, Progress, StreakRecord } from '@/types';

const STORAGE_KEYS = {
  WRONG_ANSWERS: 'history_wrong_answers',
  STUDY_RECORDS: 'history_study_records',
  STREAK_RECORDS: 'history_streak_records',
  PROGRESS: 'history_progress',
  DAILY_PRACTICE: 'history_daily_practice',
  FAVORITES: 'history_favorites',
} as const;

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
    console.error('Failed to save:', e);
  }
}

// ── 导出全部数据 ──
export function exportAllData(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    wrongAnswers: safeGet(STORAGE_KEYS.WRONG_ANSWERS, []),
    studyRecords: safeGet(STORAGE_KEYS.STUDY_RECORDS, []),
    streakRecords: safeGet(STORAGE_KEYS.STREAK_RECORDS, []),
    progress: safeGet(STORAGE_KEYS.PROGRESS, null),
    favorites: safeGet(STORAGE_KEYS.FAVORITES, []),
  };
  return JSON.stringify(data, null, 2);
}

// ── 下载导出文件 ──
export function downloadExport(): void {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `史学堂_数据备份_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── 导入数据 ──
export function importAllData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);

    if (!data.version) {
      return { success: false, message: '文件格式不正确' };
    }

    if (data.wrongAnswers) {
      safeSet(STORAGE_KEYS.WRONG_ANSWERS, data.wrongAnswers);
    }
    if (data.studyRecords) {
      safeSet(STORAGE_KEYS.STUDY_RECORDS, data.studyRecords);
    }
    if (data.streakRecords) {
      safeSet(STORAGE_KEYS.STREAK_RECORDS, data.streakRecords);
    }
    if (data.progress) {
      safeSet(STORAGE_KEYS.PROGRESS, data.progress);
    }
    if (data.favorites) {
      safeSet(STORAGE_KEYS.FAVORITES, data.favorites);
    }

    return { success: true, message: '数据导入成功' };
  } catch (e) {
    return { success: false, message: '导入失败：文件解析错误' };
  }
}

// ── 清空所有数据 ──
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// ── 收藏功能 ──
export function getFavorites(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.FAVORITES, []);
}

export function toggleFavorite(id: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    safeSet(STORAGE_KEYS.FAVORITES, list);
    return false;
  } else {
    list.push(id);
    safeSet(STORAGE_KEYS.FAVORITES, list);
    return true;
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
