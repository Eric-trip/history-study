'use client';

import { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '@/data/questions';
import { BOOKS } from '@/data/books';
import { ChoiceQuestion, EssayQuestion, Question, BookId } from '@/types';
import { gradeEssay } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord } from '@/lib/storage';
import { Timer, AlertCircle } from 'lucide-react';
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
    setAnswers({} as Record<string, string>);
    setExamResults(null);
    setTimeLeft(questionCount * 60);
    setExamStarted(true);
  };

  // Timer
  useEffect(() => {
    if (examStarted && !examResults && timeLeft > 0) {
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
  }, [examStarted, examResults, timeLeft]);

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const results: Record<string, { correct: boolean; score?: number; maxScore?: number }> = {};
    examQuestions.forEach((q) => {
      const ans = answers[q.id] || '';
      if (q.type === 'choice') {
        const correct = ans === (q as ChoiceQuestion).answer;
        results[q.id] = { correct };
        recordAnswer(correct);
        if (!correct) {
          addWrongAnswer({
            id: `wa-${q.id}-mock-${Date.now()}`,
            questionId: q.id,
            questionType: 'choice',
            questionText: q.question,
            myAnswer: ans || '未作答',
            correctAnswer: (q as ChoiceQuestion).answer,
            reason: '模拟测试答错',
            bookId: q.bookId,
            createdAt: Date.now(),
            reviewed: false,
          });
        }
      } else {
        const result = gradeEssay(q as EssayQuestion, ans);
        const correct = result.score >= result.maxScore * 0.6;
        results[q.id] = { correct, score: result.score, maxScore: result.maxScore };
        recordAnswer(correct);
        if (!correct) {
          addWrongAnswer({
            id: `wa-${q.id}-mock-${Date.now()}`,
            questionId: q.id,
            questionType: 'essay',
            questionText: q.question,
            myAnswer: ans || '未作答',
            correctAnswer: (q as EssayQuestion).referenceAnswer,
            reason: `模拟测试得分${result.score}/${result.maxScore}`,
            bookId: q.bookId,
            createdAt: Date.now(),
            reviewed: false,
          });
        }
      }
    });
    addStudyRecord({
      date: new Date().toISOString().slice(0, 10),
      totalQuestions: examQuestions.length,
      correctCount: examQuestions.filter((q) => results[q.id]?.correct).length,
      studyTime: Math.ceil((questionCount * 60 - timeLeft) / 60),
    });
    onAnswer();
    setExamResults(results);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const btnBase = 'px-3 py-1.5 rounded text-sm font-medium transition-colors';
  const btnActive = 'text-white';
  const btnInactive = 'text-[#8B8270]';

  // ── 设置界面 ──
  if (!examStarted) {
    return (
      <div className="space-y-4">
        <div className="ancient-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="seal seal-sm">考</div>
            <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>模拟测试</h2>
          </div>
          <p className="text-sm" style={{ color: '#8B8270' }}>从题库随机抽题，限时作答，自动判分</p>
        </div>

        <div className="ancient-card p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#2D2A24' }}>选择册别</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBook('all')}
                className={cn(btnBase, selectedBook === 'all' ? btnActive : btnInactive)}
                style={selectedBook === 'all' ? { background: '#5B7C5F', border: '1px solid #4A6650' } : { background: '#EDE6D4', border: '1px solid #D4C9B0' }}
              >
                全部
              </button>
              {BOOKS.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book.id)}
                  className={cn(btnBase, selectedBook === book.id ? btnActive : btnInactive)}
                  style={selectedBook === book.id ? { background: '#5B7C5F', border: '1px solid #4A6650' } : { background: '#EDE6D4', border: '1px solid #D4C9B0' }}
                >
                  {book.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#2D2A24' }}>题目数量</label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={cn(btnBase, questionCount === n ? btnActive : btnInactive)}
                  style={questionCount === n ? { background: '#5B7C5F', border: '1px solid #4A6650' } : { background: '#EDE6D4', border: '1px solid #D4C9B0' }}
                >
                  {n}题
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full py-2.5 rounded font-medium transition-all"
            style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
          >
            开始测试
          </button>
        </div>
      </div>
    );
  }

  // ── 结果界面 ──
  if (examResults) {
    const correctCount = examQuestions.filter((q) => examResults[q.id]?.correct).length;
    const totalScore = examQuestions.reduce((sum, q) => sum + (examResults[q.id]?.score ?? (examResults[q.id]?.correct ? 1 : 0)), 0);
    const maxScore = examQuestions.reduce((sum, q) => sum + (q.type === 'choice' ? 1 : (q as EssayQuestion).points), 0);
    const accuracy = Math.round((correctCount / examQuestions.length) * 100);

    return (
      <div className="space-y-4">
        <div className="ancient-card p-5 text-center">
          <div className="seal mx-auto mb-3" style={{ background: '#5B7C5F' }}>
            {accuracy >= 80 ? '优' : accuracy >= 60 ? '良' : '勉'}
          </div>
          <h2 className="font-cal text-xl mb-2" style={{ color: '#2D2A24' }}>
            {accuracy >= 80 ? '才学出众' : accuracy >= 60 ? '尚可精进' : '仍需努力'}
          </h2>
          <div className="text-3xl font-bold mb-1" style={{ color: '#5B7C5F' }}>
            {correctCount}/{examQuestions.length}
          </div>
          <p className="text-sm" style={{ color: '#8B8270' }}>正确率 {accuracy}% · 得分 {totalScore}/{maxScore}</p>
        </div>

        <div className="space-y-3">
          {examQuestions.map((q, idx) => {
            const result = examResults[q.id];
            return (
              <div key={q.id} className="ancient-card p-4">
                <div className="flex items-start gap-3">
                  <div className="seal seal-sm flex-shrink-0" style={{ background: result?.correct ? '#5B7C5F' : '#C7503B' }}>
                    {result?.correct ? '阅' : '批'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1" style={{ color: '#2D2A24' }}>
                      {idx + 1}. {q.question}
                    </div>
                    <div className="text-xs space-y-1" style={{ color: '#8B8270' }}>
                      <p>你的答案：{answers[q.id] || '未作答'}</p>
                      <p>正确答案：{q.type === 'choice' ? (q as ChoiceQuestion).answer : (q as EssayQuestion).referenceAnswer.slice(0, 50) + '...'}</p>
                      {result?.score !== undefined && (
                        <p>得分：{result.score}/{result.maxScore}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { setExamStarted(false); setExamResults(null); }}
          className="w-full py-2.5 rounded font-medium"
          style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
        >
          再来一次
        </button>
      </div>
    );
  }

  // ── 答题界面 ──
  const currentQ = examQuestions[currentIdx];

  return (
    <div className="space-y-4">
      {/* 顶部状态栏 */}
      <div className="ancient-card p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-medium" style={{ color: '#2D2A24' }}>
          第 {currentIdx + 1} / {examQuestions.length} 题
        </div>
        <div className="flex items-center gap-1 text-sm" style={{ color: timeLeft < 60 ? '#C7503B' : '#5B7C5F' }}>
          <Timer className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* 题目 */}
      <div className="ancient-card p-4 sm:p-5">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>
            {currentQ.type === 'choice' ? '选择题' : '主观题'}
          </span>
          <h3 className="font-medium text-sm sm:text-base leading-relaxed" style={{ color: '#2D2A24' }}>
            {currentQ.question}
          </h3>
        </div>

        {currentQ.type === 'choice' && (
          <div className="space-y-2">
            {(currentQ as ChoiceQuestion).options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.label })}
                className={cn(
                  'w-full text-left p-3 rounded text-sm transition-all',
                  answers[currentQ.id] === opt.label ? 'text-white' : ''
                )}
                style={answers[currentQ.id] === opt.label
                  ? { background: '#5B7C5F', border: '1px solid #4A6650' }
                  : { background: '#FBF8F0', border: '1px solid #D4C9B0', color: '#2D2A24' }}
              >
                <span className="font-medium mr-2">{opt.label}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {currentQ.type !== 'choice' && (
          <textarea
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            placeholder="在此输入你的答案... 提示：分点作答（①②③④），使用历史术语，史论结合"
            className="w-full p-3 ancient-input text-sm min-h-[120px]"
          />
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex-1 py-2.5 rounded text-sm font-medium disabled:opacity-50"
          style={{ background: '#EDE6D4', color: '#2D2A24', border: '1px solid #D4C9B0' }}
        >
          上一题
        </button>
        {currentIdx === examQuestions.length - 1 ? (
          <button
            onClick={submitExam}
            className="flex-1 py-2.5 rounded text-sm font-medium"
            style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
          >
            交卷
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex-1 py-2.5 rounded text-sm font-medium"
            style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
          >
            下一题
          </button>
        )}
      </div>

      {/* 答题卡 */}
      <div className="ancient-card p-3">
        <div className="text-xs mb-2" style={{ color: '#8B8270' }}>答题卡</div>
        <div className="flex flex-wrap gap-1.5">
          {examQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={cn(
                'w-8 h-8 rounded text-xs font-bold transition-all',
              )}
              style={idx === currentIdx
                ? { background: '#5B7C5F', color: '#F5F0E6' }
                : answers[q.id]
                  ? { background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }
                  : { background: '#EDE6D4', color: '#8B8270', border: '1px solid #D4C9B0' }
              }
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
