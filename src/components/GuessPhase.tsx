import React from 'react';
import type { GameItem } from '../App';

interface GuessPhaseProps {
  theme: string;
  items: GameItem[];
  rankings: { [key: number]: number };
  revealedCards: number[];
  onCardReveal: (rank: number) => void;
}

export function GuessPhase({
  theme,
  items,
  rankings,
  revealedCards,
  onCardReveal,
}: GuessPhaseProps) {
  const getItemByRank = (rank: number) => {
    const itemId = Object.entries(rankings).find(([, r]) => r === rank)?.[0];
    return items.find(item => item.id === Number(itemId));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">タップしてカードを公開</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((rank) => {
          const isRevealed = revealedCards.includes(rank);
          const item = getItemByRank(rank);

          return (
            <button
              key={rank}
              onClick={() => !isRevealed && onCardReveal(rank)}
              disabled={isRevealed}
              className={`
                aspect-[2/3] rounded-lg p-2 flex items-center justify-center text-center
                ${rank > 4 ? 'col-span-2' : ''}
                ${rank === 7 ? 'col-start-2' : ''}
                ${isRevealed
                  ? 'bg-white/20 border-white/30'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer hover:from-blue-600 hover:to-purple-700'
                }
                border-2 transition-all transform hover:scale-105
              `}
            >
              {isRevealed ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">{rank}</div>
                  <div className="text-xs text-white/80">{item?.text}</div>
                </div>
              ) : (
                <div className="text-white text-opacity-0">?</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-2 bg-white/5 border border-white/10 rounded-md text-white text-center text-sm"
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}