import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ClaudeButton - Reusable button component with Claude.ai styling
 *
 * Variants:
 * - primary: Orange background (main actions)
 * - secondary: Gray background (secondary actions)
 * - ghost: Transparent background (subtle actions)
 * - danger: Red background (destructive actions)
 * - icon: Icon-only button
 *
 * @example
 * <claude-button variant="primary" size="md">New Conversation</claude-button>
 * <claude-button variant="danger" size="md">Delete</claude-button>
 * <claude-button variant="icon" size="sm" .icon=${'+'}>+</claude-button>
 */
export class ClaudeButton extends LitElement {
    static properties = {
        variant: { type: String }, // 'primary' | 'secondary' | 'ghost' | 'icon'
        size: { type: String },    // 'sm' | 'md' | 'lg'
        disabled: { type: Boolean },
        loading: { type: Boolean },
        icon: { type: String },
        iconPosition: { type: String }, // 'left' | 'right'
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: var(--claude-font-family, var(--font-family-primary));
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all var(--claude-transition-base, 200ms) var(--claude-easing-smooth, ease);
            outline: none;
            user-select: none;
            position: relative;
            overflow: hidden;
        }

        button:focus-visible {
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        /* Sizes */
        .size-sm {
            height: var(--claude-btn-height-sm, 32px);
            padding: 0 12px;
            font-size: var(--claude-font-size-sm, 13px);
            border-radius: 8px;
        }

        .size-md {
            height: var(--claude-btn-height-md, 40px);
            padding: 0 16px;
            font-size: var(--claude-font-size-base, 16px);
            border-radius: 10px;
        }

        .size-lg {
            height: var(--claude-btn-height-lg, 48px);
            padding: 0 24px;
            font-size: var(--claude-font-size-md, 18px);
            border-radius: 12px;
        }

        /* Variants */
        .variant-primary {
            background: var(--claude-accent-orange, #D97706);
            color: var(--claude-text-inverse, white);
        }

        .variant-primary:hover:not(:disabled) {
            background: var(--claude-accent-orange-dark, #B45309);
            transform: translateY(-1px);
            box-shadow: var(--claude-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
        }

        .variant-primary:active:not(:disabled) {
            transform: translateY(0);
            background: #92400E;
        }

        .variant-secondary {
            background: var(--claude-bg-tertiary, #FAFAF8);
            color: var(--claude-text-primary, #1a1a1a);
            border: 1px solid var(--claude-border-normal, #d4d4cf);
        }

        .variant-secondary:hover:not(:disabled) {
            background: var(--claude-sidebar-hover, #F5F5F0);
            border-color: var(--claude-border-strong, #a3a3a0);
        }

        .variant-secondary:active:not(:disabled) {
            background: #e5e5e0;
        }

        .variant-ghost {
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .variant-ghost:hover:not(:disabled) {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .variant-ghost:active:not(:disabled) {
            background: var(--claude-active-overlay, rgba(0, 0, 0, 0.08));
        }

        .variant-danger {
            background: var(--claude-error, #DC2626);
            color: var(--claude-text-inverse, white);
        }

        .variant-danger:hover:not(:disabled) {
            background: var(--claude-error-dark, #B91C1C);
            transform: translateY(-1px);
            box-shadow: var(--claude-shadow-md, 0 4px 12px rgba(220, 38, 38, 0.2));
        }

        .variant-danger:active:not(:disabled) {
            transform: translateY(0);
            background: #991B1B;
        }

        /* Icon variant */
        .variant-icon {
            width: var(--icon-btn-size, 32px);
            height: var(--icon-btn-size, 32px);
            padding: 0;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            border-radius: 8px;
        }

        .variant-icon:hover:not(:disabled) {
            background: var(--claude-action-btn-hover, #F5F5F0);
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Icon positioning */
        .icon-left {
            flex-direction: row;
        }

        .icon-right {
            flex-direction: row-reverse;
        }

        /* Loading state */
        .loading {
            position: relative;
            color: transparent;
            pointer-events: none;
        }

        .loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            border: 2px solid currentColor;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.6s linear infinite;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: inherit;
        }

        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Ripple effect */
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
            animation: ripple 0.6s;
            opacity: 0;
        }

        @keyframes ripple {
            from {
                opacity: 1;
                transform: scale(0);
            }
            to {
                opacity: 0;
                transform: scale(10);
            }
        }

        /* Icon styles */
        .icon {
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;

    constructor() {
        super();
        this.variant = 'primary';
        this.size = 'md';
        this.disabled = false;
        this.loading = false;
        this.icon = '';
        this.iconPosition = 'left';
    }

    _handleClick(e) {
        if (this.disabled || this.loading) return;

        // Create ripple effect
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = e.clientX - button.offsetLeft + 'px';
        ripple.style.top = e.clientY - button.offsetTop + 'px';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('button-click', {
            detail: { originalEvent: e },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const classes = [
            `variant-${this.variant}`,
            `size-${this.size}`,
            this.iconPosition && this.icon ? `icon-${this.iconPosition}` : '',
            this.loading ? 'loading' : ''
        ].filter(Boolean).join(' ');

        return html`
            <button
                class="${classes}"
                ?disabled="${this.disabled || this.loading}"
                @click="${this._handleClick}"
            >
                ${this.icon && this.iconPosition === 'left' ? html`
                    <span class="icon">${this.icon}</span>
                ` : ''}

                <slot></slot>

                ${this.icon && this.iconPosition === 'right' ? html`
                    <span class="icon">${this.icon}</span>
                ` : ''}
            </button>
        `;
    }
}

customElements.define('claude-button', ClaudeButton);
