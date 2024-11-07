import React, { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Sparkles,
    Camera,
    Loader2,
    Share2,
    Wand2,
    TrendingUp,
    Newspaper,
    LightbulbIcon,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFingerprint } from "../hooks/useFingerprint";

// Types
interface Template {
    id: number;
    name: string;
    prompt: string;
    icon: React.ReactNode;
}

interface ImageCreatorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArtworkCreated?: () => void;
}

type GenerationStep = "idle" | "analyzing" | "creating";

// Constants
const MIN_PROMPT_LENGTH = 10;
const SUCCESS_MESSAGE_DURATION = 2000;

const ImageCreatorModal: React.FC<ImageCreatorModalProps> = ({
    open,
    onOpenChange,
    onArtworkCreated,
}) => {
    // State
    const [formState, setFormState] = useState({
        prompt: "",
        creator: "anon",
        selectedTemplate: null as Template | null,
    });
    const [status, setStatus] = useState({
        isSubmitting: false,
        generationStep: "idle" as GenerationStep,
        error: null as string | null,
        showSuccess: false,
    });

    const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
    const {
        fingerprint,
        isLoading: isFingerprintLoading,
        error: fingerprintError,
    } = useFingerprint();

    const { toast } = useToast();

    // Templates
    const templates: Template[] = useMemo(
        () => [
            {
                id: 1,
                name: "Crypto Dreams",
                prompt: "A dreamy scene with crypto symbols floating in a ethereal space",
                icon: <Sparkles className="h-4 w-4" />,
            },
            {
                id: 2,
                name: "Moon Mission",
                prompt: "A luxurious spacecraft heading to the moon with crypto symbols",
                icon: <TrendingUp className="h-4 w-4" />,
            },
            {
                id: 3,
                name: "Community Power",
                prompt: "A vibrant gathering of diverse people celebrating with crypto symbols",
                icon: <Share2 className="h-4 w-4" />,
            },
        ],
        []
    );

    // Handlers
    const handleInputChange = useCallback(
        (field: keyof typeof formState, value: string | Template | null) => {
            setFormState((prev) => ({
                ...prev,
                [field]: value,
                ...(field === "selectedTemplate" && value
                    ? { prompt: (value as Template).prompt }
                    : {}),
            }));
        },
        []
    );

    const resetForm = useCallback(() => {
        setFormState({
            prompt: "",
            creator: "",
            selectedTemplate: null,
        });
        setStatus({
            isSubmitting: false,
            generationStep: "idle",
            error: null,
            showSuccess: false,
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus((prev) => ({
            ...prev,
            isSubmitting: true,
            generationStep: "analyzing",
            error: null,
        }));

        try {
            if (!fingerprint) {
                throw new Error("Unable to verify device. Please try again.");
            }

            const response = await fetch("/api/artworks/create", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Fingerprint": fingerprint },
                body: JSON.stringify({
                    prompt: formState.prompt,
                    creator: formState.creator,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setStatus((prev) => ({
                ...prev,
                generationStep: "creating",
                showSuccess: true,
            }));

            onArtworkCreated?.();

            toast({
                title: "Success!",
                description: "Your artwork has been created and added to the community feed.",
                duration: 3000,
            });

            // Update remaining generations from response
            if (data.remainingGenerations !== undefined) {
                setRemainingGenerations(data.remainingGenerations);
            }

            setTimeout(() => {
                onOpenChange(false);
                resetForm();
            }, SUCCESS_MESSAGE_DURATION);
        } catch (error) {
            setStatus((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : "An unexpected error occurred",
            }));

            toast({
                title: "Error",
                description: "Failed to generate image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setStatus((prev) => ({
                ...prev,
                isSubmitting: false,
                generationStep: "idle",
            }));
        }
    };

    // Computed values
    const isSubmitDisabled =
        isFingerprintLoading ||
        status.isSubmitting ||
        formState.prompt.length < MIN_PROMPT_LENGTH ||
        !formState.creator.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-sm sm:max-w-2xl mx-auto bg-sky-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                {/* Simplified Header */}
                <DialogHeader className="space-y-3 mb-6">
                    <DialogTitle className="text-2xl font-semibold text-center">
                        Create Your Artwork
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto">
                        Transform your vision into unique AI-generated artwork, enhanced by
                        real-time market insights
                    </p>
                </DialogHeader>

                {fingerprintError && (
                    <Alert className="bg-red-500/20 border-red-500/30">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Unable to verify device. Please try refreshing the page.
                        </AlertDescription>
                    </Alert>
                )}

                {remainingGenerations !== null && (
                    <div className="text-sm text-center">
                        Remaining generations today: {remainingGenerations}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Input Section */}
                    <div className="space-y-4">
                        {/* Vision Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="prompt"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Your Vision
                            </label>
                            <div className="relative">
                                <Textarea
                                    id="prompt"
                                    value={formState.prompt}
                                    onChange={(e) => handleInputChange("prompt", e.target.value)}
                                    placeholder="Describe your artwork idea... Anything that comes to mind!"
                                    className="h-32 w-full resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                    required
                                    minLength={MIN_PROMPT_LENGTH}
                                />
                                <div className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400">
                                    {formState.prompt.length}/{MIN_PROMPT_LENGTH} min
                                </div>
                            </div>
                        </div>

                        {/* Creator Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="creator"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Artist Name
                            </label>
                            <Input
                                id="creator"
                                value={formState.creator}
                                onChange={(e) => handleInputChange("creator", e.target.value)}
                                placeholder="Your name or pseudonym"
                                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                required
                            />
                        </div>

                        {/* Template Section - Simplified */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <LightbulbIcon className="h-4 w-4" />
                                <span>Quick Start Templates</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() =>
                                            handleInputChange("selectedTemplate", template)
                                        }
                                        className={`
                                            p-3 rounded-lg text-left transition-all
                                            ${
                                                formState.selectedTemplate?.id === template.id
                                                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500"
                                                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }
                                            border text-sm
                                        `}
                                    >
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium mb-1">
                                            {template.icon}
                                            {template.name}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                                            {template.prompt}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {status.error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{status.error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button - Simplified */}
                    <Button
                        type="submit"
                        disabled={
                            status.isSubmitting ||
                            formState.prompt.length < MIN_PROMPT_LENGTH ||
                            !formState.creator.trim()
                        }
                        className={`
                            w-full py-6 text-white
                            ${
                                status.isSubmitting
                                    ? "bg-gray-400 dark:bg-gray-600"
                                    : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                            }
                            transition-all duration-200
                        `}
                    >
                        {status.isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                <span>
                                    {status.generationStep === "analyzing"
                                        ? "Generating..."
                                        : "Finalizing..."}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Camera className="h-5 w-5" />
                                <span>Create Artwork</span>
                            </div>
                        )}
                    </Button>
                </form>

                {/* Success Message */}
                {status.showSuccess && (
                    <Alert className="mt-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            Artwork created successfully! Adding to community feed...
                        </AlertDescription>
                    </Alert>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageCreatorModal;
