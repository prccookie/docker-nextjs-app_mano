'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { login } from '@/actions/login'
import { LoginSchema } from '@/schema'
import { FormError } from '../form-error'
import { Button } from '../ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { CardWrapper } from './card-wrapper'
import { useRouter } from 'next/navigation'

export const LoginForm = () => {
    const [error, setError] = useState<string | undefined>('')
    const [isPending, setTransition] = useTransition()
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })
    const router = useRouter()
    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setError('')
        setTransition(async () => {
            try {
                const response = await login(values)
                console.log('ログインレスポンス:', response) 
                if (response && response.error) {
                    setError(response.error)
                } else {
                    router.push('/settings') // ← クライアント側で遷移
                }
            } catch (e) {
                console.log(e)
                //console.error(e);
                setError('エラーが発生しました')
            }
        })
    }
    return (
        <CardWrapper
            headerLabel="メールアドレスとパスワードを入力してログイン"
            buttonLabel="アカウント作成がまだの方はコチラ"
            buttonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メールアドレス</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="nextjs@example.com"
                                            type="email"
                                            autoComplete="off"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>パスワード</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="******"
                                            type="password"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        ログイン
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}