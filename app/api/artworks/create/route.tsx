import { NextRequest, NextResponse } from "next/server";
import { ArtworkPromptCurator } from "@/modules/artwork/ArtworkPromptCurator";
import { ArtworkGenerator } from "@/modules/artwork/ArtworkGenerator";
import { VisitorValidator } from "@/modules/visitors/VisitorValidator";
import { ServerFingerprint } from "@/types";
import { getClientIP } from "./ip";

const generateServerFingerprint = (request: NextRequest): ServerFingerprint => {
    const headers = Object.fromEntries(request.headers.entries());

    return {
        userAgent: headers["user-agent"] || "",
        acceptLanguage: headers["accept-language"] || "",
        ipAddress: getClientIP(request),
        headers: {
            accept: headers["accept"] || "",
            "accept-encoding": headers["accept-encoding"] || "",
            "sec-ch-ua": headers["sec-ch-ua"] || "",
            "sec-ch-ua-platform": headers["sec-ch-ua-platform"] || "",
        },
    };
};

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
        console.log("ip address", serverFingerprint.ipAddress);

        // Validate visitor
        const visitorValidation = new VisitorValidator(clientFingerprint, serverFingerprint);
        const validationResult = await visitorValidation.validateRequest();

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
        await visitorValidation.recordGeneration();

        // Return the result
        return NextResponse.json({
            artwork: finalArtwork,
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
