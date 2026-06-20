'use client';

import { useState, useEffect } from 'react';
import { getDailyPracticeQuestions } from '@/lib/storage';
import { getQuestionById } from '@/data/questions';
import { ChoiceQuestion, EssayQuestion, Question } from '@/types';
import { gradeEssay } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord, updateStreak } from '@/lib/storage';
import { Calendar, ChevronRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyPracticeProps {
  onAnswer: () => void;
}

export default function DailyPractice({ onAnswer }: DailyPracticeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({} as Record<string, string>);
  const [results, setResults] = useState<Record<string, { correct: boolean; score?: number; maxScore?: number }> | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const ids = getDailyPracticeQuestions(5);
    const qs = ids.map((id) => getQuestionById(id)).filter(Boolean) as Question[];
    setQuestions(qs);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="ancient-card p-8 text-center">
        <p style={{ color: '#8B8270' }}>加载中...</p>
      </div>
    );
  }

  // ── 完成界面 ──
  if (completed) {
    const correctCount = questions.filter((q) => results?.[q.id]?.correct).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="space-y-4">
        <div className="ancient-card p-6 text-center">
          <div className="seal mx-auto mb-3" style={{ background: '#5B7C5F' }}>
            {accuracy >= 80 ? '优' : accuracy >= 60 ? '良' : '勉'}
          </div>
          <h2 className="font-cal text-xl mb-2" style={{ color: '#2D2A24' }}>今日功课已完成</h2>
          <div className="text-3xl font-bold mb-1" style={{ color: '#5B7C5F' }}>
            {correctCount}/{questions.length}
          </div>
          <p className="text-sm" style={{ color: '#8B8270' }}>正确率 {accuracy}%</p>
          <div className="bamboo-divider my-4" />
          <p className="text-sm" style={{ color: '#8B8270' }}>
            {accuracy >= 80 ? '学有所成，再接再厉！' : accuracy >= 60 ? '勤学不辍，日有所进。' : '骐骥一跃，不能十步。继续努力！'}
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  const handleSubmitChoice = () => {
    if (!selectedChoice) return;
    const correct = selectedChoice === (currentQ as ChoiceQuestion).answer;
    recordAnswer(correct);
    addStudyRecord({ date: new Date().toISOString().slice(0, 10), totalQuestions: 1, correctCount: correct ? 1 : 0, studyTime: 1 });
    if (!correct) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-daily-${Date.now()}`,
        questionId: currentQ.id,
        questionType: 'choice',
        questionText: currentQ.question,
        myAnswer: selectedChoice,
        correctAnswer: (currentQ as ChoiceQuestion).answer,
        reason: '每日一练答错',
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    if (!results) {
      setResults({ [currentQ.id]: { correct } });
    } else {
      setResults({ ...results, [currentQ.id]: { correct } });
    }
    setShowResult(true);
    onAnswer();
  };

  const handleSubmitEssay = () => {
    if (!essayAnswer.trim()) return;
    const result = gradeEssay(currentQ as EssayQuestion, essayAnswer);
    setGradingResult(result);
    const correct = result.score >= result.maxScore * 0.6;
    recordAnswer(correct);
    addStudyRecord({ date: new Date().toISOString().slice(0, 10), totalQuestions: 1, correctCount: correct ? 1 : 0, studyTime: 1 });
    if (!correct) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-daily-${Date.now()}`,
        questionId: currentQ.id,
        questionType: 'essay',
        questionText: currentQ.question,
        myAnswer: essayAnswer,
        correctAnswer: (currentQ as EssayQuestion).referenceAnswer,
        reason: `每日一练得分${result.score}/${result.maxScore}`,
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    if (!results) {
      setResults({ [currentQ.id]: { correct, score: result.score, maxScore: result.maxScore } });
    } else {
      setResults({ ...results, [currentQ.id]: { correct, score: result.score, maxScore: result.maxScore } });
    }
    setShowResult(true);
    onAnswer();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedChoice(null);
      setEssayAnswer('');
      setGradingResult(null);
      setShowResult(false);
    } else {
      updateStreak();
      setCompleted(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部 */}
      <div className="ancient-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="seal seal-sm">日</div>
            <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>每日一练</h2>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#8B8270' }}>
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="bamboo-divider my-3" />
        <div className="flex items-center gap-1 text-sm" style={{ color: '#5B7C5F' }}>
          <Flame className="w-4 h-4" />
          第 {currentIdx + 1} / {questions.length} 题
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="ancient-card p-4 sm:p-5">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>
            {currentQ.type === 'choice' ? '选择题' : '主观题'}
          </span>
          <h3 className="font-medium text-sm sm:text-base leading-relaxed" style={{ color: '#2D2A24' }}>
            {currentQ.question}
          </h3>
        </div>

        {/* 选择题 */}
        {currentQ.type === 'choice' && (
          <div className="space-y-2">
            {(currentQ as ChoiceQuestion).options.map((opt) => {
              const isSelected = selectedChoice === opt.label;
              const isCorrect = showResult && opt.label === (currentQ as ChoiceQuestion).answer;
              const isWrong = showResult && isSelected && opt.label !== (currentQ as ChoiceQuestion).answer;
              return (
                <button
                  key={opt.label}
                  disabled={showResult}
                  onClick={() => setSelectedChoice(opt.label)}
                  className={cn('w-full text-left p-3 rounded text-sm transition-all')}
                  style={
                    isCorrect
                      ? { background: '#E8F0E8', border: '2px solid #5B7C5F', color: '#2D2A24' }
                      : isWrong
                        ? { background: '#FDF0EE', border: '2px solid #C7503B', color: '#2D2A24' }
                        : isSelected
                          ? { background: '#5B7C5F', border: '1px solid #4A6650', color: '#F5F0E6' }
                          : { background: '#FBF8F0', border: '1px solid #D4C9B0', color: '#2D2A24' }
                  }
                >
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                  {isCorrect && <span className="float-right">✓</span>}
                  {isWrong && <span className="float-right">✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 主观题 */}
        {currentQ.type !== 'choice' && (
          <textarea
            value={essayAnswer}
            onChange={(e) => setEssayAnswer(e.target.value)}
            disabled={showResult}
            placeholder="在此输入你的答案... 提示：分点作答（①②③④），使用历史术语，史论结合"
            className="w-full p-3 ancient-input text-sm min-h-[120px]"
          />
        )}

        {/* 提交按钮 */}
        {!showResult && (
          <button
            onClick={currentQ.type === 'choice' ? handleSubmitChoice : handleSubmitEssay}
            disabled={currentQ.type === 'choice' ? !selectedChoice : !essayAnswer.trim()}
            className="w-full mt-3 py-2.5 rounded font-medium disabled:opacity-50"
            style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
          >
            提交答案
          </button>
        )}

        {/* 结果反馈 */}
        {showResult && (
          <div className="mt-4 space-y-3">
            {/* 印章反馈 */}
            <div className="flex items-center justify-center py-2">
              <div className="seal" style={{ background: results?.[currentQ.id]?.correct ? '#5B7C5F' : '#C7503B' }}>
                {results?.[currentQ.id]?.correct ? '阅' : '批'}
              </div>
            </div>

            {currentQ.type === 'choice' && (
              <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>解析</div>
                <div className="text-sm" style={{ color: '#2D2A24' }}>{currentQ.explanation}</div>
              </div>
            )}

            {gradingResult && (
              <>
                <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: '#5B7C5F' }}>得分</span>
                    <span className="text-lg font-bold" style={{ color: '#5B7C5F' }}>
                      {gradingResult.score}/{gradingResult.maxScore}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    {gradingResult.keywordMatches.map((km: any, i: number) => (
                      <span key={i} className="inline-block mr-2 text-xs" style={{ color: km.matched ? '#5B7C5F' : '#C7503B' }}>
                        {km.matched ? '✓' : '✗'} {km.keyword}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#8B8270' }}>{gradingResult.feedback}</div>
                </div>
                <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>参考答案</div>
                  <div className="text-sm whitespace-pre-line" style={{ color: '#2D2A24' }}>{(currentQ as EssayQuestion).referenceAnswer}</div>
                </div>
              </>
            )}

            <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#B8860B' }}>解析</div>
              <div className="text-sm" style={{ color: '#2D2A24' }}>{currentQ.explanation}</div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded font-medium flex items-center justify-center gap-1"
              style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
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
