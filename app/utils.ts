import { ServerFingerprint } from "@/types";
import { NextRequest } from "next/server";

export const getClientIP = (request: NextRequest): string => {
    // Check headers in order of reliability
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwardedFor.split(",")[0].trim();
    }

    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return realIP.trim();
    }

    // If running behind Cloudflare
    const cfConnectingIP = request.headers.get("cf-connecting-ip");
    if (cfConnectingIP) {
        return cfConnectingIP.trim();
    }

    // Fallback to NextJS request IP if available
    // Note: This might need to be adapted based on your deployment environment
    const remoteAddr = request.ip;
    if (remoteAddr) {
        return remoteAddr;
    }

    return "0.0.0.0"; // fallback if no IP can be determined
};

export const generateServerFingerprint = (request: NextRequest): ServerFingerprint => {
    const headers = Object.fromEntries(request.headers.entries());

    return {
        userAgent: headers["user-agent"] || "",
        acceptLanguage: headers["accept-language"] || "",
        ipAddress: getClientIP(request),
        headers: {
            accept: headers["accept"] || "",
            "accept-encoding": headers["accept-encoding"] || "",
            "sec-ch-ua": headers["sec-ch-ua"] || "",
            "sec-ch-ua-platform": headers["sec-ch-ua-platform"] || "",
        },
    };
};
