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
        <h2 className="text-3xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">Click on cards to reveal them</p>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((rank) => {
          const isRevealed = revealedCards.includes(rank);
          const item = getItemByRank(rank);

          return (
            <button
              key={rank}
              onClick={() => !isRevealed && onCardReveal(rank)}
              disabled={isRevealed}
              className={`
                aspect-[2/3] rounded-lg p-4 flex items-center justify-center text-center
                ${isRevealed
                  ? 'bg-white/20 border-white/30'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer hover:from-blue-600 hover:to-purple-700'
                }
                border-2 transition-all transform hover:scale-105
              `}
            >
              {isRevealed ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{rank}</div>
                  <div className="text-sm text-white/80">{item?.text}</div>
                </div>
              ) : (
                <div className="text-white text-opacity-0">?</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white/5 border border-white/10 rounded-md text-white text-center"
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}