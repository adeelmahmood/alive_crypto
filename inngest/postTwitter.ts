import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { inngest } from "./client";

export const postTwitter = inngest.createFunction(
    { id: "post-twitter", retries: 0 },
    // run every 2 hours
    { cron: "0 */2 * * *" },

    async ({ event, step }) => {
        // Compose a new tweet and post it
        const composer = new TwitterComposer({
            historySize: 5,
        });

        const { record } = await composer.composeTweet();
        return record;
    }
);
