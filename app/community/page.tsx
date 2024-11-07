"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, TrendingUp, Heart, Share2, Clock, Home } from "lucide-react";
import ImageCreatorModal from "../components/ImageCreatorModal";

import AliveBackgroundVibrant from "../components/AliveBackgroundVibrant";
import { useArtworks } from "../hooks/useArtworks";
import { useRouter } from "next/navigation";

interface ArtworkType {
    imageUrl: string;
    title: string;
    creator: string;
    timestamp: string;
    likes: number;
    marketMood: string;
    tags: string[];
    description: string;
}

const CommunityArtPage = () => {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [imageCreatorOpen, setImageCreatorOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<ArtworkType | null>(null);

    // Use the custom hook to fetch artworks
    const { artworks, loading, error, fetchArtworks } = useArtworks({
        searchQuery,
        marketMood:
            selectedFilter === "bullish"
                ? "Bullish"
                : selectedFilter === "bearish"
                ? "Bearish"
                : undefined,
    });

    const filterOptions = [
        { id: "all", label: "All Art" },
        { id: "trending", label: "Trending" },
        { id: "recent", label: "Recent" },
        { id: "bullish", label: "Bullish Mood" },
        { id: "bearish", label: "Bearish Mood" },
    ];

    const filteredArtworks = artworks.filter((artwork) => {
        switch (selectedFilter) {
            case "trending":
                return (artwork.likes || 0) > 100;
            case "recent":
                return (
                    artwork.timestamp &&
                    new Date(artwork.timestamp) > new Date(Date.now() - 86400000)
                );
            default:
                return true;
        }
    });

    return (
        <div className="min-h-screen relative">
            <AliveBackgroundVibrant />

            {/* Floating Home Icon */}
            <motion.div
                className="fixed bottom-8 right-8 z-50 cursor-pointer p-3 bg-blue-600 rounded-full shadow-lg"
                whileHover={{ scale: 1.1, rotate: 20 }}
                onClick={() => router.push("/")}
                title="Return to Home"
            >
                <Home className="h-6 w-6 text-white" />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-0" />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-0" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        Community Art
                        <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Where creativity meets market sentiment. Every piece tells a story of our
                        community&apos;s journey.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up opacity-0 animation-delay-600 px-4 sm:px-0">
                        <Button
                            onClick={() => setImageCreatorOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                            size="lg"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Create New Art
                        </Button>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                            type="text"
                            placeholder="Search artworks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {filterOptions.map((option) => (
                            <Button
                                key={option.id}
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFilter(option.id)}
                                className={
                                    selectedFilter === option.id
                                        ? "bg-white/20 text-white border-white/40"
                                        : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10"
                                }
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="bg-red-500/20 text-white p-4 rounded-lg mb-8">{error}</div>
                )}

                {/* Gallery Grid with Loading State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {loading
                            ? // Loading skeleton
                              Array.from({ length: 8 }).map((_, index) => (
                                  <motion.div
                                      key={`skeleton-${index}`}
                                      className="aspect-square rounded-xl bg-white/10 animate-pulse"
                                  />
                              ))
                            : filteredArtworks.map((artwork, index) => (
                                  <motion.div
                                      key={artwork.id}
                                      layout
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      transition={{ duration: 0.3 }}
                                      className="group relative"
                                  >
                                      <div
                                          onClick={() => setSelectedArtwork(artwork)}
                                          className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                                      >
                                          <Image
                                              src={artwork.imageUrl || "/placeholder.png"} // Add a fallback image
                                              alt={artwork.title}
                                              fill
                                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                              priority={index < 4} // Only prioritize first 4 images
                                              loading={index < 4 ? "eager" : "lazy"} // Lazy load images below the fold
                                              onError={(e) => {
                                                  const img = e.target as HTMLImageElement;
                                                  img.src = "/placeholder.png"; // Fallback on error
                                              }}
                                          />

                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 " />

                                          {/* Overlay Content */}
                                          <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                              <h3 className="text-white font-semibold text-lg mb-2">
                                                  {artwork.title}
                                              </h3>
                                              <div className="flex items-center gap-2 text-white/80 text-sm">
                                                  <Clock className="h-4 w-4" />
                                                  {new Date(artwork.timestamp).toLocaleDateString()}
                                              </div>
                                              <div className="flex items-center gap-2 mt-2">
                                                  <Badge className="bg-white/20 text-white">
                                                      <TrendingUp className="h-3 w-3 mr-1" />
                                                      {artwork.marketMood}
                                                  </Badge>
                                                  <Badge className="bg-pink-500/20 text-pink-200">
                                                      <Heart className="h-3 w-3 mr-1" />
                                                      {artwork.likes}
                                                  </Badge>
                                              </div>
                                          </div>
                                      </div>
                                  </motion.div>
                              ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Image Creator Modal */}
            <ImageCreatorModal
                open={imageCreatorOpen}
                onOpenChange={setImageCreatorOpen}
                onArtworkCreated={() => fetchArtworks()}
            />

            {/* Artwork Detail Modal */}
            <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
                <DialogContent className="w-full max-w-3xl mx-auto bg-gradient-to-b from-purple-950/90 via-pink-950/90 to-orange-950/90 text-white backdrop-blur-sm max-h-[90vh] overflow-y-auto">
                    {selectedArtwork && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center">
                                    {selectedArtwork.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="mt-4 flex flex-col items-center">
                                {/* Responsive container for image */}
                                <div
                                    className="relative w-full rounded-xl overflow-hidden mb-4"
                                    style={{ height: "50vh" }} // Adjusted for smaller screens
                                >
                                    <Image
                                        src={selectedArtwork.imageUrl}
                                        alt={selectedArtwork.title}
                                        className="object-contain" // Use object-cover for full containment
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                                        priority
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-4 w-full">
                                    <div className="flex items-center gap-4">
                                        <Badge className="bg-white/20 text-white">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {selectedArtwork.marketMood}
                                        </Badge>
                                        <span className="text-white/60 text-sm">
                                            Created by {selectedArtwork.creator}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="ghost" className="text-pink-200">
                                            <Heart className="h-4 w-4 mr-1" />
                                            {selectedArtwork.likes}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-white/80">
                                            <Share2 className="h-4 w-4 mr-1" />
                                            Share
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedArtwork.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            className="bg-white/10 text-white/80 hover:bg-white/20 cursor-pointer"
                                            onClick={() => setSearchQuery(tag)}
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommunityArtPage;
