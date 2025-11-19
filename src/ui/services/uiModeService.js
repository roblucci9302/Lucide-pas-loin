/**
 * UI Mode Service
 * Manages switching between Classic and Claude UI modes
 *
 * Modes:
 * - classic: Original Lucide UI (dark glass effect)
 * - claude: Claude.ai-inspired UI (light beige theme)
 */

const UI_MODE_KEY = 'lucide-ui-mode';
const UI_MODE_ATTRIBUTE = 'data-ui-mode';

export class UIModeService {
    constructor() {
        this._mode = this._loadMode();
        this._listeners = new Set();
        this._applyMode();
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

        // Default to classic mode for now (can be changed later)
        return saved === 'claude' ? 'claude' : 'classic';
    }

    /**
     * Save mode to localStorage
     * @private
     */
    _saveMode() {
        localStorage.setItem(UI_MODE_KEY, this._mode);
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
