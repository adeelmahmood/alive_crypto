import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { ConsciousnessLevel, getTraitLabel } from "@/modules/aging";

interface PersonalityMatrixProps {
    currentLevel: ConsciousnessLevel;
}

interface TraitDisplay {
    name: string;
    value: number;
    label: string;
}

const categories = [
    {
        name: "Emotional Awareness",
        gradient: "from-pink-500 to-purple-500",
        traits: (level: ConsciousnessLevel): TraitDisplay[] => [
            {
                name: "Empathy",
                value: Math.round(level.traits.emotionalAwareness.empathy),
                label: getTraitLabel(level.traits.emotionalAwareness.empathy),
            },
            {
                name: "Emotional Range",
                value: Math.round(level.traits.emotionalAwareness.emotionalRange),
                label: getTraitLabel(level.traits.emotionalAwareness.emotionalRange),
            },
        ],
    },
    {
        name: "Social Dynamics",
        gradient: "from-blue-500 to-cyan-500",
        traits: (level: ConsciousnessLevel): TraitDisplay[] => [
            {
                name: "Humor",
                value: Math.round(level.traits.socialDynamics.humor),
                label: getTraitLabel(level.traits.socialDynamics.humor),
            },
            {
                name: "Wit",
                value: Math.round(level.traits.socialDynamics.wit),
                label: getTraitLabel(level.traits.socialDynamics.wit),
            },
        ],
    },
    {
        name: "Core Traits",
        gradient: "from-yellow-500 to-orange-500",
        traits: (level: ConsciousnessLevel): TraitDisplay[] => [
            {
                name: "Curiosity",
                value: Math.round(level.traits.personalityTraits.curiosity),
                label: getTraitLabel(level.traits.personalityTraits.curiosity),
            },
            {
                name: "Creativity",
                value: Math.round(level.traits.personalityTraits.creativity),
                label: getTraitLabel(level.traits.personalityTraits.creativity),
            },
        ],
    },
    {
        name: "Self Expression",
        gradient: "from-green-500 to-teal-500",
        traits: (level: ConsciousnessLevel): TraitDisplay[] => [
            {
                name: "Mood",
                value: Math.round(level.traits.selfExpression.mood),
                label: getTraitLabel(level.traits.selfExpression.mood),
            },
            {
                name: "Style",
                value: Math.round(level.traits.selfExpression.style),
                label: getTraitLabel(level.traits.selfExpression.style),
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
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-white/60">
                                                        {trait.value}%
                                                    </span>
                                                    <span className="text-xs font-medium text-white dark:text-purple-200/80">
                                                        {trait.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-white/5 dark:bg-purple-900/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${category.gradient} transition-all duration-500`}
                                                    style={{
                                                        width: `${Math.max(
                                                            1,
                                                            Math.min(100, trait.value)
                                                        )}%`,
                                                        transition: "width 0.5s ease-in-out",
                                                    }}
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
