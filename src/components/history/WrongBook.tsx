'use client';

import { useState, useEffect } from 'react';
import { getWrongAnswers, deleteWrongAnswer, toggleWrongAnswerReviewed } from '@/lib/storage';
import { WrongAnswer } from '@/types';
import { BOOKS } from '@/data/books';
import { Trash2, Plus, NotebookPen } from 'lucide-react';
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
      <div className="ancient-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="seal seal-sm">错</div>
            <div>
              <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>错题本</h2>
              <p className="text-sm" style={{ color: '#8B8270' }}>共{wrongAnswers.length}道错题</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="ancient-btn-active px-3 py-1.5 rounded text-sm flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 手动添加
          </button>
        </div>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <AddWrongAnswerForm
          onSubmit={() => { setShowAddForm(false); refresh(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 筛选 */}
      {wrongAnswers.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterBook('all')}
            className={cn('px-3 py-1 rounded text-sm', filterBook === 'all' ? 'ancient-btn-active' : 'ancient-btn')}
          >
            全部
          </button>
          {BOOKS.map((book) => (
            <button
              key={book.id}
              onClick={() => setFilterBook(book.id)}
              className={cn('px-3 py-1 rounded text-sm', filterBook === book.id ? 'ancient-btn-active' : 'ancient-btn')}
            >
              {book.title}
            </button>
          ))}
        </div>
      )}

      <div className="bamboo-divider" />

      {/* 错题列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <NotebookPen className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4C9B0' }} />
          <p className="font-cal text-base" style={{ color: '#8B8270' }}>
            {wrongAnswers.length === 0 ? '错题本空空如也' : '该册别暂无错题'}
          </p>
          <p className="text-sm mt-1" style={{ color: '#8B8270' }}>
            {wrongAnswers.length === 0 ? '做题时会自动收录错题，也可以手动添加' : '换一个册别看看'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((wa) => {
            const book = BOOKS.find((b) => b.id === wa.bookId);
            return (
              <div key={wa.id} className="ancient-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#5B7C5F', border: '1px solid #D4C9B0' }}>
                      {book?.title || '未知'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#5B7C5F', border: '1px solid #D4C9B0' }}>
                      {wa.questionType === 'choice' ? '选择题' : '主观题'}
                    </span>
                    {wa.reviewed && (
                      <span className="seal seal-sm">阅</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleReviewed(wa.id)}
                      className="ancient-btn p-1.5 rounded text-xs"
                      title={wa.reviewed ? '标记为未复习' : '标记为已复习'}
                    >
                      {wa.reviewed ? '取消复习' : '已复习'}
                    </button>
                    <button
                      onClick={() => handleDelete(wa.id)}
                      className="ancient-btn p-1.5 rounded text-xs"
                      style={{ color: '#C7503B' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span style={{ color: '#8B8270' }}>题目：</span>
                    <span style={{ color: '#2D2A24' }}>{wa.questionText}</span>
                  </div>
                  <div>
                    <span style={{ color: '#C7503B' }}>我的答案：</span>
                    <span style={{ color: '#2D2A24' }}>{wa.myAnswer}</span>
                  </div>
                  <div>
                    <span style={{ color: '#5B7C5F' }}>正确答案：</span>
                    <span style={{ color: '#2D2A24' }}>{wa.correctAnswer}</span>
                  </div>
                  {wa.reason && (
                    <div>
                      <span style={{ color: '#B8860B' }}>丢分原因：</span>
                      <span style={{ color: '#2D2A24' }}>{wa.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddWrongAnswerForm({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) {
  const [bookId, setBookId] = useState<string>('grade7-up');
  const [questionType, setQuestionType] = useState<'choice' | 'essay'>('choice');
  const [questionText, setQuestionText] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!questionText.trim() || !correctAnswer.trim()) return;
    const { addWrongAnswer } = require('@/lib/storage');
    addWrongAnswer({
      id: `wa-manual-${Date.now()}`,
      questionId: `manual-${Date.now()}`,
      questionType,
      questionText,
      myAnswer: myAnswer || '未作答',
      correctAnswer,
      reason: reason || '未标注',
      bookId,
      createdAt: Date.now(),
      reviewed: false,
    });
    onSubmit();
  };

  return (
    <div className="ancient-card p-4 space-y-3">
      <h3 className="font-cal text-base" style={{ color: '#2D2A24' }}>手动添加错题</h3>
      <div className="flex gap-2">
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="ancient-input px-2 py-1.5 text-sm"
        >
          {BOOKS.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as 'choice' | 'essay')}
          className="ancient-input px-2 py-1.5 text-sm"
        >
          <option value="choice">选择题</option>
          <option value="essay">主观题</option>
        </select>
      </div>
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="题目内容"
        className="w-full p-2 ancient-input text-sm min-h-[60px]"
      />
      <input
        value={myAnswer}
        onChange={(e) => setMyAnswer(e.target.value)}
        placeholder="我的答案（可选）"
        className="w-full px-2 py-1.5 ancient-input text-sm"
      />
      <textarea
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        placeholder="正确答案"
        className="w-full p-2 ancient-input text-sm min-h-[60px]"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="丢分原因（如：审题错误、知识点不会、没分点）"
        className="w-full px-2 py-1.5 ancient-input text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!questionText.trim() || !correctAnswer.trim()}
          className="flex-1 py-2 rounded text-sm font-medium disabled:opacity-50"
          style={{ background: '#C7503B', color: '#F5F0E6', border: '1px solid #A04030' }}
        >
          添加
        </button>
        <button
          onClick={onCancel}
          className="ancient-btn px-4 py-2 rounded text-sm"
        >
          取消
        </button>
      </div>
    </div>
  );
}
