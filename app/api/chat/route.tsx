import { OpenAIService } from "@/modules/ai/OpenAIService";
import { generateChatPrompt, generateChatSystemPrompt } from "@/modules/prompts/chatPrompt";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Get conversation history from the request body
        const { conversationHistory } = await request.json();

        // Generate prompts
        const systemPrompt = generateChatSystemPrompt();
        const chatPrompt = generateChatPrompt(conversationHistory, "");

        console.log("System prompt:", systemPrompt);
        console.log("\n-----------------------------\n");
        console.log("Chat prompt:", chatPrompt);

        // Generate response
        const aiService = new OpenAIService();
        const response = await aiService.generateResponse(systemPrompt, chatPrompt);
        console.log("\n-----------------------------\n");

        console.log("Response:", response.response);

        return NextResponse.json({ response: response.response });
    } catch (error) {
        console.error("Error in invoking chat operation:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
