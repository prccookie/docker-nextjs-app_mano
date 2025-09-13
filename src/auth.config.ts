import bcryptjs from 'bcryptjs'
import type { NextAuthConfig } from "next-auth";
import Credentials from 'next-auth/providers/credentials'
import github from "next-auth/providers/github";
import { getUserByEmail } from './data/user'
import { LoginSchema } from './schema'

export default {
    providers: [
        github,
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials)

                if (!validatedFields.success) {
                    return null
                }

                const { email, password } = validatedFields.data
                const user = await getUserByEmail(email)
                if (!user || !user.password) {
                    return null
                }
                const passwordMatch = await bcryptjs.compare(password, user.password)
                if (passwordMatch) {
                    return user
                }
                return null
            },
        }),
    ],

    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        },
    },

} satisfies NextAuthConfig