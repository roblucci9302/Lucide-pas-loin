import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ToastNotification - Toast notification component
 *
 * Types:
 * - success: Green toast for success messages
 * - error: Red toast for errors
 * - warning: Orange toast for warnings
 * - info: Blue toast for information
 *
 * @example
 * <toast-notification
 *   type="success"
 *   message="Message sent!"
 *   ?visible=${true}
 *   @close=${this.handleClose}
 * ></toast-notification>
 */
export class ToastNotification extends LitElement {
    static properties = {
        type: { type: String },
        message: { type: String },
        duration: { type: Number },
        visible: { type: Boolean, reflect: true },
        closeable: { type: Boolean },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: var(--claude-z-toast, 3000);
            max-width: 400px;
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host([visible]) {
            display: block;
        }

        :host([closing]) {
            animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideIn {
            from {
                transform: translateX(calc(100% + 24px));
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(calc(100% + 24px));
                opacity: 0;
            }
        }

        .toast {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: var(--claude-bg-elevated, #FFFFFF);
            border-radius: 12px;
            box-shadow: var(--claude-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
            border-left: 4px solid var(--toast-color);
            min-width: 280px;
        }

        .toast-icon {
            flex-shrink: 0;
            font-size: 20px;
            margin-top: 2px;
        }

        .toast-content {
            flex: 1;
            min-width: 0;
        }

        .toast-message {
            font-size: var(--claude-font-size-sm, 14px);
            color: var(--claude-text-primary, #1a1a1a);
            line-height: 1.5;
            word-wrap: break-word;
        }

        .toast-close {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            border: none;
            background: transparent;
            color: var(--claude-text-tertiary, #9b9b9b);
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .toast-close:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Type-specific colors */
        :host([type="success"]) {
            --toast-color: #10b981;
        }

        :host([type="error"]) {
            --toast-color: #ef4444;
        }

        :host([type="warning"]) {
            --toast-color: #f59e0b;
        }

        :host([type="info"]) {
            --toast-color: #3b82f6;
        }

        /* Progress bar */
        .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--toast-color);
            opacity: 0.3;
            transform-origin: left;
            animation: progress var(--duration, 3000ms) linear;
        }

        @keyframes progress {
            from {
                transform: scaleX(1);
            }
            to {
                transform: scaleX(0);
            }
        }

        /* Mobile */
        @media (max-width: 768px) {
            :host {
                top: 16px;
                right: 16px;
                left: 16px;
                max-width: none;
            }

            .toast {
                min-width: 0;
            }
        }
    `;

    constructor() {
        super();
        this.type = 'info';
        this.message = '';
        this.duration = 3000;
        this.visible = false;
        this.closeable = true;
        this._timeoutId = null;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.visible && this.duration > 0) {
            this._startAutoClose();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._clearAutoClose();
    }

    updated(changedProperties) {
        if (changedProperties.has('visible') && this.visible && this.duration > 0) {
            this._startAutoClose();
        }
    }

    _startAutoClose() {
        this._clearAutoClose();
        this._timeoutId = setTimeout(() => {
            this._handleClose();
        }, this.duration);
    }

    _clearAutoClose() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _handleClose() {
        this._clearAutoClose();

        // Add closing animation
        this.setAttribute('closing', '');

        // Wait for animation to complete
        setTimeout(() => {
            this.visible = false;
            this.removeAttribute('closing');

            this.dispatchEvent(new CustomEvent('close', {
                bubbles: true,
                composed: true
            }));
        }, 300);
    }

    _getIcon() {
        switch (this.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return 'ℹ';
        }
    }

    render() {
        return html`
            <div class="toast" style="--duration: ${this.duration}ms">
                <div class="toast-icon">${this._getIcon()}</div>
                <div class="toast-content">
                    <div class="toast-message">${this.message}</div>
                </div>
                ${this.closeable ? html`
                    <button class="toast-close" @click="${this._handleClose}">
                        ✕
                    </button>
                ` : ''}
                ${this.duration > 0 ? html`
                    <div class="toast-progress"></div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('toast-notification', ToastNotification);
