import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { themeService } from '../../services/themeService.js';

/**
 * ThemeSelector - Theme selection component for settings
 *
 * Features:
 * - Select between light, dark, auto
 * - Visual preview of each theme
 * - Shows current selection
 * - System preference indicator for auto
 *
 * @example
 * <theme-selector></theme-selector>
 */
export class ThemeSelector extends LitElement {
    static properties = {
        _currentTheme: { type: String, state: true },
        _systemPreference: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        .theme-selector {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .section-title {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
            margin-bottom: 4px;
        }

        .theme-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
        }

        .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 2px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 12px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .theme-option:hover {
            border-color: var(--claude-border-normal, #d4d4cf);
            background: var(--claude-bg-tertiary, #FAFAF8);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .theme-option.active {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .theme-option.active:hover {
            border-color: var(--claude-accent-orange-dark, #B45309);
        }

        .theme-icon {
            font-size: 32px;
        }

        .theme-name {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .theme-description {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            text-align: center;
        }

        .active-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-accent-orange-dark, #B45309);
            font-weight: 600;
        }

        /* Preview boxes */
        .theme-preview {
            display: flex;
            gap: 4px;
            margin-top: 4px;
        }

        .preview-box {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .preview-light-bg {
            background: #FFFFFF;
        }

        .preview-light-text {
            background: #1a1a1a;
        }

        .preview-dark-bg {
            background: #1a1a1a;
        }

        .preview-dark-text {
            background: #e8e8e8;
        }

        /* System preference note */
        .system-note {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .system-note-icon {
            font-size: 16px;
        }
    `;

    constructor() {
        super();
        this._currentTheme = themeService.getTheme();
        this._systemPreference = themeService.getSystemPreference();
        this._unsubscribe = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._unsubscribe = themeService.subscribe((theme, appliedTheme) => {
            this._currentTheme = theme;
            this._systemPreference = themeService.getSystemPreference();
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _handleThemeSelect(themeId) {
        themeService.setTheme(themeId);
    }

    _getThemeDescription(themeId) {
        const descriptions = {
            light: 'Interface claire',
            dark: 'Interface sombre',
            auto: `Suit le système (${this._systemPreference === 'dark' ? 'sombre' : 'clair'})`,
        };
        return descriptions[themeId] || '';
    }

    _renderThemePreview(themeId) {
        if (themeId === 'light') {
            return html`
                <div class="theme-preview">
                    <div class="preview-box preview-light-bg"></div>
                    <div class="preview-box preview-light-text"></div>
                </div>
            `;
        } else if (themeId === 'dark') {
            return html`
                <div class="theme-preview">
                    <div class="preview-box preview-dark-bg"></div>
                    <div class="preview-box preview-dark-text"></div>
                </div>
            `;
        } else {
            // Auto - show both
            return html`
                <div class="theme-preview">
                    <div class="preview-box preview-light-bg"></div>
                    <div class="preview-box preview-dark-bg"></div>
                </div>
            `;
        }
    }

    render() {
        const themes = themeService.getAvailableThemes();

        return html`
            <div class="theme-selector">
                <div class="section-title">Apparence</div>

                <div class="theme-options">
                    ${themes.map(theme => html`
                        <div
                            class="theme-option ${this._currentTheme === theme.id ? 'active' : ''}"
                            @click="${() => this._handleThemeSelect(theme.id)}"
                        >
                            <div class="theme-icon">${theme.icon}</div>
                            <div class="theme-name">${theme.name}</div>
                            ${this._renderThemePreview(theme.id)}
                            <div class="theme-description">
                                ${this._getThemeDescription(theme.id)}
                            </div>
                            ${this._currentTheme === theme.id ? html`
                                <div class="active-indicator">
                                    <span>✓</span>
                                    <span>Actif</span>
                                </div>
                            ` : ''}
                        </div>
                    `)}
                </div>

                ${this._currentTheme === 'auto' ? html`
                    <div class="system-note">
                        <span class="system-note-icon">ℹ️</span>
                        <span>
                            Le thème change automatiquement selon les préférences de votre système.
                            Actuellement: <strong>${this._systemPreference === 'dark' ? 'Sombre' : 'Clair'}</strong>
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('theme-selector', ThemeSelector);
