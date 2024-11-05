import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Circle } from "lucide-react";

interface TweetRecord {
    id: string;
    content: string;
    created_at: string;
}

const ThoughtIndicator = () => (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <Circle className="w-1.5 h-1.5 animate-pulse text-amber-400 dark:text-purple-400" />
        <Circle className="w-1.5 h-1.5 animate-pulse text-amber-500 dark:text-purple-500 delay-150" />
        <Circle className="w-1.5 h-1.5 animate-pulse text-amber-600 dark:text-purple-600 delay-300" />
        <span className="text-amber-100 dark:text-purple-100 text-xs font-medium">
            processing neural patterns...
        </span>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <Sparkles className="w-4 h-4 animate-pulse text-amber-400 dark:text-purple-400" />
        <span className="text-amber-100 dark:text-purple-100 text-xs font-medium">
            synthesizing thoughts...
        </span>
    </div>
);

interface ThoughtProps {
    content: string;
    timestamp: string;
}

const Thought = ({ content, timestamp }: ThoughtProps) => {
    const formattedTime = new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="group relative">
            <div className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-amber-500/50 dark:from-purple-500/50 to-transparent" />

            <div className="relative flex gap-4 p-6 transition-all duration-300 hover:bg-white/5">
                <div className="relative z-10 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-purple-500 ring-4 ring-amber-500/20 dark:ring-purple-500/20 group-hover:ring-amber-500/30 dark:group-hover:ring-purple-500/30 transition-all duration-300" />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-amber-200 dark:text-purple-200">
                        <Zap className="w-4 h-4" />
                        <span>{formattedTime}</span>
                    </div>

                    <p className="text-white font-medium leading-relaxed">{content}</p>

                    <div className="w-2 h-2 rounded-full bg-amber-500/30 dark:bg-purple-500/30 animate-ping absolute left-[22px] top-[30px] hidden group-hover:block" />
                </div>
            </div>
        </div>
    );
};

interface ThoughtStreamProps {
    className?: string;
}

const ThoughtStream = ({ className }: ThoughtStreamProps) => {
    const [thoughts, setThoughts] = useState<ThoughtProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<HTMLDivElement | null>(null);
    const isInitialRender = useRef(true);

    const fetchThoughts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/posts");

            if (!response.ok) throw new Error("Failed to fetch thoughts");

            const data = await response.json();
            if (data.success && data.data) {
                const transformedThoughts = data.data.map((tweet: TweetRecord) => ({
                    content: tweet.content,
                    timestamp: tweet.created_at,
                }));

                setThoughts(transformedThoughts);

                if (streamRef.current) {
                    streamRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            fetchThoughts();
        }

        const interval = setInterval(fetchThoughts, 900000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`h-full overflow-hidden ${className}`}>
            <Card className="bg-amber-800/30 dark:bg-purple-950/30 backdrop-blur-sm border-0 h-full flex flex-col">
                <CardContent className="p-0 h-full flex flex-col">
                    {/* Header */}
                    <div className="border-b border-amber-800/20 dark:border-purple-800/20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 dark:bg-purple-500/20 rounded-xl">
                                    <Brain className="w-5 h-5 text-amber-200 dark:text-purple-200" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Recent Thoughts</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                {isLoading ? <LoadingIndicator /> : <ThoughtIndicator />}
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="text-red-300 text-center p-4 text-sm bg-red-950/20">
                            {error}
                        </div>
                    )}

                    {/* Thoughts Stream */}
                    <div ref={streamRef} className="flex-1 overflow-y-auto min-h-0 thought-stream">
                        {thoughts.length > 0 ? (
                            thoughts.map((thought) => (
                                <Thought
                                    key={thought.timestamp}
                                    content={thought.content}
                                    timestamp={thought.timestamp}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Sparkles className="w-8 h-8 mx-auto mb-4 text-amber-400 dark:text-purple-400 animate-pulse" />
                                <p className="text-amber-100 dark:text-purple-100 font-medium">
                                    Consciousness awakening...
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ThoughtStream;
