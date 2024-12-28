import { inngest } from "./client";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";

export const postImageTwitter = inngest.createFunction(
    { id: "post-image-twitter", retries: 0 },
    // run every hour
    { cron: "0 * * * *" },

    async ({ event, step }) => {
        const generator = new AliveArtworkGenerator();

        // generate and post artwork
        const tweet = await generator.generateArtwork();
        return tweet;
    }
);
