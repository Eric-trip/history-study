'use client';

import { useState } from 'react';
import { BOOKS } from '@/data/books';
import { BookId } from '@/types';
import { ChevronDown, ChevronRight, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeView() {
  const [selectedBook, setSelectedBook] = useState<BookId | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  const toggleUnit = (idx: number) => {
    const next = new Set(expandedUnits);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setExpandedUnits(next);
  };

  return (
    <div className="space-y-4">
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="seal seal-sm">典</div>
          <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>教材知识点</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>人教版初中历史 · 共6册 · 点击查看目录结构</p>
      </div>

      {/* 册别选择 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BOOKS.map((book) => (
          <button
            key={book.id}
            onClick={() => setSelectedBook(book.id)}
            className={cn(
              'p-4 rounded transition-all text-left',
              selectedBook === book.id
                ? 'ancient-btn-active shadow-md'
                : 'ancient-card hover:shadow-md'
            )}
          >
            <div className="font-cal text-base mb-1" style={{ color: '#2D2A24' }}>{book.title}</div>
            <div className="text-xs" style={{ color: '#8B8270' }}>
              {book.units.length}个单元
            </div>
          </button>
        ))}
      </div>

      {/* 选中册别的目录 */}
      {selectedBook && (
        <div className="space-y-3">
          <div className="bamboo-divider" />
          {BOOKS.find((b) => b.id === selectedBook)?.units.map((unit, idx) => {
            const isExpanded = expandedUnits.has(idx);
            return (
              <div key={idx} className="ancient-card">
                <button
                  onClick={() => toggleUnit(idx)}
                  className="w-full flex items-center gap-2 p-4 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#5B7C5F' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#5B7C5F' }} />
                  )}
                  <span className="font-medium text-sm" style={{ color: '#2D2A24' }}>{unit.name}</span>
                  <span className="ml-auto text-xs" style={{ color: '#8B8270' }}>{unit.lessons.length}课</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pl-12 space-y-1.5">
                    {unit.lessons.map((lesson, li) => (
                      <div key={li} className="flex items-center gap-2 text-sm py-1" style={{ color: '#2D2A24' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#5B7C5F' }} />
                        {lesson}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!selectedBook && (
        <div className="text-center py-16">
          <Book className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4C9B0' }} />
          <p className="text-sm" style={{ color: '#8B8270' }}>选择一册课本开始学习吧</p>
        </div>
      )}
    </div>
  );
}
