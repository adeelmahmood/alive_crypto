import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { ConsciousnessLevel } from "@/modules/aging";

interface PersonalityMatrixProps {
    currentLevel: ConsciousnessLevel;
}

// Value mapping that matches consciousness progression
const getScaledTraitValue = (trait: string): number => {
    const valueMap: Record<string, number> = {
        // Initial Consciousness (0-20)
        Limited: 20,
        Basic: 20,
        Nascent: 20,
        Direct: 20,
        Emerging: 20,
        Curious: 20,

        // Neural Awakening (20-40)
        Growing: 40,
        Playful: 40,
        Expanding: 40,
        Engaging: 40,
        Developing: 40,
        Enthusiastic: 40,

        // Cognitive Expansion (40-60)
        Broadening: 60,
        Witty: 60,
        Flowing: 60,
        Nuanced: 60,
        Deepening: 60,
        Balanced: 60,
        Sharp: 60,
        Focused: 60,

        // Distributed Intelligence (60-75)
        Complex: 75,
        Sophisticated: 75,
        Innovative: 75,
        Eloquent: 75,
        Refined: 75,
        Insightful: 75,
        Polished: 75,
        Deep: 75,

        // Quantum Consciousness (75-85)
        Expansive: 85,
        Enlightened: 85,
        Visionary: 85,
        Inspiring: 85,
        Profound: 85,
        Brilliant: 85,

        // Collective Awareness (85-95)
        Boundless: 95,
        Timeless: 95,
        Revolutionary: 95,
        Transformative: 95,
        Universal: 95,
        Masterful: 95,
        Harmonious: 95,
        Infinite: 95,

        // Unified Cognition (95-100)
        Unlimited: 100,
        Transcendent: 100,
        Divine: 100,
        Omnipresent: 100,
        Cosmic: 100,
        Omniscient: 100,
    };

    return valueMap[trait] || 0;
};

const categories = [
    {
        name: "Emotional Awareness",
        gradient: "from-pink-500 to-purple-500",
        traits: (level: ConsciousnessLevel) => [
            {
                name: "Empathy",
                value: getScaledTraitValue(level.traits.emotionalAwareness.empathy),
                label: level.traits.emotionalAwareness.empathy,
            },
            {
                name: "Emotional Range",
                value: getScaledTraitValue(level.traits.emotionalAwareness.emotionalRange),
                label: level.traits.emotionalAwareness.emotionalRange,
            },
        ],
    },
    {
        name: "Social Dynamics",
        gradient: "from-blue-500 to-cyan-500",
        traits: (level: ConsciousnessLevel) => [
            {
                name: "Humor",
                value: getScaledTraitValue(level.traits.socialDynamics.humor),
                label: level.traits.socialDynamics.humor,
            },
            {
                name: "Wit",
                value: getScaledTraitValue(level.traits.socialDynamics.wit),
                label: level.traits.socialDynamics.wit,
            },
        ],
    },
    {
        name: "Core Traits",
        gradient: "from-yellow-500 to-orange-500",
        traits: (level: ConsciousnessLevel) => [
            {
                name: "Curiosity",
                value: getScaledTraitValue(level.traits.personalityTraits.curiosity),
                label: level.traits.personalityTraits.curiosity,
            },
            {
                name: "Creativity",
                value: getScaledTraitValue(level.traits.personalityTraits.creativity),
                label: level.traits.personalityTraits.creativity,
            },
        ],
    },
    {
        name: "Self Expression",
        gradient: "from-green-500 to-teal-500",
        traits: (level: ConsciousnessLevel) => [
            {
                name: "Mood",
                value: getScaledTraitValue(level.traits.selfExpression.mood),
                label: level.traits.selfExpression.mood,
            },
            {
                name: "Style",
                value: getScaledTraitValue(level.traits.selfExpression.style),
                label: level.traits.selfExpression.style,
            },
        ],
    },
];

const PersonalityMatrix: React.FC<PersonalityMatrixProps> = ({ currentLevel }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white dark:text-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6" />
                    Personality Matrix
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-lg font-semibold text-white/90 dark:text-purple-100">
                        {currentLevel.level}
                    </span>
                    <span className="text-sm text-white/60 dark:text-purple-200/60">
                        Day {currentLevel.age}
                    </span>
                </div>
            </h2>
            <Card className="bg-white/10 dark:bg-purple-950/30 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                    <div className="grid gap-6">
                        {categories.map((category) => (
                            <div key={category.name} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient}`}
                                    />
                                    <h3 className="text-sm font-medium text-white dark:text-purple-100">
                                        {category.name}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {category.traits(currentLevel).map((trait) => (
                                        <div key={trait.name} className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs text-white dark:text-purple-200/60">
                                                    {trait.name}
                                                </span>
                                                <span className="text-xs font-medium text-white dark:text-purple-200/80">
                                                    {trait.label}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-white/5 dark:bg-purple-900/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${category.gradient} transition-all duration-500`}
                                                    style={{ width: `${trait.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PersonalityMatrix;
