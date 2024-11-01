import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Circle } from "lucide-react";

const ThoughtIndicator = () => (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <Circle className="w-1.5 h-1.5 animate-pulse text-purple-400" />
        <Circle className="w-1.5 h-1.5 animate-pulse text-purple-500 delay-150" />
        <Circle className="w-1.5 h-1.5 animate-pulse text-purple-600 delay-300" />
        <span className="text-purple-100 text-xs font-medium">processing neural patterns...</span>
    </div>
);

const LoadingIndicator = () => (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
        <span className="text-purple-100 text-xs font-medium">synthesizing thoughts...</span>
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
            {/* Connection Line */}
            <div className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />

            <div className="relative flex gap-4 p-6 transition-all duration-300 hover:bg-white/5">
                {/* Thought Node */}
                <div className="relative z-10 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20 group-hover:ring-purple-500/30 transition-all duration-300" />
                </div>

                {/* Thought Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-purple-200">
                        <Zap className="w-4 h-4" />
                        <span>{formattedTime}</span>
                    </div>

                    <p className="text-white font-medium leading-relaxed">{content}</p>

                    {/* Interaction Ripple Effect */}
                    <div className="w-2 h-2 rounded-full bg-purple-500/30 animate-ping absolute left-[22px] top-[30px] hidden group-hover:block" />
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
    const thoughtsRef = useRef<ThoughtProps[]>([]);

    useEffect(() => {
        thoughtsRef.current = thoughts;
    }, [thoughts]);

    const fetchNewThought = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/alive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: thoughtsRef.current.slice(0, 100),
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch thought");

            const data = await response.json();
            if (data.success && data.data) {
                setThoughts((prev) => [
                    {
                        content: data.data.content,
                        timestamp: new Date().toISOString(),
                    },
                    ...prev,
                ]);

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

    // useEffect(() => {
    //     // Only fetch on initial render
    //     if (isInitialRender.current) {
    //         isInitialRender.current = false;
    //         fetchNewThought();
    //     }

    //     const interval = setInterval(fetchNewThought, 60000);
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <div className={className}>
            <Card className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm border-0">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="border-b border-purple-800/20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                    <Brain className="w-5 h-5 text-purple-200" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Neural Stream</h2>
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
                    <div
                        ref={streamRef}
                        className="max-h-96 overflow-y-auto"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#9333ea transparent",
                        }}
                    >
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
                                <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-pulse" />
                                <p className="text-purple-100 font-medium">
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
