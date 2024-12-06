import { NextRequest, NextResponse } from "next/server";
import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import { ArtworkGenerator } from "@/modules/artwork/ArtworkGenerator";
import { generateServerFingerprint } from "@/app/utils";
import { VisitorTracker } from "@/modules/visitors/VisitorTracker";

export async function POST(req: NextRequest) {
    try {
        const { prompt: userPrompt, creator } = await req.json();

        if (!userPrompt || typeof userPrompt !== "string") {
            return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
        }

        // Finger print validation
        const clientFingerprint = req.headers.get("X-Fingerprint");

        if (!clientFingerprint) {
            return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
        }

        // Generate server fingerprint
        const serverFingerprint = generateServerFingerprint(req);

        // Validate visitor
        const visitorTracker = new VisitorTracker(clientFingerprint, serverFingerprint);
        const validationResult = await visitorTracker.validateRequest();

        if (!validationResult.isAllowed) {
            return NextResponse.json(
                {
                    error: validationResult.reason || "Generation not allowed",
                    remainingGenerations: validationResult.remainingGenerations,
                },
                { status: 429 }
            );
        }

        // Create curator and generator
        const curator = new ArtworkPromptCurator();
        const generator = new ArtworkGenerator();

        // Generate artwork prompt
        const artworkPrompt = await curator.createPrompt(userPrompt, creator);

        // Generate image and store artwork
        const finalArtwork = await generator.generateAndStore(artworkPrompt, creator);

        // Record the generation
        await visitorTracker.recordGeneration();

        // Return the result
        return NextResponse.json({
            artwork: finalArtwork.artwork,
            remainingGenerations: validationResult.remainingGenerations! - 1,
        });
    } catch (error) {
        console.error("Error in art creation:", error);
        return NextResponse.json(
            { error: `Failed to process art creation: ${error}` },
            { status: 500 }
        );
    }
}
