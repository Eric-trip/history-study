'use client';

import { useState } from 'react';
import { TIP_CARDS, TIP_CATEGORIES } from '@/data/tips';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TipsView() {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const categories = ['全部', ...TIP_CATEGORIES];
  const filteredCards = activeCategory === '全部'
    ? TIP_CARDS
    : TIP_CARDS.filter((c) => c.category === activeCategory);

  const toggleCard = (id: string) => {
    const next = new Set(expandedCards);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedCards(next);
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-800">主观题答题技巧卡片</h2>
        </div>
        <p className="text-sm text-gray-500">
          宏观、通用的答题方法 · 考前多看几遍 · {TIP_CARDS.length}张卡片
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 技巧卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCards.map((card) => {
          const isExpanded = expandedCards.has(card.id);
          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleCard(card.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                    {card.category}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
                <div className={cn(
                  'text-sm text-gray-600 whitespace-pre-line',
                  !isExpanded && 'line-clamp-3'
                )}>
                  {card.content}
                </div>
                {isExpanded && card.example && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs font-semibold text-blue-600 mb-1">示例</div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{card.example}</div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
