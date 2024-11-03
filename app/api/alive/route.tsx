import { NextResponse } from "next/server";
import { TwitterComposer } from "@/modules/twitter/TwitterComposer";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const composer = new TwitterComposer();
        const postContent = await composer.composeTweet();
        console.log("New Tweet:: ", postContent.record.content);

        return NextResponse.json({
            success: true,
            data: postContent,
        });
    } catch (error) {
        console.error("Error generating post:", error);
        return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
    }
}
