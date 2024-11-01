import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateSystemPrompt } from "@/modules/prompts/systemPrompt";
import { generateTwitterPrompt } from "@/modules/prompts/twitterPrompt";

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Helper function to extract post content from Claude's response
function extractPostContent(response: string): {
    thoughts: string;
    experiences: string;
    future: string;
    content: string;
    actions: string;
} | null {
    try {
        // Extract content between XML tags using regex
        const matches = response.match(/<alive>([\s\S]*?)<\/alive>/);
        if (!matches) return null;

        const aliveContent = matches[1];

        // Extract each section
        const thoughts = aliveContent.match(/<thoughts>([\s\S]*?)<\/thoughts>/)?.[1].trim() || "";
        const experiences =
            aliveContent.match(/<experiences>([\s\S]*?)<\/experiences>/)?.[1].trim() || "";
        const future = aliveContent.match(/<future>([\s\S]*?)<\/future>/)?.[1].trim() || "";
        const content = aliveContent.match(/<content>([\s\S]*?)<\/content>/)?.[1].trim() || "";
        const actions = aliveContent.match(/<actions>([\s\S]*?)<\/actions>/)?.[1].trim() || "";

        return {
            thoughts,
            experiences,
            future,
            content,
            actions,
        };
    } catch (error) {
        console.error("Error extracting post content:", error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        // grab message history from body
        const body = await request.json();
        const { history } = body;

        // Load and process the prompt
        const systemPrompt = generateSystemPrompt();
        console.log("System Prompt:", systemPrompt);

        console.log("\n-------------------\n");
        // Additional context prompt to generate a new post
        const userPrompt = generateTwitterPrompt(history, {
            bitcoin: "BTC $60,000",
            ethereum: "ETH $4,000",
            solana: "SOL $200",
        });
        console.log("User Prompt:", userPrompt);

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

        // post to twitter
        // const twitterClient = new TwitterClient();
        // const tweet = await twitterClient.postTweet(postContent.content);

        // Return the structured response
        return NextResponse.json({
            success: true,
            data: postContent,
        });
    } catch (error) {
        console.error("Error generating post:", error);
        return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
    }
}
