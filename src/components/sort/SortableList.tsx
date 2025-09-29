"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
type SortableListProps = {
    items: string[];
    setItemsAction: React.Dispatch<React.SetStateAction<string[]>>;
    isSorting: boolean;
};

export function SortableList({ items, setItemsAction, isSorting }: SortableListProps) {
    // 並び替えるアイテムのリストをstateで管理
    //親コンポーネントへ移動
    //const [items, setItems] = useState(["1", "2", "3", "4"]);

    // センサー（どのような入力でドラッグを開始するか）の設定
    // ここではポインター（マウスやタッチ）とキーボード操作を有効にしている
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // ドラッグ終了時の処理
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // overがnullの場合（ドロップ先がない場合）は何もしない
        if (!over) {
            return;
        }

        // ドラッグ元とドロップ先が同じ場合は何もしない
        if (active.id !== over.id) {
            setItemsAction((items) => {
                // 元のインデックスと新しいインデックスを取得
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);

                // arrayMoveユーティリティを使って配列を並び替える
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    //削除関数
    const handleDelete = (id: string) => {
        setItemsAction((prev) => prev.filter((item) => item !== id));
    };

    return (
        // dnd-kitのコンテキストプロバイダー
        // sensors: どの入力方法でドラッグ操作を認識するかを設定
        // collisionDetection: どの要素と衝突しているかを判断するアルゴリズム
        // onDragEnd: ドラッグが終了したときに呼ばれる関数
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            {/* 
        SortableContext: 並び替え可能な要素のコンテキストを提供
        items: 並び替え可能なアイテムのIDの配列
        strategy: 並び替えの戦略（ここでは垂直方向のリスト）
      */}
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="w-full max-w-xs p-4 bg-gray-100 rounded">
                    {items.map((id) => (
                        // 並び替え可能な各アイテムをレンダリング
                        <SortableItem key={id} id={id} isSorting={isSorting} onDeleteAction={handleDelete} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
