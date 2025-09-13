"use client"
import { useEffect, useState } from "react";
import { User } from 'next-auth' // 型がある場合
//import { boolean } from "zod/v3";
import { ImBin } from "react-icons/im";
//import { BiUndo } from "react-icons/bi";

type TodolistProps = {
    user?: User
}

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
        const newPosts = [...posts];
        newPosts.splice(index, 1);
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
            <div className="flex flex-col gap-2 h-[300px] overflow-y-scroll border p-2 rounded bg-white shadow">
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
                {posts.map((post, index) => (
                    <div key={post.id} className="flex items-center gap-2">
                        {/*
                            items-center 中央寄せ
                        */}
                        <input
                            type="checkbox"
                            className="size-5"
                            checked={post.published}
                            onChange={(e) => {
                                const newPosts = [...posts]
                                newPosts[index].published = e.target.checked
                                setPosts(newPosts)
                            }}
                        />
                        <input
                            className={`border border-black rounded px-2 py-1 flex-grow ${post.published ? 'line-through text-gray-500' : ''}`}
                            //px-2 py-1 内側の余白は、xに2、yに1
                            //{`border border-black rounded px-2 py-1 flex-grow ${post.published ? 'line-through text-gray-500' : ''}`}
                            //line-through 取り消し線
                            //${condition ? 'classA' : ''}のような書き方で、条件に応じてクラスを追加
                            value={post.title}
                            onChange={(e) => {
                                const newPosts = [...posts]
                                newPosts[index].title = e.target.value
                                setPosts(newPosts)
                            }}
                        />
                        <button
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                            onClick={() => handleDeletePost(index)}
                        ><ImBin className="size-5" /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}