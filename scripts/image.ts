import { loadEnvConfig } from "@next/env";
import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { HyperbolicAIService } from "@/modules/ai/HyperbolicAIService";
import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import TwitterClient from "@/modules/twitter/TwitterClient";
import { twitterImageSystemPrompt, twitterImagePrompt } from "@/modules/prompts/twitterImagePrompt";

loadEnvConfig("");

export const image = async () => {
    const aiService = new HyperbolicAIService();

    try {
        const aiService = new HyperbolicAIService();
        const imagePrompt = await aiService.generateResponse(
            twitterImageSystemPrompt(),
            twitterImagePrompt()
        );

        // curate prompt
        const curator = new ArtworkPromptCurator();
        const artworkPrompt = await curator.createPrompt(imagePrompt.response, "AlIve");

        console.log("Prompt:", artworkPrompt);

        // generate image
        // const imageResponse = await aiService.generateImage(artworkPrompt.description);
        // const json = imageResponse.b64_json;
        // // convert to buffer
        // const buffer = Buffer.from(json, "base64");

        // const twitter = new TwitterClient();
        // const tweet = await twitter.postTweetWithImage(artworkPrompt.title, buffer);

        // console.log("Prompt:", artworkPrompt);
    } catch (error) {
        console.error("Error:", error);
    }
};
