'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

export const LoginButton = () => {
    const router = useRouter()
    const onClick = () => {
        router.push('/auth/login')
    }
    return (
        <Button onClick={onClick} className="w-full cursor-pointer">
            ログインする
        </Button>
    )
}