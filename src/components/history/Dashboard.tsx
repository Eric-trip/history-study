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

  const recentRecords = records.slice(0, 7).reverse();

  return (
    <div className="space-y-6">
      {/* 欢迎卡片 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">欢迎回来！</h2>
        <p className="text-blue-100 text-sm mb-4">坚持每天练习，主观题一定能拿高分</p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex-1 min-w-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs text-blue-100">连续学习</span>
            </div>
            <div className="text-2xl font-bold">{progress?.streak || 0} <span className="text-sm font-normal">天</span></div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex-1 min-w-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs text-blue-100">累计答题</span>
            </div>
            <div className="text-2xl font-bold">{progress?.totalAnswered || 0} <span className="text-sm font-normal">题</span></div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex-1 min-w-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs text-blue-100">正确率</span>
            </div>
            <div className="text-2xl font-bold">{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* 今日学习 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">今日学习</h3>
            <span className="text-xs text-gray-400">{today}</span>
          </div>
          {todayRecord ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">答题数</span>
                <span className="font-semibold text-blue-600">{todayRecord.totalQuestions}题</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">正确数</span>
                <span className="font-semibold text-green-600">{todayRecord.correctCount}题</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">学习时长</span>
                <span className="font-semibold text-gray-700">{todayRecord.studyTime}分钟</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">今天还没开始学习哦</p>
              <button
                onClick={() => onNavigate('daily')}
                className="text-sm text-blue-500 font-medium hover:text-blue-600"
              >
                去做每日一练 →
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">学习资源</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('knowledge')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm text-gray-600">教材知识点 ({BOOKS.length}册)</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm text-gray-600">题库练习 ({QUESTIONS.length}题)</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('tips')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm text-gray-600">答题技巧 ({TIP_CARDS.length}张卡片)</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('wrongbook')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm text-gray-600">错题本 ({wrongAnswers.length}题)</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 近7天正确率趋势 */}
      {recentRecords.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">近7天学习记录</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {recentRecords.map((r, i) => {
              const rate = r.totalQuestions > 0 ? (r.correctCount / r.totalQuestions) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-400 font-medium">{r.totalQuestions > 0 ? `${Math.round(rate)}%` : '-'}</div>
                  <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-md transition-all"
                      style={{ height: `${rate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">{r.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 成就墙 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-800">成就墙</h3>
          <span className="text-xs text-gray-400 ml-auto">已解锁 {unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = progress?.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center p-3 rounded-xl text-center transition-all ${
                  unlocked
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                    : 'bg-gray-50 border border-gray-100 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{ach.icon}</div>
                <div className="text-xs font-medium text-gray-700">{ach.title}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{ach.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
