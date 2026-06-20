'use client';

import { useState } from 'react';
import { BOOKS } from '@/data/books';
import { KNOWLEDGE_POINTS, getKnowledgeByBook } from '@/data/knowledge';
import { BookId, KnowledgePoint } from '@/types';
import { ChevronDown, ChevronRight, Book, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeView() {
  const [selectedBook, setSelectedBook] = useState<BookId | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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
    : bookKnowledge;

  return (
    <div className="space-y-4">
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="seal seal-sm">典</div>
          <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>教材知识点</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>人教版初中历史 · 共6册 · {KNOWLEDGE_POINTS.length}个核心知识点</p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B8270' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索知识点、术语..."
          className="w-full pl-9 pr-3 py-2 ancient-input text-sm"
        />
      </div>

      {/* 搜索结果 */}
      {searchTerm ? (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#8B8270' }}>
            搜索到 {filteredKnowledge.length} 个结果
          </p>
          {filteredKnowledge.map((kp) => (
            <KnowledgeCard key={kp.id} kp={kp} />
          ))}
        </div>
      ) : (
        <>
          {/* 册别选择 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BOOKS.map((book) => {
              const count = getKnowledgeByBook(book.id).length;
              return (
                <button
                  key={book.id}
                  onClick={() => { setSelectedBook(book.id); setExpandedUnits(new Set()); }}
                  className={cn(
                    'p-3 rounded text-left transition-all border',
                    selectedBook === book.id
                      ? 'border-[#5B7C5F] bg-[#FBF8F0]'
                      : 'border-[#D4C9B0] bg-[#F5F0E6] hover:bg-[#EDE6D4]'
                  )}
                >
                  <div className="text-xs" style={{ color: '#8B8270' }}>{book.grade}·{book.semester}</div>
                  <div className="font-medium text-sm" style={{ color: '#2D2A24' }}>{book.title}</div>
                  <div className="text-xs mt-1" style={{ color: '#5B7C5F' }}>{count}个知识点</div>
                </button>
              );
            })}
          </div>

          {/* 知识点列表 */}
          {selectedBook && (
            <div className="space-y-3">
              <div className="bamboo-divider" />
              {filteredKnowledge.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: '#8B8270' }}>
                  该册暂无知识点，敬请期待
                </p>
              ) : (
                filteredKnowledge.map((kp) => (
                  <KnowledgeCard key={kp.id} kp={kp} />
                ))
              )}
            </div>
          )}

          {!selectedBook && (
            <div className="text-center py-16">
              <Book className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4C9B0' }} />
              <p className="text-sm" style={{ color: '#8B8270' }}>选择一册课本开始学习吧</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KnowledgeCard({ kp }: { kp: KnowledgePoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded p-4 cursor-pointer transition-all"
      style={{
        background: '#FBF8F0',
        border: expanded ? '1px solid #5B7C5F' : '1px solid #D4C9B0',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <div className="seal seal-sm flex-shrink-0 mt-0.5">
          {kp.importance === 'high' ? '要' : '普'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#8B8270' }}>
              {kp.unit}
            </span>
            <h3 className="font-cal text-base" style={{ color: '#2D2A24' }}>{kp.title}</h3>
          </div>
          <p className={cn('text-sm', !expanded && 'line-clamp-2')} style={{ color: '#2D2A24' }}>
            {kp.content}
          </p>
          {expanded && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {kp.keyTerms.map((term, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#E8F0E8', color: '#5B7C5F', border: '1px solid #5B7C5F' }}
                >
                  {term}
                </span>
              ))}
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#8B8270' }} />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#8B8270' }} />
        )}
      </div>
    </div>
  );
}
