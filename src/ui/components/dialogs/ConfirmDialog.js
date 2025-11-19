import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeButton.js';

/**
 * ConfirmDialog - Reusable confirmation dialog
 *
 * Features:
 * - Customizable title, message, and buttons
 * - Optional "Don't ask again" checkbox
 * - Variants: danger (red), warning (yellow), info (default)
 * - Keyboard support (Enter to confirm, Esc to cancel)
 * - Backdrop click to cancel
 *
 * @example
 * <confirm-dialog
 *   ?open=${this.confirmOpen}
 *   title="Supprimer la conversation"
 *   message="Êtes-vous sûr de vouloir supprimer cette conversation ?"
 *   variant="danger"
 *   confirmText="Supprimer"
 *   cancelText="Annuler"
 *   ?showDontAskAgain=${true}
 *   @confirm=${this.handleConfirm}
 *   @cancel=${this.handleCancel}
 * ></confirm-dialog>
 */
export class ConfirmDialog extends LitElement {
    static properties = {
        open: { type: Boolean },
        title: { type: String },
        message: { type: String },
        variant: { type: String }, // 'danger', 'warning', 'info'
        confirmText: { type: String },
        cancelText: { type: String },
        showDontAskAgain: { type: Boolean },
        _dontAskAgain: { type: Boolean, state: true },
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
            max-width: 450px;
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
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
        }

        .dialog-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }

        .dialog-icon.danger {
            background: var(--claude-error-light, #FEE2E2);
            color: var(--claude-error, #DC2626);
        }

        .dialog-icon.warning {
            background: var(--claude-warning-light, #FEF3C7);
            color: var(--claude-warning, #F59E0B);
        }

        .dialog-icon.info {
            background: var(--claude-info-light, #DBEAFE);
            color: var(--claude-info, #3B82F6);
        }

        .dialog-header-content {
            flex: 1;
        }

        .dialog-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin: 0 0 8px 0;
        }

        .dialog-message {
            font-size: var(--claude-font-size-base, 15px);
            color: var(--claude-text-secondary, #6b6b6b);
            line-height: 1.5;
            margin: 0;
        }

        .dialog-body {
            margin-bottom: 24px;
        }

        .dont-ask-again {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: var(--claude-bg-secondary, #F9FAFB);
            border-radius: 8px;
        }

        .dont-ask-again input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--claude-accent-orange, #D97706);
        }

        .dont-ask-again label {
            font-size: var(--claude-font-size-sm, 14px);
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            user-select: none;
        }

        .dialog-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
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
        this.title = 'Confirmer l\'action';
        this.message = 'Êtes-vous sûr de vouloir continuer ?';
        this.variant = 'info';
        this.confirmText = 'Confirmer';
        this.cancelText = 'Annuler';
        this.showDontAskAgain = false;
        this._dontAskAgain = false;
    }

    updated(changedProperties) {
        if (changedProperties.has('open') && this.open) {
            // Reset state when dialog opens
            this._dontAskAgain = false;

            // Setup keyboard listener
            this._keydownHandler = this._handleKeyDown.bind(this);
            document.addEventListener('keydown', this._keydownHandler);
        } else if (changedProperties.has('open') && !this.open) {
            // Cleanup keyboard listener
            if (this._keydownHandler) {
                document.removeEventListener('keydown', this._keydownHandler);
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }
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

    _handleConfirm() {
        this.dispatchEvent(new CustomEvent('confirm', {
            detail: { dontAskAgain: this._dontAskAgain },
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

    _handleDontAskAgainChange(e) {
        this._dontAskAgain = e.target.checked;
    }

    _getIcon() {
        switch (this.variant) {
            case 'danger':
                return '⚠️';
            case 'warning':
                return '⚡';
            case 'info':
            default:
                return 'ℹ️';
        }
    }

    _getConfirmVariant() {
        return this.variant === 'danger' ? 'danger' : 'primary';
    }

    render() {
        return html`
            <div class="backdrop" @click="${this._handleBackdropClick}">
                <div class="dialog" @click="${(e) => e.stopPropagation()}">
                    <div class="dialog-header">
                        <div class="dialog-icon ${this.variant}">
                            ${this._getIcon()}
                        </div>
                        <div class="dialog-header-content">
                            <h2 class="dialog-title">${this.title}</h2>
                            <p class="dialog-message">${this.message}</p>
                        </div>
                    </div>

                    ${this.showDontAskAgain ? html`
                        <div class="dialog-body">
                            <div class="dont-ask-again">
                                <input
                                    type="checkbox"
                                    id="dont-ask-again"
                                    .checked="${this._dontAskAgain}"
                                    @change="${this._handleDontAskAgainChange}"
                                />
                                <label for="dont-ask-again">
                                    Ne plus me demander
                                </label>
                            </div>
                        </div>
                    ` : ''}

                    <div class="dialog-footer">
                        <claude-button
                            variant="ghost"
                            size="md"
                            @button-click="${this._handleCancel}"
                        >
                            ${this.cancelText}
                        </claude-button>
                        <claude-button
                            variant="${this._getConfirmVariant()}"
                            size="md"
                            @button-click="${this._handleConfirm}"
                        >
                            ${this.confirmText}
                        </claude-button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('confirm-dialog', ConfirmDialog);
