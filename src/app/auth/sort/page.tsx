"use client";

import { useState } from "react";
import { SortableList } from "@/components/sort/SortableList";

export default function Home() {
    const [isSorting, setIsSorting] = useState(false);
    const [items, setItems] = useState(["1", "2", "3"]);

    const handleAddItem = () => {
        const newId = String(Date.now()); // 一意なID（タイムスタンプなど）
        setItems([...items, newId]);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">dnd-kit サンプル</h1>
            <div className="flex justify-between items-center gap-2">
                <button
                    className={`${isSorting ? "bg-orange-500 text-black" : "bg-gray-500 text-white"} px-3 py-1 rounded w-[110px]`}
                    onClick={() => setIsSorting(!isSorting)}
                >並び替え</button>
                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={handleAddItem}
                >追加</button>
            </div>
            <SortableList items={items} setItemsAction={setItems} isSorting={isSorting} />
        </main>
    );
}