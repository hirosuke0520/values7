import React, { useState, useEffect } from "react";
import type { GameItem } from "../App";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RankingPhaseProps {
  theme: string;
  items: GameItem[];
  onComplete: (rankings: { [key: number]: number }) => void;
  onBack?: () => void;
}

interface SortableItemProps {
  item: GameItem;
  index: number;
}

// ソート可能なアイテムコンポーネント
const SortableItem = ({ item, index }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none' // タッチデバイスでスクロールとの競合を防ぐ
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded-md transition-colors ${
        isDragging
          ? "bg-white/20 border-white/30 z-10"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3">
        {/* ドラッグハンドルアイコン */}
        <span className="text-white/50 select-none text-lg mr-1">⁝⁝</span>
        <span className="text-xl font-bold text-white/60 min-w-6 text-center">
          {index + 1}
        </span>
        <span className="text-white text-sm flex-grow">{item.text}</span>
      </div>
    </div>
  );
};

export function RankingPhase({
  theme,
  items,
  onComplete,
  onBack,
}: RankingPhaseProps) {
  const [rankings, setRankings] = useState<GameItem[]>([...items]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

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

  // ドラッグ＆ドロップセンサー - モバイルとデスクトップの両方に最適化
  const sensors = useSensors(
    // ポインタセンサー（マウス、タッチパッド）
    useSensor(PointerSensor, {
      // 少し距離を短くして、よりすぐに反応するように
      activationConstraint: {
        distance: 1, // 最小限の移動でドラッグ開始（反応性を向上）
      },
    }),
    // タッチセンサー（モバイル）
    useSensor(TouchSensor, {
      // モバイルでのスクロールとの競合を防ぐための設定
      activationConstraint: {
        delay: 0, // 遅延なし - 即座にドラッグ開始
        tolerance: 15, // 許容誤差を増やしてドラッグ認識を優先
      },
    }),
    // キーボードセンサー（アクセシビリティ対応）
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ終了時のハンドラ
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRankings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rankings.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {rankings.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
          ゲームスタート
        </button>
      </div>
    </div>
  );
}
