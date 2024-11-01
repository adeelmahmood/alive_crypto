import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { TwitterApi } from "twitter-api-v2";
import fs from "fs";
import path from "path";

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Initialize Twitter client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// Helper function to load and process the prompt
function loadPrompt() {
    const promptPath = path.join(process.cwd(), "prompt.md");
    let prompt = fs.readFileSync(promptPath, "utf8");

    prompt = prompt.replace("${TOKEN_NAME}", "ALIVE");
    prompt = prompt.replace("${BTC_PRICE}", "");
    prompt = prompt.replace("${ETH_PRICE}", "");
    prompt = prompt.replace("${SOL_PRICE}", "");
    prompt = prompt.replace("[FUTURE_GOALS_PLACEHOLDER]", "");
    prompt = prompt.replace("[REAL_EVENTS_PLACEHOLDER]", "");
    prompt = prompt.replace("[DEVELOPER_INSTRUCTIONS_PLACEHOLDER]", "");

    return prompt;
}

// Helper function to extract post content from Claude's response
function extractPostContent(response: string): string | null {
    try {
        const matches = response.match(/<alive>([\s\S]*?)<\/alive>/);
        if (!matches) return null;

        const aliveContent = matches[1];
        const content = aliveContent.match(/<content>([\s\S]*?)<\/content>/)?.[1].trim() || "";

        // Ensure content is within Twitter's character limit (280)
        if (content.length > 280) {
            return content.substring(0, 277) + "...";
        }

        return content;
    } catch (error) {
        console.error("Error extracting post content:", error);
        return null;
    }
}

export async function POST() {
    try {
        // Load and process the prompt
        const systemPrompt = loadPrompt();

        // Additional context prompt to generate a new post
        const userPrompt =
            "Based on your personality and current context, generate a new post for the community. Make sure the content is under 280 characters and engaging for Twitter.";

        // Call Claude
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0.8,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });

        // Check if response is of type text
        if (response.content[0].type !== "text") {
            return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
        }

        // Extract the post content
        const postContent = extractPostContent(response.content[0].text);

        if (!postContent) {
            return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
        }

        try {
            // Post to Twitter
            const tweet = await twitterClient.v2.tweet(postContent);

            // Return success response with tweet data and content
            return NextResponse.json({
                success: true,
                data: {
                    content: postContent,
                    tweetId: tweet.data.id,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (twitterError) {
            console.error("Error posting to Twitter:", twitterError);
            return NextResponse.json(
                {
                    error: "Failed to post to Twitter",
                    details: twitterError instanceof Error ? twitterError.message : "Unknown error",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error generating post:", error);
        return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
    }
}
