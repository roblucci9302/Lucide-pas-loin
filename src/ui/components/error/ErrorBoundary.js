import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ErrorBoundary - Error boundary component for graceful error handling
 *
 * Features:
 * - Catches rendering errors
 * - Displays friendly error message
 * - Retry functionality
 * - Error reporting (optional)
 *
 * @example
 * <error-boundary>
 *   <my-component></my-component>
 * </error-boundary>
 */
export class ErrorBoundary extends LitElement {
    static properties = {
        error: { type: Object, state: true },
        errorInfo: { type: Object, state: true },
        hasError: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            min-height: 300px;
            text-align: center;
        }

        .error-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 24px;
            border-radius: 50%;
            background: var(--claude-error-subtle, #FEE2E2);
            color: var(--claude-error, #DC2626);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            font-family: var(--claude-font-family-sans, system-ui);
        }

        .error-title {
            font-size: var(--claude-font-size-xl, 24px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 12px;
        }

        .error-message {
            font-size: var(--claude-font-size-base, 16px);
            color: var(--claude-text-secondary, #6b6b6b);
            max-width: 500px;
            margin-bottom: 24px;
            line-height: 1.6;
        }

        .error-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .error-button {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .error-button-primary {
            background: var(--claude-accent-orange, #D97706);
            color: white;
        }

        .error-button-primary:hover {
            background: var(--claude-accent-orange-dark, #B45309);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }

        .error-button-secondary {
            background: var(--claude-bg-tertiary, #FAFAF8);
            color: var(--claude-text-primary, #1a1a1a);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .error-button-secondary:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .error-details {
            margin-top: 24px;
            padding: 16px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
        }

        .error-details-toggle {
            background: none;
            border: none;
            color: var(--claude-text-secondary, #6b6b6b);
            font-size: var(--claude-font-size-sm, 13px);
            cursor: pointer;
            text-decoration: underline;
            margin-top: 12px;
        }

        .error-details-toggle:hover {
            color: var(--claude-text-primary, #1a1a1a);
        }

        .error-stack {
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-error, #DC2626);
            text-align: left;
            white-space: pre-wrap;
            word-break: break-word;
            padding: 12px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 6px;
            margin-top: 12px;
            max-height: 200px;
            overflow-y: auto;
        }
    `;

    constructor() {
        super();
        this.error = null;
        this.errorInfo = null;
        this.hasError = false;
        this._showDetails = false;
    }

    connectedCallback() {
        super.connectedCallback();

        // Listen for errors from child elements
        this.addEventListener('error', this._handleError.bind(this), true);

        // Global error handler
        window.addEventListener('error', this._handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this._handleUnhandledRejection.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('error', this._handleGlobalError.bind(this));
        window.removeEventListener('unhandledrejection', this._handleUnhandledRejection.bind(this));
    }

    _handleError(event) {
        this.hasError = true;
        this.error = event.error || new Error('Unknown error');
        this.errorInfo = {
            message: event.message || this.error.message,
            stack: this.error.stack,
        };

        // Prevent error from propagating
        event.stopPropagation();
        event.preventDefault();

        // Log to console in development
        // Safe check that works in browser environments
        const isDevelopment = typeof process !== 'undefined' &&
                             process.env?.NODE_ENV !== 'production';
        if (isDevelopment || window.location.hostname === 'localhost') {
            console.error('[ErrorBoundary] Error caught:', this.error);
        }

        // Optional: Send to error reporting service
        this._reportError(this.error, this.errorInfo);
    }

    _handleGlobalError(event) {
        // Only handle errors from this component's subtree
        if (this.contains(event.target)) {
            this._handleError(event);
        }
    }

    _handleUnhandledRejection(event) {
        this._handleError({
            error: event.reason,
            message: event.reason?.message || 'Unhandled Promise Rejection',
        });
    }

    _reportError(error, errorInfo) {
        // Optional: Implement error reporting to external service
        // Example: Sentry, LogRocket, etc.
        this.dispatchEvent(new CustomEvent('error-reported', {
            detail: { error, errorInfo },
            bubbles: true,
            composed: true,
        }));
    }

    _handleRetry() {
        this.hasError = false;
        this.error = null;
        this.errorInfo = null;
        this._showDetails = false;
        this.requestUpdate();
    }

    _handleReload() {
        window.location.reload();
    }

    _toggleDetails() {
        this._showDetails = !this._showDetails;
        this.requestUpdate();
    }

    render() {
        if (this.hasError) {
            return html`
                <div class="error-container">
                    <div class="error-icon">!</div>
                    <h2 class="error-title">Une erreur est survenue</h2>
                    <p class="error-message">
                        Nous sommes désolés, quelque chose s'est mal passé.
                        Veuillez réessayer ou recharger la page.
                    </p>

                    <div class="error-actions">
                        <button
                            class="error-button error-button-primary"
                            @click="${this._handleRetry}"
                        >
                            ↻ Réessayer
                        </button>
                        <button
                            class="error-button error-button-secondary"
                            @click="${this._handleReload}"
                        >
                            Recharger la page
                        </button>
                    </div>

                    <button
                        class="error-details-toggle"
                        @click="${this._toggleDetails}"
                    >
                        ${this._showDetails ? 'Masquer' : 'Afficher'} les détails
                    </button>

                    ${this._showDetails && this.errorInfo ? html`
                        <div class="error-details">
                            <strong>Message:</strong> ${this.errorInfo.message}
                            ${this.errorInfo.stack ? html`
                                <div class="error-stack">${this.errorInfo.stack}</div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html`<slot></slot>`;
    }
}

customElements.define('error-boundary', ErrorBoundary);
