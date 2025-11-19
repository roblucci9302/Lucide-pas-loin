import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ClaudeAvatar - Avatar component for user and assistant
 *
 * Types:
 * - assistant: Claude/Lucide avatar (orange square)
 * - user: User avatar (gray circle or initials)
 *
 * @example
 * <claude-avatar type="assistant"></claude-avatar>
 * <claude-avatar type="user" initials="AB"></claude-avatar>
 */
export class ClaudeAvatar extends LitElement {
    static properties = {
        type: { type: String }, // 'assistant' | 'user'
        size: { type: String }, // 'sm' | 'md' | 'lg'
        initials: { type: String },
        imageUrl: { type: String },
        color: { type: String },
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        .avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            user-select: none;
            flex-shrink: 0;
            overflow: hidden;
        }

        /* Sizes */
        .size-sm {
            width: var(--claude-avatar-sm, 24px);
            height: var(--claude-avatar-sm, 24px);
            font-size: 11px;
        }

        .size-md {
            width: var(--claude-avatar-md, 32px);
            height: var(--claude-avatar-md, 32px);
            font-size: 14px;
        }

        .size-lg {
            width: var(--claude-avatar-lg, 40px);
            height: var(--claude-avatar-lg, 40px);
            font-size: 16px;
        }

        /* Types */
        .type-assistant {
            background: var(--claude-accent-orange, #D97706);
            color: white;
            border-radius: 8px;
        }

        .type-user {
            background: var(--claude-text-tertiary, #9b9b9b);
            color: white;
            border-radius: 50%;
        }

        /* Custom color */
        .custom-color {
            background: var(--avatar-custom-color);
        }

        /* Image avatar */
        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Assistant icon (Lucide logo placeholder) */
        .assistant-icon {
            width: 60%;
            height: 60%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .assistant-icon svg {
            width: 100%;
            height: 100%;
        }
    `;

    constructor() {
        super();
        this.type = 'assistant';
        this.size = 'md';
        this.initials = '';
        this.imageUrl = '';
        this.color = '';
    }

    _getInitials() {
        if (this.initials) return this.initials;
        if (this.type === 'assistant') return 'L'; // L for Lucide
        return '?';
    }

    _renderAssistantIcon() {
        // Simplified Lucide icon (you can replace with actual SVG logo)
        return html`
            <div class="assistant-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.97c0 4.52-3.09 8.75-7.5 9.93-.29-.08-.58-.16-.86-.25A8.962 8.962 0 0112 21c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5c0 .84.21 1.63.58 2.32A9.914 9.914 0 014 14.75V7.78l8-3.6z"/>
                </svg>
            </div>
        `;
    }

    render() {
        const classes = [
            'avatar',
            `type-${this.type}`,
            `size-${this.size}`,
            this.color ? 'custom-color' : ''
        ].filter(Boolean).join(' ');

        const customStyle = this.color ? `--avatar-custom-color: ${this.color}` : '';

        return html`
            <div class="${classes}" style="${customStyle}">
                ${this.imageUrl ? html`
                    <img src="${this.imageUrl}" alt="Avatar" />
                ` : this.type === 'assistant' ? this._renderAssistantIcon() : html`
                    <span>${this._getInitials()}</span>
                `}
            </div>
        `;
    }
}

customElements.define('claude-avatar', ClaudeAvatar);
