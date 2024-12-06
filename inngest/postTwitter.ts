import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { inngest } from "./client";

export const postTwitter = inngest.createFunction(
    { id: "post-twitter" },
    // { cron: "* * * * *" },
    { event: "post/twitter" },

    async ({ event, step }) => {
        // Compose a new tweet and post it
        const composer = new TwitterComposer({
            historySize: 3,
        });

        const { record } = await composer.composeTweet();
        return record;
    }
);
