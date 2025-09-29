import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function POST(req: Request) {
    const { userId, name } = await req.json();

    if (!userId || !name) {
        return NextResponse.json({ error: 'Missing userId or name' }, { status: 400 });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
    }
}