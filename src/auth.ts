import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from 'next-auth'
//import github from 'next-auth/providers/github'
import authConfig from "./auth.config";
import db from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    //providers: [github],
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
})