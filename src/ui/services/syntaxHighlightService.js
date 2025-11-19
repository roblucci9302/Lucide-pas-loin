/**
 * syntaxHighlightService - Service for managing highlight.js integration
 *
 * Features:
 * - Dynamic loading of highlight.js library
 * - Theme management (light/dark)
 * - Language registration and detection
 * - Initialization helpers
 * - Singleton pattern for global access
 *
 * @example
 * await syntaxHighlightService.initialize();
 * const highlighted = syntaxHighlightService.highlight('const x = 5;', 'javascript');
 */
class SyntaxHighlightService {
    constructor() {
        this.isInitialized = false;
        this.isLoading = false;
        this.currentTheme = 'dark'; // 'light' | 'dark'
        this.hljs = null;
        this.loadPromise = null;
    }

    /**
     * Initialize highlight.js library
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        if (this.isLoading) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this._loadHighlightJS();

        try {
            await this.loadPromise;
            this.isInitialized = true;
            console.log('[SyntaxHighlightService] Initialized successfully');
        } catch (error) {
            console.error('[SyntaxHighlightService] Initialization failed:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load highlight.js library dynamically
     * @private
     * @returns {Promise<void>}
     */
    async _loadHighlightJS() {
        // Check if already loaded
        if (window.hljs) {
            this.hljs = window.hljs;
            return;
        }

        // Load highlight.js from CDN
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            script.async = true;

            script.onload = () => {
                this.hljs = window.hljs;

                // Configure highlight.js
                if (this.hljs) {
                    this.hljs.configure({
                        ignoreUnescapedHTML: true,
                        languages: this._getCommonLanguages(),
                    });
                }

                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load highlight.js'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Get list of commonly used languages for auto-detection
     * @private
     * @returns {string[]}
     */
    _getCommonLanguages() {
        return [
            'javascript',
            'typescript',
            'python',
            'java',
            'cpp',
            'c',
            'csharp',
            'ruby',
            'go',
            'rust',
            'php',
            'swift',
            'kotlin',
            'html',
            'css',
            'scss',
            'json',
            'xml',
            'yaml',
            'markdown',
            'sql',
            'bash',
            'shell',
        ];
    }

    /**
     * Highlight code with specified language
     * @param {string} code - Code to highlight
     * @param {string} language - Language identifier
     * @returns {Object} { value: string, language: string, relevance: number }
     */
    highlight(code, language) {
        if (!this.isInitialized || !this.hljs) {
            console.warn('[SyntaxHighlightService] Not initialized, returning plain code');
            return { value: this._escapeHtml(code), language: '', relevance: 0 };
        }

        try {
            if (language && this.hljs.getLanguage(language)) {
                // Highlight with specified language
                const result = this.hljs.highlight(code, {
                    language: language,
                    ignoreIllegals: true
                });
                return result;
            } else {
                // Auto-detect language
                const result = this.hljs.highlightAuto(code);
                return result;
            }
        } catch (error) {
            console.error('[SyntaxHighlightService] Highlight error:', error);
            return { value: this._escapeHtml(code), language: '', relevance: 0 };
        }
    }

    /**
     * Auto-detect language from code
     * @param {string} code - Code to analyze
     * @returns {Object} { language: string, relevance: number }
     */
    detectLanguage(code) {
        if (!this.isInitialized || !this.hljs) {
            return { language: '', relevance: 0 };
        }

        try {
            const result = this.hljs.highlightAuto(code);
            return {
                language: result.language || '',
                relevance: result.relevance || 0
            };
        } catch (error) {
            console.error('[SyntaxHighlightService] Language detection error:', error);
            return { language: '', relevance: 0 };
        }
    }

    /**
     * Check if a language is supported
     * @param {string} language - Language identifier
     * @returns {boolean}
     */
    isLanguageSupported(language) {
        if (!this.isInitialized || !this.hljs) {
            return false;
        }

        try {
            return !!this.hljs.getLanguage(language);
        } catch (error) {
            return false;
        }
    }

    /**
     * Get list of all registered languages
     * @returns {string[]}
     */
    getRegisteredLanguages() {
        if (!this.isInitialized || !this.hljs) {
            return [];
        }

        try {
            return this.hljs.listLanguages();
        } catch (error) {
            console.error('[SyntaxHighlightService] Error listing languages:', error);
            return [];
        }
    }

    /**
     * Set theme (light or dark)
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('[SyntaxHighlightService] Invalid theme:', theme);
            return;
        }

        this.currentTheme = theme;
        console.log('[SyntaxHighlightService] Theme set to:', theme);

        // Dispatch event for components to update
        window.dispatchEvent(new CustomEvent('syntax-theme-change', {
            detail: { theme }
        }));
    }

    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Map common language aliases to canonical names
     * @param {string} lang - Language alias
     * @returns {string} Canonical language name
     */
    normalizeLanguage(lang) {
        if (!lang) return '';

        const languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'cpp': 'cpp',
            'c++': 'cpp',
            'cs': 'csharp',
            'c#': 'csharp',
            'kt': 'kotlin',
            'yml': 'yaml',
            'md': 'markdown',
            'sh': 'bash',
        };

        const normalized = lang.toLowerCase();
        return languageMap[normalized] || normalized;
    }

    /**
     * Get display name for a language
     * @param {string} lang - Language identifier
     * @returns {string} Display name
     */
    getLanguageDisplayName(lang) {
        if (!lang) return 'Code';

        const displayMap = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'csharp': 'C#',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'php': 'PHP',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'markdown': 'Markdown',
            'sql': 'SQL',
            'bash': 'Bash',
            'shell': 'Shell',
        };

        return displayMap[lang.toLowerCase()] || lang.toUpperCase();
    }

    /**
     * Escape HTML entities
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Check if service is ready
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized && !!this.hljs;
    }

    /**
     * Wait for service to be ready
     * @returns {Promise<void>}
     */
    async waitUntilReady() {
        if (this.isReady()) {
            return;
        }

        if (this.isLoading && this.loadPromise) {
            await this.loadPromise;
            return;
        }

        await this.initialize();
    }
}

// Export singleton instance
export const syntaxHighlightService = new SyntaxHighlightService();

// Auto-initialize on import (optional, can be removed if you want manual control)
if (typeof window !== 'undefined') {
    // Initialize in background
    syntaxHighlightService.initialize().catch(error => {
        console.error('[SyntaxHighlightService] Auto-initialization failed:', error);
    });
}
