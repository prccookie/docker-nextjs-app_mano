'use server'

//import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { Prisma } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import type { z } from 'zod'
import db from '@/lib/db'
import { RegisterSchema } from '@/schema'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: '入力内容を修正してください' }
    }

    const { name, email, password } = validatedFields.data
    const hashedPassword = await bcryptjs.hash(password, 10)

    try {
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        console.log('登録成功！')

        return { success: 'アカウントを登録しました' }
    } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                console.log('このメールアドレスは既に登録されています')
                return { error: 'このメールアドレスは既に登録されています' }
            }
        }
        //console.log(e)
        console.error(e)
        console.error('Unexpected error:', (e as Error).message)
        console.error('Error stack:', (e as Error).stack)
        return { error: 'エラーが発生しました' }
    }
}