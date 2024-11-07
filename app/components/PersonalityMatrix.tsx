import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Sparkles } from "lucide-react";
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
        icon: "✧",
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
        icon: "❋",
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
        icon: "✦",
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
        icon: "✧",
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
        <div className="h-full overflow-hidden">
            <Card className="bg-amber-800/30 dark:bg-purple-950/30 h-full border-0 relative">
                {/* Animated background glow effects */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 -left-4 w-24 h-24 bg-amber-500/20 dark:bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-0 -right-4 w-32 h-32 bg-amber-500/20 dark:bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
                </div>

                <div className="border-b border-amber-800/20 dark:border-purple-800/20 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative p-2 bg-amber-500/20 dark:bg-purple-500/20 rounded-xl group">
                                <Zap className="h-5 w-5 text-amber-200 dark:text-purple-200 transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-amber-500/20 dark:bg-purple-500/20 rounded-xl animate-ping opacity-0 group-hover:opacity-70" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Personality Matrix</h2>
                        </div>
                        <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-purple-500/10 rounded-full px-4 py-1.5">
                            <Sparkles className="h-4 w-4 text-amber-200 dark:text-purple-200" />
                            <span className="text-sm font-semibold text-white">
                                {currentLevel.level}
                            </span>
                            <span className="text-sm text-amber-200/60 dark:text-purple-200/60 font-mono">
                                Day {currentLevel.age}
                            </span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 relative space-y-6">
                    {categories.map((category, categoryIndex) => (
                        <div key={category.name} className="space-y-3 group">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-6 h-6 rounded-lg bg-gradient-to-r ${category.gradient} flex items-center justify-center`}
                                >
                                    <span className="text-white text-xs">{category.icon}</span>
                                </div>
                                <h3 className="text-sm font-medium text-white dark:text-purple-100">
                                    {category.name}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {category.traits(currentLevel).map((trait, traitIndex) => (
                                    <div
                                        key={trait.name}
                                        className="space-y-1.5 transition-all duration-300 hover:translate-x-1"
                                        style={{
                                            animationDelay: `${
                                                categoryIndex * 200 + traitIndex * 100
                                            }ms`,
                                        }}
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs text-amber-200/80 dark:text-purple-200/80">
                                                {trait.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-amber-200/60 dark:text-purple-200/60">
                                                    {trait.value}%
                                                </span>
                                                <span className="text-xs font-medium text-amber-100 dark:text-purple-100">
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
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
export default PersonalityMatrix;
