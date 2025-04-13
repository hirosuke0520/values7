import React, { useState, useEffect, useMemo } from "react";
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
  DragStartEvent,
  DragOverEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
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
  axisHeight: number;
  padding: number;
  itemHeight: number;
  position: number;
  onPositionChange: (id: number, position: number) => void;
}

// ソート可能な項目コンポーネント
const SortableItem = ({
  item,
  index,
  axisHeight,
  padding,
  itemHeight,
  position,
  onPositionChange,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    attributes: {
      role: "slider",
      "aria-valuenow": position,
      "aria-valuemin": padding,
      "aria-valuemax": axisHeight - padding,
    },
  });

  // 位置をスタイルに変換
  const yPosition = position;

  const style = {
    transition,
    position: "absolute",
    top: `${yPosition}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    height: `${itemHeight}px`,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute transform -translate-y-1/2 left-0 ml-14 p-3 rounded-md transition-all duration-150
        ${
          isDragging
            ? "bg-white/30 border-white/40 cursor-grabbing"
            : "bg-white/10 border-white/20 hover:bg-white/15 cursor-grab"
        } 
        border w-3/4 max-w-sm`}
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

interface PositionData {
  [itemId: number]: number;
}

export function WeightingPhase({
  theme,
  items,
  rankings = {},
  onComplete,
  onBack,
}: WeightingPhaseProps) {
  // 縦軸の高さ
  const axisHeight = 600;
  // 項目の高さ
  const itemHeight = 50;
  // 余白
  const padding = 20;

  // ソート済みの項目リスト（順位順）
  const [sortedItems, setSortedItems] = useState<GameItem[]>([]);
  // 各アイテムの垂直位置を保持
  const [positions, setPositions] = useState<PositionData>({});

  // 初期化（ソートとポジショニング）
  useEffect(() => {
    let initialSortedItems;

    if (Object.keys(rankings).length > 0) {
      // rankingsがある場合はそれに基づいてソート
      initialSortedItems = [...items].sort(
        (a, b) => rankings[a.id] - rankings[b.id]
      );
    } else {
      // rankingsがない場合はIDに基づいてソート
      initialSortedItems = [...items];
    }

    setSortedItems(initialSortedItems);

    // 初期位置を均等に設定
    const initialPositions: PositionData = {};
    const availableHeight = axisHeight - padding * 2;

    initialSortedItems.forEach((item, index) => {
      if (initialSortedItems.length <= 1) {
        initialPositions[item.id] = padding + availableHeight / 2;
      } else {
        const step = availableHeight / (initialSortedItems.length - 1);
        initialPositions[item.id] = padding + index * step;
      }
    });

    setPositions(initialPositions);
  }, [items, rankings, axisHeight, padding]);

  // ドラッグ＆ドロップセンサー - モバイルとデスクトップの両方に最適化
  const sensors = useSensors(
    // ポインタセンサー（マウス、タッチパッド）
    useSensor(PointerSensor, {
      // 少し距離を短くして、よりすぐに反応するように
      activationConstraint: {
        distance: 3,
      },
    }),
    // タッチセンサー（モバイル）
    useSensor(TouchSensor, {
      // 遅延を短くして素早く反応
      activationConstraint: {
        delay: 100,
        tolerance: 8, // 許容誤差を増やして誤操作を減らす
      },
    }),
    // キーボードセンサー（アクセシビリティ対応）
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // アイテム位置を更新する関数
  const handlePositionChange = (id: number, position: number) => {
    setPositions((prev) => ({
      ...prev,
      [id]: Math.max(padding, Math.min(axisHeight - padding, position)),
    }));
  };

  // ドラッグ開始時のハンドラ
  const handleDragStart = (event: DragStartEvent) => {
    // ドラッグ開始時の処理
  };

  // ドラッグ中のハンドラ - 垂直位置を更新
  const handleDragOver = (event: DragOverEvent) => {
    const { active, delta } = event;

    if (active && delta.y !== 0) {
      const itemId = Number(active.id);
      const currentPosition = positions[itemId] || 0;
      const newPosition = currentPosition + delta.y;
      
      // 位置を範囲内に制限
      const clampedPosition = Math.max(
        padding,
        Math.min(axisHeight - padding, newPosition)
      );
      
      // 現在のドラッグ中は自由に動かせるように
      handlePositionChange(itemId, clampedPosition);
    }
  };

  // ドラッグ終了時のハンドラ - グリッドにスナップさせる
  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;

    if (active) {
      const itemId = Number(active.id);
      const currentPosition = positions[itemId];
      
      // 最も近いグリッド位置を見つける
      const nearestGridPosition = findNearestGridPosition(currentPosition);
      
      // 他のアイテムとの衝突をチェック
      const collision = checkForCollision(itemId, nearestGridPosition);
      
      if (collision) {
        // 衝突がある場合、使用中でないグリッド位置を見つける
        const usedPositions = Object.entries(positions)
          .filter(([id]) => Number(id) !== itemId)
          .map(([_, pos]) => pos);
        
        // 空いているグリッド位置を見つける
        const availableGridPosition = gridPositions.find(
          pos => !usedPositions.some(usedPos => Math.abs(usedPos - pos) < gridStep / 2)
        );
        
        if (availableGridPosition) {
          // 空きがあればそこに配置
          handlePositionChange(itemId, availableGridPosition);
        } else {
          // 空きがなければ、現在の位置に最も近いグリッド位置を使用
          const sortedGridPositions = [...gridPositions].sort(
            (a, b) => Math.abs(a - currentPosition) - Math.abs(b - currentPosition)
          );
          
          // 利用可能な位置を順番に試す
          for (const gridPos of sortedGridPositions) {
            if (!checkForCollision(itemId, gridPos)) {
              handlePositionChange(itemId, gridPos);
              break;
            }
          }
        }
      } else {
        // 衝突がなければ、そのグリッド位置にスナップ
        handlePositionChange(itemId, nearestGridPosition);
      }
      
      // 位置に基づいてアイテムを上から下へソート
      const sortedByPosition = [...sortedItems].sort((a, b) => {
        return positions[a.id] - positions[b.id];
      });
      
      setSortedItems(sortedByPosition);
    }
  };

  // 完了ボタン押下時
  const handleComplete = () => {
    // 位置に基づいて項目を上から下へソート
    const itemsSortedByPosition = [...sortedItems].sort(
      (a, b) => positions[a.id] - positions[b.id]
    );

    // 位置情報を計算
    const weights: { [key: number]: number } = {};
    const calculatedRankings: { [key: number]: number } = {};

    // 利用可能な高さ
    const availableHeight = axisHeight - padding * 2;

    // 各項目の重みと順位を計算
    itemsSortedByPosition.forEach((item, index) => {
      // 正規化された位置（0～1）を計算
      const normalizedPosition =
        (positions[item.id] - padding) / availableHeight;

      // 重みは逆転（上ほど重要＝重みが大きい）
      weights[item.id] = Math.round(100 - normalizedPosition * 100);

      // 順位は上から順に（1位, 2位, ...）
      calculatedRankings[item.id] = index + 1;
    });

    onComplete(weights, calculatedRankings);
  };

  // グリッド関連の状態と定数
  const totalGridSlots = 15; // グリッドスロットの総数
  const availableHeight = axisHeight - padding * 2;
  const gridStep = availableHeight / (totalGridSlots - 1); // グリッド間の間隔

  // グリッド位置（スナップ位置）を計算
  const gridPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < totalGridSlots; i++) {
      positions.push(padding + i * gridStep);
    }
    return positions;
  }, [padding, gridStep, totalGridSlots]);

  // 最も近いグリッド位置を見つける関数
  const findNearestGridPosition = (yPosition: number) => {
    return gridPositions.reduce((nearest, position) => {
      return Math.abs(position - yPosition) < Math.abs(nearest - yPosition)
        ? position
        : nearest;
    }, gridPositions[0]);
  };

  // 他のアイテムとの衝突をチェックする関数
  const checkForCollision = (itemId: number, position: number) => {
    // 許容誤差（これより近いと衝突と見なす）
    const collisionThreshold = gridStep / 2;
    
    // 他のアイテムのIDと位置のペアを調べる
    return Object.entries(positions).find(
      ([id, pos]) => 
        // 自分自身は除外
        Number(id) !== itemId && 
        // 位置が近すぎる場合は衝突と見なす
        Math.abs(pos - position) < collisionThreshold
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">重要度に応じて位置を調整してください</p>
        <p className="text-sm text-white/70">（上にあるほど重要）</p>
      </div>

      {/* dnd-kit コンテキスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* 縦軸と項目のコンテナ */}
        <div
          className="relative mx-auto"
          style={{ height: `${axisHeight}px`, width: "100%" }}
        >
          {/* 縦軸 - 左端に配置 */}
          <div
            className="absolute left-6"
            style={{
              height: "100%",
              width: "2px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />

          {/* グリッドマーカー - グリッド位置に小さな点を表示 */}
          {gridPositions.map((position, idx) => (
            <div
              key={`grid-${idx}`}
              className="absolute left-6 w-2 h-2 rounded-full bg-white/30 transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: position }}
            />
          ))}

          {/* 上部ラベル */}
          <div
            className="absolute left-6 -translate-x-1/2"
            style={{ top: padding }}
          >
            <span className="text-white/70 text-sm whitespace-nowrap">
              非常に重要
            </span>
          </div>

          {/* 下部ラベル */}
          <div
            className="absolute left-6 -translate-x-1/2"
            style={{ top: axisHeight - padding }}
          >
            <span className="text-white/70 text-sm whitespace-nowrap">
              重要でない
            </span>
          </div>

          {/* ソータブルコンテキスト */}
          <SortableContext items={sortedItems.map((item) => item.id)}>
            {/* 項目 - 左側の軸に合わせて配置調整 */}
            {sortedItems.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                axisHeight={axisHeight}
                padding={padding}
                itemHeight={itemHeight}
                position={positions[item.id] || padding}
                onPositionChange={handlePositionChange}
              />
            ))}
          </SortableContext>
        </div>
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
