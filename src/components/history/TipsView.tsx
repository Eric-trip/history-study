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
      <div className="ancient-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="seal seal-sm">技</div>
          <h2 className="font-cal text-lg" style={{ color: '#2D2A24' }}>主观题答题技巧卡片</h2>
        </div>
        <p className="text-sm" style={{ color: '#8B8270' }}>
          共{TIP_CARDS.length}张卡片 · 点击卡片展开详情
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded text-sm font-medium transition-all',
              activeCategory === cat ? 'ancient-btn-active' : 'ancient-btn'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bamboo-divider" />

      {/* 卡片列表 */}
      <div className="space-y-3">
        {filteredCards.map((card) => {
          const isExpanded = expandedCards.has(card.id);
          return (
            <div key={card.id} className="ancient-card relative">
              {card.category === '审题' && <div className="corner-seal">审</div>}
              {card.category === '题型公式' && <div className="corner-seal">式</div>}
              {card.category === '材料分析' && <div className="corner-seal">材</div>}
              {card.category === '答题规范' && <div className="corner-seal">范</div>}
              {card.category === '日常提升' && <div className="corner-seal">升</div>}
              <button
                onClick={() => toggleCard(card.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#EDE6D4', color: '#5B7C5F', border: '1px solid #D4C9B0' }}>
                      {card.category}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" style={{ color: '#8B8270' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" style={{ color: '#8B8270' }} />
                  )}
                </div>
                <h3 className="font-cal text-base mb-2" style={{ color: '#2D2A24' }}>{card.title}</h3>
                <div className={cn(
                  'text-sm whitespace-pre-line',
                  !isExpanded && 'line-clamp-3'
                )} style={{ color: '#2D2A24' }}>
                  {card.content}
                </div>
                {isExpanded && card.example && (
                  <div className="mt-3 p-3 rounded" style={{ background: '#EDE6D4', border: '1px solid #D4C9B0' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#5B7C5F' }}>示例</div>
                    <div className="text-sm whitespace-pre-line" style={{ color: '#2D2A24' }}>{card.example}</div>
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
