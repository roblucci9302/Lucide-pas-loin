import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeAvatar.js';

/**
 * MessageUser - User message component with Claude.ai styling
 *
 * Features:
 * - Aligned right
 * - Background color (#F5F5F0)
 * - Rounded corners (16px)
 * - Optional avatar
 * - Timestamp
 *
 * @example
 * <message-user
 *   .content=${this.message.content}
 *   .timestamp=${this.message.created_at}
 *   .userName=${"John"}
 * ></message-user>
 */
export class MessageUser extends LitElement {
    static properties = {
        content: { type: String },
        timestamp: { type: String },
        userName: { type: String },
        userAvatar: { type: String },
        showAvatar: { type: Boolean },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .message-wrapper {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            width: 100%;
        }

        .message-container {
            display: flex;
            flex-direction: column;
            max-width: 70%;
            gap: 6px;
        }

        .message-content {
            background: var(--claude-message-user-bg, #F5F5F0);
            border-radius: var(--claude-message-radius, 16px);
            padding: var(--claude-message-padding, 16px);
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
            white-space: pre-wrap;
            word-wrap: break-word;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .message-content:hover {
            background: #ebebeb;
        }

        .message-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            padding: 0 4px;
        }

        .timestamp {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .user-name {
            font-size: var(--claude-font-size-xs, 12px);
            font-weight: 500;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Avatar */
        .avatar-wrapper {
            flex-shrink: 0;
            align-self: flex-end;
            margin-bottom: 4px;
        }

        /* Animation */
        @keyframes messageEnter {
            from {
                opacity: 0;
                transform: translateY(10px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        :host(.entering) .message-wrapper {
            animation: messageEnter var(--claude-transition-slow, 300ms) var(--claude-easing-smooth, ease);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .message-container {
                max-width: 85%;
            }

            .message-content {
                font-size: 15px;
                padding: 12px;
            }
        }
    `;

    constructor() {
        super();
        this.content = '';
        this.timestamp = '';
        this.userName = 'You';
        this.userAvatar = '';
        this.showAvatar = false;
    }

    firstUpdated() {
        // Add entering animation
        this.classList.add('entering');
        setTimeout(() => this.classList.remove('entering'), 300);
    }

    _formatTimestamp(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins}min`;

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    render() {
        return html`
            <div class="message-wrapper">
                <div class="message-container">
                    <div class="message-content">
                        ${this.content}
                    </div>
                    ${this.timestamp ? html`
                        <div class="message-meta">
                            <span class="timestamp">${this._formatTimestamp(this.timestamp)}</span>
                        </div>
                    ` : ''}
                </div>

                ${this.showAvatar ? html`
                    <div class="avatar-wrapper">
                        <claude-avatar
                            type="user"
                            size="sm"
                            initials="${this.userName.charAt(0).toUpperCase()}"
                            .imageUrl="${this.userAvatar}"
                        ></claude-avatar>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('message-user', MessageUser);
