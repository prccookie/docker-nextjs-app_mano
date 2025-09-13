import { LoginButton } from '@/components/auth/login-button'
import { RegisterButton } from '@/components/auth/register-button'

export default function Home() {
    return (
        <main className="flex h-full flex-col items-center justify-center bg-sky-100">
            <div className="space-y-6 text-center">
                <h1 className={'text-6xl font-semibold drop-shadow-md'}>
                    トップ画面
                </h1>
                <p className="text-lg">Next.jsによる認証チュートリアル</p>
                <div>
                    <LoginButton />
                </div>
                <div>
                    <RegisterButton />
                </div>
            </div>
        </main>
    )
}
