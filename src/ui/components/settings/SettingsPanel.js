import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { uiModeService } from '../../services/uiModeService.js';
import '../base/ClaudeButton.js';

/**
 * SettingsPanel - Settings dialog for UI mode and theme preferences
 *
 * Features:
 * - Toggle between Classic and Claude UI modes
 * - Select theme (Light/Dark/Auto)
 * - Keyboard shortcuts reference
 * - Preferences display
 *
 * @example
 * <settings-panel
 *   ?open=${this.settingsOpen}
 *   @close=${this.handleClose}
 * ></settings-panel>
 */
export class SettingsPanel extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        currentMode: { type: String, state: true },
        currentTheme: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-modal, 1000);
            align-items: center;
            justify-content: center;
        }

        :host([open]) {
            display: flex;
        }

        /* Overlay */
        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Modal */
        .modal {
            position: relative;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 16px;
            box-shadow: var(--claude-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.15));
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        /* Header */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .header-title {
            font-size: var(--claude-font-size-xl, 24px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .close-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 20px;
        }

        .close-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Content */
        .content {
            padding: 24px;
            overflow-y: auto;
            max-height: calc(80vh - 100px);
        }

        /* Section */
        .section {
            margin-bottom: 32px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 16px;
        }

        .section-description {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
            margin-bottom: 16px;
            line-height: 1.5;
        }

        /* Mode Toggle */
        .mode-toggle {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .mode-option {
            padding: 16px;
            border: 2px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 12px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            background: transparent;
            text-align: left;
        }

        .mode-option:hover {
            border-color: var(--claude-border-normal, #d4d4cf);
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.02));
        }

        .mode-option.active {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .mode-option-title {
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 4px;
            font-size: var(--claude-font-size-base, 16px);
        }

        .mode-option-desc {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Theme Selector */
        .theme-selector {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .theme-option {
            padding: 16px 12px;
            border: 2px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 12px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            background: transparent;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .theme-option:hover {
            border-color: var(--claude-border-normal, #d4d4cf);
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.02));
        }

        .theme-option.active {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .theme-icon {
            font-size: 24px;
        }

        .theme-label {
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
            font-size: var(--claude-font-size-sm, 13px);
        }

        /* Shortcuts */
        .shortcuts-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 8px;
        }

        .shortcut-label {
            font-size: var(--claude-font-size-base, 16px);
            color: var(--claude-text-primary, #1a1a1a);
        }

        .shortcut-keys {
            display: flex;
            gap: 4px;
        }

        .key {
            padding: 4px 8px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 4px;
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Mobile */
        @media (max-width: 768px) {
            .modal {
                width: 95%;
                max-height: 90vh;
            }

            .mode-toggle {
                grid-template-columns: 1fr;
            }

            .theme-selector {
                grid-template-columns: 1fr;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.currentMode = uiModeService.getMode();
        this.currentTheme = uiModeService.getTheme();
        this._unsubscribe = null;
    }

    connectedCallback() {
        super.connectedCallback();
        // Subscribe to mode/theme changes
        this._unsubscribe = uiModeService.subscribe(() => {
            this.currentMode = uiModeService.getMode();
            this.currentTheme = uiModeService.getTheme();
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _handleClose() {
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true
        }));
    }

    _handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            this._handleClose();
        }
    }

    _handleModeChange(mode) {
        uiModeService.setMode(mode);
        this.currentMode = mode;
    }

    _handleThemeChange(theme) {
        uiModeService.setTheme(theme);
        this.currentTheme = theme;
    }

    _isMac() {
        return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
    }

    render() {
        const cmdKey = this._isMac() ? '⌘' : 'Ctrl';

        return html`
            <div class="overlay" @click="${this._handleOverlayClick}">
                <div class="modal">
                    <!-- Header -->
                    <div class="header">
                        <div class="header-title">⚙️ Paramètres</div>
                        <button class="close-button" @click="${this._handleClose}">
                            ✕
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <!-- UI Mode Section -->
                        <div class="section">
                            <div class="section-title">Mode d'interface</div>
                            <div class="section-description">
                                Choisissez le style d'interface que vous préférez
                            </div>
                            <div class="mode-toggle">
                                <button
                                    class="mode-option ${this.currentMode === 'classic' ? 'active' : ''}"
                                    @click="${() => this._handleModeChange('classic')}"
                                >
                                    <div class="mode-option-title">🎨 Classic</div>
                                    <div class="mode-option-desc">Interface Lucide originale</div>
                                </button>
                                <button
                                    class="mode-option ${this.currentMode === 'claude' ? 'active' : ''}"
                                    @click="${() => this._handleModeChange('claude')}"
                                >
                                    <div class="mode-option-title">✨ Claude</div>
                                    <div class="mode-option-desc">Interface Claude.ai moderne</div>
                                </button>
                            </div>
                        </div>

                        <!-- Theme Section (only for Claude mode) -->
                        ${this.currentMode === 'claude' ? html`
                            <div class="section">
                                <div class="section-title">Thème</div>
                                <div class="section-description">
                                    Sélectionnez votre préférence de couleur
                                </div>
                                <div class="theme-selector">
                                    <button
                                        class="theme-option ${this.currentTheme === 'light' ? 'active' : ''}"
                                        @click="${() => this._handleThemeChange('light')}"
                                    >
                                        <div class="theme-icon">☀️</div>
                                        <div class="theme-label">Clair</div>
                                    </button>
                                    <button
                                        class="theme-option ${this.currentTheme === 'dark' ? 'active' : ''}"
                                        @click="${() => this._handleThemeChange('dark')}"
                                    >
                                        <div class="theme-icon">🌙</div>
                                        <div class="theme-label">Sombre</div>
                                    </button>
                                    <button
                                        class="theme-option ${this.currentTheme === 'auto' ? 'active' : ''}"
                                        @click="${() => this._handleThemeChange('auto')}"
                                    >
                                        <div class="theme-icon">🔄</div>
                                        <div class="theme-label">Auto</div>
                                    </button>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Keyboard Shortcuts Section -->
                        <div class="section">
                            <div class="section-title">Raccourcis clavier</div>
                            <div class="shortcuts-list">
                                <div class="shortcut-item">
                                    <div class="shortcut-label">Nouvelle conversation</div>
                                    <div class="shortcut-keys">
                                        <span class="key">${cmdKey}</span>
                                        <span class="key">K</span>
                                    </div>
                                </div>
                                <div class="shortcut-item">
                                    <div class="shortcut-label">Paramètres</div>
                                    <div class="shortcut-keys">
                                        <span class="key">${cmdKey}</span>
                                        <span class="key">,</span>
                                    </div>
                                </div>
                                <div class="shortcut-item">
                                    <div class="shortcut-label">Fermer panneau</div>
                                    <div class="shortcut-keys">
                                        <span class="key">Esc</span>
                                    </div>
                                </div>
                                <div class="shortcut-item">
                                    <div class="shortcut-label">Envoyer message</div>
                                    <div class="shortcut-keys">
                                        <span class="key">Enter</span>
                                    </div>
                                </div>
                                <div class="shortcut-item">
                                    <div class="shortcut-label">Nouvelle ligne</div>
                                    <div class="shortcut-keys">
                                        <span class="key">Shift</span>
                                        <span class="key">Enter</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('settings-panel', SettingsPanel);
