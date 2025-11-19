import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * MessageActions - Action buttons for messages (copy, edit, regenerate, etc.)
 *
 * Features:
 * - Copy to clipboard
 * - Edit message (user only)
 * - Regenerate response (assistant only)
 * - Reactions (thumbs up/down)
 * - Delete message
 *
 * @example
 * <message-actions
 *   role="user"
 *   .messageId=${message.id}
 *   .content=${message.content}
 *   @action=${this.handleAction}
 * ></message-actions>
 */
export class MessageActions extends LitElement {
    static properties = {
        role: { type: String }, // 'user' or 'assistant'
        messageId: { type: String },
        content: { type: String },
        reaction: { type: String }, // 'up' | 'down' | null
        isEditing: { type: Boolean },
        showMenu: { type: Boolean, state: true },
        _deleteConfirm: { type: Boolean, state: true }, // Confirmation state for delete
    };

    static styles = css`
        :host {
            display: block;
        }

        .actions-container {
            display: flex;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
        }

        :host(:hover) .actions-container,
        .actions-container:focus-within,
        .actions-container.visible {
            opacity: 1;
        }

        .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--claude-text-tertiary, #9b9b9b);
            cursor: pointer;
            border-radius: 6px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 16px;
        }

        .action-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .action-button:active {
            transform: scale(0.95);
        }

        .action-button.primary {
            color: var(--claude-accent-orange, #D97706);
        }

        .action-button.primary:hover {
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .action-button.danger {
            color: var(--claude-error, #DC2626);
            background: var(--claude-error-subtle, #FEE2E2);
            font-size: var(--claude-font-size-xs, 11px);
            font-weight: 600;
            width: auto;
            padding: 0 8px;
        }

        .action-button.danger:hover {
            background: var(--claude-error, #DC2626);
            color: white;
        }

        /* Reaction Buttons */
        .reaction-group {
            display: flex;
            gap: 2px;
            padding: 2px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 8px;
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .reaction-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 6px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 14px;
        }

        .reaction-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            transform: scale(1.1);
        }

        .reaction-button.active {
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .reaction-button.active.up {
            color: var(--claude-success, #10B981);
        }

        .reaction-button.active.down {
            color: var(--claude-error, #EF4444);
        }

        /* Tooltip */
        .action-button[title] {
            position: relative;
        }

        /* Copied feedback */
        .copy-feedback {
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 8px;
            background: var(--claude-text-primary, #1a1a1a);
            color: white;
            font-size: var(--claude-font-size-xs, 11px);
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            animation: fadeInOut 1.5s ease;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(4px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-4px); }
        }

        /* Mobile */
        @media (max-width: 768px) {
            .actions-container {
                opacity: 1; /* Always visible on mobile */
            }

            .action-button {
                width: 36px;
                height: 36px;
            }
        }
    `;

    constructor() {
        super();
        this.role = 'user';
        this.messageId = '';
        this.content = '';
        this.reaction = null;
        this.isEditing = false;
        this.showMenu = false;
        this._showCopyFeedback = false;
        this._deleteConfirm = false;
        this._deleteTimeout = null;
    }

    _handleCopy() {
        if (!this.content) return;

        navigator.clipboard.writeText(this.content).then(() => {
            // Show feedback
            this._showCopyFeedback = true;
            this.requestUpdate();

            // Hide feedback after animation
            setTimeout(() => {
                this._showCopyFeedback = false;
                this.requestUpdate();
            }, 1500);

            // Dispatch event
            this._dispatchAction('copy');
        }).catch(err => {
            console.error('[MessageActions] Failed to copy:', err);
        });
    }

    _handleEdit() {
        this._dispatchAction('edit');
    }

    _handleRegenerate() {
        this._dispatchAction('regenerate');
    }

    _handleDelete() {
        if (!this._deleteConfirm) {
            // First click: ask for confirmation
            this._deleteConfirm = true;

            // Reset confirmation after 3 seconds
            if (this._deleteTimeout) {
                clearTimeout(this._deleteTimeout);
            }
            this._deleteTimeout = setTimeout(() => {
                this._deleteConfirm = false;
                this._deleteTimeout = null;
            }, 3000);
        } else {
            // Second click: actually delete
            this._dispatchAction('delete');
            this._deleteConfirm = false;
            if (this._deleteTimeout) {
                clearTimeout(this._deleteTimeout);
                this._deleteTimeout = null;
            }
        }
    }

    _handleReaction(type) {
        const newReaction = this.reaction === type ? null : type;
        this._dispatchAction('reaction', { reaction: newReaction });
    }

    _dispatchAction(action, detail = {}) {
        this.dispatchEvent(new CustomEvent('action', {
            detail: {
                action,
                messageId: this.messageId,
                role: this.role,
                ...detail,
            },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
            <div class="actions-container ${this.showMenu ? 'visible' : ''}">
                <!-- Copy Button -->
                <button
                    class="action-button"
                    @click=${this._handleCopy}
                    title="Copier"
                >
                    📋
                    ${this._showCopyFeedback ? html`
                        <span class="copy-feedback">Copié !</span>
                    ` : ''}
                </button>

                <!-- Edit Button (User only) -->
                ${this.role === 'user' ? html`
                    <button
                        class="action-button"
                        @click=${this._handleEdit}
                        title="Éditer"
                    >
                        ✏️
                    </button>
                ` : ''}

                <!-- Regenerate Button (Assistant only) -->
                ${this.role === 'assistant' ? html`
                    <button
                        class="action-button primary"
                        @click=${this._handleRegenerate}
                        title="Régénérer"
                    >
                        🔄
                    </button>
                ` : ''}

                <!-- Reactions (Assistant only) -->
                ${this.role === 'assistant' ? html`
                    <div class="reaction-group">
                        <button
                            class="reaction-button ${this.reaction === 'up' ? 'active up' : ''}"
                            @click=${() => this._handleReaction('up')}
                            title="Utile"
                        >
                            👍
                        </button>
                        <button
                            class="reaction-button ${this.reaction === 'down' ? 'active down' : ''}"
                            @click=${() => this._handleReaction('down')}
                            title="Pas utile"
                        >
                            👎
                        </button>
                    </div>
                ` : ''}

                <!-- Delete Button -->
                <button
                    class="action-button ${this._deleteConfirm ? 'danger' : ''}"
                    @click=${this._handleDelete}
                    title="${this._deleteConfirm ? 'Cliquez pour confirmer' : 'Supprimer'}"
                >
                    ${this._deleteConfirm ? 'Confirmer ?' : '🗑️'}
                </button>
            </div>
        `;
    }
}

customElements.define('message-actions', MessageActions);
