"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
    id: string;
    isSorting: boolean;
    onDeleteAction: (id: string) => void;
};

export function SortableItem({ id, isSorting, onDeleteAction }: Props) {
    // useSortableフックから並び替えに必要な情報を取得
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });
    /*
    useSortable(Hook)
    並び替え可能なアイテムを作成するためのHooks

    attributes:
    roleやaria-属性など、ドラッグ可能な要素に付与すべき
    アクセシビリティ関連の属性が含まれる

    listeners:
    ドラッグ操作を開始するためのイベントリスナー（onMouseDown, onTouchStart など）。
    こちらを適用した要素がドラッグのハンドル（掴む部分）になります。

    setNodeRef
    dnd-kitがDOM要素を認識し、操作するために使用。
    refプロパティに渡します。

    transform
    ドラッグ中の要素の移動量を表す {x, y} 形式のオブジェクト。
    CSS.Transform.toString()を使ってCSSのtransformプロパティに変換する。

    transition
    ドラッグが終了し、要素が元の位置に戻る際のアニメーションを指定する。

    isDragging
    アイテムが現在ドラッグされているかどうかを判定するフラグ
    */

    // transformとtransitionをCSSのスタイルとして適用
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // ドラッグ中は少し見た目を変える
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : "auto",
    };

    const [text, setText] = useState("");

    return (
        // setNodeRefでこのdiv要素をdnd-kitが監視するDOMノードとして設定
        <div ref={setNodeRef} style={style} className="flex flex-col p-4 border rounded bg-white mb-2 touch-none">
            {/* 
        attributesとlistenersをハンドル（掴む部分）に適用する
        今回はアイテム全体を掴めるようにdivに適用
      */}
            <div {...(isSorting ? { ...attributes, ...listeners } : {})}//isSortingがtrueの場合は<div {...attributes} {...listeners}>になる。
            /* className="cursor-grab mb-2 text-gray-600">
                ☰ ドラッグ
            </div>
            <div*/>
                アイテム {id}
                <input
                    className="border border-black rounded px-2 py-1 flex-grow"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSorting} // 並び替え中は入力不可
                />
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    disabled={isSorting} // 並び替え中は入力不可
                    onClick={() => onDeleteAction(id)}
                >削除</button>
            </div>
        </div>
    );
}
