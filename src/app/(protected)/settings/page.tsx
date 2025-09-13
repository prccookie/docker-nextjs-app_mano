import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
//import { Todolist } from '@/components/todos/todolist'
//import Lists from '@/components/todos/lists'
import { SortableList } from '@/components/sort/SortableTodoList'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

//const SettingsPage = () => {
//    return <div>設定画面</div>
//}

const SettingsPage = async () => {
    const session = await auth()
    if (!session) return null
    const onSubmit = async () => {
        'use server'
        await signOut()
    }
    return (
        <div>
            <form action={onSubmit}>
                <Button type="submit" className="ml-[75%] w-[25%]" variant="secondary">
                    ログアウト
                </Button>
            </form>
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <h1 className={'text-3xl font-semibold drop-shadow-md'}>ようこそ {session.user?.name ?? "ななし"} さん</h1>
                    <pre>メールアドレス：{session.user?.email}</pre>
                </CardHeader>
            </Card>
            <Card className="w-[400px] shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent>
                    <h2 className={'text-2xl font-semibold drop-shadow-md'}>あなたのTODOリストです</h2>
                    {/*設定画面
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                    <pre>名前：{session.user?.name}</pre>
                    <Todolist user={session.user} />*/}
                    <SortableList user={session.user} />
                    {/* <Lists />*/}
                </CardContent>
            </Card>
        </div>
    )
}

export default SettingsPage