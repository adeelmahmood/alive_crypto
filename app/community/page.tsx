"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Search,
    TrendingUp,
    Filter,
    Heart,
    Share2,
    Clock,
    Zap,
    SlidersHorizontal,
    X,
} from "lucide-react";
import AliveBackground from "../components/AliveBackground";
import ImageCreatorModal from "../components/ImageCreatorModal";

import sample1 from "@/app/images/art/art-sample1.png";
import sample2 from "@/app/images/art/art-sample2.png";
import sample3 from "@/app/images/art/art-sample3.png";

const CommunityArtPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [imageCreatorOpen, setImageCreatorOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    // Example artwork data structure
    const [artworks, setArtworks] = useState([
        {
            id: 1,
            imageUrl: sample2.src,
            title: "The Great Meme Ascension",
            creator: "AliveAI",
            timestamp: "2024-03-15T10:00:00Z",
            likes: 156,
            marketMood: "Bullish",
            tags: ["memecoins", "AI", "space", "surreal", "dogecoin"],
            description:
                "Created during bullish market sentiment. This piece explores the intersection of artificial intelligence, cryptocurrency markets, and community-driven innovation.",
        },
        {
            id: 2,
            imageUrl: sample1.src,
            title: "Binary Bears to Digital Bulls",
            creator: "AliveAI",
            timestamp: "2024-03-15T11:30:00Z",
            likes: 189,
            marketMood: "Transition",
            tags: ["market", "transformation", "cyberpunk", "binary", "bull-bear"],
            description:
                "Created during market transition sentiment. This piece explores the intersection of artificial intelligence, cryptocurrency markets, and community-driven innovation.",
        },
        {
            id: 3,
            imageUrl: sample3.src,
            title: "The AI Oracle's Vision",
            creator: "AliveAI",
            timestamp: "2024-03-15T12:45:00Z",
            likes: 223,
            marketMood: "Prophetic",
            tags: ["oracle", "future", "AI", "mystical", "predictions"],
            description:
                "Created during prophetic market sentiment. This piece explores the intersection of artificial intelligence, cryptocurrency markets, and community-driven innovation.",
        },
    ]);

    // copy artworks multiple times
    useEffect(() => {
        setArtworks([...artworks, ...artworks, ...artworks, ...artworks]);
    }, []);

    const filterOptions = [
        { id: "all", label: "All Art" },
        { id: "trending", label: "Trending" },
        { id: "recent", label: "Recent" },
        { id: "bullish", label: "Bullish Mood" },
        { id: "bearish", label: "Bearish Mood" },
    ];

    const filteredArtworks = artworks.filter((artwork) => {
        if (searchQuery) {
            return (
                artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                artwork.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        switch (selectedFilter) {
            case "trending":
                return artwork.likes > 100;
            case "recent":
                return new Date(artwork.timestamp) > new Date(Date.now() - 86400000);
            case "bullish":
                return artwork.marketMood === "Bullish";
            case "bearish":
                return artwork.marketMood === "Bearish";
            default:
                return true;
        }
    });

    return (
        <div className="min-h-screen relative">
            <AliveBackground />

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
                        community's journey.
                    </p>

                    <Button
                        onClick={() => setImageCreatorOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                        size="lg"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Create New Art
                    </Button>
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

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredArtworks.map((artwork) => (
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
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        priority
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
            <ImageCreatorModal open={imageCreatorOpen} onOpenChange={setImageCreatorOpen} />

            {/* Artwork Detail Modal */}
            <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
                <DialogContent className="max-w-4xl mx-4 bg-gradient-to-b from-purple-950/90 via-pink-950/90 to-orange-950/90 text-white backdrop-blur-sm">
                    {selectedArtwork && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                                    {selectedArtwork.title}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedArtwork(null)}
                                        className="text-white/60 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="mt-4">
                                <div className="aspect-square rounded-xl overflow-hidden mb-4">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={selectedArtwork.imageUrl}
                                            alt={selectedArtwork.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 90vw, 1024px"
                                            priority
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
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
