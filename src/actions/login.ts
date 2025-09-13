//'use server'
//import { AuthError } from 'next-auth'
import { z } from 'zod'
//import { signIn } from '@/auth'
import { signIn } from 'next-auth/react'
//import { DEFAULT_LOGIN_REDIRECT } from '@/route'
import { LoginSchema } from '@/schema'

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: '入力内容を修正してください' }
    }

    const { email, password } = validatedFields.data

    //try {
        const res = await signIn('credentials', {
            email,
            password,
            //redirectTo: DEFAULT_LOGIN_REDIRECT,
            redirect: false,
        })

        console.log('signIn result:', res)

        if (!res || res.error) {
            return {
                error: 'メールアドレスもしくはパスワードが間違っています。',
            }
        }

        return { success: true }
    //} catch (error) {
    //    console.error('ログインエラー:', error)
    //    return { error: 'サーバーエラーが発生しました。' }
    //}
}