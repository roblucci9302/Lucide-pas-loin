import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import './StatisticsPanel.js';

/**
 * StatisticsModal - Modal wrapper for StatisticsPanel
 *
 * @example
 * <statistics-modal
 *   ?open=${this.statisticsOpen}
 *   .conversations=${this.conversations}
 *   @close=${this.handleClose}
 * ></statistics-modal>
 */
export class StatisticsModal extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        conversations: { type: Array },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-modal, 1000);
        }

        :host([open]) {
            display: flex;
        }

        /* Overlay */
        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Modal */
        .modal {
            position: relative;
            width: 100%;
            height: 100%;
            background: var(--claude-bg-primary, #F5F5F0);
            animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        /* Header */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            background: var(--claude-bg-secondary, #FFFFFF);
        }

        .close-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 20px;
        }

        .close-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Content */
        .content {
            flex: 1;
            overflow-y: auto;
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.conversations = [];
    }

    _handleClose() {
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true
        }));
    }

    _handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            this._handleClose();
        }
    }

    _handleExportSuccess() {
        this.dispatchEvent(new CustomEvent('export-success', {
            bubbles: true,
            composed: true
        }));
    }

    _handleExportError(e) {
        this.dispatchEvent(new CustomEvent('export-error', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="overlay" @click="${this._handleOverlayClick}">
                <div class="modal" @click="${(e) => e.stopPropagation()}">
                    <!-- Header -->
                    <div class="header">
                        <button class="close-button" @click="${this._handleClose}">
                            ✕
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <statistics-panel
                            .conversations="${this.conversations}"
                            @export-success="${this._handleExportSuccess}"
                            @export-error="${this._handleExportError}"
                        ></statistics-panel>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('statistics-modal', StatisticsModal);
