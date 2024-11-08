import { generateServerFingerprint } from "@/app/utils";
import { ArtworkDatastore } from "@/modules/artwork/ArtworkDatastore";
import { VisitorTracker } from "@/modules/visitors/VisitorTracker";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "24");
        const offset = parseInt(searchParams.get("offset") || "0");
        const marketMood = searchParams.get("marketMood") || undefined;
        const searchQuery = searchParams.get("search") || undefined;

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
        const { artworks, total } = await datastore.getArtworks(visitorId, {
            limit,
            offset,
            marketMood,
            searchQuery,
        });

        return NextResponse.json({ artworks, total }, { status: 200 });
    } catch (error) {
        console.error("Error fetching artworks:", error);
        return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
    }
}
