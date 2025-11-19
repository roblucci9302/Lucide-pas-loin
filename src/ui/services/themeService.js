/**
 * Theme Service
 *
 * Manages application themes (light, dark, auto)
 * - Theme switching
 * - System preference detection
 * - Local storage persistence
 * - CSS custom property updates
 *
 * Available themes: 'light', 'dark', 'auto'
 */

class ThemeService {
    constructor() {
        this.currentTheme = 'auto'; // 'light' | 'dark' | 'auto'
        this.appliedTheme = 'light'; // Actual applied theme (light or dark)
        this.listeners = new Set();
        this.mediaQuery = null;

        this._init();
    }

    /**
     * Initialize theme service
     * @private
     */
    _init() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('lucide-theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }

        // Set up system preference listener
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this._applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Apply initial theme
        this._updateTheme();
    }

    /**
     * Get current theme setting
     * @returns {string} 'light' | 'dark' | 'auto'
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Get actually applied theme (resolves 'auto' to 'light' or 'dark')
     * @returns {string} 'light' | 'dark'
     */
    getAppliedTheme() {
        return this.appliedTheme;
    }

    /**
     * Set theme
     * @param {string} theme - 'light' | 'dark' | 'auto'
     */
    setTheme(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            console.error('[ThemeService] Invalid theme:', theme);
            return;
        }

        this.currentTheme = theme;
        localStorage.setItem('lucide-theme', theme);
        this._updateTheme();
        this._notifyListeners();
    }

    /**
     * Toggle between light and dark
     */
    toggle() {
        if (this.appliedTheme === 'light') {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }

    /**
     * Update theme application
     * @private
     */
    _updateTheme() {
        let themeToApply = this.currentTheme;

        // Resolve 'auto' to actual theme
        if (themeToApply === 'auto') {
            themeToApply = this.mediaQuery.matches ? 'dark' : 'light';
        }

        this._applyTheme(themeToApply);
    }

    /**
     * Apply theme to document
     * @private
     */
    _applyTheme(theme) {
        this.appliedTheme = theme;

        // Update document class
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(`theme-${theme}`);

        // Update data attribute for easier CSS targeting
        document.documentElement.setAttribute('data-theme', theme);

        // Apply CSS custom properties
        this._applyCSSVariables(theme);
    }

    /**
     * Apply CSS custom properties for theme
     * @private
     */
    _applyCSSVariables(theme) {
        const root = document.documentElement;

        if (theme === 'dark') {
            // Dark theme colors
            root.style.setProperty('--claude-bg-primary', '#1a1a1a');
            root.style.setProperty('--claude-bg-secondary', '#2d2d2d');
            root.style.setProperty('--claude-bg-tertiary', '#3e3e3e');
            root.style.setProperty('--claude-sidebar-bg', '#1a1a1a');

            root.style.setProperty('--claude-text-primary', '#e8e8e8');
            root.style.setProperty('--claude-text-secondary', '#a3a3a0');
            root.style.setProperty('--claude-text-tertiary', '#6b6b6b');

            root.style.setProperty('--claude-border-subtle', '#3e3e3e');
            root.style.setProperty('--claude-border-normal', '#4e4e4e');

            root.style.setProperty('--claude-hover-overlay', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--claude-active-overlay', 'rgba(255, 255, 255, 0.12)');

            root.style.setProperty('--claude-scrollbar-thumb', '#4e4e4e');
            root.style.setProperty('--claude-scrollbar-thumb-hover', '#5e5e5e');

            root.style.setProperty('--claude-code-bg', '#1e1e1e');
            root.style.setProperty('--claude-code-text', '#d4d4d4');
            root.style.setProperty('--claude-code-inline-bg', '#3e3e3e');

            root.style.setProperty('--claude-input-bg', '#2d2d2d');
            root.style.setProperty('--claude-input-border', '#4e4e4e');
            root.style.setProperty('--claude-input-focus-border', '#D97706');

            root.style.setProperty('--code-bg', '#1e1e1e');
            root.style.setProperty('--code-gutter-bg', '#252525');
            root.style.setProperty('--code-gutter-text', '#858585');
            root.style.setProperty('--code-border', '#3e3e3e');
            root.style.setProperty('--code-text', '#d4d4d4');
            root.style.setProperty('--code-header-bg', '#2d2d2d');
            root.style.setProperty('--code-badge-text', '#858585');
            root.style.setProperty('--code-hover-bg', '#3e3e3e');
            root.style.setProperty('--code-hover-border', '#4e4e4e');
            root.style.setProperty('--code-scrollbar-track', '#1e1e1e');
            root.style.setProperty('--code-scrollbar-thumb', '#3e3e3e');
            root.style.setProperty('--code-scrollbar-thumb-hover', '#4e4e4e');
        } else {
            // Light theme colors (default)
            root.style.setProperty('--claude-bg-primary', '#FFFFFF');
            root.style.setProperty('--claude-bg-secondary', '#FFFFFF');
            root.style.setProperty('--claude-bg-tertiary', '#FAFAF8');
            root.style.setProperty('--claude-sidebar-bg', '#FFFFFF');

            root.style.setProperty('--claude-text-primary', '#1a1a1a');
            root.style.setProperty('--claude-text-secondary', '#6b6b6b');
            root.style.setProperty('--claude-text-tertiary', '#9b9b9b');

            root.style.setProperty('--claude-border-subtle', '#e5e5e0');
            root.style.setProperty('--claude-border-normal', '#d4d4cf');

            root.style.setProperty('--claude-hover-overlay', 'rgba(0, 0, 0, 0.04)');
            root.style.setProperty('--claude-active-overlay', 'rgba(0, 0, 0, 0.08)');

            root.style.setProperty('--claude-scrollbar-thumb', '#d4d4cf');
            root.style.setProperty('--claude-scrollbar-thumb-hover', '#a3a3a0');

            root.style.setProperty('--claude-code-bg', '#2d2d2d');
            root.style.setProperty('--claude-code-text', '#e8e8e8');
            root.style.setProperty('--claude-code-inline-bg', '#F5F5F0');

            root.style.setProperty('--claude-input-bg', '#FFFFFF');
            root.style.setProperty('--claude-input-border', '#d4d4cf');
            root.style.setProperty('--claude-input-focus-border', '#D97706');

            root.style.setProperty('--code-bg', '#1e1e1e');
            root.style.setProperty('--code-gutter-bg', '#252525');
            root.style.setProperty('--code-gutter-text', '#858585');
            root.style.setProperty('--code-border', '#3e3e3e');
            root.style.setProperty('--code-text', '#d4d4d4');
            root.style.setProperty('--code-header-bg', '#2d2d2d');
            root.style.setProperty('--code-badge-text', '#858585');
            root.style.setProperty('--code-hover-bg', '#3e3e3e');
            root.style.setProperty('--code-hover-border', '#4e4e4e');
            root.style.setProperty('--code-scrollbar-track', '#1e1e1e');
            root.style.setProperty('--code-scrollbar-thumb', '#3e3e3e');
            root.style.setProperty('--code-scrollbar-thumb-hover', '#4e4e4e');
        }
    }

    /**
     * Subscribe to theme changes
     * @param {Function} callback - Called when theme changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);

        // Call immediately with current theme
        callback(this.currentTheme, this.appliedTheme);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Notify all listeners of theme change
     * @private
     */
    _notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentTheme, this.appliedTheme);
            } catch (error) {
                console.error('[ThemeService] Error in listener:', error);
            }
        });
    }

    /**
     * Get system preference
     * @returns {string} 'light' | 'dark'
     */
    getSystemPreference() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    /**
     * Check if current theme is dark
     * @returns {boolean}
     */
    isDark() {
        return this.appliedTheme === 'dark';
    }

    /**
     * Check if current theme is light
     * @returns {boolean}
     */
    isLight() {
        return this.appliedTheme === 'light';
    }

    /**
     * Get available themes
     * @returns {Array} List of available themes
     */
    getAvailableThemes() {
        return [
            { id: 'light', name: 'Clair', icon: '☀️' },
            { id: 'dark', name: 'Sombre', icon: '🌙' },
            { id: 'auto', name: 'Automatique', icon: '🔄' },
        ];
    }
}

// Export singleton instance
export const themeService = new ThemeService();
