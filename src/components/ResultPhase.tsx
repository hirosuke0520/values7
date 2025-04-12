import React from 'react';
import type { GameItem } from '../App';

interface ResultPhaseProps {
  theme: string;
  items: GameItem[];
  rankings: { [key: number]: number };
  onRestart: () => void;
}

export function ResultPhase({
  theme,
  items,
  rankings,
  onRestart,
}: ResultPhaseProps) {
  const sortedItems = [...items].sort((a, b) => rankings[a.id] - rankings[b.id]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">最終結果</p>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="p-3 bg-white/5 border border-white/10 rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm">
                {index + 1}
              </div>
              <span className="text-white text-sm">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
      >
        もう一度プレイ
      </button>
    </div>
  );
}