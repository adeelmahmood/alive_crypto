import { Artwork, ArtworkCreate } from "@/types";
import { OpenAIService } from "../ai/OpenAIService";
import { ArtworkDatastore } from "./ArtworkDatastore";

export class ArtworkGenerator {
    private imageService: OpenAIService;
    private datastore: ArtworkDatastore;

    constructor() {
        this.imageService = new OpenAIService();
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
