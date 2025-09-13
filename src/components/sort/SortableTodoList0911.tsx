"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { SortableItem } from "./SortableTodoItem";
import { User } from 'next-auth' // 型がある場合
import { CgCheckR } from "react-icons/cg";

type TodolistProps = {
    user?: User
}

export function SortableList({ user }: TodolistProps) {
    const [posts, setPosts] = useState<{ id: string; title: string; published: boolean }[]>([])
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
            } catch (error) {
                console.error('Post取得エラー:', error);
            }
        };

        fetchPost();
    }, [user?.id]);

    // 
    const [isSorting, setIsSorting] = useState(false);
    const [message, setMessage] = useState('')
    const [saving, setsaving] = useState(false)
    const isAnimating = useRef(false);

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
            setPosts((items) => {
                // 元のインデックスと新しいインデックスを取得
                //const oldIndex = items.indexOf(active.id as string);
                //const newIndex = items.indexOf(over.id as string);
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                // arrayMoveユーティリティを使って配列を並び替える
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    //戻すボタン
    const handleReload = async () => {
        if (!user?.id) return;

        resetTimer();
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
        resetTimer();
        setMessage('');
    };

    //削除ボタン
    const handleDeletePost = (index: number) => {
        const newPosts = [...posts];
        newPosts.splice(index, 1);
        setPosts(newPosts);
        resetTimer();
        setMessage('');
    };

    //保存ボタン
    const handleSavePosts = async () => {
        if (!user?.id) return;

        setsaving(true);
        resetTimer();
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
            setsaving(false);
        }
    };

    //全下降ボタン
    const handleAllDown = () => {
        const newPostsF = posts.filter((post) => !post.published);
        const newPostsT = posts.filter((post) => post.published);
        setPosts([...newPostsF, ...newPostsT]);
        resetTimer();
        setMessage('チェックが入った行を下へ移しました');
    };

    //全削除ボタン
    const handleAllDel = () => {
        const newPostsF = posts.filter((post) => !post.published);
        setPosts(newPostsF);
        resetTimer();
        setMessage('チェックが入った行を全て削除しました');
    };

    //逆順ボタン
    const handleReverse = () => {
        resetTimer();
        const newPosts = posts.slice().reverse();
        //以下でも反転するが、毎回インデックス計算が必要なので、reverse() よりやや非効率。読みにくく、意図が伝わりにくい
        //const newPosts = posts.map((post,index,oldpost) => (
        //    oldpost[oldpost.length - 1 - index])
        //);
        setPosts(newPosts);
        setMessage('リストを逆順にしました');
        setAnimationTrigger(prev => prev + 1);
    }

    //チェック反転ボタン
    const handleCheckReverse = () => {
        resetTimer();
        const newPosts = posts.map((post) => (
            {
                ...post,
                published: !post.published
            })
        );
        setPosts(newPosts);
        setMessage('チェックを反転しました');
    }

    //チェック全解除ボタン
    const handleCheckFalse = () => {
        const newPosts = posts.map((post) => (
            {
                ...post,
                published: false
            })
        );
        setPosts(newPosts);
        resetTimer();
        setMessage('チェックを全て外しました');
    }

    //チェックボックス
    const updateToggle = (index: number, checked: boolean) => {
        setPosts((oldPosts) => {
            const newPosts = [...oldPosts];
            newPosts[index] = {
                ...newPosts[index],
                published: checked,
            };
            return newPosts;
        });
    };
    //テキストボックス
    const updateText = (index: number, title: string) => {
        setPosts((oldPosts) => {
            const newPosts = [...oldPosts];
            newPosts[index] = {
                ...newPosts[index],
                title,
            };
            return newPosts;
        });
    };

    //メッセージの自動ループ
    const [messageIndex, setmessageIndex] = useState(0);
    const disappearTimer = useRef<NodeJS.Timeout | null>(null);
    const appearTimer = useRef<NodeJS.Timeout | null>(null);
    const disappearInterval = useRef<NodeJS.Timeout | null>(null);
    const appearInterval = useRef<NodeJS.Timeout | null>(null);
    const [animationTrigger, setAnimationTrigger] = useState(0);

    useEffect(() => {
        const messages = [
            "「戻す」で最後に保存した内容に戻します",
            "「並替」で並び替えモードになります",
            "「追加」でリストを1行追加します",
            "「保存」で現在のリストを保存します",
            "「逆順」でリストの順序を逆順にします",
            "「☑反転」でチェックの有無を反転します",
            "「☑解除」で全ての行からチェックを外します",
            "「☑下段」でチェックが入った行を全てリスト下段に移動します",
            "「☑削除」でチェックが入った行を全て消します",
            "リスト内の「ゴミ箱ボタン」でその行を消します",
        ];
        //let disappearTimer: NodeJS.Timeout;
        //let appearTimer: NodeJS.Timeout;

        //並び替えモードのときは何もせず return
        if (isSorting) {
            setMessage('');
            return;
        }
        // 既存のタイマーが残っていたら return（安全設計）
        //if (disappearTimer.current || appearTimer.current || disappearInterval.current || appearInterval.current) {
        //    return;
        //}

        // アニメーション中なら何もしない
        if (isAnimating.current) return;

        if (!isSorting) {
            if (message !== "" && !isAnimating.current) {
                //
                // 10秒後に文字列を1文字ずつ消す処理を開始
                isAnimating.current = true;
                disappearTimer.current = setTimeout(() => {
                    const intervaltimer = setInterval(() => {
                        //disappearInterval.current = intervaltimer;
                        //if (disappearInterval.current === null) isAnimating.current = true;
                        setMessage((prev) => {
                            if (prev.length <= 1) {
                                clearInterval(intervaltimer); // 最後の文字を消したら停止
                                disappearInterval.current = null;
                                isAnimating.current = false;
                                return "";
                            }
                            return prev.slice(1); // 先頭から1文字ずつ削除
                        });
                    }, 100); // 0.1秒ごとに1文字消す
                    disappearInterval.current = intervaltimer;
                }, 10000); // 10秒（10000ミリ秒）
            }
            if (message === "" && !isAnimating.current) {
                isAnimating.current = true;
                appearTimer.current = setTimeout(() => {
                    const nextMessage = messages[messageIndex];
                    let i = 0;

                    const interval = setInterval(() => {
                    //appearInterval.current = setInterval(() => {
                        //appearInterval.current = interval;
                        //if (i === 0) isAnimating.current = true;
                        i++;
                        setMessage(nextMessage.slice(0, i));
                        if (i >= nextMessage.length) {
                            clearInterval(interval);
                            appearInterval.current = null;
                            isAnimating.current = false;

                            disappearTimer.current = setTimeout(() => {
                                disappearInterval.current = setInterval(() => {
                                    setMessage((prev) => {
                                        if (prev.length <= 1) {
                                            clearInterval(disappearInterval.current!);
                                            disappearInterval.current = null;
                                            isAnimating.current = false;
                                            return "";
                                        }
                                        return prev.slice(1);
                                    });
                                }, 100);
                                disappearInterval.current = interval;
                            }, 10000); // ← 表示完了後に10秒待って消去
                            setmessageIndex((prev) => (prev + 1) % messages.length);
                        }
                    }, 70);
                    appearInterval.current = interval;
                }, 5000);
            }
        }
        return () => {
            //resetTimer();
            if (disappearTimer.current) clearTimeout(disappearTimer.current); // クリーンアップ。messageが変わったら前のタイマーをキャンセル
            if (appearTimer.current) clearTimeout(appearTimer.current);
            //clearTimeout(disappearTimer); // クリーンアップ。messageが変わったら前のタイマーをキャンセル
            //clearTimeout(appearTimer);
            if (disappearInterval.current) clearInterval(disappearInterval.current);
            if (appearInterval.current) clearInterval(appearInterval.current);
            isAnimating.current = false;
        };
    }, [messageIndex, isSorting, animationTrigger]);

    const resetTimer = () => {
        if (disappearTimer.current) clearTimeout(disappearTimer.current);
        if (appearTimer.current) clearTimeout(appearTimer.current);
        if (disappearInterval.current) clearInterval(disappearInterval.current);
        if (appearInterval.current) clearInterval(appearInterval.current);
        //setMessage('');
        disappearTimer.current = null;
        appearTimer.current = null;
        disappearInterval.current = null;
        appearInterval.current = null;
        isAnimating.current = false;
        // メッセージを空にする前に、**次のレンダリングで反映されるように一時停止**
        //setmessageIndex((prev) => prev); // indexは維持
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
            <SortableContext items={posts} strategy={verticalListSortingStrategy}>
                <div
                    className="flex justify-between"
                >
                    <div className="flex justify-between items-center gap-2 py-1 justify-start flex-col">
                        <button
                            //className={`bg-blue-500 text-white px-3 py-1 rounded w-[100px]`}
                            className={`bg-blue-500 text-white ${isSorting ? "font-bold" : ""} px-3 py-1 rounded w-[100px]`}
                            //className={`${isSorting ? "bg-orange-500 text-black font-bold" : "bg-gray-500 text-white"} px-3 py-1 rounded w-[60px]`}
                            onClick={() => setIsSorting(!isSorting)}
                        >
                            {isSorting ? '並替終' : '並替'}
                        </button>
                        <button
                            className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleAddPost();
                            }}
                            aria-disabled={isSorting}
                        >追加</button>
                        <button
                            className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={handleSavePosts}
                            aria-disabled={saving || isSorting}
                        >
                            {saving ? '保存中...' : '保存'}
                        </button>
                    </div>
                    <div className="flex justify-between items-center gap-2 py-1 justify-end flex-col">
                        <button
                            className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleReverse();
                            }}
                            aria-disabled={isSorting}
                        >逆順</button>
                        <button
                            className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                            handleCheckReverse();
                        }}
                        aria-disabled={isSorting}
                        ><div className="flex items-center justify-center">
                                <div><CgCheckR /></div>
                                <div>反転</div>
                            </div>
                        </button>
                        <button
                            className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleCheckFalse();
                            }}
                            aria-disabled={isSorting}
                        ><div className="flex items-center justify-center">
                                <div><CgCheckR /></div>
                                <div>解除</div>
                            </div>
                        </button>
                    </div>
                    <div className="flex justify-between items-center gap-2 py-1 justify-end flex-col">
                        <button
                            className={`${isSorting ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleReload()
                            }}
                            aria-disabled={saving || isSorting}
                        >戻す</button>
                        <button
                            className={`${isSorting ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleAllDown();
                            }}
                            aria-disabled={isSorting}
                        ><div className="flex items-center justify-center">
                                <div><CgCheckR /></div>
                                <div>下段</div>
                            </div>
                        </button>
                        <button
                            className={`${isSorting ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting) {
                                    e.preventDefault();
                                    return;
                                }
                                handleAllDel();
                            }}
                            aria-disabled={isSorting}
                        >
                            <div className="flex items-center justify-center">
                                <div><CgCheckR /></div>
                                <div>削除</div>
                            </div>
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-700 py-1">
                    {/*message
                        ? message : isSorting //messageが空欄ならisSortingを確認、trueなら次の行の左側、falseなら右側（'\u00A0'：空白）のテキストが表示される
                            ? 'ドラッグでリストを並び替えできます' : '\u00A0'*/}
                    {isSorting ? 'ドラッグでリストを並び替えできます' : message || '\u00A0'}
                </p>
                <div className="flex flex-col w-full p-2 bg-gray-100 rounded h-[500px] overflow-y-scroll overflow-x-hidden">
                    {posts.map((post, index) => (
                        // 並び替え可能な各アイテムをレンダリング
                        //className="gap-2 border p-2 rounded bg-white shadow "

                        <SortableItem key={post.id} post={post} index={index} isSorting={isSorting} onDeleteAction={handleDeletePost} onToggleAction={updateToggle} onTitleAction={updateText} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
