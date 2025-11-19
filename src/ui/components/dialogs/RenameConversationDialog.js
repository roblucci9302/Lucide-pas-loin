import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeButton.js';

/**
 * RenameConversationDialog - Modal dialog for renaming a conversation
 *
 * Features:
 * - Input field with current title pre-filled
 * - Validation (min 1 char, max 100 chars)
 * - Keyboard support (Enter to confirm, Esc to cancel)
 * - Auto-focus on input when opened
 * - Backdrop click to close
 *
 * @example
 * <rename-conversation-dialog
 *   ?open=${this.renameDialogOpen}
 *   .conversationTitle=${this.currentTitle}
 *   @confirm=${this.handleRename}
 *   @cancel=${this.handleCancel}
 * ></rename-conversation-dialog>
 */
export class RenameConversationDialog extends LitElement {
    static properties = {
        open: { type: Boolean },
        conversationTitle: { type: String },
        _inputValue: { type: String, state: true },
        _error: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: var(--claude-z-modal, 2000);
            align-items: center;
            justify-content: center;
        }

        :host([open]) {
            display: flex;
        }

        .backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            animation: fadeIn 200ms ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .dialog {
            position: relative;
            background: var(--claude-bg-primary, #FFFFFF);
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 480px;
            box-shadow: var(--claude-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
            animation: slideUp 200ms ease;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .dialog-title {
            font-size: var(--claude-font-size-xl, 20px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .close-btn {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .close-btn:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .dialog-body {
            margin-bottom: 24px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        label {
            font-size: var(--claude-font-size-sm, 14px);
            font-weight: 500;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .input-wrapper {
            position: relative;
        }

        input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--claude-border-light, #e5e5e0);
            border-radius: 8px;
            background: var(--claude-input-bg, #FFFFFF);
            color: var(--claude-text-primary, #1a1a1a);
            font-size: var(--claude-font-size-base, 16px);
            font-family: inherit;
            outline: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
            box-sizing: border-box;
        }

        input:focus {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-input-focus-bg, #FFFFFF);
        }

        input.error {
            border-color: var(--claude-error, #DC2626);
        }

        .char-count {
            position: absolute;
            right: 12px;
            bottom: -24px;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .char-count.warning {
            color: var(--claude-warning, #F59E0B);
        }

        .char-count.error {
            color: var(--claude-error, #DC2626);
        }

        .error-message {
            color: var(--claude-error, #DC2626);
            font-size: var(--claude-font-size-sm, 13px);
            margin-top: 4px;
            display: none;
        }

        .error-message.visible {
            display: block;
        }

        .dialog-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 32px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .dialog {
                width: 95%;
                padding: 20px;
            }

            .dialog-footer {
                flex-direction: column-reverse;
            }

            .dialog-footer claude-button {
                width: 100%;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.conversationTitle = '';
        this._inputValue = '';
        this._error = '';
    }

    updated(changedProperties) {
        if (changedProperties.has('open') && this.open) {
            // Reset state when dialog opens
            this._inputValue = this.conversationTitle || '';
            this._error = '';

            // Focus input
            setTimeout(() => {
                const input = this.shadowRoot.querySelector('input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }
    }

    _handleInput(e) {
        this._inputValue = e.target.value;
        this._error = '';
    }

    _handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this._handleConfirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this._handleCancel();
        }
    }

    _validate() {
        const value = this._inputValue.trim();

        if (value.length === 0) {
            this._error = 'Le titre ne peut pas être vide';
            return false;
        }

        if (value.length > 100) {
            this._error = 'Le titre ne peut pas dépasser 100 caractères';
            return false;
        }

        return true;
    }

    _handleConfirm() {
        if (!this._validate()) {
            return;
        }

        this.dispatchEvent(new CustomEvent('confirm', {
            detail: { title: this._inputValue.trim() },
            bubbles: true,
            composed: true
        }));
    }

    _handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel', {
            bubbles: true,
            composed: true
        }));
    }

    _handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            this._handleCancel();
        }
    }

    _getCharCountClass() {
        const length = this._inputValue.length;
        if (length > 100) return 'error';
        if (length > 90) return 'warning';
        return '';
    }

    render() {
        const charCount = this._inputValue.length;
        const hasError = this._error !== '';

        return html`
            <div class="backdrop" @click="${this._handleBackdropClick}">
                <div class="dialog" @click="${(e) => e.stopPropagation()}">
                    <div class="dialog-header">
                        <h2 class="dialog-title">Renommer la conversation</h2>
                        <button class="close-btn" @click="${this._handleCancel}" title="Fermer">
                            ✕
                        </button>
                    </div>

                    <div class="dialog-body">
                        <div class="form-group">
                            <label for="conversation-title">Nouveau titre</label>
                            <div class="input-wrapper">
                                <input
                                    id="conversation-title"
                                    type="text"
                                    class="${hasError ? 'error' : ''}"
                                    .value="${this._inputValue}"
                                    @input="${this._handleInput}"
                                    @keydown="${this._handleKeyDown}"
                                    maxlength="101"
                                    placeholder="Entrez le nouveau titre..."
                                />
                                <span class="char-count ${this._getCharCountClass()}">
                                    ${charCount}/100
                                </span>
                            </div>
                            <div class="error-message ${hasError ? 'visible' : ''}">
                                ${this._error}
                            </div>
                        </div>
                    </div>

                    <div class="dialog-footer">
                        <claude-button
                            variant="ghost"
                            size="md"
                            @button-click="${this._handleCancel}"
                        >
                            Annuler
                        </claude-button>
                        <claude-button
                            variant="primary"
                            size="md"
                            @button-click="${this._handleConfirm}"
                        >
                            Renommer
                        </claude-button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('rename-conversation-dialog', RenameConversationDialog);
