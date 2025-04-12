import React, { useState, useEffect, useRef } from "react";
import type { GameItem } from "../App";

interface RankingPhaseProps {
  theme: string;
  items: GameItem[];
  onComplete: (rankings: { [key: number]: number }) => void;
  onBack?: () => void;
}

export function RankingPhase({
  theme,
  items,
  onComplete,
  onBack,
}: RankingPhaseProps) {
  const [rankings, setRankings] = useState<GameItem[]>([...items]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Check if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Universal drag handlers (for both desktop and mobile)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggingIndex !== null && draggingIndex !== index) {
      moveItem(draggingIndex, index);
      setDraggingIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  // For mobile touch-based drag
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggingIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingIndex === null) return;
    
    const touch = e.touches[0];
    const elements = itemsRef.current.filter(el => el !== null);
    
    // Find the element under the touch point
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el) continue;
      
      const rect = el.getBoundingClientRect();
      if (
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom &&
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right
      ) {
        if (i !== draggingIndex) {
          moveItem(draggingIndex, i);
          setDraggingIndex(i);
        }
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggingIndex(null);
  };

  // Shared item movement logic
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rankings.length || fromIndex === toIndex) return;
    
    const newRankings = [...rankings];
    const [removed] = newRankings.splice(fromIndex, 1);
    newRankings.splice(toIndex, 0, removed);
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
        <p className="text-sm text-white/70">（1位が最も重要）</p>
        <p className="text-xs text-white/60 mt-1">
          項目をドラッグして順位を入れ替えられます
        </p>
      </div>

      <div className="space-y-2">
        {rankings.map((item, index) => (
          <div
            key={item.id}
            ref={el => itemsRef.current[index] = el}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`p-3 border rounded-md transition-colors ${
              draggingIndex === index 
                ? 'bg-white/20 border-white/30' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            style={{ touchAction: 'none', cursor: 'grab' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white/60 min-w-6 text-center">
                {index + 1}
              </span>
              <span className="text-white text-sm flex-grow">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
          >
            戻る
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
        >
          順位を確定
        </button>
      </div>
    </div>
  );
}