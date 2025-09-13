import * as z from 'zod'
//import isEmail from 'validator/lib/isEmail';
import validator from 'validator'

export const RegisterSchema = z.object({
    email: z.string().refine(val => validator.isEmail(val), {
        message: '正しいメールアドレスを入力してください',
    }),
    password: z.string().min(6, {
        message: 'パスワードは6文字以上で入力してください',
    }),
    name: z.string().min(1, {
        message: '名前を入力してください',
    }),
})

export const LoginSchema = z.object({
    email: z.string().refine(val => validator.isEmail(val), {
        message: 'メールアドレスを入力してください',
    }),
    password: z.string().min(1, {
        message: 'パスワードを入力してください',
    }),
})