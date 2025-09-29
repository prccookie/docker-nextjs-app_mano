'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

export const RegisterButton = () => {
    const router = useRouter()
    const onClick = () => {
        router.push('/auth/register')
    }
    return (
        <Button
            onClick={onClick}
            variant="secondary"
            className="w-full cursor-pointer"
        >
            アカウントを登録する
        </Button>
    )
}