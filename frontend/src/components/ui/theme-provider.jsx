import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        console.log('Initial theme from localStorage:', savedTheme);
        return savedTheme || 'light'; // Default to light if no saved theme
    });

    useEffect(() => {
        const root = document.documentElement;
        console.log('Current theme state:', theme);

        // Remove existing theme classes
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = systemPrefersDark ? 'dark' : 'light';
            console.log('System prefers dark:', systemPrefersDark, 'Applying system theme:', systemTheme);
            root.classList.add(systemTheme);
            localStorage.setItem('theme', 'system');
        } else {
            console.log('Applying manual theme:', theme);
            root.classList.add(theme);
            localStorage.setItem('theme', theme);
        }

        // Listen for system theme changes when theme is 'system'
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (theme === 'system') {
                const newSystemTheme = e.matches ? 'dark' : 'light';
                console.log('System preference changed, new theme:', newSystemTheme);
                root.classList.remove('light', 'dark');
                root.classList.add(newSystemTheme);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        console.log('Initial system prefers dark:', mediaQuery.matches);

        // Cleanup listener on unmount
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};