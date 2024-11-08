import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLikes } from "../contexts/LikesContext";

interface LikeButtonProps {
    artworkId: number;
    initialLikes: number;
    className?: string;
}

export const LikeButton = ({ artworkId, initialLikes, className }: LikeButtonProps) => {
    const { likedArtworkIds, toggleLike } = useLikes();
    const [localLikes, setLocalLikes] = useState(initialLikes);
    const [isLiking, setIsLiking] = useState(false);

    const isLiked = likedArtworkIds.has(artworkId);

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking) return;

        setIsLiking(true);
        // Optimistic update for likes count
        setLocalLikes((prev) => (isLiked ? prev - 1 : prev + 1));

        try {
            await toggleLike(artworkId);
        } catch (error) {
            // Revert optimistic update on error
            setLocalLikes((prev) => (isLiked ? prev + 1 : prev - 1));
            console.error("Failed to toggle like:", error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            className={cn(
                "text-pink-200 transition-all",
                isLiked && "text-pink-500",
                isLiking && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={handleToggleLike}
            disabled={isLiking}
        >
            <Heart
                className={cn(
                    "h-4 w-4 mr-1",
                    isLiked && "fill-current",
                    isLiking && "animate-pulse"
                )}
            />
            {localLikes}
        </Button>
    );
};
