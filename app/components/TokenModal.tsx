import React from "react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Coins, Rocket } from "lucide-react";

const TokenModal = () => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-600 dark:to-orange-700 hover:opacity-90 shadow-lg transition-all duration-300 scale-100 hover:scale-105 text-white dark:text-orange-100"
                >
                    <Coins className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Token Coming Soon</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-purple-950 dark:to-amber-950 border-none shadow-xl max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center flex flex-col items-center gap-4">
                        <div className="relative">
                            <Rocket className="h-12 w-12 text-amber-500 dark:text-amber-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1">
                                <div className="animate-ping absolute h-3 w-3 rounded-full bg-amber-400 opacity-75"></div>
                                <div className="relative h-3 w-3 rounded-full bg-amber-500"></div>
                            </div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                            Token Launch Soon
                        </span>
                    </AlertDialogTitle>
                    <div className="text-center mt-4">
                        <p className="text-amber-900/80 dark:text-amber-100/80">
                            An AI-powered meme token that we&aposll build together 🚀
                        </p>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center sm:space-x-4 mt-4">
                    <AlertDialogCancel className="border-none bg-amber-100 dark:bg-purple-900 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-purple-800">
                        Close
                    </AlertDialogCancel>
                    <Button
                        onClick={() => window.open("https://twitter.com/AlIveAI", "_blank")}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white hover:opacity-90"
                    >
                        Follow Updates
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TokenModal;
