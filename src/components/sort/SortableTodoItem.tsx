/*
親:Page.　DBを読み取って子に渡す
子:List.　並び替えて孫に渡す
孫:Item.　表示する
*/
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImBin } from "react-icons/im";

type Props = {
    post: {
        id: string;
        title: string;
        published: boolean
    }
    index: number;
    isSorting: boolean;
    onDeleteAction: (index: number) => void;
    onToggleAction: (index: number, checked: boolean) => void;
    onTitleAction: (index: number, title: string) => void;
};

export function SortableItem({ post, index, isSorting, onDeleteAction, onToggleAction, onTitleAction }: Props) {
    // useSortableフックから並び替えに必要な情報を取得
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post.id });
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


    return (
        // setNodeRefでこのdiv要素をdnd-kitが監視するDOMノードとして設定
        <div {...(isSorting ? { ...attributes, ...listeners } : {})} ref={setNodeRef} style={style} className={`py-2 border rounded bg-white mb-2 touch-none ${isSorting ? "border-black" : ""}`}>
            {/* flex flex-col 
        attributesとlistenersをハンドル（掴む部分）に適用する
        今回はアイテム全体を掴めるようにdivに適用
      */}
            <div //isSortingがtrueの場合は<div {...attributes} {...listeners}>になる。
            /* className="cursor-grab mb-2 text-gray-600">
                //☰ ドラッグ
            </div>
            <div*/
                //className="flex flex-col gap-2 border p-2 rounded bg-white shadow  h-[300px] overflow-y-scroll"
            >
                <div key={post.id} className="flex items-center gap-2">
                    {/*
                            items-center 中央寄せ
                        */}
                    <input
                        type="checkbox"
                        className="size-5"
                        checked={post.published}
                        disabled={isSorting} // 並び替え中は入力不可
                        onChange={(e) => onToggleAction(index, e.target.checked)}
                    />
                    <input
                        className={`border ${isSorting ? 'border-gray' : 'border-black'} rounded px-2 py-1 flex-grow ${post.published ? 'line-through text-gray-500' : ''}`}
                        //px-2 py-1 内側の余白は、xに2、yに1
                        //{`border border-black rounded px-2 py-1 flex-grow ${post.published ? 'line-through text-gray-500' : ''}`}
                        //line-through 取り消し線
                        //${condition ? 'classA' : ''}のような書き方で、条件に応じてクラスを追加
                        //${isSorting ? 'border-gray' : 'border-black'} 並び替え中は枠線を灰色にする
                        value={post.title}
                        disabled={isSorting} // 並び替え中は入力不可
                        onChange={(e) => onTitleAction(index, e.target.value)}
                    />
                    <button
                        className={`${isSorting ? 'bg-gray-300' : 'bg-gray-500'} text-white px-3 py-1 rounded`} // 並び替え中は色を薄くする
                        disabled={isSorting} // 並び替え中は入力不可
                        onClick={() => onDeleteAction(index)}
                    ><ImBin className="size-5" /></button>
                </div>
            </div>
        </div>
    );
}
