import React, { useState } from 'react';
import type { GameItem } from '../App';

interface RankingPhaseProps {
  theme: string;
  items: GameItem[];
  onComplete: (rankings: { [key: number]: number }) => void;
}

export function RankingPhase({ theme, items, onComplete }: RankingPhaseProps) {
  const [rankings, setRankings] = useState<GameItem[]>([...items]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const newRankings = [...rankings];
    const [removed] = newRankings.splice(sourceIndex, 1);
    newRankings.splice(targetIndex, 0, removed);
    setRankings(newRankings);
  };

  const handleSubmit = () => {
    const rankingMap = rankings.reduce((acc, item, index) => {
      acc[item.id] = index + 1;
      return acc;
    }, {} as { [key: number]: number });
    onComplete(rankingMap);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">項目を並べ替えて順位を決めてください</p>
        <p className="text-sm text-white/60">（1位が最も重要）</p>
      </div>

      <div className="space-y-2">
        {rankings.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="p-3 bg-white/5 border border-white/10 rounded-md cursor-move hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white/60">{index + 1}</span>
              <span className="text-white text-sm">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
      >
        順位を確定
      </button>
    </div>
  );
}