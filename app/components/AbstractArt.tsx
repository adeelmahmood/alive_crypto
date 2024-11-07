"use client";

// Abstract geometric artwork component
const AbstractArt = () => (
    <svg
        viewBox="0 0 400 400"
        className="absolute opacity-30 dark:opacity-20 right-0 top-0 h-96 w-96"
    >
        <defs>
            <filter id="glow-abstract">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <linearGradient id="lightStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                    offset="0%"
                    className="text-white"
                    style={{ stopColor: "currentColor", stopOpacity: 0.8 }}
                />
                <stop
                    offset="100%"
                    className="text-white"
                    style={{ stopColor: "currentColor", stopOpacity: 0.6 }}
                />
            </linearGradient>
            <linearGradient id="darkStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                    offset="0%"
                    className="text-purple-200"
                    style={{ stopColor: "currentColor", stopOpacity: 0.8 }}
                />
                <stop
                    offset="100%"
                    className="text-purple-200"
                    style={{ stopColor: "currentColor", stopOpacity: 0.6 }}
                />
            </linearGradient>
        </defs>
        <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            className="stroke-white/80 dark:stroke-purple-200/80"
            strokeWidth="3"
            filter="url(#glow-abstract)"
        />
        <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            className="stroke-white/90 dark:stroke-purple-200/90"
            strokeWidth="3"
            filter="url(#glow-abstract)"
        >
            <animate attributeName="r" values="100;120;100" dur="4s" repeatCount="indefinite" />
        </circle>
        <path
            d="M200,50 L350,200 L200,350 L50,200 Z"
            fill="none"
            className="stroke-white/85 dark:stroke-purple-200/85"
            strokeWidth="3"
            filter="url(#glow-abstract)"
        >
            <animate
                attributeName="stroke-dasharray"
                values="0,1000;1000,0"
                dur="4s"
                repeatCount="indefinite"
            />
        </path>
    </svg>
);

export default AbstractArt;
