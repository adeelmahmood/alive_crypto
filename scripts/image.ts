import { loadEnvConfig } from "@next/env";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";

loadEnvConfig("");

export const image = async () => {
    try {
        const generator = new AliveArtworkGenerator();

        await generator.generateArtwork();
    } catch (error) {
        console.error("Error:", error);
    }
};
