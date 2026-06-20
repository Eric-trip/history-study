'use client';

import { useState, useEffect } from 'react';
import { getDailyPracticeQuestions } from '@/lib/storage';
import { getQuestionById } from '@/data/questions';
import { ChoiceQuestion, EssayQuestion, Question } from '@/types';
import { gradeEssay } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord, updateStreak } from '@/lib/storage';
import { Calendar, CheckCircle2, XCircle, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyPracticeProps {
  onAnswer: () => void;
}

export default function DailyPractice({ onAnswer }: DailyPracticeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; score?: number; maxScore?: number }> | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const ids = getDailyPracticeQuestions(5);
    const qs = ids.map((id) => getQuestionById(id)).filter(Boolean) as Question[];
    setQuestions(qs);
  }, []);

  const handleSubmit = () => {
    const q = questions[currentIdx];
    const ans = answers[q.id] || '';

    if (q.type === 'choice') {
      const correct = ans === (q as ChoiceQuestion).answer;
      setResults({ ...results, [q.id]: { correct } });
      recordAnswer(correct);
      if (!correct) {
        addWrongAnswer({
          id: `wa-${q.id}-${Date.now()}`,
          questionId: q.id,
          questionType: 'choice',
          questionText: q.question,
          myAnswer: ans || '未作答',
          correctAnswer: `${(q as ChoiceQuestion).answer}: ${(q as ChoiceQuestion).options.find(o => o.label === (q as ChoiceQuestion).answer)?.text || ''}`,
          reason: '每日一练答错',
          bookId: q.bookId,
          createdAt: Date.now(),
          reviewed: false,
        });
      }
    } else {
      const grading = gradeEssay(q as EssayQuestion, ans);
      setResults({ ...results, [q.id]: { correct: grading.score / grading.maxScore >= 0.6, score: grading.score, maxScore: grading.maxScore } });
      recordAnswer(grading.score / grading.maxScore >= 0.6);
      if (grading.score / grading.maxScore < 0.6) {
        addWrongAnswer({
          id: `wa-${q.id}-${Date.now()}`,
          questionId: q.id,
          questionType: (q as EssayQuestion).type,
          questionText: q.question,
          myAnswer: ans,
          correctAnswer: (q as EssayQuestion).referenceAnswer,
          reason: '每日一练得分过低',
          bookId: q.bookId,
          createdAt: Date.now(),
          reviewed: false,
        });
      }
    }
    setShowResult(true);
    onAnswer();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowResult(false);
    } else {
      // 完成
      setCompleted(true);
      addStudyRecord({
        date: today,
        totalQuestions: questions.length,
        correctCount: Object.values(results || {}).filter((r) => r.correct).length,
        studyTime: 10,
      });
      updateStreak();
      onAnswer();
    }
  };

  // ── 完成界面 ──
  if (completed) {
    const correctCount = Object.values(results || {}).filter((r) => r.correct).length;
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl p-6 text-white text-center shadow-lg">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">今日练习完成！</h2>
          <p className="text-blue-100 mb-4">{today}</p>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 inline-block">
            <div className="text-3xl font-bold">{correctCount}/{questions.length}</div>
            <div className="text-sm text-blue-100 mt-1">正确率 {Math.round((correctCount / questions.length) * 100)}%</div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <div className="font-semibold text-gray-800">连续打卡+1！</div>
            <div className="text-sm text-gray-500">坚持每天练习，主观题成绩一定会提高</div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">正在加载今日练习...</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const result = results?.[currentQ.id];

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">每日一练</h2>
            <p className="text-xs text-gray-500">{today} · 每天5题 · 坚持就是胜利</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center',
                idx === currentIdx
                  ? 'bg-green-500 text-white'
                  : results?.[q.id]
                    ? results[q.id].correct
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
              )}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            第{currentIdx + 1}题
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
            {currentQ.type === 'choice' ? '选择题' : '主观题'}
          </span>
          {currentQ.type !== 'choice' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
              {(currentQ as EssayQuestion).points}分
            </span>
          )}
        </div>

        <h3 className="text-base font-medium text-gray-800">{currentQ.question}</h3>

        {currentQ.type === 'choice' ? (
          <div className="space-y-2">
            {(currentQ as ChoiceQuestion).options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.label;
              const isCorrect = opt.label === (currentQ as ChoiceQuestion).answer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;
              return (
                <button
                  key={opt.label}
                  onClick={() => !showResult && setAnswers({ ...answers, [currentQ.id]: opt.label })}
                  disabled={showResult}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                    !showResult && (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-300'),
                    showCorrect && 'border-green-500 bg-green-50',
                    showWrong && 'border-red-500 bg-red-50',
                    showResult && !showCorrect && !showWrong && 'border-gray-100 opacity-60'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                    !showResult && (isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'),
                    showCorrect && 'bg-green-500 text-white',
                    showWrong && 'bg-red-500 text-white',
                    showResult && !showCorrect && !showWrong && 'bg-gray-100 text-gray-400'
                  )}>
                    {showCorrect ? '✓' : showWrong ? '✗' : opt.label}
                  </span>
                  <span className="text-sm text-gray-700">{opt.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            disabled={showResult}
            placeholder="在此输入答案... 分点作答，使用历史术语"
            className="w-full min-h-[150px] p-3 border-2 border-gray-100 rounded-lg text-sm focus:border-blue-300 focus:outline-none resize-y disabled:bg-gray-50"
          />
        )}

        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!answers[currentQ.id]?.trim()}
            className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            提交答案
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className={cn(
              'flex items-center gap-2 font-medium text-sm',
              result?.correct ? 'text-green-600' : 'text-red-600'
            )}>
              {result?.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result?.correct
                ? currentQ.type === 'choice' ? '回答正确！+10分' : `得分：${result.score}/${result.maxScore}`
                : currentQ.type === 'choice' ? '回答错误' : `得分：${result?.score || 0}/${result?.maxScore}`}
            </div>
            {currentQ.type !== 'choice' && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-semibold text-green-600 mb-1">参考答案</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{(currentQ as EssayQuestion).referenceAnswer}</div>
              </div>
            )}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-semibold text-blue-600 mb-1">解析</div>
              <div className="text-sm text-gray-700">{currentQ.explanation}</div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
            >
              {currentIdx < questions.length - 1 ? '下一题' : '完成今日练习'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
