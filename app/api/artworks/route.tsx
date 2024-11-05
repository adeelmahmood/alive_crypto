import { ArtworkDatastore } from "@/modules/artwork/ArtworkDatastore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const marketMood = searchParams.get("marketMood") || undefined;
        const searchQuery = searchParams.get("search") || undefined;

        const datastore = new ArtworkDatastore();
        const { artworks, total } = await datastore.getArtworks({
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
