import { useToast } from "@/hooks/use-toast";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import React, { createContext, useContext, useState, useCallback } from "react";

interface LikesContextType {
    likedArtworkIds: Set<number>;
    toggleLike: (artworkId: number) => Promise<void>;
    initializeLikes: (likedIds: number[]) => void;
}

const LikesContext = createContext<LikesContextType | null>(null);

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [likedArtworkIds, setLikedArtworkIds] = useState<Set<number>>(new Set());
    const { toast } = useToast();

    const initializeLikes = useCallback((likedIds: number[]) => {
        setLikedArtworkIds(new Set(likedIds));
    }, []);

    const toggleLike = useCallback(
        async (artworkId: number) => {
            try {
                const fp = await FingerprintJS.load();
                const { visitorId } = await fp.get();

                // Optimistic update
                setLikedArtworkIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(artworkId)) {
                        next.delete(artworkId);
                    } else {
                        next.add(artworkId);
                    }
                    return next;
                });

                const response = await fetch("/api/artworks/likes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Fingerprint": visitorId,
                    },
                    body: JSON.stringify({ artworkId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to toggle like");
                }
            } catch (error) {
                console.error("Failed to toggle like:", error);
                // Revert optimistic update on error
                setLikedArtworkIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(artworkId)) {
                        next.delete(artworkId);
                    } else {
                        next.add(artworkId);
                    }
                    return next;
                });

                toast({
                    title: "Error",
                    description: "Failed to update like status",
                    variant: "destructive",
                });
            }
        },
        [toast]
    );

    return (
        <LikesContext.Provider value={{ likedArtworkIds, toggleLike, initializeLikes }}>
            {children}
        </LikesContext.Provider>
    );
};

export const useLikes = () => {
    const context = useContext(LikesContext);
    if (!context) {
        throw new Error("useLikes must be used within a LikesProvider");
    }
    return context;
};
