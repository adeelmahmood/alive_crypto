import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useArtworks } from "../hooks/useArtworks";

const CommunityArtSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { artworks, loading } = useArtworks({ searchQuery: "", limit: 9 });

    useEffect(() => {
        const updateScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // Mobile screens are less than 768px
        };

        updateScreenSize();
        window.addEventListener("resize", updateScreenSize);
        return () => window.removeEventListener("resize", updateScreenSize);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoPlaying && artworks.length > 0) {
            const itemsPerView = isMobile ? 1 : 3;
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % (artworks.length - (itemsPerView - 1)));
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, artworks.length, isMobile]);

    const handlePrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        const itemsPerView = isMobile ? 1 : 3;
        setCurrentIndex((prev) => Math.min(artworks.length - itemsPerView, prev + 1));
    };

    if (loading || artworks.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-96">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-yellow-950/30 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    const itemsPerView = isMobile ? 1 : 3;

    return (
        <div className="relative w-full group">
            <Card className="overflow-hidden bg-transparent border-0">
                <div className="relative h-96">
                    <div
                        className={`absolute inset-0 grid ${
                            isMobile ? "grid-cols-1" : "grid-cols-3"
                        } gap-4 px-4`}
                    >
                        {artworks
                            .slice(currentIndex, currentIndex + itemsPerView)
                            .map((artwork) => (
                                <div
                                    key={artwork.id}
                                    className="relative h-full rounded-xl overflow-hidden group/card"
                                >
                                    <div className="w-full h-full bg-black/20">
                                        <img
                                            src={artwork.imageUrl}
                                            alt={artwork.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="text-lg font-bold mb-2 line-clamp-1">
                                                {artwork.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-white/20">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    {artwork.marketMood}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                )}

                {currentIndex < artworks.length - itemsPerView && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                )}

                {/* Progress Dots */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {Array.from({ length: Math.max(1, artworks.length - (itemsPerView - 1)) }).map(
                        (_, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex
                                        ? "bg-white w-4"
                                        : "bg-white/50 hover:bg-white/80"
                                }`}
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setCurrentIndex(index);
                                }}
                            />
                        )
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CommunityArtSlider;
