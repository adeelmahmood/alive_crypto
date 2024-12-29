import { Artwork, ArtworkCreate } from "@/types";
import { ArtworkDatastore } from "./ArtworkDatastore";
import { OpenAIService } from "../ai/OpenAIService";

export class ArtworkGenerator {
    private imageService: OpenAIService;
    private datastore: ArtworkDatastore;

    constructor() {
        this.imageService = new OpenAIService();
        this.datastore = new ArtworkDatastore();
    }

    public async generateAndStore(
        artwork: Artwork,
        creator?: string
    ): Promise<{ artwork: Artwork; image: string }> {
        // Generate image
        const imageResponse = await this.imageService.generateImage(artwork.description);

        // Prepare artwork data for storage
        const artworkCreate: ArtworkCreate = {
            ...artwork,
            description: imageResponse.revised_prompt || artwork.description,
            creator: creator || "AlIve",
            b64_json: imageResponse.b64_json,
        };

        // Store in database
        const savedArtwork = await this.datastore.saveArtwork(artworkCreate);

        return {
            artwork: savedArtwork,
            image: imageResponse.b64_json,
        };
    }
}
