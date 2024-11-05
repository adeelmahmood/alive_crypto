import { useState, useEffect } from "react";
import { Artwork } from "@/types";

interface UseArtworksProps {
    searchQuery?: string;
    marketMood?: string;
    limit?: number;
}

export function useArtworks({ searchQuery, marketMood, limit = 20 }: UseArtworksProps = {}) {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (searchQuery) params.set("search", searchQuery);
                if (marketMood) params.set("marketMood", marketMood);
                if (limit) params.set("limit", limit.toString());

                const response = await fetch(`/api/artworks?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch artworks");

                const data = await response.json();
                setArtworks(data.artworks);
                setTotal(data.total);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchArtworks();
    }, [searchQuery, marketMood, limit]);

    return { artworks, loading, error, total };
}
