import { loadEnvConfig } from "@next/env";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";
import { MinimaxAIService } from "@/modules/ai/MinimaxAIService";

loadEnvConfig("");

export const viode = async () => {
    try {
        const videoService = new MinimaxAIService();

        await videoService.generateVideo("cat playing basketball");
    } catch (error) {
        console.error("Error:", error);
    }
};
