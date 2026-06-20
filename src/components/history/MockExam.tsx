'use client';

import { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '@/data/questions';
import { BOOKS } from '@/data/books';
import { ChoiceQuestion, EssayQuestion, Question, BookId } from '@/types';
import { gradeEssay } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord } from '@/lib/storage';
import { Timer, AlertCircle, CheckCircle2, XCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockExamProps {
  onAnswer: () => void;
}

export default function MockExam({ onAnswer }: MockExamProps) {
  const [selectedBook, setSelectedBook] = useState<BookId | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({} as Record<string, string>);
  const [examResults, setExamResults] = useState<Record<string, { correct: boolean; score?: number; maxScore?: number }> | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = () => {
    const pool = selectedBook === 'all' ? QUESTIONS : QUESTIONS.filter((q) => q.bookId === selectedBook);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    setExamQuestions(selected);
    setCurrentIdx(0);
    setAnswers({});
    setExamResults(null);
    setExamStarted(true);
    setTimeLeft(selected.length * 2 * 60); // 每题2分钟
  };

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            submitExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [examStarted, timeLeft, examResults]);

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const results: Record<string, { correct: boolean; score?: number; maxScore?: number }> = {};
    let correctCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    examQuestions.forEach((q) => {
      const ans = answers[q.id] || '';
      if (q.type === 'choice') {
        const correct = ans === (q as ChoiceQuestion).answer;
        results[q.id] = { correct };
        if (correct) correctCount++;
        if (!correct) {
          addWrongAnswer({
            id: `wa-${q.id}-${Date.now()}`,
            questionId: q.id,
            questionType: 'choice',
            questionText: q.question,
            myAnswer: ans || '未作答',
            correctAnswer: `${(q as ChoiceQuestion).answer}: ${(q as ChoiceQuestion).options.find(o => o.label === (q as ChoiceQuestion).answer)?.text || ''}`,
            reason: '模拟测试答错',
            bookId: q.bookId,
            createdAt: Date.now(),
            reviewed: false,
          });
        }
      } else {
        const eq = q as EssayQuestion;
        if (ans.trim()) {
          const grading = gradeEssay(eq, ans);
          results[q.id] = { correct: grading.score / grading.maxScore >= 0.6, score: grading.score, maxScore: grading.maxScore };
          totalScore += grading.score;
          maxScore += grading.maxScore;
          if (grading.score / grading.maxScore < 0.6) {
            addWrongAnswer({
              id: `wa-${q.id}-${Date.now()}`,
              questionId: q.id,
              questionType: eq.type,
              questionText: q.question,
              myAnswer: ans,
              correctAnswer: eq.referenceAnswer,
              reason: '模拟测试得分过低',
              bookId: q.bookId,
              createdAt: Date.now(),
              reviewed: false,
            });
          }
        } else {
          results[q.id] = { correct: false, score: 0, maxScore: eq.points };
          maxScore += eq.points;
          addWrongAnswer({
            id: `wa-${q.id}-${Date.now()}`,
            questionId: q.id,
            questionType: eq.type,
            questionText: q.question,
            myAnswer: '未作答',
            correctAnswer: eq.referenceAnswer,
            reason: '模拟测试未作答',
            bookId: q.bookId,
            createdAt: Date.now(),
            reviewed: false,
          });
        }
      }
    });

    setExamResults(results);
    recordAnswer(correctCount >= examQuestions.length / 2);
    addStudyRecord({
      date: new Date().toISOString().slice(0, 10),
      totalQuestions: examQuestions.length,
      correctCount,
      studyTime: Math.ceil((examQuestions.length * 2 * 60 - timeLeft) / 60),
    });
    onAnswer();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── 设置界面 ──
  if (!examStarted) {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-gray-800">模拟测试</h2>
          </div>
          <p className="text-sm text-gray-500">从题库随机抽题，限时作答，自动判分</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">选择册别</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBook('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedBook === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                )}
              >
                全部
              </button>
              {BOOKS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBook(b.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedBook === b.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {b.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">题目数量</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    questionCount === n ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {n}题
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              每题限时2分钟 · 选择题自动判分 · 主观题关键词匹配判分 · 答错的题自动加入错题本
            </div>
          </div>
          <button
            onClick={startExam}
            className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            开始测试
          </button>
        </div>
      </div>
    );
  }

  // ── 结果界面 ──
  if (examResults) {
    const choiceCorrect = examQuestions.filter((q) => q.type === 'choice').length;
    const choiceCorrectCount = examQuestions.filter((q) => q.type === 'choice' && examResults[q.id]?.correct).length;
    const essayQuestions = examQuestions.filter((q) => q.type !== 'choice');
    const totalEssayScore = essayQuestions.reduce((sum, q) => sum + (examResults[q.id]?.score || 0), 0);
    const totalEssayMax = essayQuestions.reduce((sum, q) => sum + (examResults[q.id]?.maxScore || 0), 0);

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-4">测试完成！</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-xs text-purple-100 mb-1">选择题</div>
              <div className="text-2xl font-bold">{choiceCorrectCount}/{choiceCorrect}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-xs text-purple-100 mb-1">主观题得分</div>
              <div className="text-2xl font-bold">{totalEssayScore}/{totalEssayMax}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-xs text-purple-100 mb-1">总题数</div>
              <div className="text-2xl font-bold">{examQuestions.length}</div>
            </div>
          </div>
        </div>

        {/* 逐题回顾 */}
        <div className="space-y-3">
          {examQuestions.map((q, idx) => {
            const result = examResults[q.id];
            return (
              <div key={q.id} className={cn(
                'bg-white rounded-xl p-4 border',
                result?.correct ? 'border-green-200' : 'border-red-200'
              )}>
                <div className="flex items-start gap-2 mb-2">
                  {result?.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">第{idx + 1}题</div>
                    <div className="text-sm font-medium text-gray-800 mb-2">{q.question}</div>
                    {q.type === 'choice' ? (
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">你的答案：{answers[q.id] || '未作答'}</div>
                        <div className="text-green-600">正确答案：{(q as ChoiceQuestion).answer}</div>
                      </div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">你的答案：{answers[q.id] || '未作答'}</div>
                        <div className="text-green-600">参考答案：{(q as EssayQuestion).referenceAnswer}</div>
                        <div className="text-orange-600">得分：{result?.score || 0}/{result?.maxScore || 0}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setExamStarted(false)}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          返回设置
        </button>
      </div>
    );
  }

  // ── 答题界面 ──
  const currentQ = examQuestions[currentIdx];
  const isLast = currentIdx === examQuestions.length - 1;
  const progress = ((currentIdx + 1) / examQuestions.length) * 100;

  return (
    <div className="space-y-4">
      {/* 顶部状态栏 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            第 {currentIdx + 1} / {examQuestions.length} 题
          </span>
          <div className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold',
            timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          )}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
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
            {(currentQ as ChoiceQuestion).options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.label })}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                  answers[currentQ.id] === opt.label
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                )}
              >
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  answers[currentQ.id] === opt.label ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {opt.label}
                </span>
                <span className="text-sm text-gray-700">{opt.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            placeholder="在此输入答案... 分点作答，使用历史术语"
            className="w-full min-h-[150px] p-3 border-2 border-gray-100 rounded-lg text-sm focus:border-blue-300 focus:outline-none resize-y"
          />
        )}
      </div>

      {/* 导航 */}
      <div className="flex gap-2">
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            上一题
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            下一题
          </button>
        ) : (
          <button
            onClick={submitExam}
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            交卷
          </button>
        )}
      </div>

      {/* 题目导航 */}
      <div className="bg-white rounded-xl p-3 border border-gray-100">
        <div className="text-xs text-gray-400 mb-2">答题卡</div>
        <div className="flex flex-wrap gap-1.5">
          {examQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                idx === currentIdx
                  ? 'bg-blue-500 text-white'
                  : answers[q.id]
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
