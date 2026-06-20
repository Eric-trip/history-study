'use client';

import { useState, useMemo } from 'react';
import { QUESTIONS } from '@/data/questions';
import { BOOKS } from '@/data/books';
import { KNOWLEDGE_POINTS } from '@/data/knowledge';
import { ChoiceQuestion, EssayQuestion, BookId, Question } from '@/types';
import { gradeEssayWithAI, AIGradingResult } from '@/lib/aiGrader';
import { recordAnswer, addWrongAnswer, addStudyRecord } from '@/lib/storage';
import { toggleFavorite, isFavorite } from '@/lib/dataManager';
import { RotateCcw, ChevronRight, Star, Link2, Lightbulb } from 'lucide-react';

interface PracticeViewProps {
  onAnswer: () => void;
}

export default function PracticeView({ onAnswer }: PracticeViewProps) {
  const [selectedBook, setSelectedBook] = useState<BookId | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'choice' | 'essay'>('all');
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [favState, setFavState] = useState(false);
  const [aiGrading, setAiGrading] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState<AIGradingResult | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (selectedBook !== 'all' && q.bookId !== selectedBook) return false;
      if (selectedType === 'choice' && q.type !== 'choice') return false;
      if (selectedType === 'essay' && q.type === 'choice') return false;
      return true;
    });
  }, [selectedBook, selectedType]);

  const relatedKnowledge = useMemo(() => {
    if (!currentQ) return [];
    return KNOWLEDGE_POINTS.filter(
      (kp) => kp.bookId === currentQ.bookId && kp.unit === currentQ.unit
    );
  }, [currentQ]);

  const book = currentQ ? BOOKS.find((b) => b.id === currentQ.bookId) : null;

  const handleSubmitChoice = () => {
    if (!currentQ || currentQ.type !== 'choice' || !selectedChoice) return;
    const correct = selectedChoice === (currentQ as ChoiceQuestion).answer;
    setIsCorrect(correct);
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

  const handleSubmitEssay = async () => {
    if (!currentQ || currentQ.type === 'choice' || !essayAnswer.trim()) return;
    setAiGrading(true);
    const result = await gradeEssayWithAI(currentQ as EssayQuestion, essayAnswer);
    setGradingResult(result);
    const correct = result.score >= result.maxScore * 0.6;
    setIsCorrect(correct);
    recordAnswer(correct);
    addStudyRecord({ date: new Date().toISOString().slice(0, 10), totalQuestions: 1, correctCount: correct ? 1 : 0, studyTime: 1 });
    if (!correct) {
      addWrongAnswer({
        id: `wa-${currentQ.id}-${Date.now()}`,
        questionId: currentQ.id,
        questionType: currentQ.type,
        questionText: currentQ.question,
        myAnswer: essayAnswer,
        correctAnswer: (currentQ as EssayQuestion).referenceAnswer,
        reason: `主观题得分${result.score}/${result.maxScore}`,
        bookId: currentQ.bookId,
        createdAt: Date.now(),
        reviewed: false,
      });
    }
    onAnswer();
    setAiGrading(false);
    setShowResult(true);
  };

  const onNext = () => {
    const remaining = filteredQuestions.filter((q) => q.id !== currentQ?.id);
    if (remaining.length === 0) {
      setCurrentQ(null); setShowResult(false); setSelectedChoice(null); setEssayAnswer(''); setGradingResult(null);
      return;
    }
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentQ(next); setShowResult(false); setSelectedChoice(null); setEssayAnswer(''); setGradingResult(null);
    setFavState(isFavorite(next.id)); setShowKnowledge(false);
  };

  const activeBtn = { background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' };

  return (
    <div className="space-y-4">
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="seal seal-sm" style={{ background: '#5B7C5F', color: '#F5F0E6' }}>练</div>
          <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>题库练习</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>选择题自动判分，主观题智能批阅</p>
      </div>

      {/* 筛选 + 答题 */}
      <div className="space-y-4">
        {!currentQ && (
          <>
            <div className="ancient-card p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedBook('all')} className="ancient-btn px-3 py-1.5 text-sm" style={selectedBook === 'all' ? activeBtn : {}}>全部</button>
                {BOOKS.map((b) => (
                  <button key={b.id} onClick={() => setSelectedBook(b.id)} className="ancient-btn px-3 py-1.5 text-sm" style={selectedBook === b.id ? activeBtn : {}}>{b.title}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedType('all')} className="ancient-btn px-3 py-1.5 text-sm" style={selectedType === 'all' ? activeBtn : {}}>全部</button>
                <button onClick={() => setSelectedType('choice')} className="ancient-btn px-3 py-1.5 text-sm" style={selectedType === 'choice' ? activeBtn : {}}>选择题</button>
                <button onClick={() => setSelectedType('essay')} className="ancient-btn px-3 py-1.5 text-sm" style={selectedType === 'essay' ? activeBtn : {}}>主观题</button>
              </div>
            </div>
            <button
              onClick={() => {
                const random = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
                setCurrentQ(random); setShowResult(false); setSelectedChoice(null); setEssayAnswer('');
                setGradingResult(null); setFavState(isFavorite(random.id)); setShowKnowledge(false);
              }}
              disabled={filteredQuestions.length === 0}
              className="w-full py-2.5 rounded font-medium disabled:opacity-50"
              style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}
            >
              开始练习（{filteredQuestions.length}题）
            </button>
          </>
        )}

        {/* 答题界面 */}
        {currentQ && !showResult && (
          <div className="ancient-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>{book?.title}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#8B8270' }}>{currentQ.unit}</span>
                <span className="text-xs" style={{ color: '#8B8270' }}>难度{'★'.repeat(currentQ.difficulty)}</span>
              </div>
              <button onClick={() => { toggleFavorite(currentQ.id); setFavState(!favState); }} className="flex-shrink-0">
                <Star className="w-5 h-5" fill={favState ? '#B8860B' : 'none'} color={favState ? '#B8860B' : '#D4C9B0'} />
              </button>
            </div>

            <h3 className="font-cal text-base" style={{ color: '#2D2A24' }}>{currentQ.question}</h3>

            {currentQ.type === 'choice' && (
              <div className="space-y-2">
                {(currentQ as ChoiceQuestion).options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedChoice(opt.label)}
                    className="w-full text-left p-3 rounded text-sm transition-all"
                    style={selectedChoice === opt.label
                      ? { background: '#E8F0E8', border: '1px solid #5B7C5F', color: '#2D2A24' }
                      : { background: '#FBF8F0', border: '1px solid #D4C9B0', color: '#2D2A24' }
                    }
                  >
                    <span className="font-bold mr-2">{opt.label}.</span>{opt.text}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type !== 'choice' && (
              <div>
                <textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="在此输入你的答案... 提示：分点作答（①②③④），使用历史术语，史论结合"
                  className="w-full p-3 ancient-input text-sm min-h-[120px] resize-y"
                />
                <div className="text-xs mt-1" style={{ color: '#8B8270' }}>{essayAnswer.length}字</div>
              </div>
            )}

            <button
              onClick={currentQ.type === 'choice' ? handleSubmitChoice : handleSubmitEssay}
              disabled={currentQ.type === 'choice' ? !selectedChoice : !essayAnswer.trim() || aiGrading}
              className="w-full py-2.5 rounded font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#C7503B', color: '#F5F0E6', border: '1px solid #A04030' }}
            >
              {aiGrading ? '批阅中...' : '提交答案'}
            </button>
          </div>
        )}

        {/* 结果界面 */}
        {currentQ && showResult && (
          <div className="ancient-card p-5 space-y-4">
            <div className="flex items-center justify-center py-4">
              {isCorrect ? (
                <div className="seal seal-lg" style={{ background: '#C7503B', color: '#F5F0E6' }}>阅</div>
              ) : (
                <div className="seal seal-lg" style={{ background: '#2D2A24', color: '#F5F0E6' }}>误</div>
              )}
            </div>

            {currentQ.type !== 'choice' && gradingResult && (
              <>
                <div className="text-center">
                  <div className="font-cal text-2xl" style={{ color: isCorrect ? '#5B7C5F' : '#C7503B' }}>
                    {gradingResult.score} / {gradingResult.maxScore} 分
                  </div>
                  <div className="text-sm mt-1" style={{ color: '#8B8270' }}>{gradingResult.feedback}</div>
                </div>

                {gradingResult.suggestions && gradingResult.suggestions.length > 0 && (
                  <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                    <div className="flex items-center gap-1 mb-2">
                      <Lightbulb className="w-4 h-4" style={{ color: '#B8860B' }} />
                      <div className="text-xs font-semibold" style={{ color: '#B8860B' }}>学习建议</div>
                    </div>
                    <ul className="space-y-1">
                      {gradingResult.suggestions.map((s, i) => (
                        <li key={i} className="text-sm flex gap-2" style={{ color: '#2D2A24' }}>
                          <span style={{ color: '#5B7C5F' }}>·</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#5B7C5F' }}>关键词踩分</div>
                  <div className="flex flex-wrap gap-1.5">
                    {gradingResult.keywordMatches.map((km, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded" style={km.matched
                        ? { background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }
                        : { background: '#F5E8E8', color: '#C7503B', border: '1px solid #C7503B', textDecoration: 'line-through' }
                      }>
                        {km.matched ? '✓' : '✗'} {km.keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentQ.type === 'choice' && (
              <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                <div className="text-sm" style={{ color: '#2D2A24' }}>
                  正确答案：<span className="font-bold" style={{ color: '#5B7C5F' }}>{(currentQ as ChoiceQuestion).answer}</span>
                </div>
              </div>
            )}

            {/* 知识点联动 */}
            {relatedKnowledge.length > 0 && (
              <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                <button onClick={() => setShowKnowledge(!showKnowledge)} className="flex items-center gap-1 text-xs font-semibold w-full" style={{ color: '#5B7C5F' }}>
                  <Link2 className="w-3 h-3" /> 相关知识点（{relatedKnowledge.length}个）
                </button>
                {showKnowledge && (
                  <div className="mt-3 space-y-2">
                    {relatedKnowledge.map((kp) => (
                      <div key={kp.id} className="p-2 rounded" style={{ background: '#EDE6D4' }}>
                        <div className="font-cal text-sm" style={{ color: '#2D2A24' }}>{kp.title}</div>
                        <div className="text-xs mt-1" style={{ color: '#2D2A24' }}>{kp.content}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {kp.keyTerms.map((term, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>{term}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentQ.type !== 'choice' && (
              <div className="p-3 rounded" style={{ background: '#E8F0E8', border: '1px solid #5B7C5F' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>参考答案</div>
                <div className="text-sm whitespace-pre-line" style={{ color: '#2D2A24' }}>{(currentQ as EssayQuestion).referenceAnswer}</div>
              </div>
            )}

            <div className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#B8860B' }}>解析</div>
              <div className="text-sm" style={{ color: '#2D2A24' }}>{currentQ.explanation}</div>
            </div>

            <button onClick={onNext} className="w-full py-2.5 rounded font-medium flex items-center justify-center gap-1" style={{ background: '#5B7C5F', color: '#F5F0E6', border: '1px solid #4A6650' }}>
              下一题 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentQ && (
          <button
            onClick={() => { setCurrentQ(null); setSelectedChoice(null); setEssayAnswer(''); setGradingResult(null); }}
            className="ancient-btn px-4 py-2 text-sm flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" /> 重新选择
          </button>
        )}
      </div>
    </div>
  );
}
