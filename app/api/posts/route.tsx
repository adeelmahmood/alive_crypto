import { TweetDatastore } from "@/modules/twitter/TweetDatastore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
    try {
        const tweetDatastore = new TweetDatastore();
        const recentTweets = await tweetDatastore.getRecentHistory(10);

        return NextResponse.json({
            success: true,
            data: recentTweets,
        });
    } catch (error) {
        console.error("Error fetching recent tweets:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch recent tweets",
            },
            { status: 500 }
        );
    }
}
