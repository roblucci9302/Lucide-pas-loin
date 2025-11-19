import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ClaudeCard - Flexible card component with Claude.ai styling
 *
 * Variants:
 * - default: Standard card with border
 * - elevated: Card with shadow
 * - flat: No border or shadow
 *
 * @example
 * <claude-card variant="elevated">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </claude-card>
 */
export class ClaudeCard extends LitElement {
    static properties = {
        variant: { type: String }, // 'default' | 'elevated' | 'flat'
        padding: { type: String }, // 'sm' | 'md' | 'lg' | 'none'
        hoverable: { type: Boolean },
        clickable: { type: Boolean },
    };

    static styles = css`
        :host {
            display: block;
        }

        .card {
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: var(--radius-lg, 12px);
            transition: all var(--claude-transition-base, 200ms) var(--claude-easing-smooth, ease);
        }

        /* Variants */
        .variant-default {
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .variant-elevated {
            box-shadow: var(--claude-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
        }

        .variant-flat {
            border: none;
            box-shadow: none;
        }

        /* Padding */
        .padding-none {
            padding: 0;
        }

        .padding-sm {
            padding: var(--padding-sm, 12px);
        }

        .padding-md {
            padding: var(--padding-md, 16px);
        }

        .padding-lg {
            padding: var(--padding-lg, 24px);
        }

        /* Hoverable */
        .hoverable:hover {
            box-shadow: var(--claude-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
            transform: translateY(-2px);
        }

        /* Clickable */
        .clickable {
            cursor: pointer;
        }

        .clickable:active {
            transform: translateY(0);
        }

        /* Content wrapper */
        .content {
            width: 100%;
            height: 100%;
        }
    `;

    constructor() {
        super();
        this.variant = 'default';
        this.padding = 'md';
        this.hoverable = false;
        this.clickable = false;
    }

    _handleClick(e) {
        if (!this.clickable) return;

        this.dispatchEvent(new CustomEvent('card-click', {
            detail: { originalEvent: e },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const classes = [
            'card',
            `variant-${this.variant}`,
            `padding-${this.padding}`,
            this.hoverable ? 'hoverable' : '',
            this.clickable ? 'clickable' : ''
        ].filter(Boolean).join(' ');

        return html`
            <div class="${classes}" @click="${this._handleClick}">
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('claude-card', ClaudeCard);
