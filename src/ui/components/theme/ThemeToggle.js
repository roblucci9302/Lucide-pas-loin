import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { themeService } from '../../services/themeService.js';

/**
 * ThemeToggle - Quick theme toggle button
 *
 * Features:
 * - Quick toggle between light/dark
 * - Shows current theme icon
 * - Smooth transition
 * - Tooltip
 *
 * @example
 * <theme-toggle></theme-toggle>
 */
export class ThemeToggle extends LitElement {
    static properties = {
        _currentTheme: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        .toggle-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            border-radius: 8px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 20px;
            position: relative;
        }

        .toggle-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
            transform: scale(1.05);
        }

        .toggle-button:active {
            transform: scale(0.95);
        }

        /* Tooltip */
        .tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--claude-text-primary, #1a1a1a);
            color: var(--claude-bg-primary, #FFFFFF);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: var(--claude-font-size-xs, 12px);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
            z-index: 1000;
        }

        .toggle-button:hover .tooltip {
            opacity: 1;
        }

        /* Animation */
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        .toggle-button.animating {
            animation: rotate 0.5s ease;
        }
    `;

    constructor() {
        super();
        this._currentTheme = themeService.getAppliedTheme();
        this._unsubscribe = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._unsubscribe = themeService.subscribe((theme, appliedTheme) => {
            this._currentTheme = appliedTheme;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _handleToggle() {
        const button = this.shadowRoot.querySelector('.toggle-button');
        button.classList.add('animating');
        setTimeout(() => {
            button.classList.remove('animating');
        }, 500);

        themeService.toggle();
    }

    _getIcon() {
        return this._currentTheme === 'dark' ? '🌙' : '☀️';
    }

    _getTooltip() {
        return this._currentTheme === 'dark' ? 'Mode clair' : 'Mode sombre';
    }

    render() {
        return html`
            <button
                class="toggle-button"
                @click="${this._handleToggle}"
                aria-label="${this._getTooltip()}"
                title="${this._getTooltip()}"
            >
                ${this._getIcon()}
                <span class="tooltip">${this._getTooltip()}</span>
            </button>
        `;
    }
}

customElements.define('theme-toggle', ThemeToggle);
