// /api/create-chat endpoint
// lang chain -> convert pdf into strings

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        const { file_key, file_name } = body;
        await loadS3IntoPinecone(file_key);
        // create new chat within database
        // returns an array of all inserted ids
        const chat_id = await db
            .insert(chats)
            .values({
                fileKey: file_key,
                pdfName: file_name,
                pdfUrl: await getS3Url(file_key),
                userId,
            })
            .returning({
                insertedId: chats.id,
            });
        return NextResponse.json({ chat_id: chat_id[0].insertedId }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });
    }
}