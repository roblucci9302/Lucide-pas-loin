import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * MessageActionBar - Action bar for messages (copy, feedback, regenerate, share)
 *
 * Features:
 * - Copy message
 * - Thumbs up/down (feedback)
 * - Regenerate response
 * - Share message
 * - Tooltips on hover
 *
 * @example
 * <message-action-bar
 *   @action-copy=${this.handleCopy}
 *   @action-thumbs-up=${this.handleThumbsUp}
 *   @action-thumbs-down=${this.handleThumbsDown}
 *   @action-regenerate=${this.handleRegenerate}
 *   @action-share=${this.handleShare}
 * ></message-action-bar>
 */
export class MessageActionBar extends LitElement {
    static properties = {
        showTooltip: { type: String, state: true }, // which button's tooltip to show
        copiedState: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        .action-bar {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 8px;
            box-shadow: var(--claude-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
            width: fit-content;
        }

        .action-button {
            position: relative;
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
            font-size: 16px;
        }

        .action-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        .action-button:active {
            background: var(--claude-active-overlay, rgba(0, 0, 0, 0.08));
            transform: scale(0.95);
        }

        .action-button.active {
            color: var(--claude-accent-orange, #D97706);
            background: var(--claude-selected-overlay, rgba(217, 119, 6, 0.08));
        }

        /* Tooltip */
        .tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--claude-text-primary, #1a1a1a);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: var(--claude-font-size-xs, 12px);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
            z-index: 1000;
        }

        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: var(--claude-text-primary, #1a1a1a);
        }

        .action-button:hover .tooltip {
            opacity: 1;
        }

        /* Copied feedback */
        .copied-feedback {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--claude-success-bg, #ECFDF5);
            color: var(--claude-success-text, #065F46);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: var(--claude-font-size-xs, 12px);
            white-space: nowrap;
            animation: fadeInOut 2s ease;
        }

        @keyframes fadeInOut {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(5px);
            }
            10%, 90% {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateX(-50%) translateY(-5px);
            }
        }

        /* Divider */
        .divider {
            width: 1px;
            height: 20px;
            background: var(--claude-border-subtle, #e5e5e0);
            margin: 0 4px;
        }

        /* Icon styling */
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;

    constructor() {
        super();
        this.showTooltip = '';
        this.copiedState = false;
    }

    _handleCopy() {
        this.copiedState = true;
        this.dispatchEvent(new CustomEvent('action-copy', {
            bubbles: true,
            composed: true
        }));

        setTimeout(() => {
            this.copiedState = false;
        }, 2000);
    }

    _handleThumbsUp() {
        this.dispatchEvent(new CustomEvent('action-thumbs-up', {
            bubbles: true,
            composed: true
        }));
    }

    _handleThumbsDown() {
        this.dispatchEvent(new CustomEvent('action-thumbs-down', {
            bubbles: true,
            composed: true
        }));
    }

    _handleRegenerate() {
        this.dispatchEvent(new CustomEvent('action-regenerate', {
            bubbles: true,
            composed: true
        }));
    }

    _handleShare() {
        this.dispatchEvent(new CustomEvent('action-share', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="action-bar">
                <!-- Copy button -->
                <button
                    class="action-button"
                    @click="${this._handleCopy}"
                    aria-label="Copier le message"
                >
                    <span class="icon">📋</span>
                    <span class="tooltip">Copier</span>
                    ${this.copiedState ? html`
                        <span class="copied-feedback">✓ Copié !</span>
                    ` : ''}
                </button>

                <div class="divider"></div>

                <!-- Thumbs up -->
                <button
                    class="action-button"
                    @click="${this._handleThumbsUp}"
                    aria-label="Bonne réponse"
                >
                    <span class="icon">👍</span>
                    <span class="tooltip">Bonne réponse</span>
                </button>

                <!-- Thumbs down -->
                <button
                    class="action-button"
                    @click="${this._handleThumbsDown}"
                    aria-label="Mauvaise réponse"
                >
                    <span class="icon">👎</span>
                    <span class="tooltip">Mauvaise réponse</span>
                </button>

                <div class="divider"></div>

                <!-- Regenerate -->
                <button
                    class="action-button"
                    @click="${this._handleRegenerate}"
                    aria-label="Régénérer la réponse"
                >
                    <span class="icon">🔄</span>
                    <span class="tooltip">Régénérer</span>
                </button>

                <!-- Share -->
                <button
                    class="action-button"
                    @click="${this._handleShare}"
                    aria-label="Partager"
                >
                    <span class="icon">↗️</span>
                    <span class="tooltip">Partager</span>
                </button>
            </div>
        `;
    }
}

customElements.define('message-action-bar', MessageActionBar);
