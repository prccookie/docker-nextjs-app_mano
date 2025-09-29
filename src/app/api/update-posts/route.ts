import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId, posts } = await req.json()

    if (!userId || !Array.isArray(posts)) {
        return NextResponse.json({ success: false }, { status: 400 })
    }

    // 既存のPostを削除（簡易的な上書き方式）
    await prisma.post.deleteMany({ where: { authorId: userId } })

    // 新しいPostを一括作成
    await prisma.post.createMany({
        data: posts.map(p => ({
            title: p.title,
            published: p.published,
            authorId: userId,
        })),
    })

    return NextResponse.json({ success: true })
}