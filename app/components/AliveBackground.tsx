"use client";

import React from "react";
import aliveBgImage from "@/app/images/alive_bg4.png";

const AliveBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full z-0">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-15 transition-opacity duration-500"
                style={{
                    backgroundImage: `url(${aliveBgImage.src})`,
                    filter: "blur(2px)",
                }}
            />
            {/* Darker gradient overlay for light mode */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-800/70 via-amber-900/60 to-amber-800/70 dark:from-purple-950/60 dark:via-pink-950/50 dark:to-orange-950/60 mix-blend-soft-light" />

            {/* Additional darkening layer for light mode */}
            <div className="absolute inset-0 bg-amber-950/30 dark:bg-transparent" />
        </div>
    );
};

export default AliveBackground;

// "use client";

// import React, { useState, useEffect } from "react";
// import aliveBg1 from "@/app/images/alive_bg.png";
// import aliveBg2 from "@/app/images/alive_bg2.png";
// import aliveBg3 from "@/app/images/alive_bg3.png";
// import aliveBg4 from "@/app/images/alive_bg4.png";

// const TRANSITION_DURATION = 4000; // Duration of transition in ms
// const IMAGE_DURATION = 8000; // How long each image stays before transitioning

// // Transition types available
// const TRANSITIONS = {
//     FADE_SLIDE_UP: "fade-slide-up",
//     FADE_SLIDE_RIGHT: "fade-slide-right",
//     CROSSFADE_ZOOM: "crossfade-zoom",
// };

// const AliveBackground = ({
//     enableTransition = true,
//     transitionType = TRANSITIONS.CROSSFADE_ZOOM,
// }) => {
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [nextImageIndex, setNextImageIndex] = useState(1);
//     const [isTransitioning, setIsTransitioning] = useState(false);

//     const images = [aliveBg1, aliveBg2, aliveBg3, aliveBg4];

//     useEffect(() => {
//         if (!enableTransition) return;

//         const transitionInterval = setInterval(() => {
//             setIsTransitioning(true);
//             setNextImageIndex((prevIndex) => (prevIndex + 1) % images.length);

//             setTimeout(() => {
//                 setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//                 setIsTransitioning(false);
//             }, TRANSITION_DURATION);
//         }, IMAGE_DURATION);

//         return () => clearInterval(transitionInterval);
//     }, [enableTransition]);

//     // Dynamic styles based on transition type
//     const getTransitionStyles = (isNext) => {
//         const baseStyles = {
//             backgroundImage: `url(${images[isNext ? nextImageIndex : currentImageIndex].src})`,
//             filter: "blur(2px)",
//         };

//         const transitions = {
//             [TRANSITIONS.FADE_SLIDE_UP]: {
//                 transform: isTransitioning
//                     ? isNext
//                         ? "translateY(0)"
//                         : "translateY(-2%)"
//                     : isNext
//                     ? "translateY(2%)"
//                     : "translateY(0)",
//                 opacity: isTransitioning ? (isNext ? 0.25 : 0) : isNext ? 0 : 0.25,
//             },
//             [TRANSITIONS.FADE_SLIDE_RIGHT]: {
//                 transform: isTransitioning
//                     ? isNext
//                         ? "translateX(0)"
//                         : "translateX(-2%)"
//                     : isNext
//                     ? "translateX(2%)"
//                     : "translateX(0)",
//                 opacity: isTransitioning ? (isNext ? 0.25 : 0) : isNext ? 0 : 0.25,
//             },
//             [TRANSITIONS.CROSSFADE_ZOOM]: {
//                 transform: isTransitioning
//                     ? isNext
//                         ? "scale(1)"
//                         : "scale(1.04)"
//                     : isNext
//                     ? "scale(0.96)"
//                     : "scale(1)",
//                 opacity: isTransitioning ? (isNext ? 0.25 : 0) : isNext ? 0 : 0.25,
//             },
//         };

//         return {
//             ...baseStyles,
//             ...transitions[transitionType],
//         };
//     };

//     return (
//         <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
//             {/* Current Image */}
//             <div
//                 className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[4000ms] ease-in-out"
//                 style={getTransitionStyles(false)}
//             />

//             {/* Next Image */}
//             <div
//                 className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[4000ms] ease-in-out"
//                 style={getTransitionStyles(true)}
//             />

//             {/* Gradient overlays */}
//             <div className="absolute inset-0 bg-gradient-to-b from-amber-800/70 via-amber-900/60 to-amber-800/70 dark:from-purple-950/60 dark:via-pink-950/50 dark:to-orange-950/60 mix-blend-soft-light" />

//             {/* Additional darkening layer */}
//             <div className="absolute inset-0 bg-amber-950/30 dark:bg-transparent" />
//         </div>
//     );
// };

// export default AliveBackground;
