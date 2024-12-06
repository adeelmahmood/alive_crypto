import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { inngest } from "./client";

export const postTwitter = inngest.createFunction(
    { id: "post-twitter", retries: 1 },
    { cron: "0 */3 * * *" }, // Run every 3 hours

    async ({ event, step }) => {
        // Compose a new tweet and post it
        const composer = new TwitterComposer({
            historySize: 3,
        });

        const { record } = await composer.composeTweet();
        return record;
    }
);
