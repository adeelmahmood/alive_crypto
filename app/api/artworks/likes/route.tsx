import { generateServerFingerprint } from "@/app/utils";
import { ArtworkDatastore } from "@/modules/artwork/ArtworkDatastore";
import { VisitorTracker } from "@/modules/visitors/VisitorTracker";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { artworkId } = await request.json();

        if (!artworkId) {
            return NextResponse.json({ error: "Artwork ID is required" }, { status: 400 });
        }

        const clientFingerprint = request.headers.get("X-Fingerprint");

        if (!clientFingerprint) {
            return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
        }

        // Generate server fingerprint
        const serverFingerprint = generateServerFingerprint(request);

        // Track visitor
        const visitorTracker = new VisitorTracker(clientFingerprint, serverFingerprint);
        const visitorId = await visitorTracker.ensureVisitor();

        const datastore = new ArtworkDatastore();

        // Perform the like toggle operation
        const newLikesCount = await datastore.toggleLike(artworkId, visitorId);

        return NextResponse.json({
            likes: newLikesCount,
        });
    } catch (error) {
        console.error("Error processing like:", error);
        return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log("Checking like status for visitor:", request.headers.get("X-Fingerprint"));
        const { searchParams } = new URL(request.url);
        const clientFingerprint = searchParams.get("visitorId");

        if (!clientFingerprint) {
            return NextResponse.json({ error: "Missing visitor ID" }, { status: 400 });
        }

        // Generate server fingerprint
        const serverFingerprint = generateServerFingerprint(request);

        // Track visitor
        const visitorTracker = new VisitorTracker(clientFingerprint, serverFingerprint);
        const visitorId = await visitorTracker.ensureVisitor();

        const datastore = new ArtworkDatastore();
        const likedArtworkIds = await datastore.getVisitorLikedArtworkIds(visitorId);
        console.log("Liked artwork IDs:", likedArtworkIds);

        return NextResponse.json({ likedArtworkIds });
    } catch (error) {
        console.error("Error checking like status:", error);
        return NextResponse.json({ error: "Failed to check like status" }, { status: 500 });
    }
}
