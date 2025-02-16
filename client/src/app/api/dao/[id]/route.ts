import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    try {
        const dao = await prisma.dao.findUnique({
            where: { id: Number(id) },
            include: {
                creator: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!dao) {
            return NextResponse.json({ error: "DAO not found" }, { status: 404 });
        }

        return NextResponse.json(dao, { status: 200 });
    } catch (error) {
        console.error("Error fetching DAO:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
