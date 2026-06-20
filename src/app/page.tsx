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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const { progress: p } = checkAchievements();
    setProgress({ ...p });
  };

  const refreshProgress = () => {
    const { progress: p } = checkAchievements();
    setProgress({ ...p });
  };

  return (
    <div className="min-h-screen flex flex-col bamboo-texture" style={{ background: '#F5F0E6' }}>
      {/* 顶部导航 - 古籍页眉风 */}
      <header className="ancient-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* 标题栏 - 书法标题左 + 积分右 */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {/* 印章 logo */}
              <div className="seal" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1rem' }}>史</div>
              <div>
                <h1 className="font-cal text-xl leading-tight" style={{ color: '#2D2A24' }}>史学堂</h1>
                <p className="text-xs leading-tight" style={{ color: '#8B8270' }}>人教版 · 主观题提分利器</p>
              </div>
            </div>
            {/* 积分 & 等级 */}
            {progress && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ background: '#EDE6D4', border: '1px solid #D4C9B0' }}>
                  <Flame className="w-4 h-4" style={{ color: '#C7503B' }} />
                  <span className="text-sm font-semibold" style={{ color: '#C7503B' }}>{progress.streak}天</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ background: '#EDE6D4', border: '1px solid #D4C9B0' }}>
                  <Star className="w-4 h-4" style={{ color: '#5B7C5F' }} />
                  <span className="text-sm font-semibold" style={{ color: '#5B7C5F' }}>Lv.{progress.level}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ background: '#EDE6D4', border: '1px solid #D4C9B0' }}>
                  <Trophy className="w-4 h-4" style={{ color: '#B8860B' }} />
                  <span className="text-sm font-semibold" style={{ color: '#B8860B' }}>{progress.totalPoints}</span>
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
                    'flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'ancient-btn-active shadow-sm'
                      : 'ancient-btn'
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

      {/* 页脚 - 卷轴底部 */}
      <footer className="scroll-footer mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm" style={{ color: '#8B8270' }}>
          <p>史学堂 · 人教版初中历史 · 数据保存在本地浏览器</p>
        </div>
      </footer>
    </div>
  );
}
