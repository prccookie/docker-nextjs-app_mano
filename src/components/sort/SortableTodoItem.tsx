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
import { FaPlus } from "react-icons/fa";

type Props = {
    post: {
        id: string;
        title: string;
        published: boolean
        club: boolean
        diamond: boolean
        heart: boolean
        spade: boolean
    }
    index: number;
    isSorting: boolean;
    onDeleteAction: (index: number) => void;
    onInsertAction: (index: number) => void;
    onToggleAction: (index: number, checked: boolean) => void;
    onTitleAction: (index: number, title: string) => void;
    onSwitchAction: (index: number, key: PostKey) => void;
};
type PostKey = "club" | "diamond" | "heart" | "spade";

export function SortableItem({ post, index, isSorting, onDeleteAction, onInsertAction, onToggleAction, onTitleAction, onSwitchAction }: Props) {
    // useSortableフックから並び替えに必要な情報を取得
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post.id });

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
        <div {...(isSorting ? { ...attributes, ...listeners } : {})} ref={setNodeRef} style={style} >
            {/* flex flex-col 
        attributesとlistenersをハンドル（掴む部分）に適用する
        今回はアイテム全体を掴めるようにdivに適用
      */}
            <div className="flex items-center gap-2 text-center">
                <button //挿入ボタン
                    className={`bg-blue-500 disabled:opacity-0 text-white px-3 rounded w-[100%] flex justify-center text-center`} // 並び替え中は色を薄くする
                    disabled={isSorting} // 並び替え中は入力不可
                    onClick={() => onInsertAction(index)}
                    aria-label="挿入"
                ><FaPlus className="size-3" /></button>
            </div>
            <div className={`py-2 border rounded bg-white my-2 touch-none ${isSorting ? "border-black" : ""}`}//isSortingがtrueの場合は<div {...attributes} {...listeners}>になる。
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
                        aria-label="チェック"
                        name={`published-${index}`}
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
                        aria-label="入力欄"
                        name={`title-${index}`}
                    />
                    <button
                        className={`${isSorting ? 'bg-gray-300' : 'bg-gray-500'} text-white px-3 py-1 rounded`} // 並び替え中は色を薄くする
                        disabled={isSorting} // 並び替え中は入力不可
                        onClick={() => onDeleteAction(index)}
                        aria-label="削除"
                    ><ImBin className="size-5" /></button>
                </div>
            </div>
        </div>
    );
}
