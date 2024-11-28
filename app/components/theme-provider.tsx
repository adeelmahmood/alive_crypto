"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
    children: React.ReactNode;
};

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
}>({
    theme: "light",
    toggleTheme: () => null,
});

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        // Check system preferences on mount
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setTheme(mediaQuery.matches ? "dark" : "light");

        // Listen for system theme changes
        const listener = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    useEffect(() => {
        // Update document class when theme changes
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
