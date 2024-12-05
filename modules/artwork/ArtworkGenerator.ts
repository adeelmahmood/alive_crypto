import { Artwork, ArtworkCreate } from "@/types";
import { ArtworkDatastore } from "./ArtworkDatastore";
import { HyperbolicAIService } from "../ai/HyperbolicAIService";

export class ArtworkGenerator {
    private imageService: HyperbolicAIService;
    private datastore: ArtworkDatastore;

    constructor() {
        this.imageService = new HyperbolicAIService();
        this.datastore = new ArtworkDatastore();
    }

    public async generateAndStore(artwork: Artwork, creator?: string): Promise<Artwork> {
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
        return await this.datastore.saveArtwork(artworkCreate);
    }
}
