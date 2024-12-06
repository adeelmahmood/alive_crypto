import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Make sure the request is authorized
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        // Compose a new tweet and post it
        const composer = new TwitterComposer();
        const { record } = await composer.composeTweet();

        return NextResponse.json({ record });
    } catch (error) {
        console.error("Error in invoking post tweet operation:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
