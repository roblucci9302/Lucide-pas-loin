import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeAvatar.js';
import './MessageActions.js';

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
        messageId: { type: String },
        content: { type: String },
        timestamp: { type: String },
        userName: { type: String },
        userAvatar: { type: String },
        showAvatar: { type: Boolean },
        showActions: { type: Boolean },
        isEditing: { type: Boolean, state: true },
        editValue: { type: String, state: true },
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

        /* Edit Mode */
        .edit-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .edit-textarea {
            width: 100%;
            min-height: 80px;
            padding: 12px;
            font-family: inherit;
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            border: 2px solid var(--claude-accent-orange, #D97706);
            border-radius: var(--claude-message-radius, 16px);
            background: var(--claude-bg-secondary, #FFFFFF);
            color: var(--claude-text-primary, #1a1a1a);
            resize: vertical;
            outline: none;
        }

        .edit-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .edit-button {
            padding: 6px 16px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .edit-button.save {
            background: var(--claude-accent-orange, #D97706);
            color: white;
        }

        .edit-button.save:hover {
            background: var(--claude-accent-orange-dark, #B45309);
        }

        .edit-button.cancel {
            background: var(--claude-bg-tertiary, #FAFAF8);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .edit-button.cancel:hover {
            background: var(--claude-border-subtle, #e5e5e0);
        }

        /* Actions */
        .message-actions {
            display: flex;
            justify-content: flex-end;
            padding: 4px;
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
        this.messageId = '';
        this.content = '';
        this.timestamp = '';
        this.userName = 'You';
        this.userAvatar = '';
        this.showAvatar = false;
        this.showActions = true;
        this.isEditing = false;
        this.editValue = '';
    }

    _handleMessageAction(e) {
        const { action, messageId } = e.detail;

        if (action === 'edit') {
            this.isEditing = true;
            this.editValue = this.content;
        } else {
            // Forward other actions to parent
            this.dispatchEvent(new CustomEvent('message-action', {
                detail: e.detail,
                bubbles: true,
                composed: true,
            }));
        }
    }

    _handleSaveEdit() {
        if (!this.editValue.trim()) return;

        this.dispatchEvent(new CustomEvent('message-action', {
            detail: {
                action: 'edit-save',
                messageId: this.messageId,
                content: this.editValue,
            },
            bubbles: true,
            composed: true,
        }));

        this.isEditing = false;
    }

    _handleCancelEdit() {
        this.isEditing = false;
        this.editValue = '';
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
                    ${this.isEditing ? html`
                        <!-- Edit Mode -->
                        <div class="edit-container">
                            <textarea
                                class="edit-textarea"
                                .value=${this.editValue}
                                @input=${(e) => { this.editValue = e.target.value; }}
                                @keydown=${(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        e.preventDefault();
                                        this._handleSaveEdit();
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        this._handleCancelEdit();
                                    }
                                }}
                            ></textarea>
                            <div class="edit-actions">
                                <button
                                    class="edit-button cancel"
                                    @click=${this._handleCancelEdit}
                                >
                                    Annuler
                                </button>
                                <button
                                    class="edit-button save"
                                    @click=${this._handleSaveEdit}
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    ` : html`
                        <!-- View Mode -->
                        <div class="message-content">
                            ${this.content}
                        </div>

                        <!-- Actions -->
                        ${this.showActions ? html`
                            <div class="message-actions">
                                <message-actions
                                    role="user"
                                    .messageId=${this.messageId}
                                    .content=${this.content}
                                    @action=${this._handleMessageAction}
                                ></message-actions>
                            </div>
                        ` : ''}

                        ${this.timestamp ? html`
                            <div class="message-meta">
                                <span class="timestamp">${this._formatTimestamp(this.timestamp)}</span>
                            </div>
                        ` : ''}
                    `}
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
