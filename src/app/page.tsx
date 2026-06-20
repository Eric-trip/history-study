'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, PenLine, NotebookPen, Timer, Flame, Star, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProgress, checkAchievements, ACHIEVEMENTS } from '@/lib/storage';
import { Progress } from '@/types';

import Dashboard from '@/components/history/Dashboard';
import KnowledgeView from '@/components/history/KnowledgeView';
import TipsView from '@/components/history/TipsView';
import PracticeView from '@/components/history/PracticeView';
import WrongBook from '@/components/history/WrongBook';
import MockExam from '@/components/history/MockExam';
import DailyPractice from '@/components/history/DailyPractice';

type TabId = 'dashboard' | 'knowledge' | 'tips' | 'practice' | 'wrongbook' | 'mock' | 'daily';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: '学习概览', icon: Flame },
  { id: 'knowledge', label: '知识点', icon: BookOpen },
  { id: 'tips', label: '答题技巧', icon: Lightbulb },
  { id: 'practice', label: '题库练习', icon: PenLine },
  { id: 'wrongbook', label: '错题本', icon: NotebookPen },
  { id: 'mock', label: '模拟测试', icon: Timer },
  { id: 'daily', label: '每日一练', icon: Calendar },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // 切换tab时刷新进度
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const { progress: p } = checkAchievements();
    setProgress({ ...p });
  };

  // 子组件更新进度时调用
  const refreshProgress = () => {
    const { progress: p } = checkAchievements();
    setProgress({ ...p });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/50 to-white">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* 标题栏 */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                史
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">初中历史学习平台</h1>
                <p className="text-xs text-gray-400 leading-tight">人教版 · 主观题提分利器</p>
              </div>
            </div>
            {/* 积分 & 等级 */}
            {progress && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">{progress.streak}天</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">Lv.{progress.level}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600">{progress.totalPoints}</span>
                </div>
              </div>
            )}
          </div>
          {/* Tab导航 */}
          <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard progress={progress} onNavigate={handleTabChange} />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'tips' && <TipsView />}
        {activeTab === 'practice' && <PracticeView onAnswer={refreshProgress} />}
        {activeTab === 'wrongbook' && <WrongBook />}
        {activeTab === 'mock' && <MockExam onAnswer={refreshProgress} />}
        {activeTab === 'daily' && <DailyPractice onAnswer={refreshProgress} />}
      </main>

      {/* 页脚 */}
      <footer className="mt-auto border-t border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
          <p>初中历史学习平台 · 人教版 · 数据保存在本地浏览器</p>
        </div>
      </footer>
    </div>
  );
}
