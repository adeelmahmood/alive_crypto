import { Card, CardContent } from "@/components/ui/card";
import { Rocket } from "lucide-react";

const TimelineCard = ({
    level,
    index,
    isLast,
}: {
    level: { age: number; level: string; description: string };
    index: number;
    isLast: boolean;
}) => (
    <div className="relative">
        <div className="space-y-4">
            {/* Header row with day and level */}
            <div className="flex flex-row items-center gap-3 md:flex-col md:items-start">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-4 h-4 rounded-full bg-amber-500 dark:bg-purple-500 ring-4 ring-amber-500/20 dark:ring-purple-500/20" />
                        {/* Vertical connecting line for mobile only */}
                        {!isLast && (
                            <div className="md:hidden absolute top-4 left-2 h-16 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent dark:from-purple-500/50" />
                        )}
                    </div>
                    <div className="bg-amber-500/20 dark:bg-purple-500/20 rounded-lg px-3 py-1">
                        <span className="text-amber-200 dark:text-purple-200 font-mono text-sm">
                            Day {level.age}
                        </span>
                    </div>
                </div>

                {/* Level label - moves next to day on mobile */}
                <h3 className="text-lg font-semibold text-white dark:text-purple-100 md:mt-2">
                    {level.level}
                </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-white/60 dark:text-purple-200/60 pl-9 md:pl-0">
                {level.description}
            </p>
        </div>
    </div>
);

const GrowthTimeline = ({
    consciousnessLevels,
}: {
    consciousnessLevels: Array<{ age: number; level: string; description: string }>;
}) => {
    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="bg-amber-800/30 dark:bg-purple-950/30 backdrop-blur-sm border-0">
                <CardContent className="p-4 md:p-8">
                    <h2 className="text-xl font-bold text-white dark:text-purple-100 mb-8 flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 dark:bg-purple-500/20 rounded-xl">
                            <Rocket className="h-6 w-6 text-amber-200 dark:text-purple-200" />
                        </div>
                        Evolutionary Roadmap
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {consciousnessLevels.slice(0, 4).map((level, index, array) => (
                            <TimelineCard
                                key={index}
                                level={level}
                                index={index}
                                isLast={index === array.length - 1}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GrowthTimeline;
