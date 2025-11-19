import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../theme/ThemeToggle.js';

/**
 * MobileHeader - Mobile header with hamburger menu
 *
 * Features:
 * - Hamburger menu button
 * - App logo/title
 * - Quick actions (theme toggle, search)
 * - Fixed positioning
 *
 * @example
 * <mobile-header
 *   ?sidebarOpen=${this.sidebarOpen}
 *   @toggle-sidebar=${this.handleToggle}
 * ></mobile-header>
 */
export class MobileHeader extends LitElement {
    static properties = {
        sidebarOpen: { type: Boolean },
        title: { type: String },
    };

    static styles = css`
        :host {
            display: none;
        }

        /* Show on mobile */
        @media (max-width: 768px) {
            :host {
                display: block;
            }
        }

        .header {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: var(--claude-bg-primary, #FFFFFF);
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            display: flex;
            align-items: center;
            padding: 0 16px;
            gap: 12px;
            z-index: var(--claude-z-header, 900);
        }

        .hamburger-button {
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: var(--claude-text-primary, #1a1a1a);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            position: relative;
            flex-shrink: 0;
        }

        .hamburger-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .hamburger-button:active {
            transform: scale(0.95);
        }

        /* Hamburger icon */
        .hamburger-icon {
            width: 20px;
            height: 20px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
        }

        .hamburger-line {
            width: 100%;
            height: 2px;
            background: currentColor;
            border-radius: 2px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        /* Animated X when open */
        .hamburger-button.open .hamburger-line:nth-child(1) {
            transform: translateY(6px) rotate(45deg);
        }

        .hamburger-button.open .hamburger-line:nth-child(2) {
            opacity: 0;
        }

        .hamburger-button.open .hamburger-line:nth-child(3) {
            transform: translateY(-6px) rotate(-45deg);
        }

        /* Title */
        .header-title {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }

        .logo {
            width: 24px;
            height: 24px;
            background: var(--claude-accent-orange, #D97706);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }

        .title-text {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Actions */
        .header-actions {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .action-button {
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 18px;
        }

        .action-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        .action-button:active {
            transform: scale(0.95);
        }
    `;

    constructor() {
        super();
        this.sidebarOpen = false;
        this.title = 'Lucide';
    }

    _handleToggleSidebar() {
        this.dispatchEvent(new CustomEvent('toggle-sidebar', {
            bubbles: true,
            composed: true,
        }));
    }

    _handleSearchOpen() {
        this.dispatchEvent(new CustomEvent('search-open', {
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
            <div class="header">
                <!-- Hamburger menu -->
                <button
                    class="hamburger-button ${this.sidebarOpen ? 'open' : ''}"
                    @click="${this._handleToggleSidebar}"
                    aria-label="${this.sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}"
                >
                    <div class="hamburger-icon">
                        <div class="hamburger-line"></div>
                        <div class="hamburger-line"></div>
                        <div class="hamburger-line"></div>
                    </div>
                </button>

                <!-- Title -->
                <div class="header-title">
                    <div class="logo">L</div>
                    <div class="title-text">${this.title}</div>
                </div>

                <!-- Actions -->
                <div class="header-actions">
                    <button
                        class="action-button"
                        @click="${this._handleSearchOpen}"
                        aria-label="Rechercher"
                        title="Rechercher"
                    >
                        🔍
                    </button>

                    <theme-toggle></theme-toggle>
                </div>
            </div>
        `;
    }
}

customElements.define('mobile-header', MobileHeader);
