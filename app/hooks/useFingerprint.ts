import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const useFingerprint = () => {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initializeFingerprint = async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                setFingerprint(result.visitorId);
                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to generate fingerprint"));
                setIsLoading(false);
            }
        };

        initializeFingerprint();
    }, []);

    return { fingerprint, isLoading, error };
};
