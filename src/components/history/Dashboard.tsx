'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/types';
import { Flame, BookOpen, Target, TrendingUp, Award, ChevronRight, Download, Upload, Trash2, Star } from 'lucide-react';
import { getStudyRecords, getWrongAnswers, ACHIEVEMENTS, getStreakRecords } from '@/lib/storage';
import { downloadExport, importAllData, clearAllData, getFavorites } from '@/lib/dataManager';
import { BOOKS } from '@/data/books';
import { QUESTIONS } from '@/data/questions';
import { TIP_CARDS } from '@/data/tips';

interface DashboardProps {
  progress: Progress | null;
  onNavigate: (tab: any) => void;
}

export default function Dashboard({ progress, onNavigate }: DashboardProps) {
  const [records, setRecords] = useState(getStudyRecords());
  const [wrongAnswers, setWrongAnswers] = useState(getWrongAnswers());
  const [streakRecords, setStreakRecords] = useState(getStreakRecords());
  const [favCount, setFavCount] = useState(getFavorites().length);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  const accuracy = progress && progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  const unlockedAchievements = progress
    ? ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id))
    : [];

  const recentRecords = records.slice(0, 7).reverse();

  // 生成最近30天的日历
  const calendarDays = (() => {
    const days: { date: string; studied: boolean; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const rec = records.find((r) => r.date === dateStr);
      days.push({ date: dateStr, studied: !!rec, count: rec?.totalQuestions || 0 });
    }
    return days;
  })();

  const refresh = () => {
    setRecords(getStudyRecords());
    setWrongAnswers(getWrongAnswers());
    setStreakRecords(getStreakRecords());
    setFavCount(getFavorites().length);
    setRefreshKey(k => k + 1);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importAllData(ev.target?.result as string);
      alert(result.message);
      if (result.success) {
        refresh();
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('确定清空所有数据？此操作不可撤销！')) {
      clearAllData();
      window.location.reload();
    }
  };

  const stats = [
    { label: '连续打卡', value: `${progress?.streak || 0}天`, icon: Flame, color: '#C7503B' },
    { label: '积分等级', value: `Lv.${progress?.level || 1}`, icon: TrendingUp, color: '#B8860B' },
    { label: '正确率', value: `${accuracy}%`, icon: Target, color: '#5B7C5F' },
    { label: '总答题', value: `${progress?.totalAnswered || 0}题`, icon: BookOpen, color: '#5B7C5F' },
  ];

  const resources = [
    { label: '教材知识点', value: `${BOOKS.length}册`, tab: 'knowledge', icon: BookOpen },
    { label: '题库练习', value: `${QUESTIONS.length}题`, tab: 'practice', icon: Target },
    { label: '答题技巧', value: `${TIP_CARDS.length}张卡片`, tab: 'tips', icon: Flame },
    { label: '错题本', value: `${wrongAnswers.length}题`, tab: 'wrongbook', icon: BookOpen },
    { label: '收藏', value: `${favCount}个`, tab: 'knowledge', icon: Star },
  ];

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* 顶部欢迎区 */}
      <div className="ancient-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-cal text-xl" style={{ color: '#2D2A24' }}>温故而知新</h2>
            <p className="text-sm mt-1" style={{ color: '#8B8270' }}>
              {progress?.streak ? `已连续学习${progress.streak}天，继续加油！` : '开始你的历史学习之旅吧'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="seal" style={{ background: '#C7503B', color: '#F5F0E6' }}>史</div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="ancient-card p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <div className="font-cal text-xl" style={{ color: '#2D2A24' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: '#8B8270' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* 今日学习 */}
      <div className="ancient-card p-4">
        <h3 className="font-cal text-base mb-3" style={{ color: '#2D2A24' }}>今日学习</h3>
        {todayRecord ? (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-cal text-lg" style={{ color: '#5B7C5F' }}>{todayRecord.totalQuestions}</div>
              <div className="text-xs" style={{ color: '#8B8270' }}>今日答题</div>
            </div>
            <div>
              <div className="font-cal text-lg" style={{ color: '#5B7C5F' }}>{todayRecord.correctCount}</div>
              <div className="text-xs" style={{ color: '#8B8270' }}>答对</div>
            </div>
            <div>
              <div className="font-cal text-lg" style={{ color: '#5B7C5F' }}>{todayRecord.totalQuestions > 0 ? Math.round(todayRecord.correctCount / todayRecord.totalQuestions * 100) : 0}%</div>
              <div className="text-xs" style={{ color: '#8B8270' }}>正确率</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: '#8B8270' }}>今日尚未打卡</p>
            <button onClick={() => onNavigate('daily')} className="ancient-btn px-4 py-1.5 mt-2 text-sm" style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}>
              去做每日一练 →
            </button>
          </div>
        )}
      </div>

      {/* 学习日历 */}
      <div className="ancient-card p-4">
        <h3 className="font-cal text-base mb-3" style={{ color: '#2D2A24' }}>学习日历（近30天）</h3>
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm flex items-center justify-center text-[10px]"
              style={day.studied
                ? { background: '#5B7C5F', color: '#F5F0E6' }
                : { background: '#EDE6D4', color: '#D4C9B0' }
              }
              title={`${day.date} ${day.studied ? `学习${day.count}题` : '未学习'}`}
            >
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#8B8270' }}>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#5B7C5F' }}></span> 已学习
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#EDE6D4' }}></span> 未学习
          </span>
        </div>
      </div>

      {/* 学习资源快捷入口 */}
      <div className="ancient-card p-4">
        <h3 className="font-cal text-base mb-3" style={{ color: '#2D2A24' }}>学习资源</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(res.tab)}
                className="p-3 rounded text-left transition-all hover:shadow-md"
                style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}
              >
                <Icon className="w-4 h-4 mb-1" style={{ color: '#5B7C5F' }} />
                <div className="text-sm font-medium" style={{ color: '#2D2A24' }}>{res.label}</div>
                <div className="text-xs" style={{ color: '#8B8270' }}>{res.value}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 近7天学习趋势 */}
      {recentRecords.length > 0 && (
        <div className="ancient-card p-4">
          <h3 className="font-cal text-base mb-3" style={{ color: '#2D2A24' }}>近7天学习</h3>
          <div className="space-y-2">
            {recentRecords.map((rec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-xs w-20" style={{ color: '#8B8270' }}>{rec.date.slice(5)}</span>
                <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: '#EDE6D4' }}>
                  <div className="h-full" style={{ width: `${Math.min(100, rec.totalQuestions * 10)}%`, background: '#5B7C5F' }} />
                </div>
                <span className="text-xs w-16 text-right" style={{ color: '#2D2A24' }}>{rec.correctCount}/{rec.totalQuestions}题</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 成就墙 */}
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5" style={{ color: '#B8860B' }} />
          <h3 className="font-cal text-base" style={{ color: '#2D2A24' }}>成就墙</h3>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>
            {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="bamboo-divider mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = progress?.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center p-3 rounded text-center transition-all ${unlocked ? 'ancient-card' : 'opacity-40'}`}
                style={unlocked ? { background: '#FBF8F0' } : { background: '#E8E0CE' }}
              >
                <div className="text-2xl mb-1">{ach.icon}</div>
                <div className="text-xs font-medium" style={{ color: '#2D2A24' }}>{ach.title}</div>
                <div className="text-[10px] mt-0.5 leading-tight" style={{ color: '#8B8270' }}>{ach.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="ancient-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cal text-base" style={{ color: '#2D2A24' }}>数据管理</h3>
          <button onClick={() => setShowDataMenu(!showDataMenu)} className="ancient-btn px-3 py-1 text-xs">
            {showDataMenu ? '收起' : '展开'}
          </button>
        </div>
        {showDataMenu && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: '#8B8270' }}>
              数据保存在浏览器本地，换设备或清除缓存会丢失。建议定期导出备份。
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadExport()}
                className="ancient-btn px-3 py-2 text-sm flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> 导出数据
              </button>
              <label className="ancient-btn px-3 py-2 text-sm flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" /> 导入数据
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button
                onClick={handleClear}
                className="px-3 py-2 text-sm rounded flex items-center gap-1"
                style={{ background: '#F5E8E8', color: '#C7503B', border: '1px solid #C7503B' }}
              >
                <Trash2 className="w-3 h-3" /> 清空数据
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
