import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { publicKey } = body;

        if (!publicKey) {
            return NextResponse.json(
                { error: "Public key is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { public_key: publicKey },
        });

        if (!user) {
            // Create a new user if not found
            user = await prisma.user.create({
                data: { public_key: publicKey },
            });
        }
        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
