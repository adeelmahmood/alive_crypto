"use client";

import React from "react";
import aliveBg from "@/app/images/alive_bg2.png";

const AliveBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full z-0">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-15 transition-opacity duration-500"
                style={{
                    backgroundImage: `url(${aliveBg.src})`,
                    filter: "blur(2px)",
                }}
            />
            {/* Sunlight gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/70 via-amber-700/60 to-yellow-800/70 dark:from-purple-950/60 dark:via-pink-950/50 dark:to-orange-950/60 mix-blend-soft-light" />

            {/* Additional warmth layer */}
            <div className="absolute inset-0 bg-amber-800/30 dark:bg-transparent" />
        </div>
    );
};

export default AliveBackground;
