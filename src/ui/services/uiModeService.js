/**
 * UI Mode Service
 * Manages switching between Classic and Claude UI modes
 * Also manages theme (light/dark/auto) for Claude mode
 *
 * Modes:
 * - classic: Original Lucide UI (dark glass effect)
 * - claude: Claude.ai-inspired UI (light beige theme)
 *
 * Themes (for Claude mode):
 * - light: Light theme (beige/cream)
 * - dark: Dark theme (#1a1a1a background)
 * - auto: Follow system preference
 */

const UI_MODE_KEY = 'lucide-ui-mode';
const UI_THEME_KEY = 'lucide-ui-theme';
const UI_MODE_ATTRIBUTE = 'data-ui-mode';
const UI_THEME_ATTRIBUTE = 'data-theme';

export class UIModeService {
    constructor() {
        this._mode = this._loadMode();
        this._theme = this._loadTheme();
        this._listeners = new Set();
        this._applyMode();
        this._applyTheme();
        this._setupSystemThemeListener();
    }

    /**
     * Get current UI mode
     * @returns {'classic' | 'claude'}
     */
    getMode() {
        return this._mode;
    }

    /**
     * Set UI mode
     * @param {'classic' | 'claude'} mode
     */
    setMode(mode) {
        if (mode !== 'classic' && mode !== 'claude') {
            console.error(`Invalid UI mode: ${mode}. Must be 'classic' or 'claude'.`);
            return;
        }

        if (this._mode === mode) return;

        this._mode = mode;
        this._saveMode();
        this._applyMode();
        this._notifyListeners();
    }

    /**
     * Toggle between classic and claude modes
     */
    toggleMode() {
        const newMode = this._mode === 'classic' ? 'claude' : 'classic';
        this.setMode(newMode);
    }

    /**
     * Check if current mode is Claude
     * @returns {boolean}
     */
    isClaudeMode() {
        return this._mode === 'claude';
    }

    /**
     * Check if current mode is Classic
     * @returns {boolean}
     */
    isClassicMode() {
        return this._mode === 'classic';
    }

    /**
     * Get current theme
     * @returns {'light' | 'dark' | 'auto'}
     */
    getTheme() {
        return this._theme;
    }

    /**
     * Set theme (only applies to Claude mode)
     * @param {'light' | 'dark' | 'auto'} theme
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark' && theme !== 'auto') {
            console.error(`Invalid theme: ${theme}. Must be 'light', 'dark', or 'auto'.`);
            return;
        }

        if (this._theme === theme) return;

        this._theme = theme;
        this._saveTheme();
        this._applyTheme();
        this._notifyListeners();
    }

    /**
     * Check if dark theme is active (considering auto mode)
     * @returns {boolean}
     */
    isDarkTheme() {
        if (this._theme === 'dark') return true;
        if (this._theme === 'light') return false;
        // Auto mode: check system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Check if light theme is active
     * @returns {boolean}
     */
    isLightTheme() {
        return !this.isDarkTheme();
    }

    /**
     * Subscribe to mode changes
     * @param {Function} callback - Called with new mode when it changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this._listeners.add(callback);

        // Return unsubscribe function
        return () => {
            this._listeners.delete(callback);
        };
    }

    /**
     * Load mode from localStorage
     * @private
     */
    _loadMode() {
        const saved = localStorage.getItem(UI_MODE_KEY);

        // Default to claude mode to showcase new UI
        return saved === 'classic' ? 'classic' : 'claude';
    }

    /**
     * Save mode to localStorage
     * @private
     */
    _saveMode() {
        localStorage.setItem(UI_MODE_KEY, this._mode);
    }

    /**
     * Load theme from localStorage
     * @private
     */
    _loadTheme() {
        const saved = localStorage.getItem(UI_THEME_KEY);

        // Default to light theme
        if (saved === 'dark' || saved === 'light' || saved === 'auto') {
            return saved;
        }
        return 'light';
    }

    /**
     * Save theme to localStorage
     * @private
     */
    _saveTheme() {
        localStorage.setItem(UI_THEME_KEY, this._theme);
    }

    /**
     * Apply mode to DOM
     * @private
     */
    _applyMode() {
        // Set attribute on root element
        document.documentElement.setAttribute(UI_MODE_ATTRIBUTE, this._mode);

        // Apply/remove theme class
        document.documentElement.classList.toggle('claude-theme', this._mode === 'claude');
        document.documentElement.classList.toggle('classic-theme', this._mode === 'classic');

        // Load appropriate stylesheet
        this._loadStylesheet();

        console.log(`[UIModeService] Applied mode: ${this._mode}`);
    }

    /**
     * Load the appropriate stylesheet for current mode
     * @private
     */
    _loadStylesheet() {
        // Check if claude-tokens stylesheet is already loaded
        const existingLink = document.querySelector('link[data-ui-mode-style]');

        if (this._mode === 'claude') {
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = './ui/styles/claude-tokens.css';
                link.setAttribute('data-ui-mode-style', 'claude');
                document.head.appendChild(link);
            }
        } else {
            // Remove claude stylesheet if in classic mode
            if (existingLink) {
                existingLink.remove();
            }
        }
    }

    /**
     * Apply theme to DOM
     * @private
     */
    _applyTheme() {
        // Set theme attribute on root element
        document.documentElement.setAttribute(UI_THEME_ATTRIBUTE, this._theme);

        console.log(`[UIModeService] Applied theme: ${this._theme}`);
    }

    /**
     * Setup listener for system theme changes (when in auto mode)
     * @private
     */
    _setupSystemThemeListener() {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            // Only react if in auto mode
            if (this._theme === 'auto') {
                console.log(`[UIModeService] System theme changed to: ${e.matches ? 'dark' : 'light'}`);
                this._notifyListeners();
            }
        };

        // Modern API
        if (darkModeQuery.addEventListener) {
            darkModeQuery.addEventListener('change', handleSystemThemeChange);
        } else {
            // Legacy API
            darkModeQuery.addListener(handleSystemThemeChange);
        }
    }

    /**
     * Notify all listeners of mode change
     * @private
     */
    _notifyListeners() {
        this._listeners.forEach(callback => {
            try {
                callback(this._mode);
            } catch (error) {
                console.error('[UIModeService] Error in listener callback:', error);
            }
        });
    }

    /**
     * Reset to default mode (classic)
     */
    reset() {
        this.setMode('classic');
    }
}

// Singleton instance
export const uiModeService = new UIModeService();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.__uiModeService = uiModeService;
}
