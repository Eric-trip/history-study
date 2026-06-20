'use client';

import { Progress } from '@/types';
import { Flame, BookOpen, Target, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { getStudyRecords, getWrongAnswers, ACHIEVEMENTS } from '@/lib/storage';
import { BOOKS } from '@/data/books';
import { QUESTIONS } from '@/data/questions';
import { TIP_CARDS } from '@/data/tips';

interface DashboardProps {
  progress: Progress | null;
  onNavigate: (tab: any) => void;
}

export default function Dashboard({ progress, onNavigate }: DashboardProps) {
  const records = getStudyRecords();
  const wrongAnswers = getWrongAnswers();
  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  const accuracy = progress && progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  const unlockedAchievements = progress
    ? ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id))
    : [];

  const recentRecords = [...records].slice(-7).reverse();

  const stats = [
    { label: '连续打卡', value: `${progress?.streak || 0}天`, icon: Flame, color: '#C7503B' },
    { label: '答题总数', value: `${progress?.totalAnswered || 0}题`, icon: Target, color: '#5B7C5F' },
    { label: '正确率', value: `${accuracy}%`, icon: TrendingUp, color: '#B8860B' },
    { label: '积分等级', value: `Lv.${progress?.level || 1}`, icon: Award, color: '#5B7C5F' },
  ];

  const resources = [
    { label: '教材知识点', desc: `${BOOKS.length}册`, tab: 'knowledge', icon: BookOpen },
    { label: '题库练习', desc: `${QUESTIONS.length}题`, tab: 'practice', icon: Target },
    { label: '答题技巧', desc: `${TIP_CARDS.length}张卡片`, tab: 'tips', icon: TrendingUp },
    { label: '错题本', desc: `${wrongAnswers.length}题`, tab: 'wrongbook', icon: Award },
  ];

  return (
    <div className="space-y-5">
      {/* 欢迎语 */}
      <div className="ancient-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="seal seal-sm">学</div>
          <h2 className="font-cal text-xl" style={{ color: '#2D2A24' }}>温故而知新</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>
          {todayRecord
            ? `今日已练习${todayRecord.totalQuestions}题，继续保持！`
            : '今日尚未开始练习，去每日一练打卡吧'}
        </p>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="ancient-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs" style={{ color: '#8B8270' }}>{stat.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* 今日学习 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cal text-lg title-deco" style={{ color: '#2D2A24' }}>今日学习</h3>
          <button
            onClick={() => onNavigate('daily')}
            className="ancient-btn px-3 py-1 text-sm flex items-center gap-1"
          >
            去做每日一练 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bamboo-divider mb-4" />
        {todayRecord ? (
          <div className="ancient-card p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm" style={{ color: '#8B8270' }}>今日答题</div>
                <div className="text-2xl font-bold" style={{ color: '#5B7C5F' }}>{todayRecord.totalQuestions}题</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: '#8B8270' }}>正确</div>
                <div className="text-2xl font-bold" style={{ color: '#5B7C5F' }}>{todayRecord.correctCount}题</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: '#8B8270' }}>用时</div>
                <div className="text-2xl font-bold" style={{ color: '#5B7C5F' }}>{todayRecord.studyTime}分</div>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('daily')}
            className="ancient-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="seal mx-auto mb-3" style={{ width: '3rem', height: '3rem', fontSize: '1.25rem' }}>练</div>
              <p className="font-cal text-lg mb-1" style={{ color: '#2D2A24' }}>今日尚未打卡</p>
              <p className="text-sm" style={{ color: '#8B8270' }}>点击开始每日一练，连续打卡赚积分</p>
            </div>
          </div>
        )}
      </div>

      {/* 学习资源 */}
      <div>
        <h3 className="font-cal text-lg title-deco mb-3" style={{ color: '#2D2A24' }}>学习资源</h3>
        <div className="bamboo-divider mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resources.map((res) => {
            const Icon = res.icon;
            return (
              <button
                key={res.tab}
                onClick={() => onNavigate(res.tab)}
                className="ancient-card p-4 text-left hover:shadow-md transition-shadow group"
              >
                <Icon className="w-5 h-5 mb-2" style={{ color: '#5B7C5F' }} />
                <div className="font-medium text-sm" style={{ color: '#2D2A24' }}>{res.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#8B8270' }}>{res.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 近7天记录 */}
      {recentRecords.length > 0 && (
        <div>
          <h3 className="font-cal text-lg title-deco mb-3" style={{ color: '#2D2A24' }}>近7天记录</h3>
          <div className="bamboo-divider mb-4" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentRecords.map((r, i) => (
              <div key={i} className="ancient-card p-3 min-w-[80px] text-center">
                <div className="text-xs" style={{ color: '#8B8270' }}>{r.date.slice(5)}</div>
                <div className="text-lg font-bold" style={{ color: '#5B7C5F' }}>{r.totalQuestions}</div>
                <div className="text-xs" style={{ color: '#8B8270' }}>题</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 成就墙 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cal text-lg title-deco" style={{ color: '#2D2A24' }}>成就墙</h3>
          <span className="text-sm" style={{ color: '#8B8270' }}>
            已解锁 {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="bamboo-divider mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = progress?.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center p-3 rounded text-center transition-all ${
                  unlocked ? 'ancient-card' : 'opacity-40'
                }`}
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
    </div>
  );
}
