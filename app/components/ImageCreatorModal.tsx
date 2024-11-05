import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Sparkles,
    Camera,
    Loader2,
    Share2,
    Heart,
    Wand2,
    TrendingUp,
    Newspaper,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Template {
    id: number;
    name: string;
    prompt: string;
}

interface ImageCreatorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ImageCreatorModal: React.FC<ImageCreatorModalProps> = ({ open, onOpenChange }) => {
    const [prompt, setPrompt] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [generationStep, setGenerationStep] = useState<"idle" | "analyzing" | "creating">("idle");

    const templates: Template[] = [
        {
            id: 1,
            name: "Crypto Dreams",
            prompt: "A dreamy scene with crypto symbols floating in a ethereal space",
        },
        {
            id: 2,
            name: "Moon Mission",
            prompt: "A luxurious spacecraft heading to the moon with crypto symbols",
        },
        {
            id: 3,
            name: "Community Power",
            prompt: "A vibrant gathering of diverse people celebrating with crypto symbols",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setGenerationStep("analyzing");

        try {
            const response = await fetch("/api/art", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error("Failed to generate image");

            setGenerationStep("creating");
            const data = await response.json();
            setPreviewImage(data.imageUrl);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error generating image:", error);
            // Handle error appropriately
        } finally {
            setIsSubmitting(false);
            setGenerationStep("idle");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl mx-4 sm:mx-auto bg-gradient-to-b from-yellow-800/70 via-amber-700/60 to-yellow-800/70 dark:from-purple-950/60 dark:via-pink-950/50 dark:to-orange-950/60 text-white backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
                        Create Magic with Me{" "}
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
                    </DialogTitle>
                    <div className="space-y-2 text-center">
                        <p className="text-yellow-100/90 dark:text-purple-200/90 text-sm sm:text-base">
                            Let's create something beautiful together! I'll infuse it with my
                            market-inspired mood! 💫
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-yellow-200/80">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Reading market mood
                            </span>
                            <span className="flex items-center gap-1">
                                <Newspaper className="h-3 w-3" /> Checking latest news
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-yellow-100/90 dark:text-purple-200/90">
                                Feeling inspired? Try one of my favorite themes:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setPrompt(template.prompt);
                                        }}
                                        className={`p-3 rounded-lg text-sm text-left transition-all ${
                                            selectedTemplate?.id === template.id
                                                ? "bg-amber-500/30 dark:bg-purple-700/40 border-2 border-yellow-300/50 dark:border-purple-500/50"
                                                : "bg-amber-600/20 dark:bg-purple-900/30 border border-yellow-500/30 dark:border-purple-800/30 hover:bg-amber-500/30 dark:hover:bg-purple-800/40"
                                        }`}
                                    >
                                        <div className="font-medium mb-1 text-yellow-100 dark:text-purple-100">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-yellow-200/80 dark:text-purple-300/80">
                                            {template.prompt}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="prompt"
                                className="block text-sm font-medium text-white"
                            >
                                Tell me your vision ✨ and I will post it for our community:
                            </label>
                            <Textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Let your imagination run wild! What kind of crypto art shall we create today?"
                                className="h-24 sm:h-32 bg-amber-600/20 dark:bg-purple-900/20 border-yellow-500/30 dark:border-purple-800/30 text-white placeholder:text-gray-200"
                                required
                            />
                            <p className="text-xs text-yellow-200/80 dark:text-purple-300/80 italic">
                                I'll blend your idea with my current mood, which is influenced by
                                market trends, news, and the overall crypto vibe!
                            </p>
                        </div>

                        {previewImage && !isSubmitting && (
                            <div className="space-y-2">
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={previewImage}
                                        alt="Generated preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-2">
                                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-300" />
                                        <span className="text-xs sm:text-sm text-yellow-100">
                                            Created with market-inspired love
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || prompt.length < 10}
                            className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-purple-600 dark:to-pink-600 hover:from-yellow-500 hover:to-amber-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white border-yellow-300/20 dark:border-purple-500/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">
                                        {generationStep === "analyzing"
                                            ? "Reading the Market..."
                                            : "Creating Magic..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">Create & Share</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {showSuccess && (
                    <Alert className="bg-yellow-500/20 dark:bg-green-900/20 border-yellow-300/30 dark:border-green-500/30">
                        <AlertDescription className="text-yellow-100 dark:text-green-200 flex items-center gap-2 text-sm">
                            <Share2 className="h-4 w-4" />
                            Gorgeous! I'll share this masterpiece in our next tweet! 🚀
                        </AlertDescription>
                    </Alert>
                )}

                <div className="text-xs sm:text-sm text-yellow-200/70 dark:text-purple-300/70 text-center">
                    Let's create something that will make our community go wild! 🌟
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCreatorModal;
