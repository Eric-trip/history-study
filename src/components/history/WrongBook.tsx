'use client';

import { useState, useEffect } from 'react';
import { getWrongAnswers, deleteWrongAnswer, toggleWrongAnswerReviewed } from '@/lib/storage';
import { WrongAnswer } from '@/types';
import { BOOKS } from '@/data/books';
import { Trash2, CheckCircle2, NotebookPen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WrongBook() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterBook, setFilterBook] = useState<string>('all');

  useEffect(() => {
    setWrongAnswers(getWrongAnswers());
  }, []);

  const refresh = () => setWrongAnswers(getWrongAnswers());

  const handleDelete = (id: string) => {
    deleteWrongAnswer(id);
    refresh();
  };

  const handleToggleReviewed = (id: string) => {
    toggleWrongAnswerReviewed(id);
    refresh();
  };

  const filtered = filterBook === 'all'
    ? wrongAnswers
    : wrongAnswers.filter((w) => w.bookId === filterBook);

  return (
    <div className="space-y-4">
      <div className="bg-red-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">错题本</h2>
          <p className="text-sm text-gray-500">
            共 {wrongAnswers.length} 题 · 已复习 {wrongAnswers.filter((w) => w.reviewed).length} 题
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> 手动添加
        </button>
      </div>

      {/* 添加错题表单 */}
      {showAddForm && (
        <AddWrongAnswerForm
          onSubmit={() => {
            setShowAddForm(false);
            refresh();
          }}
        />
      )}

      {/* 筛选 */}
      {wrongAnswers.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterBook('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              filterBook === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
            )}
          >
            全部
          </button>
          {BOOKS.map((book) => (
            <button
              key={book.id}
              onClick={() => setFilterBook(book.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                filterBook === book.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
              )}
            >
              {book.title}
            </button>
          ))}
        </div>
      )}

      {/* 错题列表 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
          <NotebookPen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {wrongAnswers.length === 0 ? '错题本还是空的，练习或手动添加错题吧' : '该册别暂无错题'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((wa) => {
            const book = BOOKS.find((b) => b.id === wa.bookId);
            return (
              <div
                key={wa.id}
                className={cn(
                  'bg-white rounded-xl p-4 border',
                  wa.reviewed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {book?.title || '未知'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                      {wa.questionType === 'choice' ? '选择题' : '主观题'}
                    </span>
                    {wa.reviewed && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">已复习</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleReviewed(wa.id)}
                      className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      title={wa.reviewed ? '标记为未复习' : '标记为已复习'}
                    >
                      <CheckCircle2 className={cn('w-4 h-4', wa.reviewed ? 'text-green-500' : 'text-gray-300')} />
                    </button>
                    <button
                      onClick={() => handleDelete(wa.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">题目：</span>
                    <span className="text-gray-800">{wa.questionText}</span>
                  </div>
                  {wa.myAnswer && (
                    <div>
                      <span className="text-gray-400 text-xs">我的答案：</span>
                      <span className="text-red-600">{wa.myAnswer}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-xs">正确答案：</span>
                    <span className="text-green-600">{wa.correctAnswer}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">丢分原因：</span>
                    <span className="text-gray-600">{wa.reason}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 添加错题表单 ──
function AddWrongAnswerForm({ onSubmit }: { onSubmit: () => void }) {
  const [questionText, setQuestionText] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [reason, setReason] = useState('');
  const [bookId, setBookId] = useState<string>('grade7-up');
  const [type, setType] = useState<'choice' | 'short-answer' | 'essay'>('short-answer');

  const handleSubmit = () => {
    if (!questionText.trim() || !correctAnswer.trim()) return;
    const { addWrongAnswer } = require('@/lib/storage');
    addWrongAnswer({
      id: `wa-manual-${Date.now()}`,
      questionId: `manual-${Date.now()}`,
      type,
      questionText: questionText.trim(),
      myAnswer: myAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      reason: reason.trim() || '未标注',
      bookId,
      createdAt: Date.now(),
      reviewed: false,
    });
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl p-4 border-2 border-red-200 space-y-3">
      <h3 className="font-semibold text-gray-800">手动添加错题</h3>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {BOOKS.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="choice">选择题</option>
          <option value="short-answer">简答题</option>
          <option value="essay">材料分析题</option>
        </select>
      </div>
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="题目内容"
        className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[60px]"
      />
      <input
        value={myAnswer}
        onChange={(e) => setMyAnswer(e.target.value)}
        placeholder="我的答案（选填）"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <textarea
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        placeholder="正确答案"
        className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[60px]"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="丢分原因（如：审题错误、知识点不会、没分点）"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!questionText.trim() || !correctAnswer.trim()}
          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          添加
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}
