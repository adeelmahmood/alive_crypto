import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import TwitterClient from "@/modules/twitter/TwitterClient";
import { inngest } from "./client";
import { HyperbolicAIService } from "@/modules/ai/HyperbolicAIService";
import { twitterImagePrompt, twitterImageSystemPrompt } from "@/modules/prompts/twitterImagePrompt";

export const postImageTwitter = inngest.createFunction(
    { id: "post-image-twitter" },
    { cron: "0 */4 * * *" }, // Run every 4 hours

    async ({ event, step }) => {
        // generate image prompt
        const aiService = new HyperbolicAIService();
        const imagePrompt = await aiService.generateResponse(
            twitterImageSystemPrompt(),
            twitterImagePrompt()
        );

        // curate prompt
        const curator = new ArtworkPromptCurator();
        const artworkPrompt = await curator.createPrompt(imagePrompt.response, "AlIve");

        // generate image
        const imageResponse = await aiService.generateImage(artworkPrompt.description);
        const json = imageResponse.b64_json;
        // convert to buffer
        const buffer = Buffer.from(json, "base64");

        const twitter = new TwitterClient();
        const tweet = await twitter.postTweetWithImage(artworkPrompt.title, buffer);

        return tweet;
    }
);
