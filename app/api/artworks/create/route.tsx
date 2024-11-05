import { NextRequest, NextResponse } from "next/server";
import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import { ArtworkGenerator } from "@/modules/artwork/ArtworkGenerator";

export async function POST(req: NextRequest) {
    try {
        const { prompt: userPrompt, creator } = await req.json();

        if (!userPrompt || typeof userPrompt !== "string") {
            return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
        }

        // Create curator and generator
        const curator = new ArtworkPromptCurator();
        const generator = new ArtworkGenerator();

        // Generate artwork prompt
        const artworkPrompt = await curator.createPrompt(userPrompt);
        console.log("Artwork prompt:", artworkPrompt);

        // Generate image and store artwork
        const finalArtwork = await generator.generateAndStore(artworkPrompt, creator);

        return NextResponse.json({ artwork: finalArtwork }, { status: 200 });
    } catch (error) {
        console.error("Error in art creation:", error);
        return NextResponse.json({ error: "Failed to process art creation" }, { status: 500 });
    }
}
