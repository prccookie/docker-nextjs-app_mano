"use client"
import { useEffect, useState } from "react";
import { User } from 'next-auth' // 型がある場合
//import { boolean } from "zod/v3";
import { ImBin } from "react-icons/im";
//import { BiUndo } from "react-icons/bi";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    Modifier
} from "@dnd-kit/core";
import {
    //arrayMove,
    SortableContext,
    useSortable,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    restrictToParentElement,
    restrictToWindowEdges
} from '@dnd-kit/modifiers';

type TodolistProps = {
    user?: User
}

// 型定義
type Post = {
    id: string;
    title: string;
    published: boolean;
};

type OnChangeFn = <K extends keyof Post>(
    index: number,
    field: K,
    value: Post[K]
) => void;

export const Todolist = ({ user }: TodolistProps) => {
    //const [text, setText] = useState(user?.name ?? 'ななし');
    //const [text0, setText0] = useState('');

    //return (
    //    <div className="flex items-center gap-2">
    //        <input type="checkbox" />
    //        <input
    //            className="border border-black rounded px-2 py-1"
    //            value={text}
    //            onChange={(e) => setText(e.target.value)}
    //        />
    //    </div>
    //)

    //const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [loading2, setLoading2] = useState(false)

    {/*
    const handleUpdate = async () => {
        console.log('更新ボタン押された。送信データ:', { userId: user?.id, name: text })
        if (!user?.id) return

        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('/api/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name: text }),
            })

            const data = await res.json()
            if (data.success) {
                setMessage('名前を更新しました！')
            } else {
                setMessage('更新に失敗しました')
            }
        } catch (error) {
            console.log(error)
            setMessage('エラーが発生しました')
        } finally {
            setLoading(false)
        }
    }
    */}

    const [posts, setPosts] = useState<Post[]>([])
    useEffect(() => {
        const fetchPost = async () => {
            if (!user?.id) return;

            try {
                const res = await fetch('/api/user-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });

                const data = await res.json();
                if (Array.isArray(data.posts)) {
                    setPosts(data.posts)
                }
                //const text = await res.text();
                //console.log('レスポンス内容:', text);
                //
                //// JSONとしてパースできるか確認（必要なら try-catch で囲む）
                //try {
                //    const data = JSON.parse(text);
                //    if (data.post?.title) {
                //        setText2(data.post.title);
                //    }
                //} catch (error) {
                //    console.error('JSONのパースに失敗しました:', error);
                //}
            } catch (error) {
                console.error('Post取得エラー:', error);
            }
        };

        fetchPost();
    }, [user?.id]);

    //戻すボタン
    const handleReload = async () => {
        if (!user?.id) return;

        //setLoading(true);
        try {
            const res = await fetch('/api/user-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });
            const data = await res.json();
            if (Array.isArray(data.posts)) {
                setPosts(data.posts);
                setMessage('リストを再読み込みしました');
            }
        } catch (error) {
            console.error('再読み込みエラー:', error);
            setMessage('再読み込みに失敗しました');
        } finally {
            //setLoading(false);
        }
    };
    //追加ボタン
    const handleAddPost = () => {
        const newPost = {
            id: crypto.randomUUID(), // 仮ID（保存時にDBで上書きされる）
            title: '',
            published: false,
        };
        setPosts([...posts, newPost]);
        setMessage('');
    };
    //削除ボタン
    const handleDeletePost = (index: number) => {
        console.log('削除対象インデックス:', index);
        const newPosts = [...posts];
        newPosts.splice(index, 1);
        console.log('更新後の配列:', newPosts);
        setPosts(newPosts);
        setMessage('');
    };
    //保存ボタン
    const handleSavePosts = async () => {
        if (!user?.id) return;

        setLoading2(true);
        setMessage('');

        try {
            const res = await fetch('/api/update-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, posts }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('リストを保存しました！');
            } else {
                setMessage('保存に失敗しました');
            }
        } catch (error) {
            console.error('保存エラー:', error);
            setMessage('エラーが発生しました');
        } finally {
            setLoading2(false);
        }
    };

    //カスタムモディファイア。ドラッグ中の x 座標が ±1px を超えない。名前は当初は±10pxだった名残
    const restrictXTo10px: Modifier = ({ transform }) => {
        return {
            ...transform,
            x: Math.max(Math.min(transform.x, 1), -1), // -1〜1pxの範囲に制限
        };
    };


    //配列の並び替えを行うユーティリティ関数
    function arrayMove<T>(arr: T[], from: number, to: number): T[]  {
        const copy = [...arr];//配列をコピーする
        const item = copy.splice(from, 1)[0];//コピー配列からfrom番目の要素を(から1つ)削除。削除した要素をitemに代入
        copy.splice(to, 0, item);//コピー配列のto番目(から要素を0個削除して)itemを挿入
        return copy;//コピー配列（並び変えた配列）を返す
    };

    //dnd-kit コンポーネント
    const SortableItem = ({
        post,
        index,
        onChange,
        onDelete,
    }: {
        post: Post;
        index: number;
        onChange: OnChangeFn;
        onDelete: (index: number) => void;
    }) => {
        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id: post.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            pointerEvents: 'auto' as const
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="relative flex items-center gap-2 max-w-full"
            >
                <input
                    type="checkbox"
                    className="size-5"
                    checked={post.published}
                    onChange={(e) => onChange(index, 'published', e.target.checked)}
                />
                <input
                    className={`border border-black rounded px-2 py-1 flex-grow ${post.published ? 'line-through text-gray-500' : ''
                        }`}
                    value={post.title}
                    onChange={(e) => onChange(index, 'title', e.target.value)}
                />
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    title="Delete"
                    onClick={() => onDelete(index)}
                >
                    <ImBin className="size-5" />
                </button>
            </div>
        );
    };

    // センサー（どのような入力でドラッグを開始するか）の設定
    // ここではポインター（マウスやタッチ）とキーボード操作を有効にしている
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = posts.findIndex((p) => p.id === active.id);
            const newIndex = posts.findIndex((p) => p.id === over?.id);
            setPosts(arrayMove(posts, oldIndex, newIndex));
        }
    };
    /*
            // ドラッグ終了時の処理
        const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;

            // overがnullの場合（ドロップ先がない場合）は何もしない
            if (!over) {
                return;
            }

            // ドラッグ元とドロップ先が同じ場合は何もしない
            if (active.id !== over.id) {
                setItems((items) => {
                    // 元のインデックスと新しいインデックスを取得
                    const oldIndex = items.indexOf(active.id as string);
                    const newIndex = items.indexOf(over.id as string);

                    // arrayMoveユーティリティを使って配列を並び替える
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        };

    */
    return (
        <div className="flex flex-col gap-2">
            {/*
            <div className="flex items-center gap-2">
                <input
                    className="border border-black rounded px-2 py-1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? '更新中...' : '名前を更新'}
                </button>
            </div>
            */}
            {/*
            <div className="flex items-center gap-2">
                <input type="checkbox" />
                <input
                    className="border border-black rounded px-2 py-1"
                    value={text0}
                    onChange={(e) => setText0(e.target.value)}
                />
            </div>
            */}
            <div className="flex justify-between items-center gap-2">
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={handleReload}
                >破棄</button>
                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded w-[80px]"
                    onClick={handleAddPost}
                >追加</button>
                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded w-[120px]"
                    onClick={handleSavePosts}
                    disabled={loading2}
                >
                    {loading2 ? '保存中...' : 'リストを保存'}
                </button>
            </div>
            <p className="text-sm text-gray-700">{message ? message : '「破棄」は変更を破棄して保存済みリストを読み込みます'}</p>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement, restrictToWindowEdges, restrictXTo10px]}
            >
                <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2 h-[300px] overflow-y-scroll overflow-x-hidden touch-pan-y border p-2 rounded bg-white shadow">
                        {/*
                flex 要素をフレックスボックスにする
                flex-col 子要素を縦方向（列）に並べる
                gap-2 子要素の間に 0.5rem（8px）の隙間
                h-[300px] 高さ300px固定
                overflow-y-scroll 縦方向スクロールバー常時表示
                border 要素に境界線を入れる
                p-2 内側の余白（padding）を 0.5rem（8px）
                rounded 角を丸く（デフォルトで 0.25rem）
                bg-white 背景色は白
                shadow 要素に軽い影を付けて浮かせたような見た目に
                */}
                        {/*    <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >*/}
                        {posts.map((post, index) => (
                            <SortableItem
                                key={post.id}
                                post={post}
                                index={index}
                                onChange={(i, field, value) => {
                                    const newPosts = [...posts];
                                    newPosts[i][field] = value;
                                    setPosts(newPosts);
                                }}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>

    )
}