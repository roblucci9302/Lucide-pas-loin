import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * LoadingSkeleton - Animated skeleton loader
 *
 * Features:
 * - Shimmer animation
 * - Multiple variants (text, avatar, card, message)
 * - Customizable dimensions
 * - Accessibility friendly
 *
 * @example
 * <loading-skeleton variant="message"></loading-skeleton>
 */
export class LoadingSkeleton extends LitElement {
    static properties = {
        variant: { type: String }, // 'text' | 'avatar' | 'card' | 'message' | 'conversation'
        width: { type: String },
        height: { type: String },
        count: { type: Number },
    };

    static styles = css`
        :host {
            display: block;
        }

        /* Base skeleton */
        .skeleton {
            background: linear-gradient(
                90deg,
                var(--claude-bg-tertiary, #FAFAF8) 0%,
                var(--claude-border-subtle, #e5e5e0) 50%,
                var(--claude-bg-tertiary, #FAFAF8) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            border-radius: 8px;
        }

        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }

        /* Variants */
        .skeleton-text {
            height: 16px;
            margin-bottom: 8px;
        }

        .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }

        .skeleton-card {
            height: 120px;
            border-radius: 12px;
        }

        /* Message skeleton */
        .skeleton-message {
            display: flex;
            gap: 12px;
            padding: 16px 0;
        }

        .skeleton-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .skeleton-message-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .skeleton-message-line {
            height: 16px;
            border-radius: 4px;
        }

        .skeleton-message-line:last-child {
            width: 70%;
        }

        /* Conversation skeleton */
        .skeleton-conversation {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 4px;
        }

        .skeleton-conversation-avatar {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            flex-shrink: 0;
        }

        .skeleton-conversation-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .skeleton-conversation-title {
            height: 14px;
            width: 60%;
            border-radius: 4px;
        }

        .skeleton-conversation-preview {
            height: 12px;
            width: 80%;
            border-radius: 4px;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            :host([data-theme="dark"]) .skeleton {
                background: linear-gradient(
                    90deg,
                    var(--claude-bg-secondary, #2d2d2d) 0%,
                    var(--claude-bg-tertiary, #3e3e3e) 50%,
                    var(--claude-bg-secondary, #2d2d2d) 100%
                );
            }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            .skeleton {
                animation: none;
            }
        }
    `;

    constructor() {
        super();
        this.variant = 'text';
        this.width = '100%';
        this.height = '16px';
        this.count = 1;
    }

    _renderText() {
        return html`
            ${Array(this.count).fill(0).map(() => html`
                <div
                    class="skeleton skeleton-text"
                    style="width: ${this.width}; height: ${this.height}"
                ></div>
            `)}
        `;
    }

    _renderAvatar() {
        return html`
            <div class="skeleton skeleton-avatar"></div>
        `;
    }

    _renderCard() {
        return html`
            <div class="skeleton skeleton-card"></div>
        `;
    }

    _renderMessage() {
        return html`
            ${Array(this.count).fill(0).map(() => html`
                <div class="skeleton-message">
                    <div class="skeleton skeleton-message-avatar"></div>
                    <div class="skeleton-message-content">
                        <div class="skeleton skeleton-message-line"></div>
                        <div class="skeleton skeleton-message-line"></div>
                        <div class="skeleton skeleton-message-line"></div>
                    </div>
                </div>
            `)}
        `;
    }

    _renderConversation() {
        return html`
            ${Array(this.count).fill(0).map(() => html`
                <div class="skeleton-conversation">
                    <div class="skeleton skeleton-conversation-avatar"></div>
                    <div class="skeleton-conversation-content">
                        <div class="skeleton skeleton-conversation-title"></div>
                        <div class="skeleton skeleton-conversation-preview"></div>
                    </div>
                </div>
            `)}
        `;
    }

    render() {
        switch (this.variant) {
            case 'avatar':
                return this._renderAvatar();
            case 'card':
                return this._renderCard();
            case 'message':
                return this._renderMessage();
            case 'conversation':
                return this._renderConversation();
            case 'text':
            default:
                return this._renderText();
        }
    }
}

customElements.define('loading-skeleton', LoadingSkeleton);
