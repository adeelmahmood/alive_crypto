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

// Neural network inspired background
const NeuralBackground = () => (
    <svg
        viewBox="0 0 400 400"
        className="absolute opacity-40 dark:opacity-30 left-0 bottom-0 h-96 w-96"
    >
        <defs>
            <linearGradient id="nodeGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0.8 }} />
            </linearGradient>
            <linearGradient id="nodeGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#e9d5ff", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#e9d5ff", stopOpacity: 0.8 }} />
            </linearGradient>
            <filter id="glow-neural">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Nodes with glowing effect */}
        <circle
            cx="100"
            cy="100"
            r="6"
            className="fill-[url(#nodeGradientLight)] dark:fill-[url(#nodeGradientDark)]"
            filter="url(#glow-neural)"
        >
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle
            cx="300"
            cy="150"
            r="6"
            className="fill-[url(#nodeGradientLight)] dark:fill-[url(#nodeGradientDark)]"
            filter="url(#glow-neural)"
        >
            <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2.5s"
                repeatCount="indefinite"
            />
        </circle>
        <circle
            cx="200"
            cy="250"
            r="6"
            className="fill-[url(#nodeGradientLight)] dark:fill-[url(#nodeGradientDark)]"
            filter="url(#glow-neural)"
        >
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Connecting lines with gradients */}
        <line
            x1="100"
            y1="100"
            x2="300"
            y2="150"
            className="stroke-white dark:stroke-purple-200"
            strokeWidth="2"
            strokeOpacity="0.7"
            filter="url(#glow-neural)"
        >
            <animate
                attributeName="stroke-opacity"
                values="0.4;0.8;0.4"
                dur="3s"
                repeatCount="indefinite"
            />
        </line>
        <line
            x1="300"
            y1="150"
            x2="200"
            y2="250"
            className="stroke-white dark:stroke-purple-200"
            strokeWidth="2"
            strokeOpacity="0.7"
            filter="url(#glow-neural)"
        >
            <animate
                attributeName="stroke-opacity"
                values="0.4;0.8;0.4"
                dur="2.5s"
                repeatCount="indefinite"
            />
        </line>
        <line
            x1="100"
            y1="100"
            x2="200"
            y2="250"
            className="stroke-white dark:stroke-purple-200"
            strokeWidth="2"
            strokeOpacity="0.7"
            filter="url(#glow-neural)"
        >
            <animate
                attributeName="stroke-opacity"
                values="0.4;0.8;0.4"
                dur="2s"
                repeatCount="indefinite"
            />
        </line>
    </svg>
);

export default AbstractArt;
