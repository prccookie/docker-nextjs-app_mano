import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId } = await req.json()

    if (!userId) {
        return NextResponse.json({ error: 'userIdがありません' }, {
            status: 400,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        })
    }

    const existingPosts = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        //take: 10,
    })

    if (existingPosts.length > 0) {
        return NextResponse.json({ posts: existingPosts },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            })
    }

    const newPost = await prisma.post.create({
        data: {
            title: '',
            author: { connect: { id: userId } },
        },
    })

    return NextResponse.json({ posts: [newPost] },
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        })
}