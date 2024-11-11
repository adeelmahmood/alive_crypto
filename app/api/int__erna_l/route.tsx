import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const composer = new TwitterComposer();

        const { record } = await composer.composeTweet();

        return NextResponse.json({ record });
    } catch (error) {
        console.error("Error in invoking post operation:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
