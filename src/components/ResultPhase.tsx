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
        <h2 className="text-3xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">Final Rankings</p>
      </div>

      <div className="space-y-4">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="p-4 bg-white/5 border border-white/10 rounded-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-bold">
                {index + 1}
              </div>
              <span className="text-white">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}