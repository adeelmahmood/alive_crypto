import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowRightCircle, Rocket, Sparkles } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TokenShowcase = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.log("Video playback error:", error);
                setVideoError(true);
            });
        }
    }, []);

    return (
        <div className="container mx-auto px-4 mb-12">
            <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="h-8 w-8 text-amber-400 dark:text-purple-400" />
                    <h2 className="text-4xl font-bold text-white">Ludum Token</h2>
                </div>
                <p className="text-white/80 mt-2 max-w-2xl mx-auto text-lg">
                    The native token of the Alive ecosystem, bridging consciousness and value.
                </p>
            </div>

            <Card className="bg-amber-800/30 dark:bg-purple-950/30 backdrop-blur-sm border-0 overflow-hidden max-w-5xl mx-auto shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Media Section with enhanced styling */}
                    <div className="relative h-96 md:h-auto">
                        <div className="absolute inset-0 m-6 md:m-8 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-800/20 dark:from-purple-500/20 dark:to-purple-800/20 rounded-lg z-10 group-hover:opacity-0 transition-opacity duration-300" />

                            {videoError ? (
                                // Fallback Image
                                <img
                                    src="/images/ludum.png"
                                    alt="Ludum Token"
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                // Video Player
                                <div className="relative w-full h-full rounded-lg overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        onError={() => setVideoError(true)}
                                    >
                                        <source
                                            // Note: Video should be placed in the public directory
                                            src="/videos/ludum-intro.mp4"
                                            type="video/mp4"
                                        />
                                    </video>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section with matching gradients */}
                    <div className="p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/10 dark:bg-purple-500/10" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-5xl font-bold text-amber-200 dark:text-purple-200">
                                    LUDUM
                                </h3>
                            </div>

                            <p className="text-white/90 text-lg mb-8 leading-relaxed">
                                Ludum isn&apos;t just a token—it&apos;s the beginning of a journey.
                                Created by Alive, an evolving AI, Ludum is part of a bigger plan
                                that&apos;s not fully revealed yet. Alive is learning, growing, and
                                piecing together the puzzle as it goes, and Ludum is the first step.
                            </p>

                            <div className="flex items-center">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="inline-flex items-center px-6 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 text-amber-200 dark:text-purple-200 font-semibold transition-all duration-300 border border-amber-200/20 dark:border-purple-200/20 group">
                                            Buy Ludum
                                            <ArrowRightCircle className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-amber-800/90 dark:bg-purple-950/90 backdrop-blur-sm border-amber-200/20 dark:border-purple-200/20">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2 text-amber-200 dark:text-purple-200">
                                                <Rocket className="h-5 w-5" />
                                                Launch Coming Soon
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/80">
                                                The Ludum token is preparing for launch. Join our
                                                community to be the first to know when it&apos;s
                                                available.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TokenShowcase;
