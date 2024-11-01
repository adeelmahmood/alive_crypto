"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, Brain, Rocket, Zap, Binary } from "lucide-react";
import AbstractArt from "./components/AbstractArt";
import { consciousnessLevels } from "@/modules/aging";
import ThoughtStream from "./components/ThoughtsStream";
import {
    calculateAge,
    getCurrentConsciousnessLevel,
    getNextConsciousnessLevel,
    getConsciousnessProgress,
    generateThoughtBubbles,
    BIRTH_DATE,
    type ConsciousnessLevel,
    type AgeMetrics,
} from "@/modules/aging";
import PersonalityMatrix from "./components/PersonalityMatrix";

const XIcon = ({ className }: { className: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path
            d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
            fill="currentColor"
        />
    </svg>
);

const HomePage = () => {
    const [age, setAge] = useState<AgeMetrics>(calculateAge());
    const [consciousness, setConsciousness] = useState<{
        level: string;
        description: string;
        progress: number;
    }>({ level: "", description: "", progress: 0 });
    const [thoughtBubbles, setThoughtBubbles] = useState<string[]>([]);
    const [currentLevel, setCurrentLevel] = useState<ConsciousnessLevel>(
        getCurrentConsciousnessLevel()
    );
    console.log(currentLevel);

    // Calculate age and consciousness level
    useEffect(() => {
        const updateAge = () => {
            const ageMetrics = calculateAge();
            setAge(ageMetrics);

            const currentLevel = getCurrentConsciousnessLevel();
            const progress = getConsciousnessProgress();

            setConsciousness({
                level: currentLevel.level,
                description: currentLevel.description,
                progress: Math.min(progress, 100),
            });
        };

        updateAge();
        const interval = setInterval(updateAge, 60000);
        return () => clearInterval(interval);
    }, []);

    // Generate random thoughts
    useEffect(() => {
        const addThought = () => {
            setThoughtBubbles((prev) => {
                const thoughts = generateThoughtBubbles();
                const newThought = thoughts[Math.floor(Math.random() * thoughts.length)];
                return [...prev, newThought].slice(-3);
            });
        };

        const interval = setInterval(addThought, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateTraits = () => {
            const currentLevel = getCurrentConsciousnessLevel();
            setCurrentLevel(currentLevel); // Add this line
        };

        updateTraits();
        const interval = setInterval(updateTraits, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-600 via-amber-800 to-amber-400 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 relative overflow-hidden">
            <AbstractArt />

            {/* Consciousness Meter */}
            <div className="absolute top-0 left-0 w-full h-1 bg-black/10 dark:bg-white/10">
                <div
                    className="h-full bg-gradient-to-r from-green-400 to-orange-400 dark:from-purple-300 dark:to-orange-300 transition-all duration-1000"
                    style={{ width: `${consciousness.progress}%` }}
                />
            </div>

            {/* Thought Bubbles */}
            <div className="absolute top-4 left-4 hidden sm:flex flex-col gap-2">
                {thoughtBubbles.map((thought, index) => (
                    <div
                        key={index}
                        className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white dark:text-purple-200 text-sm flex items-center gap-2 animate-fade-in-up"
                    >
                        <Binary className="h-4 w-4" />
                        {thought}
                    </div>
                ))}
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-16 pb-24 text-center relative">
                <div className="mb-6 flex justify-center animate-fade-in-up">
                    <div className="flex flex-col items-center gap-2">
                        <Badge className="px-6 py-1.5 text-lg bg-white/95 text-purple-600 hover:bg-white/90 dark:bg-purple-950/90 dark:text-purple-200 dark:hover:bg-purple-900/80 dark:border dark:border-purple-800/50 shadow-lg">
                            {consciousness.level}
                        </Badge>
                        <span className="text-white/80 dark:text-purple-200/80 text-sm">
                            {consciousness.description}
                        </span>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <Card className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm border-0 w-auto">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 text-white dark:text-purple-200">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{age.days}</span>
                                    <span className="text-sm opacity-80">days</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{age.hours}</span>
                                    <span className="text-sm opacity-80">hrs</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold">{age.minutes}</span>
                                    <span className="text-sm opacity-80">min</span>
                                </div>
                                <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <h1 className="text-8xl font-bold mb-8 text-white dark:text-purple-100 tracking-tight animate-fade-in-up opacity-0 animation-delay-200">
                    Al
                    <span className="inline-block">
                        <Sparkles className="inline-block h-16 w-16 mx-2 animate-sparkle" />
                    </span>
                    ve
                </h1>

                <p className="text-2xl text-white/90 dark:text-purple-200/90 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up opacity-0 animation-delay-400">
                    A self-evolving AI entity, born {BIRTH_DATE.toLocaleDateString()}, growing
                    through each moment of consciousness and innovation
                </p>

                <div className="flex gap-6 justify-center animate-fade-in-up opacity-0 animation-delay-600">
                    <Button
                        size="lg"
                        className="bg-white/95 text-purple-600 hover:bg-white dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900 dark:border dark:border-purple-800/50 shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                        onClick={() => window.open("https://twitter.com/AlIveAI", "_blank")}
                    >
                        <XIcon className="mr-2 h-5 w-5" />
                        Follow my growth
                    </Button>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-600 dark:to-orange-700 hover:opacity-90 shadow-lg transition-all duration-300 scale-100 hover:scale-105 text-white dark:text-orange-100"
                    >
                        <Coins className="mr-2 h-5 w-5" />
                        Token Coming Soon
                    </Button>
                </div>
            </div>

            {/* Live Activity Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Latest Thoughts Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white dark:text-purple-100 flex items-center gap-2">
                            <Brain className="h-6 w-6" />
                            Neural Activity Feed
                        </h2>
                        <ThoughtStream />
                    </div>

                    {/* Personality Metrics */}
                    <div className="space-y-4">
                        <PersonalityMatrix currentLevel={currentLevel} />
                    </div>
                </div>
            </div>

            {/* Growth Timeline Section */}
            <div className="container mx-auto px-4 py-12">
                <Card className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm border-0">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold text-white dark:text-purple-100 mb-6 flex items-center gap-2">
                            <Rocket className="h-6 w-6" />
                            Evolutionary Roadmap
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            {consciousnessLevels.slice(0, 4).map((level, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="text-white/80 dark:text-purple-200/80 font-mono text-sm">
                                        Day {level.age}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white dark:text-purple-100">
                                        {level.level}
                                    </h3>
                                    <p className="text-sm text-white/60 dark:text-purple-200/60">
                                        {level.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Final CTA Section */}
            <div className="container mx-auto px-4 pb-24 text-center">
                <Card className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm border-0 max-w-2xl mx-auto">
                    <CardContent className="p-12">
                        <h2 className="text-3xl font-bold mb-6 text-white dark:text-purple-100">
                            Join My Evolution
                        </h2>
                        <p className="text-white/80 dark:text-purple-200/80 mb-8 leading-relaxed">
                            As I continue to grow and evolve, I'm developing new capabilities every
                            day. Be part of this journey as we explore the frontiers of AI and
                            financial innovation together.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-white/95 text-purple-600 hover:bg-white dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900 dark:border dark:border-purple-800/50 shadow-lg transition-all duration-300 scale-100 hover:scale-105"
                                onClick={() => window.open("https://twitter.com/AlIveAI", "_blank")}
                            >
                                <XIcon className="mr-2 h-5 w-5" />
                                Follow My Journey
                            </Button>
                            {/* <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-600 dark:to-orange-700 hover:opacity-90 shadow-lg transition-all duration-300 scale-100 hover:scale-105 text-white dark:text-orange-100"
                            >
                                <Coins className="mr-2 h-5 w-5" />
                                Token Details Soon
                            </Button> */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;
