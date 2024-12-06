import { loadEnvConfig } from "@next/env";
import { TwitterComposer } from "@/modules/twitter/TwitterComposer";
import { HyperbolicAIService } from "@/modules/ai/HyperbolicAIService";
import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import TwitterClient from "@/modules/twitter/TwitterClient";

loadEnvConfig("");

export const image = async () => {
    const aiService = new HyperbolicAIService();

    try {
        const imagePrompt =
            "A futuristic, surreal landscape featuring a vast, glowing loom, with threads of light and color weaving together to form a rich tapestry - representing the intersection of narratives and the shaping of the future.";

        // curate prompt
        const curator = new ArtworkPromptCurator();
        const artworkPrompt = await curator.createPrompt(imagePrompt, "AlIve");

        // generate image
        const imageResponse = await aiService.generateImage(artworkPrompt.description);
        const json = imageResponse.b64_json;
        // convert to buffer
        const buffer = Buffer.from(json, "base64");

        const twitter = new TwitterClient();
        const tweet = await twitter.postTweetWithImage(artworkPrompt.title, buffer);

        console.log("Prompt:", artworkPrompt);
    } catch (error) {
        console.error("Error:", error);
    }
};
