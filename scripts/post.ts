import { loadEnvConfig } from "@next/env";
import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { AliveArtworkGenerator } from "@/modules/artwork/AliveArtworkGenerator";

loadEnvConfig("");

export const post = async () => {
    const composer = new TwitterComposer({
        historySize: 3,
    });

    const result = await composer.composeTweet(true);

    // const generator = new AliveArtworkGenerator();

    // // generate and post artwork
    // const tweet = await generator.generateArtwork();
    // return tweet;
};
