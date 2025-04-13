import React, { useState, useRef, useEffect } from "react";
import type { GameItem } from "../App";

interface WeightingPhaseProps {
  theme: string;
  items: GameItem[];
  rankings?: { [key: number]: number }; // itemId -> rank (オプショナルに変更)
  onComplete: (
    weights: { [key: number]: number },
    rankings: { [key: number]: number }
  ) => void; // rankingsも返すように変更
  onBack?: () => void;
}

export function WeightingPhase({
  theme,
  items,
  rankings = {}, // デフォルト値を空オブジェクトに
  onComplete,
  onBack,
}: WeightingPhaseProps) {
  // 縦軸の高さ
  const axisHeight = 600; // 高さを増やす
  // 項目の高さ
  const itemHeight = 50; // 高さを少し小さく
  // 余白
  const padding = 20;

  // ドラッグ中の項目ID
  const [draggingId, setDraggingId] = useState<number | null>(null);
  // 各項目の位置情報
  const [positions, setPositions] = useState<{ [key: number]: number }>({});
  // コンテナのref
  const containerRef = useRef<HTMLDivElement>(null);

  // 初期配置
  useEffect(() => {
    const initialPositions: { [key: number]: number } = {};

    // 等間隔に配置するための計算
    const availableHeight = axisHeight - padding * 2;
    const step = availableHeight / (items.length - 1 || 1);

    if (Object.keys(rankings).length > 0) {
      // rankingsがある場合はそれに基づいて配置
      const sortedItems = [...items].sort(
        (a, b) => rankings[a.id] - rankings[b.id]
      );
      sortedItems.forEach((item, index) => {
        const yPosition = padding + index * step;
        initialPositions[item.id] = yPosition;
      });
    } else {
      // rankingsがない場合はIDに基づいて等間隔に配置
      items.forEach((item, index) => {
        const yPosition = padding + index * step;
        initialPositions[item.id] = yPosition;
      });
    }

    setPositions(initialPositions);
  }, [items, rankings]);

  // マウスドラッグ開始
  const handleMouseDown = (itemId: number) => {
    setDraggingId(itemId);
  };

  // マウス移動
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    // マウス位置からコンテナ内のY座標を計算
    let newY = e.clientY - containerRect.top;

    // 範囲内に収める
    newY = Math.max(padding, Math.min(axisHeight - padding, newY));

    // 位置を更新
    setPositions((prev) => ({
      ...prev,
      [draggingId]: newY,
    }));
  };

  // 位置情報に基づいて順位を計算
  const calculateRankings = () => {
    // 位置でソートした項目IDと順位のマッピングを作成
    const sortedIds = Object.entries(positions)
      .sort(([, posA], [, posB]) => posA - posB)
      .map(([id]) => parseInt(id));
    
    const newRankings: { [key: number]: number } = {};
    sortedIds.forEach((id, index) => {
      newRankings[id] = index + 1;
    });
    
    return newRankings;
  };

  // 重なりを防ぐためにカードの位置を調整
  const adjustCardPositions = () => {
    if (!draggingId) return;
    
    // 現在のドラッグ中の項目の位置
    const currentPosition = positions[draggingId];
    
    // 各カードの最小間隔（カードの高さの半分程度）
    const minGap = itemHeight * 0.7;
    
    // 位置でソートした項目のID配列
    const sortedItemIds = Object.entries(positions)
      .sort(([, posA], [, posB]) => posA - posB)
      .map(([id]) => parseInt(id));
    
    // ドラッグ中の項目のインデックスを取得
    const currentIndex = sortedItemIds.indexOf(draggingId);
    
    // 新しい位置を計算
    const newPositions = { ...positions };
    
    // 上下の項目との重なりを検出して調整
    if (currentIndex > 0) {
      // 上の項目との距離を確認
      const aboveId = sortedItemIds[currentIndex - 1];
      const abovePos = positions[aboveId];
      
      // 最小間隔より近い場合、上の項目を上に移動
      if (currentPosition - abovePos < minGap) {
        newPositions[aboveId] = currentPosition - minGap;
      }
    }
    
    if (currentIndex < sortedItemIds.length - 1) {
      // 下の項目との距離を確認
      const belowId = sortedItemIds[currentIndex + 1];
      const belowPos = positions[belowId];
      
      // 最小間隔より近い場合、下の項目を下に移動
      if (belowPos - currentPosition < minGap) {
        newPositions[belowId] = currentPosition + minGap;
      }
    }
    
    // 連鎖反応を処理（他のカードの調整が必要な場合）
    let hasChanges = true;
    let maxIterations = 10; // 無限ループ防止
    
    while (hasChanges && maxIterations > 0) {
      hasChanges = false;
      maxIterations--;
      
      // 各項目を上から順に確認
      for (let i = 1; i < sortedItemIds.length; i++) {
        const currentId = sortedItemIds[i];
        const aboveId = sortedItemIds[i - 1];
        
        // 現在の距離と最小間隔を比較
        const currentPos = newPositions[currentId];
        const abovePos = newPositions[aboveId];
        
        if (currentPos - abovePos < minGap) {
          // 下の項目を下に移動
          newPositions[currentId] = abovePos + minGap;
          hasChanges = true;
        }
      }
    }
    
    // 範囲内に収める
    Object.keys(newPositions).forEach(id => {
      const numId = parseInt(id);
      newPositions[numId] = Math.max(
        padding,
        Math.min(axisHeight - padding, newPositions[numId])
      );
    });
    
    setPositions(newPositions);
  };

  // タッチイベント用ハンドラ
  const handleTouchStart = (itemId: number) => {
    setDraggingId(itemId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingId || !containerRef.current) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    let newY = touch.clientY - containerRect.top;

    newY = Math.max(padding, Math.min(axisHeight - padding, newY));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: newY,
    }));
  };

  // ドラッグ終了時に位置を自動調整
  const handleMouseUp = () => {
    if (draggingId !== null) {
      adjustCardPositions();
    }
    setDraggingId(null);
  };

  // タッチ終了時も同様に調整
  const handleTouchEnd = () => {
    if (draggingId !== null) {
      adjustCardPositions();
    }
    setDraggingId(null);
  };

  // 完了ボタン押下時
  const handleComplete = () => {
    // 位置情報を0-100のスコア（重み）に変換
    const weights: { [key: number]: number } = {};

    // 最小と最大の位置を取得
    const values = Object.values(positions);
    const minPos = Math.min(...values);
    const maxPos = Math.max(...values);
    const range = maxPos - minPos || 1; // ゼロ除算防止

    // 各項目のウェイトを計算（上にあるほど値が大きい）
    Object.entries(positions).forEach(([itemId, position]) => {
      // 位置を0-100のスケールに変換（上が100、下が0）
      const weight = 100 - ((position - minPos) / range) * 100;
      weights[parseInt(itemId)] = Math.round(weight);
    });

    // 位置情報から順位も計算
    // 1. 位置でソートした項目ID配列を作成（上から順に）
    const sortedItemIds = Object.entries(positions)
      .sort(([, posA], [, posB]) => posA - posB)
      .map(([id]) => parseInt(id));

    // 2. ソートした順に順位を割り当て（1位が最も重要 = 最も上）
    const calculatedRankings: { [key: number]: number } = {};
    sortedItemIds.forEach((id, index) => {
      calculatedRankings[id] = index + 1;
    });

    onComplete(weights, calculatedRankings);
  };

  // 位置でソートした項目
  const sortedItems = [...items].sort((a, b) => {
    const posA = positions[a.id] || 0;
    const posB = positions[b.id] || 0;
    return posA - posB;
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{theme}</h2>
        <p className="text-white/80">重要度に応じて位置を調整してください</p>
      </div>

      {/* 縦軸と項目のコンテナ */}
      <div
        className="relative mx-auto"
        style={{ height: `${axisHeight}px`, width: "100%" }}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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

        {/* 項目 - 左側の軸に合わせて配置調整 */}
        {sortedItems.map((item, index) => {
          const yPosition = positions[item.id] || 0;
          const isDragging = draggingId === item.id;

          return (
            <div
              key={item.id}
              onMouseDown={() => handleMouseDown(item.id)}
              onTouchStart={() => handleTouchStart(item.id)}
              className={`absolute transform -translate-y-1/2 left-0 ml-14 p-3 rounded-md transition-all duration-300
                ${
                  isDragging
                    ? "bg-white/30 border-white/40 cursor-grabbing z-20"
                    : "bg-white/10 border-white/20 hover:bg-white/15 cursor-grab"
                } 
                border w-3/4 max-w-sm`}
              style={{
                top: `${yPosition}px`,
                height: `${itemHeight}px`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white/60 min-w-6 text-center">
                  {index + 1}
                </span>
                <span className="text-white text-sm flex-grow">
                  {item.text}
                </span>
              </div>
            </div>
          );
        })}
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
          onClick={handleComplete}
          className="py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
        >
          完了
        </button>
      </div>
    </div>
  );
}
