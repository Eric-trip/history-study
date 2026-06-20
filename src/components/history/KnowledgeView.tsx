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
      <div className="bg-blue-50 rounded-xl p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-1">教材知识点</h2>
        <p className="text-sm text-gray-500">人教版初中历史 · 共6册 · 点击查看目录结构</p>
      </div>

      {/* 册别选择 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BOOKS.map((book) => (
          <button
            key={book.id}
            onClick={() => setSelectedBook(book.id)}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              selectedBook === book.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-blue-300'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              selectedBook === book.id ? 'bg-blue-500' : 'bg-gray-100'
            )}>
              <Book className={cn('w-5 h-5', selectedBook === book.id ? 'text-white' : 'text-gray-400')} />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-800">{book.title}</div>
              <div className="text-xs text-gray-400">{book.units.length}个单元</div>
            </div>
          </button>
        ))}
      </div>

      {/* 单元目录 */}
      {selectedBook && (
        <div className="space-y-2">
          {BOOKS.find((b) => b.id === selectedBook)?.units.map((unit, idx) => {
            const isExpanded = expandedUnits.has(idx);
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleUnit(idx)}
                  className="w-full flex items-center gap-2 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm text-gray-800">{unit.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{unit.lessons.length}课</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pl-12 space-y-1.5">
                    {unit.lessons.map((lesson, li) => (
                      <div key={li} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
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
          <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">选择一册课本开始学习吧</p>
        </div>
      )}
    </div>
  );
}
