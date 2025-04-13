import React from "react";
import type { GameItem } from "../App";

interface GuessPhaseProps {
  theme: string;
  items: GameItem[];
  rankings: { [key: number]: number };
  weights?: { [key: number]: number }; // 残しておくがオプショナルに
  revealedCards: number[];
  onCardReveal: (rank: number) => void;
  onBack?: () => void;
}

export function GuessPhase({
  theme,
  items,
  rankings,
  weights,
  revealedCards,
  onCardReveal,
  onBack,
}: GuessPhaseProps) {
  const getItemByRank = (rank: number) => {
    const itemId = Object.entries(rankings).find(([, r]) => r === rank)?.[0];
    return items.find((item) => item.id === Number(itemId));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">順位を予想してください</p>
        <p className="text-sm text-white/70">（1位が最も重要）</p>
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

      <div className="space-y-2">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((rank) => {
          const isRevealed = revealedCards.includes(rank);
          const item = getItemByRank(rank);

          return (
            <button
              key={rank}
              onClick={() => !isRevealed && onCardReveal(rank)}
              disabled={isRevealed}
              className={`
                w-full p-4 rounded-lg flex items-center gap-3
                ${
                  isRevealed
                    ? "bg-white/20 border-white/30"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer hover:from-blue-600 hover:to-purple-700"
                }
                border-2 transition-colors
              `}
            >
              <span className="text-xl font-bold text-white">{rank}</span>
              {isRevealed ? (
                <span className="text-white text-sm">{item?.text}</span>
              ) : (
                <span className="text-white/60 text-sm">
                  タップしてオープン
                </span>
              )}
            </button>
          );
        })}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-3 px-4 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          戻る
        </button>
      )}
    </div>
  );
}