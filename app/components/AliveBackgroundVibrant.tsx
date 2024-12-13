"use client";

import React from "react";

const AliveBackgroundVibrant = () => {
    return (
        <div className="fixed inset-0 w-full h-full z-0">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-20 transition-opacity duration-500"
                style={{
                    backgroundImage: `url(/images/alive_bg5.png)`,
                    filter: "blur(3px)",
                }}
            />
            {/* Colorful gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/60 via-purple-600/50 to-pink-500/60 dark:from-blue-900/60 dark:via-purple-800/50 dark:to-pink-900/60 mix-blend-soft-light" />

            {/* Subtle glow overlay for added mystique */}
            <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-900/20 mix-blend-overlay" />
        </div>
    );
};

export default AliveBackgroundVibrant;
