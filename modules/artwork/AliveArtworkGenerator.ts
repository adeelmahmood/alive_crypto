import { HyperbolicAIService } from "../ai/HyperbolicAIService";
import { twitterImageSystemPrompt, twitterImagePrompt } from "../prompts/twitterImagePrompt";
import TwitterApiClient from "../twitter/TwitterApiClient";
import { ArtworkDatastore } from "./ArtworkDatastore";
import { ArtworkGenerator } from "./ArtworkGenerator";
import { ArtworkPromptCurator } from "./ArtworkPromptCurator";

export class AliveArtworkGenerator {
    private datastore: ArtworkDatastore;
    private aiService: HyperbolicAIService;
    private curator: ArtworkPromptCurator;
    private gen: ArtworkGenerator;
    private twitter: TwitterApiClient;

    constructor() {
        this.datastore = new ArtworkDatastore();
        this.aiService = new HyperbolicAIService();

        this.curator = new ArtworkPromptCurator();
        this.gen = new ArtworkGenerator();

        this.twitter = new TwitterApiClient();
    }

    async generateArtwork() {
        // retrieve recent artworks generated by the system
        const recentArtworks = await this.datastore.getAliveArtworks();
        const recentPrompts = recentArtworks.map((artwork) => artwork.description);

        // generate image prompt
        const imagePrompt = await this.aiService.generateResponse(
            twitterImageSystemPrompt(),
            twitterImagePrompt(recentPrompts)
        );

        // curate prompt
        const artworkPrompt = await this.curator.createPrompt(imagePrompt.response, "AlIve");

        // save artwork
        const { artwork, image } = await this.gen.generateAndStore(artworkPrompt);
        // convert to buffer
        const buffer = Buffer.from(image, "base64");

        // post to twitter
        const tweet = await this.twitter.postTweetWithImage(artworkPrompt.title, buffer);
        return tweet;
    }
}
