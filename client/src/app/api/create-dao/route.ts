import { NextResponse } from "next/server";
import { prisma } from '@/prisma/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { daoname, tokenname, tokensymbol, contractAddress, address, memberAddresses = [] } = body;

        if (!daoname || !tokenname || !tokensymbol || !contractAddress || !address) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Find the creator in the database
        const creator = await prisma.user.findFirst({
            where: { public_key: address }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "User Doesn't exist" },
                { status: 404 }
            );
        }

        // Find all members (including creator) in DB
        const allMembers = await prisma.user.findMany({
            where: { public_key: { in: [address, ...memberAddresses] } }
        });

        if (!allMembers.length) {
            return NextResponse.json(
                { error: "No valid users found for membership" },
                { status: 400 }
            );
        }

        // Create the DAO with creatorID
        const dao = await prisma.dao.create({
            data: {
                daoname,
                tokenname,
                tokensymbol,
                contractAddress,
                creatorID: creator.id,
            },
        });

        // Create DaoMember records for all members
        const daoMembers = allMembers.map(user => ({
            daoID: dao.id,
            userID: user.id,
        }));

        await prisma.daoMember.createMany({
            data: daoMembers
        });

        return NextResponse.json({ success: true, dao, members: daoMembers, message: 'DAO created successfully' }, { status: 201 });
    } catch (error) {
        console.error("Error creating DAO:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
