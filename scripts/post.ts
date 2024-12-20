import { loadEnvConfig } from "@next/env";
import { TwitterComposer } from "@/modules/twitter/TwitterComposer";

loadEnvConfig("");

export const post = async () => {
    const composer = new TwitterComposer();

    try {
        const composer = new TwitterComposer({
            historySize: 3,
        });

        // compose 5 tweets
        // for (let i = 0; i < 3; i++) {
        const result = await composer.composeTweet(true);
        console.log(result);
        // separator
        console.log("\n-------------------\n");
        // }
    } catch (error) {
        console.error("Error:", error);
    }
};
