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
import { FaPlus } from "react-icons/fa";

type TodolistProps = {
    user?: User
}

export function SortableList({ user }: TodolistProps) {
    type PostType = {
        id: string;
        title: string;
        published: boolean;
        club: boolean;
        diamond: boolean;
        heart: boolean;
        spade: boolean;
    };
    const [posts, setPosts] = useState <PostType[]>([])
    //絞り込み結果は filteredIndexes に保持し、表示は posts[index] を使う
    const [filteredIndexes, setFilteredIndexes] = useState<number[]>([]);

    type PostKey = "club" | "diamond" | "heart" | "spade";
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

        setFilterFlagsDraft({
            club: false,
            diamond: false,
            heart: false,
            spade: false,
        });
        hasFilteredOnce.current = false;

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
            club: filterFlagsDraft.club,
            diamond: filterFlagsDraft.diamond,
            heart: filterFlagsDraft.heart,
            spade: filterFlagsDraft.spade,
        };
        const newIndex = posts.length;
        setPosts([...posts, newPost]);
        setFilteredIndexes((prev) => [...prev, newIndex]);
    };

    //挿入ボタン
    const handleInsertPost = (index: number) => {
        const insPost = {
            id: crypto.randomUUID(), // 仮ID（保存時にDBで上書きされる）
            title: '',
            published: false,
            club: filterFlagsDraft.club,
            diamond: filterFlagsDraft.diamond,
            heart: filterFlagsDraft.heart,
            spade: filterFlagsDraft.spade,
        };
        const newPosts = [...posts];
        newPosts.splice(index, 0, insPost);
        setPosts(newPosts);
        setFilteredIndexes((prev) => {
            const result: number[] = [];

            for (const i of prev) {
                if (i === index) {
                    result.push(i, i + 1); // indexとindex+1の両方を追加
                } else if (i > index) {
                    result.push(i + 1); // indexより大きいものは+1
                } else {
                    result.push(i); // それ以外はそのまま
                }
            }

            return result;
        });
};

    //削除ボタン
    const handleDeletePost = (index: number) => {
        const newPosts = [...posts];
        newPosts.splice(index, 1);
        setPosts(newPosts);
        //resetTimer();
        //setMessage('');
        //hasFilteredOnce.current = false;
        setFilteredIndexes((prev) =>
            prev
                .filter((i) => i !== index)
                .map((i) => (i > index ? i - 1 : i))
        );
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
        hasFilteredOnce.current = false;
        setMessage('チェックが入った行を下へ移しました');
    };

    //全削除ボタン
    const handleAllDel = () => {
        const newPostsF = posts.filter((post) => !post.published);
        setPosts([...newPostsF]);
        resetTimer();
        setFilteredIndexes(newPostsF.map((_, index) => index));
        hasFilteredOnce.current = false;
        setMessage('チェックが入った行を全て削除しました');
    };

    //逆順ボタン
    //const [message1, setMessage1] = useState('メッセージ1')
    const handleReverse = () => {
        resetTimer();
        const newPosts = posts.slice().reverse();
        //以下でも反転するが、毎回インデックス計算が必要なので、reverse() よりやや非効率。読みにくく、意図が伝わりにくい
        //const newPosts = posts.map((post,index,oldpost) => (
        //    oldpost[oldpost.length - 1 - index])
        //);
        setPosts(newPosts);
        resetTimer();
        setMessage('リストを逆順にしました');
        //setAnimationTrigger(prev => prev + 1);

        if (!allShow) {
            setFilteredIndexes((prev) => {
                const result: number[] = [];
                let debugMessage = `リスト逆順/// length=${posts.length}, i=`;

                for (const i of prev) {
                    result.push(posts.length - i - 1);
                    debugMessage += `${i},`;
                }

                //setMessage1(debugMessage);
                console.log('Reversed indexes:', result);
                console.log('Original indexes:', prev);
                return result;
            });
            //const newIndexes = filteredIndexes.slice().reverse();
            //setFilteredIndexes(newIndexes);
        }
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
        resetTimer();
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

    //汎用チェックボタン
    const updateSwitch = (index: number, key: PostKey) => {
        setPosts((oldPosts) => {
            const newPosts = [...oldPosts];
            newPosts[index] = {
                ...newPosts[index],
                [key]: !newPosts[index][key],
            };
            return newPosts;
        });
    };

    const allShow = useRef(false);
    //「絞込」ボタンで filteredPosts を更新
    const applyFilter = () => {
        const { club, diamond, heart, spade } = filterFlagsDraft;
        const isFiltering = club || diamond || heart || spade;

        const indexes = posts
            .map((post, index) => ({ post, index }))
            .filter(({ post }) => {
                if (true) {
                    if (!isFiltering) {// 全部falseなら全件表示  
                        allShow.current = true;// 全件表示ならallShowをtrue
                        return true;
                    }
                    allShow.current = false; // 絞り込みありならallShowをfalse
                    return (
                        (club && post.club) ||
                        (diamond && post.diamond) ||
                        (heart && post.heart) ||
                        (spade && post.spade)
                    );
                }
            })
            .map(({ index }) => index); // ✅ indexだけ抽出

        setFilteredIndexes(indexes); // ✅ number[] を渡す
    };

    //メッセージの自動ループ
    const [messageIndex, setmessageIndex] = useState(0);
    const disappearTimer = useRef<NodeJS.Timeout | null>(null);
    const appearTimer = useRef<NodeJS.Timeout | null>(null);
    const disappearInterval = useRef<NodeJS.Timeout | null>(null);
    const appearInterval = useRef<NodeJS.Timeout | null>(null);
    //const [animationTrigger, setAnimationTrigger] = useState(0);
    //const [isResetTimer, setIsResetTimer] = useState(false);
    //const isAnimating = useRef(false);
    const isNewMessage = useRef(false);

    useEffect(() => {
        const messages = [
            "「戻す」で最後に保存した内容に戻します",
            "「並替」で並び替えモードになります",
            "「追加」でリスト最下段に1行追加します",
            "「保存」で現在のリストを保存します",
            "「逆順」でリストの順序を逆順にします",
            "「☑反転」でチェックの有無を反転します",
            "「☑解除」で全ての行からチェックを外します",
            "「☑下段」でチェックが入った行を全てリスト下段に移動します",
            "「☑削除」でチェックが入った行を全て消します",
            "リスト内の「ゴミ箱ボタン」でその行を消します",
            "リスト行間の「＋ボタン」で行間に1行挿入します",
        ];
        let disappearTimer: NodeJS.Timeout;
        let appearTimer: NodeJS.Timeout;
        if (!isSorting) {
            if (message !== "") {
                //
                // 10秒後に文字列を1文字ずつ消す処理を開始
                disappearTimer = setTimeout(() => {
                //disappearTimer.current = setTimeout(() => {
                    const intervaltimer = setInterval(() => {
                        setMessage((prev) => {
                            if (prev.length <= 1) {
                                clearInterval(intervaltimer); // 最後の文字を消したら停止
                                disappearInterval.current = null;
                                isNewMessage.current = false;
                                return "";
                            }
                            return prev.slice(1); // 先頭から1文字ずつ削除
                        });
                    }, 100); // 0.1秒ごとに1文字消す
                    disappearInterval.current = intervaltimer;
                }, 10000); // 10秒（10000ミリ秒）
            }
            if (message === "") {
                //isAnimating.current = true;
                appearTimer = setTimeout(() => {
                //appearTimer.current = setTimeout(() => {
                    const nextMessage = messages[messageIndex];
                    let i = 0;

                    const interval = setInterval(() => {
                        if (!isNewMessage.current) {
                            i++;
                            setMessage(nextMessage.slice(0, i));
                        }
                        if (i >= nextMessage.length || isNewMessage.current) {
                            clearInterval(interval);
                            appearInterval.current = null;
                            //isAnimating.current = false;
                            setmessageIndex((prev) => (prev + 1) % messages.length);
                        }
                    }, 70);
                }, 5000);
            }
        }
        if (isSorting) {
            setMessage('');
        }
        return () => {
            //if (disappearTimer.current) clearTimeout(disappearTimer.current); // クリーンアップ。messageが変わったら前のタイマーをキャンセル 
            //if (appearTimer.current) clearTimeout(appearTimer.current);
            clearTimeout(disappearTimer); // クリーンアップ。messageが変わったら前のタイマーをキャンセル
            clearTimeout(appearTimer);
            //setIsResetTimer(false);
        };
    }, [message, messageIndex, isSorting, isNewMessage]);

    const resetTimer = () => {
    //setIsResetTimer(true);
        //if (disappearTimer.current) clearTimeout(disappearTimer.current);
        //if (appearTimer.current) clearTimeout(appearTimer.current);
        if (disappearInterval.current) clearInterval(disappearInterval.current);
        if (appearInterval.current) clearInterval(appearInterval.current);
        //setMessage('');
        //disappearTimer.current = null;
        //appearTimer.current = null;
        disappearInterval.current = null;
        appearInterval.current = null;
        //isAnimating.current = false;
        isNewMessage.current = true;
        // メッセージを空にする前に、**次のレンダリングで反映されるように一時停止**
        //setmessageIndex((prev) => prev); // indexは維持
        //setIsResetTimer(true);
        if (disappearTimer.current) {
            clearTimeout(disappearTimer.current);
            disappearTimer.current = null;
        }
        if (appearTimer.current) {
            clearTimeout(appearTimer.current); appearTimer.current = null;
        }
        if (appearInterval.current) {
            clearInterval(appearInterval.current);
            appearInterval.current = null;
        }
        if (disappearInterval.current) {
            clearInterval(disappearInterval.current);
            disappearInterval.current = null;
        }
        setMessage('');
    };

    const [filterFlagsDraft, setFilterFlagsDraft] = useState({
        club: false,
        diamond: false,
        heart: false,
        spade: false,
    });
    /*const [ filterFlags, setFilterFlags] = useState({
        club: false,
        diamond: false,
        heart: false,
        spade: false,
    });*/
    //const [filterAndOr, setFilterAndOr] = useState(false);//trueならAND検索
    const hasFilteredOnce = useRef(false);
    useEffect(() => {
        if (!hasFilteredOnce.current && posts.length > 0) {
            applyFilter(); // ページ表示直後に1回だけ絞り込み実行
            hasFilteredOnce.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts]);

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
                    <div className="flex justify-between items-center gap-2 py-1 justify-start flex-col center space-evenly">
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
                            className={`${isSorting || !allShow.current ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting || !allShow.current) {
                                    e.preventDefault();
                                    return;
                                }
                                handleAllDown();
                            }}
                            aria-disabled={isSorting || !allShow.current}
                        ><div className="flex items-center justify-center">
                                <div><CgCheckR /></div>
                                <div>下段</div>
                            </div>
                        </button>
                        <button
                            className={`${isSorting || !allShow.current ? "bg-gray-300 cursor-not-allowed" : "bg-gray-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={(e) => {
                                if (isSorting || !allShow.current) {
                                    e.preventDefault();
                                    return;
                                }
                                handleAllDel();
                            }}
                            aria-disabled={isSorting || !allShow.current}
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
                    {/*posts.map((post, index) => ({ post, index })).filter(({ post }) => {
                        // 並び替え可能な各アイテムをレンダリング(OR検索)
                        //className="gap-2 border p-2 rounded bg-white shadow "
                        const { club, diamond, heart, spade } = filterFlags;
                        if (!filterAndOr)
                        {
                            // 絞り込みが1つでも有効ならOR条件で判定
                            const isFiltering = club || diamond || heart || spade;

                            if (!isFiltering) return true; // 全部falseなら全件表示

                            return (
                                (club && post.club) ||
                                (diamond && post.diamond) ||
                                (heart && post.heart) ||
                                (spade && post.spade)
                            );
                        }
                        else
                        {
                            const activeKeys = Object.entries(filterFlags)
                                .filter(([, isSelected]) => isSelected)
                                .map(([key]) => key as keyof typeof post);

                            // 絞り込みがない場合は全件表示
                            if (activeKeys.length === 0) return true;

                            // AND条件：すべての選択項目が true である投稿のみ表示
                            return activeKeys.every((key) => post[key]);
                        }
                    }).map(({post, index}) => (
                        <SortableItem key={post.id} post={post} index={index} isSorting={isSorting} onDeleteAction={handleDeletePost} onInsertAction={handleInsertPost} onToggleAction={updateToggle} onTitleAction={updateText} onSwitchAction={updateSwitch} />
                    ))*/}
                    {/*filteredIndexes.map((index) => (*/
                        filteredIndexes.map((index) => {
                            const post = posts[index];
                            if (!post) return null; // ✅ 安全ガード
                            return (
                                /*filteredItems.map(({ index }) => (*/

                                <SortableItem
                                    key={posts[index].id}
                                    post={posts[index]}
                                    index={index}
                                    isSorting={isSorting}
                                    onDeleteAction={handleDeletePost}
                                    onInsertAction={handleInsertPost}
                                    onToggleAction={updateToggle}
                                    onTitleAction={updateText}
                                    onSwitchAction={updateSwitch}
                                />
                            )
                        })}
                    <div className="flex items-center gap-2 text-center">
                        <button
                            className={`bg-blue-500 disabled:opacity-0 text-white px-3 rounded w-[100%] flex justify-center text-center`} // disabled中は透明にする
                            //className={`${isSorting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white px-3 py-1 rounded w-[100px]`}
                            onClick={() => {
                                handleAddPost();
                            }}
                            disabled={isSorting}
                            aria-label="追加"
                        ><FaPlus className="size-3" /></button>
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}
