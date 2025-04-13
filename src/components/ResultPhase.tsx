import React from 'react';
import type { GameItem } from '../App';

interface ResultPhaseProps {
  theme: string;
  items: GameItem[];
  rankings: { [key: number]: number };
  weights?: { [key: number]: number }; // 重み（オプション）
  onRestart: () => void;
}

export function ResultPhase({
  theme,
  items,
  rankings,
  weights = {}, // デフォルト値を空オブジェクトに
  onRestart,
}: ResultPhaseProps) {
  const sortedItems = [...items].sort((a, b) => rankings[a.id] - rankings[b.id]);
  
  // 重みの最大値と最小値を計算
  const weightValues = Object.values(weights);
  const maxWeight = weightValues.length ? Math.max(...weightValues) : 100;
  const minWeight = weightValues.length ? Math.min(...weightValues) : 0;
  const weightRange = maxWeight - minWeight || 1; // ゼロ除算防止

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">最終結果</p>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item, index) => {
          // 項目の重み（0-100）
          const itemWeight = weights[item.id] || 0;
          // バーの幅を計算（10%〜100%）
          const barWidth = weightValues.length 
            ? 10 + ((itemWeight - minWeight) / weightRange * 90) 
            : 100 - (index * 10); // 重みがない場合は順位に応じて幅を変える
          
          return (
            <div
              key={item.id}
              className="p-3 bg-white/5 border border-white/10 rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">{item.text}</span>
                    {weightValues.length > 0 && (
                      <span className="text-white/60 text-xs">{itemWeight}点</span>
                    )}
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div 
                      className="bg-white/30 h-2 rounded-full" 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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