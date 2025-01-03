import { inngest } from "./client";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";

export const postImageDarkTwitter = inngest.createFunction(
    { id: "post-image-dark-twitter", retries: 0 },
    // run every 2 hours
    { cron: "0 */2 * * *" },

    async ({ event, step }) => {
        const generator = new AliveArtworkGenerator();

        // generate and post dark artwork
        const tweet = await generator.generateDarkArtwork();
        return tweet;
    }
);
