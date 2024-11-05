import { loadEnvConfig } from "@next/env";
import { TweetRecord, TweetResponse } from "@/types";
import { MemoryProcessor } from "@/modules/processing/memory/MemoryProcessor";

loadEnvConfig("");

export const memory = async () => {
    try {
        const tweet: TweetRecord = {
            id: 1,
            content: "🚀 Incredible milestone: 10,000 community members strong! Your belief...",
            thoughts:
                "Community growth validates our approach. Next steps: Announce presale details, Launch governance structure",
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
