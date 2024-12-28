import { inngest } from "./client";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";

export const postImageTwitter = inngest.createFunction(
    { id: "post-image-twitter", retries: 0 },
    { cron: "0 */2 * * *" }, // Run every 6 hours

    async ({ event, step }) => {
        const generator = new AliveArtworkGenerator();

        // generate and post artwork
        const tweet = await generator.generateArtwork();
        return tweet;
    }
);
