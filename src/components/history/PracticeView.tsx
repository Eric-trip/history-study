'use client';

import { useState, useMemo } from 'react';
import { QUESTIONS } from '@/data/questions';
import { BOOKS } from '@/data/books';
import { ChoiceQuestion, EssayQuestion, BookId, Question } from '@/types';
import { gradeEssay, GradingResult } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord } from '@/lib/storage';
import { RotateCcw, ChevronRight, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeViewProps {
  onAnswer: () => void;
}

export default function PracticeView({ onAnswer }: PracticeViewProps) {
  const [selectedBook, setSelectedBook] = useState<BookId | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'choice' | 'essay'>('all');
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [showResult, setShowResult] = useState(false);

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (selectedBook !== 'all' && q.bookId !== selectedBook) return false;
      if (selectedType === 'choice' && q.type !== 'choice') return false;
      if (selectedType === 'essay' && q.type === 'choice') return false;
      return true;
    });
  }, [selectedBook, selectedType]);

  const startPractice = () => {
    if (filteredQuestions.length === 0) return;
    const random = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setCurrentQ(random);
    setShowResult(false);
  };

  // 选择题作答
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  const handleSubmitChoice = () => {
    if (!currentQ || currentQ.type !== 'choice' || !selectedChoice) return;
    const correct = selectedChoice === (currentQ as ChoiceQuestion).answer;
    recordAnswer(correct);
    addStudyRecord({ date: new Date().toISOString().slice(0, 10), totalQuestions: 1, correctCount: correct ? 1 : 0, studyTime: 1 });
    if (!correct) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-${Date.now()}`,
        questionId: currentQ.id,
        questionType: 'choice',
        questionText: currentQ.question,
        myAnswer: selectedChoice,
        correctAnswer: (currentQ as ChoiceQuestion).answer,
        reason: '选择题答错',
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    onAnswer();
    setShowResult(true);
  };

  const handleSubmitEssay = () => {
    if (!currentQ || currentQ.type === 'choice' || !essayAnswer.trim()) return;
    const result = gradeEssay(currentQ as EssayQuestion, essayAnswer);
    setGradingResult(result);
    const correct = result.score >= result.maxScore * 0.6;
    recordAnswer(correct);
    addStudyRecord({ date: new Date().toISOString().slice(0, 10), totalQuestions: 1, correctCount: correct ? 1 : 0, studyTime: 1 });
    if (!correct) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-${Date.now()}`,
        questionId: currentQ.id,
        questionType: 'essay',
        questionText: currentQ.question,
        myAnswer: essayAnswer,
        correctAnswer: (currentQ as EssayQuestion).referenceAnswer,
        reason: result.missedKeywords.join('、'),
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    onAnswer();
    setShowResult(true);
  };

  const onNext = () => {
    startPractice();
    setSelectedChoice(null);
    setEssayAnswer('');
    setGradingResult(null);
  };

  if (!currentQ) {
    return (
      <div className="space-y-4">
        <div className="ancient-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="seal seal-sm">练</div>
            <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>题库练习</h2>
          </div>
          <p className="text-sm" style={{ color: '#8B8270' }}>
            共{filteredQuestions.length}道题 · 选择册别和题型后点击开始
          </p>
        </div>

        {/* 册别选择 */}
        <div>
          <h3 className="font-cal text-base title-deco mb-2" style={{ color: '#2D2A24' }}>选择册别</h3>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedBook('all')}
              className={cn('px-3 py-1.5 rounded text-sm', selectedBook === 'all' ? 'ancient-btn-active' : 'ancient-btn')}
            >
              全部
            </button>
            {BOOKS.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                className={cn('px-3 py-1.5 rounded text-sm', selectedBook === book.id ? 'ancient-btn-active' : 'ancient-btn')}
              >
                {book.title}
              </button>
            ))}
          </div>
        </div>

        {/* 题型选择 */}
        <div>
          <h3 className="font-cal text-base title-deco mb-2" style={{ color: '#2D2A24' }}>选择题型</h3>
          <div className="flex gap-1.5">
            {([
              { val: 'all', label: '全部' },
              { val: 'choice', label: '选择题' },
              { val: 'essay', label: '主观题' },
            ] as const).map((t) => (
              <button
                key={t.val}
                onClick={() => setSelectedType(t.val)}
                className={cn('px-3 py-1.5 rounded text-sm', selectedType === t.val ? 'ancient-btn-active' : 'ancient-btn')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bamboo-divider" />

        <button
          onClick={startPractice}
          disabled={filteredQuestions.length === 0}
          className="w-full py-3 rounded font-cal text-base transition-all disabled:opacity-50"
          style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
        >
          开始练习
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 题目卡片 */}
      <div className="ancient-card p-5 relative">
        <div className="corner-seal">{currentQ.type === 'choice' ? '择' : '答'}</div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#5B7C5F', border: '1px solid #D4C9B0' }}>
            {BOOKS.find((b) => b.id === currentQ.bookId)?.title}
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#5B7C5F', border: '1px solid #D4C9B0' }}>
            {currentQ.unit}
          </span>
          <span className="text-xs" style={{ color: '#8B8270' }}>
            {currentQ.type === 'choice' ? '选择题' : `主观题（${(currentQ as EssayQuestion).points}分）`}
          </span>
        </div>
        <h3 className="font-cal text-base mb-4" style={{ color: '#2D2A24' }}>{currentQ.question}</h3>

        {/* 选择题选项 */}
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
                  className={cn(
                    'w-full text-left p-3 rounded transition-all flex items-center gap-3',
                    showResult && isCorrect && 'mark-correct',
                    showResult && isWrong && 'mark-wrong',
                    !showResult && isSelected && 'ancient-btn-active',
                    !showResult && !isSelected && 'ancient-card',
                    showResult && !isCorrect && !isWrong && 'ancient-card opacity-60'
                  )}
                >
                  <span className="font-bold w-6 h-6 flex items-center justify-center rounded text-sm flex-shrink-0" style={{ border: '1px solid #D4C9B0', background: '#FBF8F0' }}>
                    {opt.label}
                  </span>
                  <span className="text-sm" style={{ color: '#2D2A24' }}>{opt.text}</span>
                  {isCorrect && <span className="ml-auto seal seal-sm">批</span>}
                  {isWrong && <span className="ml-auto text-2xl font-bold" style={{ color: '#5D4E37' }}>✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 主观题输入 */}
        {currentQ.type !== 'choice' && (
          <div className="space-y-3">
            <textarea
              value={essayAnswer}
              onChange={(e) => setEssayAnswer(e.target.value)}
              disabled={showResult}
              placeholder="在此输入你的答案... 提示：分点作答（①②③④），使用历史术语，史论结合"
              className="w-full p-3 ancient-input min-h-[120px] text-sm resize-y"
            />
            {!showResult && (
              <button
                onClick={handleSubmitEssay}
                disabled={!essayAnswer.trim()}
                className="w-full py-2.5 rounded font-medium transition-all disabled:opacity-50"
                style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
              >
                提交答案
              </button>
            )}
          </div>
        )}

        {/* 选择题提交按钮 */}
        {currentQ.type === 'choice' && !showResult && (
          <button
            onClick={handleSubmitChoice}
            disabled={!selectedChoice}
            className="w-full py-2.5 mt-3 rounded font-medium transition-all disabled:opacity-50"
            style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
          >
            提交答案
          </button>
        )}

        {/* 结果展示 */}
        {showResult && (
          <div className="mt-4 space-y-3">
            <div className="bamboo-divider" />

            {/* 选择题结果 */}
            {currentQ.type === 'choice' && (
              <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                <div className="flex items-center gap-2 mb-1">
                  {selectedChoice === (currentQ as ChoiceQuestion).answer ? (
                    <span className="seal seal-sm">批</span>
                  ) : (
                    <span className="text-xl font-bold" style={{ color: '#5D4E37' }}>✗</span>
                  )}
                  <span className="font-cal text-sm" style={{ color: '#2D2A24' }}>
                    {selectedChoice === (currentQ as ChoiceQuestion).answer ? '正确' : '错误'}
                  </span>
                </div>
                <div className="text-sm mt-2" style={{ color: '#2D2A24' }}>
                  <span style={{ color: '#8B8270' }}>正确答案：</span>
                  {(currentQ as ChoiceQuestion).answer}
                </div>
              </div>
            )}

            {/* 主观题判分结果 */}
            {currentQ.type !== 'choice' && gradingResult && (
              <div className="space-y-3">
                {/* 印章式评分 */}
                <div className="flex items-center gap-4 p-4 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="seal" style={{ fontSize: '1rem' }}>
                    {gradingResult.score}/{gradingResult.maxScore}
                  </div>
                  <div className="flex-1">
                    <div className="font-cal text-base" style={{ color: '#2D2A24' }}>评卷</div>
                    <div className="text-sm" style={{ color: '#8B8270' }}>{gradingResult.feedback}</div>
                  </div>
                </div>

                {/* 关键词匹配 */}
                <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#5B7C5F' }}>踩分关键词</div>
                  <div className="flex flex-wrap gap-1.5">
                    {gradingResult.keywordMatches.map((km, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: km.matched ? '#D4E5D0' : '#F5E0DC',
                          color: km.matched ? '#3D6B3D' : '#C7503B',
                          border: `1px solid ${km.matched ? '#A0C8A0' : '#E0C0BC'}`,
                        }}
                      >
                        {km.matched ? '✓' : '✗'} {km.keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 参考答案 */}
                <div className="p-3 rounded" style={{ background: '#EDE6D4', border: '1px solid #D4C9B0' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>参考答案</div>
                  <div className="text-sm whitespace-pre-line" style={{ color: '#2D2A24' }}>
                    {(currentQ as EssayQuestion).referenceAnswer}
                  </div>
                </div>

                {/* 解析 */}
                <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#B8860B' }}>答题指导</div>
                  <div className="text-sm" style={{ color: '#2D2A24' }}>{currentQ.explanation}</div>
                </div>
              </div>
            )}

            {/* 选择题解析 */}
            {currentQ.type === 'choice' && (
              <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#B8860B' }}>解析</div>
                <div className="text-sm" style={{ color: '#2D2A24' }}>{currentQ.explanation}</div>
              </div>
            )}

            <button
              onClick={onNext}
              className="w-full py-2.5 rounded font-medium transition-all flex items-center justify-center gap-1"
              style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
            >
              下一题 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 重新选择 */}
      <button
        onClick={() => { setCurrentQ(null); setSelectedChoice(null); setEssayAnswer(''); setGradingResult(null); }}
        className="ancient-btn px-4 py-2 text-sm flex items-center gap-1 mx-auto"
      >
        <RotateCcw className="w-3 h-3" /> 重新选择
      </button>
    </div>
  );
}
