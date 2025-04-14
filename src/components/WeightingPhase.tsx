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

interface WeightingPhaseProps {
  theme: string;
  items: GameItem[];
  rankings?: { [key: number]: number };
  onComplete: (
    weights: { [key: number]: number },
    rankings: { [key: number]: number }
  ) => void;
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
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none", // タッチデバイスでスクロールとの競合を防ぐ
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
        <span className="text-lg font-bold text-white/60 min-w-6 text-center">
          {index + 1}
        </span>
        <span className="text-white text-sm flex-grow">{item.text}</span>
      </div>
    </div>
  );
};

export function WeightingPhase({
  theme,
  items,
  rankings = {},
  onComplete,
  onBack,
}: WeightingPhaseProps) {
  // ソート済みの項目リスト
  const [sortedItems, setSortedItems] = useState<GameItem[]>([]);

  // 初期化（ソート）
  useEffect(() => {
    let initialSortedItems;

    if (Object.keys(rankings).length > 0) {
      // rankingsがある場合はそれに基づいてソート
      initialSortedItems = [...items].sort(
        (a, b) => rankings[a.id] - rankings[b.id]
      );
    } else {
      // rankingsがない場合はそのまま
      initialSortedItems = [...items];
    }

    setSortedItems(initialSortedItems);
  }, [items, rankings]);

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
      setSortedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 完了ボタン押下時
  const handleComplete = () => {
    // 各項目の順位と重みを計算
    const weights: { [key: number]: number } = {};
    const calculatedRankings: { [key: number]: number } = {};

    // 順位に基づいて重みを計算（上位ほど重み大）
    sortedItems.forEach((item, index) => {
      // 順位は上から順に（1位, 2位, ...）
      calculatedRankings[item.id] = index + 1;

      // 重みは順位に反比例（7項目の場合、1位:100, 2位:83, 3位:67, 4位:50, 5位:33, 6位:17, 7位:0）
      const totalItems = sortedItems.length;
      if (totalItems <= 1) {
        weights[item.id] = 100;
      } else {
        const normalizedPosition = index / (totalItems - 1);
        weights[item.id] = Math.round(100 - normalizedPosition * 100);
      }
    });

    onComplete(weights, calculatedRankings);
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

      {/* dnd-kit コンテキスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedItems.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
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
          onClick={handleComplete}
          className="py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
        >
          完了
        </button>
      </div>
    </div>
  );
}
