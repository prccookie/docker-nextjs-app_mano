'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { RegisterSchema } from '@/schema'
import { Button } from '../ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { CardWrapper } from './card-wrapper'
import { register } from '@/actions/register'
import { useState, useTransition } from 'react'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'

export const RegisterForm = () => {
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
        },
    })

    const [isPending, setTransition] = useTransition()

    //const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    //    console.log(values)
    //};
    const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
        //const response = await register(values)
        //console.log(response)
        setError('')
        setSuccess('')
            setTransition(async () => {
                try {
                    const response = await register(values)
                    if (response.error) {
                        setError(response.error)
                    } else {
                        setSuccess(response.success)
                    }
                } catch (e) {
                    setError('エラーが発生しました')
                }
            })
    };

    return (
        <CardWrapper
            headerLabel="各項目を入力してアカウントを作成"
            buttonLabel="既にアカウントを登録済みの方はコチラ"
            buttonHref="/auth/login"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>名前</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="ネクスト ジェイエス"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メールアドレス</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="nextjs@example.com"
                                            type="email"
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
                                    <FormDescription>
                                        パスワードは6文字以上で設定してください
                                    </FormDescription>
                                    <FormControl>
                                        <Input {...field} placeholder="******" type="password" />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        アカウントを作成する
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}