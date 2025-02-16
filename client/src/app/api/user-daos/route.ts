import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const publicKey = searchParams.get("publicKey");

        if (!publicKey) {
            return NextResponse.json(
                { error: "Public key is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { public_key: publicKey },
            include: { daos: true }, // Fetch DAOs created by user
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ daos: user.daos }, { status: 200 });
    } catch (error) {
        console.error("Error fetching DAOs:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
