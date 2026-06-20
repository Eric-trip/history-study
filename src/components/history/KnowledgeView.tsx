'use client';

import { useState, useMemo } from 'react';
import { BOOKS } from '@/data/books';
import { KNOWLEDGE_POINTS, getKnowledgeByBook } from '@/data/knowledge';
import { QUESTIONS } from '@/data/questions';
import { BookId, KnowledgePoint } from '@/types';
import { ChevronDown, ChevronRight, Book, Search, Star, Link2 } from 'lucide-react';
import { toggleFavorite, isFavorite } from '@/lib/dataManager';
import { cn } from '@/lib/utils';

export default function KnowledgeView() {
  const [selectedBook, setSelectedBook] = useState<BookId | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKp, setExpandedKp] = useState<string | null>(null);
  const [favState, setFavState] = useState<Record<string, boolean>>({});

  const toggleUnit = (idx: number) => {
    const next = new Set(expandedUnits);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setExpandedUnits(next);
  };

  const bookKnowledge = selectedBook ? getKnowledgeByBook(selectedBook) : [];

  const filteredKnowledge = searchTerm
    ? KNOWLEDGE_POINTS.filter(
        (kp) =>
          kp.title.includes(searchTerm) ||
          kp.content.includes(searchTerm) ||
          kp.keyTerms.some((term) => term.includes(searchTerm))
      )
    : [];

  const getRelatedQuestions = (kp: KnowledgePoint) => {
    return QUESTIONS.filter((q) => q.bookId === kp.bookId && q.unit === kp.unit);
  };

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setFavState({ ...favState, [id]: isFavorite(id) });
  };

  const getFavState = (id: string) => {
    if (favState[id] !== undefined) return favState[id];
    return isFavorite(id);
  };

  const book = selectedBook ? BOOKS.find((b) => b.id === selectedBook) : null;

  return (
    <div className="space-y-4">
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="seal seal-sm" style={{ background: '#5B7C5F', color: '#F5F0E6' }}>典</div>
          <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>教材知识点</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>人教版初中历史 · 共6册 · {KNOWLEDGE_POINTS.length}个知识点</p>
      </div>

      {/* 搜索框 */}
      <div className="ancient-card p-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#8B8270' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索知识点、术语..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#2D2A24' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs" style={{ color: '#8B8270' }}>清除</button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {searchTerm && (
        <div className="space-y-2">
          <div className="text-sm" style={{ color: '#8B8270' }}>找到 {filteredKnowledge.length} 个相关知识点</div>
          {filteredKnowledge.map((kp) => (
            <div key={kp.id} className="ancient-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="text-xs px-2 py-0.5 rounded mr-2" style={{ background: '#EDE6D4', color: '#8B8270' }}>
                    {BOOKS.find((b) => b.id === kp.bookId)?.title}
                  </span>
                  <h3 className="font-cal text-base inline" style={{ color: '#2D2A24' }}>{kp.title}</h3>
                </div>
                <button onClick={() => handleToggleFav(kp.id)} className="flex-shrink-0">
                  <Star className="w-4 h-4" fill={getFavState(kp.id) ? '#B8860B' : 'none'} color={getFavState(kp.id) ? '#B8860B' : '#D4C9B0'} />
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: '#2D2A24' }}>{kp.content}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {kp.keyTerms.map((term, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>{term}</span>
                ))}
              </div>
            </div>
          ))}
          {filteredKnowledge.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#8B8270' }}>未找到相关知识点</p>
            </div>
          )}
        </div>
      )}

      {/* 册别选择 */}
      {!searchTerm && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BOOKS.map((b) => {
            const count = KNOWLEDGE_POINTS.filter((kp) => kp.bookId === b.id).length;
            return (
              <button
                key={b.id}
                onClick={() => { setSelectedBook(b.id); setExpandedUnits(new Set()); }}
                className="ancient-card p-4 text-left transition-all hover:shadow-md"
              >
                <div className="text-xs mb-1" style={{ color: '#8B8270' }}>{b.grade}·{b.semester}</div>
                <div className="font-cal text-base" style={{ color: '#2D2A24' }}>{b.title}</div>
                <div className="text-xs mt-1" style={{ color: '#5B7C5F' }}>{count}个知识点</div>
              </button>
            );
          })}
        </div>
      )}

      {/* 知识点列表 */}
      {!searchTerm && selectedBook && (
        <div className="space-y-3">
          <button
            onClick={() => setSelectedBook(null)}
            className="ancient-btn px-3 py-1.5 text-sm"
          >
            ← 返回册别选择
          </button>

          {book && (
            <div className="ancient-card p-4">
              <h3 className="font-cal text-lg" style={{ color: '#2D2A24' }}>{book.title}</h3>
              <p className="text-sm mt-1" style={{ color: '#8B8270' }}>
                共 {book.units.length} 个单元 · {bookKnowledge.length} 个知识点
              </p>
            </div>
          )}

          {book?.units.map((unit, idx) => {
            const isExpanded = expandedUnits.has(idx);
            const unitKnowledge = bookKnowledge.filter((kp) => unit.name.startsWith(kp.unit));
            return (
              <div key={idx} className="ancient-card">
                <button
                  onClick={() => toggleUnit(idx)}
                  className="w-full p-4 flex items-center gap-2 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#8B8270' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#8B8270' }} />
                  )}
                  <span className="font-cal text-sm" style={{ color: '#2D2A24' }}>{unit.name}</span>
                  <span className="ml-auto text-xs" style={{ color: '#8B8270' }}>
                    {unitKnowledge.length}个知识点 · {unit.lessons.length}课
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {unitKnowledge.map((kp) => (
                      <div key={kp.id} className="p-3 rounded" style={{ background: '#FBF8F0', border: '1px solid #D4C9B0' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {kp.importance === 'high' && (
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#C7503B', color: '#F5F0E6' }}>重点</span>
                              )}
                              <h4 className="font-cal text-base" style={{ color: '#2D2A24' }}>{kp.title}</h4>
                            </div>
                            <p className={cn('text-sm mt-1', expandedKp !== kp.id && 'line-clamp-2')} style={{ color: '#2D2A24' }}>
                              {kp.content}
                            </p>
                            {expandedKp === kp.id && (
                              <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {kp.keyTerms.map((term, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}>{term}</span>
                                  ))}
                                </div>
                                {(() => {
                                  const related = getRelatedQuestions(kp);
                                  if (related.length === 0) return null;
                                  return (
                                    <div className="p-2 rounded" style={{ background: '#EDE6D4' }}>
                                      <div className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>
                                        <Link2 className="w-3 h-3" /> 相关练习题（{related.length}题）
                                      </div>
                                      <div className="space-y-1">
                                        {related.slice(0, 3).map((q) => (
                                          <div key={q.id} className="text-xs" style={{ color: '#2D2A24' }}>
                                            · {q.question.slice(0, 40)}{q.question.length > 40 ? '...' : ''}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button onClick={() => handleToggleFav(kp.id)}>
                              <Star className="w-4 h-4" fill={getFavState(kp.id) ? '#B8860B' : 'none'} color={getFavState(kp.id) ? '#B8860B' : '#D4C9B0'} />
                            </button>
                            <button onClick={() => setExpandedKp(expandedKp === kp.id ? null : kp.id)}>
                              {expandedKp === kp.id ? (
                                <ChevronDown className="w-4 h-4" style={{ color: '#8B8270' }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: '#8B8270' }} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {unitKnowledge.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-xs" style={{ color: '#8B8270' }}>本单元暂无知识点</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!searchTerm && !selectedBook && (
        <div className="text-center py-16">
          <Book className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4C9B0' }} />
          <p className="text-sm" style={{ color: '#8B8270' }}>选择一册课本或搜索知识点开始学习</p>
        </div>
      )}
    </div>
  );
}
