'use client';

import { useState, useMemo } from 'react';
import { QUESTIONS } from '@/data/questions';
import { BOOKS } from '@/data/books';
import { ChoiceQuestion, EssayQuestion, BookId, Question } from '@/types';
import { gradeEssay, GradingResult } from '@/lib/grader';
import { recordAnswer, addWrongAnswer, addStudyRecord } from '@/lib/storage';
import { CheckCircle2, XCircle, Award, RotateCcw, ChevronRight, Brain } from 'lucide-react';
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

  const handleAnswered = (isCorrect: boolean) => {
    setShowResult(true);
    recordAnswer(isCorrect);
    addStudyRecord({
      date: new Date().toISOString().slice(0, 10),
      totalQuestions: 1,
      correctCount: isCorrect ? 1 : 0,
      studyTime: 2,
    });
    if (!isCorrect && currentQ) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-${Date.now()}`,
        questionId: currentQ.id,
        questionType: currentQ.type,
        questionText: currentQ.question,
        myAnswer: '',
        correctAnswer: currentQ.type === 'choice'
          ? `${(currentQ as ChoiceQuestion).answer}: ${(currentQ as ChoiceQuestion).options.find(o => o.label === (currentQ as ChoiceQuestion).answer)?.text || ''}`
          : (currentQ as EssayQuestion).referenceAnswer,
        reason: '练习答错',
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    onAnswer();
  };

  const nextQuestion = () => {
    startPractice();
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-1">题库练习</h2>
        <p className="text-sm text-gray-500">
          共 {filteredQuestions.length} 题 · 选择题自动判分 · 主观题关键词智能匹配
        </p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">册别：</span>
          <button
            onClick={() => setSelectedBook('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              selectedBook === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            全部
          </button>
          {BOOKS.map((book) => (
            <button
              key={book.id}
              onClick={() => setSelectedBook(book.id)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedBook === book.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {book.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">题型：</span>
          {(['all', 'choice', 'essay'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedType === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {t === 'all' ? '全部' : t === 'choice' ? '选择题' : '主观题'}
            </button>
          ))}
        </div>
      </div>

      {/* 答题区 */}
      {!currentQ ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
          <Brain className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">准备好了吗？点击下方按钮开始练习</p>
          <button
            onClick={startPractice}
            disabled={filteredQuestions.length === 0}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            开始练习
          </button>
        </div>
      ) : currentQ.type === 'choice' ? (
        <ChoicePractice
          question={currentQ as ChoiceQuestion}
          showResult={showResult}
          onAnswered={handleAnswered}
          onNext={nextQuestion}
        />
      ) : (
        <EssayPractice
          question={currentQ as EssayQuestion}
          showResult={showResult}
          onAnswered={handleAnswered}
          onNext={nextQuestion}
        />
      )}
    </div>
  );
}

// ── 选择题组件 ──
function ChoicePractice({
  question,
  showResult,
  onAnswered,
  onNext,
}: {
  question: ChoiceQuestion;
  showResult: boolean;
  onAnswered: (isCorrect: boolean) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (label: string) => {
    if (showResult) return;
    setSelected(label);
    onAnswered(label === question.answer);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">选择题</span>
        <span className="text-xs text-gray-400">{question.unit}</span>
        <span className="text-xs text-gray-400 ml-auto">难度{'⭐'.repeat(question.difficulty)}</span>
      </div>

      <h3 className="text-base font-medium text-gray-800 leading-relaxed">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === question.answer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={showResult}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                !showResult && 'border-gray-100 hover:border-blue-300 hover:bg-blue-50/50',
                showCorrect && 'border-green-500 bg-green-50',
                showWrong && 'border-red-500 bg-red-50',
                showResult && !showCorrect && !showWrong && 'border-gray-100 opacity-60'
              )}
            >
              <span className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                !showResult && 'bg-gray-100 text-gray-500',
                showCorrect && 'bg-green-500 text-white',
                showWrong && 'bg-red-500 text-white',
                showResult && !showCorrect && !showWrong && 'bg-gray-100 text-gray-400'
              )}>
                {showCorrect ? <CheckCircle2 className="w-4 h-4" /> : showWrong ? <XCircle className="w-4 h-4" /> : opt.label}
              </span>
              <span className="text-sm text-gray-700">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className={cn(
            'flex items-center gap-2 font-medium text-sm',
            selected === question.answer ? 'text-green-600' : 'text-red-600'
          )}>
            {selected === question.answer ? (
              <><CheckCircle2 className="w-4 h-4" /> 回答正确！+10分</>
            ) : (
              <><XCircle className="w-4 h-4" /> 回答错误，正确答案是 {question.answer}</>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs font-semibold text-blue-600 mb-1">解析</div>
            <div className="text-sm text-gray-700">{question.explanation}</div>
          </div>
          <button
            onClick={onNext}
            className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
          >
            下一题 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 主观题组件 ──
function EssayPractice({
  question,
  showResult,
  onAnswered,
  onNext,
}: {
  question: EssayQuestion;
  showResult: boolean;
  onAnswered: (isCorrect: boolean) => void;
  onNext: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState<GradingResult | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const result = gradeEssay(question, answer);
    setGrading(result);
    // 正确率60%以上算通过
    onAnswered(result.score / result.maxScore >= 0.6);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">主观题</span>
        <span className="text-xs text-gray-400">{question.unit}</span>
        <span className="text-xs text-gray-400 ml-auto">难度{'⭐'.repeat(question.difficulty)}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">{question.points}分</span>
      </div>

      <h3 className="text-base font-medium text-gray-800 leading-relaxed">{question.question}</h3>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={showResult}
        placeholder="在此输入你的答案...&#10;提示：分点作答（①②③④），使用历史术语，史论结合"
        className="w-full min-h-[150px] p-3 border-2 border-gray-100 rounded-lg text-sm text-gray-700 resize-y focus:border-blue-300 focus:outline-none disabled:bg-gray-50"
      />

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          提交答案
        </button>
      ) : (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* 得分 */}
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-lg text-gray-800">
              得分：{grading?.score}/{grading?.maxScore}
            </span>
          </div>

          {/* 反馈 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-700">{grading?.feedback}</div>
          </div>

          {/* 关键词匹配 */}
          {grading && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 mb-2">踩分关键词匹配</div>
              <div className="flex flex-wrap gap-1.5">
                {grading.keywordMatches.map((km, i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      km.matched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    )}
                  >
                    {km.matched ? '✓' : '✗'} {km.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 参考答案 */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs font-semibold text-green-600 mb-1">参考答案</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{question.referenceAnswer}</div>
          </div>

          {/* 解析 */}
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="text-xs font-semibold text-amber-600 mb-1">答题指导</div>
            <div className="text-sm text-gray-700">{question.explanation}</div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
          >
            下一题 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
