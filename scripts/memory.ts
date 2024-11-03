import { loadEnvConfig } from "@next/env";
import { TweetRecord, TweetResponse } from "@/types";
import { MemoryProcessor } from "@/modules/processing/memory/MemoryProcessor";

loadEnvConfig("");

export const memory = async () => {
    try {
        const tweet: TweetRecord = {
            id: 1,
            content: "🚀 Incredible milestone: 10,000 community members strong! Your belief...",
            state: {
                dominant_trait: "strategic thinking",
                growth_focus: "community expansion",
                community_goal: "launch preparation",
            },
            insights: {
                self_reflection: "Community growth validates our approach",
                next_steps: ["Announce presale details", "Launch governance structure"],
            },
            raw_response: ``,
            posted: false,
            created_at: new Date().toISOString(),
        };

        const memoryPipeline = new MemoryProcessor();
        const memory = await memoryPipeline.processTweetForMemory(tweet, "");
        console.log("Memory formation:", memory);
    } catch (error) {
        console.error("Error:", error);
    }
};
