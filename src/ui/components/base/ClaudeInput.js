import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * ClaudeInput - Auto-expanding textarea with Claude.ai styling
 *
 * Features:
 * - Auto-expands as user types
 * - Placeholder text
 * - Max height limit
 * - Character/token counter
 * - File attachment support
 *
 * @example
 * <claude-input
 *   placeholder="Talk to Lucide..."
 *   .value=${this.inputValue}
 *   @input-change=${this.handleInput}
 * ></claude-input>
 */
export class ClaudeInput extends LitElement {
    static properties = {
        value: { type: String },
        placeholder: { type: String },
        disabled: { type: Boolean },
        maxHeight: { type: Number },
        minHeight: { type: Number },
        showCounter: { type: Boolean },
        maxLength: { type: Number },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .input-wrapper {
            position: relative;
            width: 100%;
        }

        .input-container {
            background: var(--claude-input-bg, #FFFFFF);
            border: 1px solid var(--claude-input-border, #e5e5e0);
            border-radius: var(--claude-input-radius, 24px);
            padding: var(--claude-input-padding, 16px);
            transition: all var(--claude-transition-base, 200ms) var(--claude-easing-smooth, ease);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-container:focus-within {
            border-color: var(--claude-input-border-focus, #D97706);
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
        }

        .input-container.disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        textarea {
            width: 100%;
            border: none;
            outline: none;
            resize: none;
            font-family: var(--claude-font-family, -apple-system, sans-serif);
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
            background: transparent;
            overflow-y: auto;
            box-sizing: border-box;
            padding: 0;
            margin: 0;
        }

        textarea::placeholder {
            color: var(--claude-input-placeholder, #9b9b9b);
        }

        textarea:disabled {
            cursor: not-allowed;
        }

        /* Custom scrollbar */
        textarea::-webkit-scrollbar {
            width: 6px;
        }

        textarea::-webkit-scrollbar-track {
            background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Character counter */
        .counter {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            text-align: right;
            user-select: none;
        }

        .counter.warning {
            color: var(--claude-warning-text, #92400E);
        }

        .counter.error {
            color: var(--claude-error-text, #991B1B);
        }

        /* Bottom toolbar */
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            border-top: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .toolbar-left {
            display: flex;
            gap: 8px;
        }

        .toolbar-right {
            display: flex;
            gap: 8px;
            align-items: center;
        }
    `;

    constructor() {
        super();
        this.value = '';
        this.placeholder = 'Talk to Lucide...';
        this.disabled = false;
        this.maxHeight = 200;
        this.minHeight = 24;
        this.showCounter = false;
        this.maxLength = 0;
    }

    firstUpdated() {
        this._adjustHeight();
    }

    updated(changedProperties) {
        if (changedProperties.has('value')) {
            this._adjustHeight();
        }
    }

    _adjustHeight() {
        const textarea = this.shadowRoot.querySelector('textarea');
        if (!textarea) return;

        // Reset height to get accurate scrollHeight
        textarea.style.height = `${this.minHeight}px`;

        // Calculate new height
        const newHeight = Math.min(
            Math.max(textarea.scrollHeight, this.minHeight),
            this.maxHeight
        );

        textarea.style.height = `${newHeight}px`;
    }

    _handleInput(e) {
        this.value = e.target.value;

        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));

        this._adjustHeight();
    }

    _handleKeyDown(e) {
        // Allow Shift+Enter for new lines
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            this.dispatchEvent(new CustomEvent('submit', {
                detail: { value: this.value },
                bubbles: true,
                composed: true
            }));
        }

        this.dispatchEvent(new CustomEvent('keydown', {
            detail: { originalEvent: e },
            bubbles: true,
            composed: true
        }));
    }

    _getCounterClass() {
        if (!this.maxLength) return '';

        const ratio = this.value.length / this.maxLength;
        if (ratio >= 1) return 'error';
        if (ratio >= 0.9) return 'warning';
        return '';
    }

    clear() {
        this.value = '';
        this._adjustHeight();
    }

    focus() {
        const textarea = this.shadowRoot.querySelector('textarea');
        textarea?.focus();
    }

    render() {
        const counterClass = this._getCounterClass();

        return html`
            <div class="input-wrapper">
                <div class="input-container ${this.disabled ? 'disabled' : ''}">
                    <textarea
                        .value="${this.value}"
                        placeholder="${this.placeholder}"
                        ?disabled="${this.disabled}"
                        @input="${this._handleInput}"
                        @keydown="${this._handleKeyDown}"
                        spellcheck="true"
                        rows="1"
                    ></textarea>

                    ${this.showCounter || this.maxLength > 0 ? html`
                        <div class="counter ${counterClass}">
                            ${this.value.length}${this.maxLength ? ` / ${this.maxLength}` : ''}
                        </div>
                    ` : ''}
                </div>

                <slot name="toolbar"></slot>
            </div>
        `;
    }
}

customElements.define('claude-input', ClaudeInput);
