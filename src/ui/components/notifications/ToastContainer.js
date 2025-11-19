import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { toastService } from '../../services/toastService.js';
import './ToastNotification.js';

/**
 * ToastContainer - Container for all toast notifications
 *
 * This component listens to toastService and displays all active toasts.
 * Should be placed at the root of the app.
 *
 * @example
 * <toast-container></toast-container>
 */
export class ToastContainer extends LitElement {
    static properties = {
        toasts: { type: Array, state: true },
    };

    static styles = css`
        :host {
            display: block;
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: var(--claude-z-toast, 3000);
            pointer-events: none;
        }

        .toast-stack {
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: auto;
        }

        /* Mobile */
        @media (max-width: 768px) {
            :host {
                top: 16px;
                right: 16px;
                left: 16px;
            }
        }
    `;

    constructor() {
        super();
        this.toasts = [];
        this._unsubscribe = null;
    }

    connectedCallback() {
        super.connectedCallback();

        // Subscribe to toast service
        this._unsubscribe = toastService.subscribe((toasts) => {
            this.toasts = toasts;
        });

        // Load initial toasts
        this.toasts = toastService.getToasts();
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        // Unsubscribe from toast service
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _handleToastClose(toastId) {
        toastService.dismiss(toastId);
    }

    render() {
        if (this.toasts.length === 0) {
            return html``;
        }

        return html`
            <div class="toast-stack">
                ${this.toasts.map(toast => html`
                    <toast-notification
                        type="${toast.type}"
                        message="${toast.message}"
                        duration="${toast.duration}"
                        ?visible="${toast.visible}"
                        ?closeable="${toast.closeable}"
                        @close="${() => this._handleToastClose(toast.id)}"
                    ></toast-notification>
                `)}
            </div>
        `;
    }
}

customElements.define('toast-container', ToastContainer);
