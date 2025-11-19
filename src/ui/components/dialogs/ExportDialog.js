import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeButton.js';

/**
 * ExportDialog - Modal dialog for exporting conversations
 *
 * Features:
 * - Export format selection (Markdown, JSON, PDF)
 * - Preview of what will be exported
 * - Options for metadata inclusion
 * - Download button with format-specific handling
 *
 * @example
 * <export-dialog
 *   ?open=${this.exportDialogOpen}
 *   .conversation=${this.selectedConversation}
 *   .messages=${this.messages}
 *   @export=${this.handleExport}
 *   @cancel=${this.handleCancel}
 * ></export-dialog>
 */
export class ExportDialog extends LitElement {
    static properties = {
        open: { type: Boolean },
        conversation: { type: Object },
        messages: { type: Array },
        _selectedFormat: { type: String, state: true },
        _includeMetadata: { type: Boolean, state: true },
        _includeTimestamps: { type: Boolean, state: true },
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
            max-width: 520px;
            max-height: 90vh;
            overflow-y: auto;
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
            margin-bottom: 24px;
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
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .section-title {
            font-size: var(--claude-font-size-sm, 14px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Format Selection */
        .format-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
        }

        .format-card {
            border: 2px solid var(--claude-border-light, #e5e5e0);
            border-radius: 10px;
            padding: 16px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: var(--claude-bg-primary, #FFFFFF);
        }

        .format-card:hover {
            border-color: var(--claude-accent-orange-light, #FCD34D);
            background: var(--claude-bg-secondary, #F9FAFB);
        }

        .format-card.selected {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-lightest, #FEF3C7);
        }

        .format-icon {
            font-size: 32px;
        }

        .format-name {
            font-size: var(--claude-font-size-sm, 14px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .format-description {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            text-align: center;
        }

        /* Options */
        .options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            background: var(--claude-bg-secondary, #F9FAFB);
            border-radius: 8px;
        }

        .option {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .option input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--claude-accent-orange, #D97706);
        }

        .option label {
            font-size: var(--claude-font-size-sm, 14px);
            color: var(--claude-text-primary, #1a1a1a);
            cursor: pointer;
            user-select: none;
            flex: 1;
        }

        .option-description {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            margin-left: 30px;
        }

        /* Preview */
        .preview {
            padding: 16px;
            background: var(--claude-bg-secondary, #F9FAFB);
            border-radius: 8px;
            border: 1px solid var(--claude-border-light, #e5e5e0);
        }

        .preview-title {
            font-size: var(--claude-font-size-sm, 14px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
            margin-bottom: 8px;
        }

        .preview-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .preview-info-item {
            display: flex;
            justify-content: space-between;
        }

        .preview-info-label {
            font-weight: 500;
        }

        .preview-info-value {
            color: var(--claude-text-primary, #1a1a1a);
        }

        .dialog-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .dialog {
                width: 95%;
                padding: 20px;
            }

            .format-grid {
                grid-template-columns: 1fr;
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
        this.conversation = null;
        this.messages = [];
        this._selectedFormat = 'markdown';
        this._includeMetadata = true;
        this._includeTimestamps = true;
    }

    updated(changedProperties) {
        if (changedProperties.has('open') && this.open) {
            // Reset state when dialog opens
            this._selectedFormat = 'markdown';
            this._includeMetadata = true;
            this._includeTimestamps = true;
        }
    }

    _handleFormatSelect(format) {
        this._selectedFormat = format;
    }

    _handleMetadataToggle(e) {
        this._includeMetadata = e.target.checked;
    }

    _handleTimestampsToggle(e) {
        this._includeTimestamps = e.target.checked;
    }

    _handleExport() {
        this.dispatchEvent(new CustomEvent('export', {
            detail: {
                format: this._selectedFormat,
                includeMetadata: this._includeMetadata,
                includeTimestamps: this._includeTimestamps,
                conversation: this.conversation,
                messages: this.messages,
            },
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

    _getFileExtension() {
        const extensions = {
            markdown: '.md',
            json: '.json',
            pdf: '.pdf',
        };
        return extensions[this._selectedFormat] || '.txt';
    }

    _getFileName() {
        const title = this.conversation?.title || 'conversation';
        const sanitized = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];
        return `lucide-${sanitized}-${timestamp}${this._getFileExtension()}`;
    }

    _getMessageCount() {
        return this.messages?.length || 0;
    }

    _getUserMessageCount() {
        return this.messages?.filter(m => m.role === 'user').length || 0;
    }

    _getAssistantMessageCount() {
        return this.messages?.filter(m => m.role === 'assistant').length || 0;
    }

    render() {
        const formats = [
            {
                id: 'markdown',
                icon: '📝',
                name: 'Markdown',
                description: 'Format texte avec mise en forme'
            },
            {
                id: 'json',
                icon: '🔧',
                name: 'JSON',
                description: 'Format structuré pour l\'import'
            },
            {
                id: 'pdf',
                icon: '📄',
                name: 'PDF',
                description: 'Document imprimable'
            },
        ];

        return html`
            <div class="backdrop" @click="${this._handleBackdropClick}">
                <div class="dialog" @click="${(e) => e.stopPropagation()}">
                    <div class="dialog-header">
                        <h2 class="dialog-title">Exporter la conversation</h2>
                        <button class="close-btn" @click="${this._handleCancel}" title="Fermer">
                            ✕
                        </button>
                    </div>

                    <div class="dialog-body">
                        <!-- Format Selection -->
                        <div class="section">
                            <div class="section-title">Format d'export</div>
                            <div class="format-grid">
                                ${formats.map(format => html`
                                    <div
                                        class="format-card ${this._selectedFormat === format.id ? 'selected' : ''}"
                                        @click="${() => this._handleFormatSelect(format.id)}"
                                    >
                                        <div class="format-icon">${format.icon}</div>
                                        <div class="format-name">${format.name}</div>
                                        <div class="format-description">${format.description}</div>
                                    </div>
                                `)}
                            </div>
                        </div>

                        <!-- Options -->
                        <div class="section">
                            <div class="section-title">Options</div>
                            <div class="options">
                                <div class="option">
                                    <input
                                        type="checkbox"
                                        id="include-metadata"
                                        .checked="${this._includeMetadata}"
                                        @change="${this._handleMetadataToggle}"
                                    />
                                    <label for="include-metadata">
                                        Inclure les métadonnées
                                    </label>
                                </div>
                                <div class="option-description">
                                    Titre, date de création, nombre de messages
                                </div>

                                <div class="option">
                                    <input
                                        type="checkbox"
                                        id="include-timestamps"
                                        .checked="${this._includeTimestamps}"
                                        @change="${this._handleTimestampsToggle}"
                                    />
                                    <label for="include-timestamps">
                                        Inclure les horodatages
                                    </label>
                                </div>
                                <div class="option-description">
                                    Date et heure de chaque message
                                </div>
                            </div>
                        </div>

                        <!-- Preview -->
                        <div class="section">
                            <div class="section-title">Aperçu</div>
                            <div class="preview">
                                <div class="preview-title">Fichier : ${this._getFileName()}</div>
                                <div class="preview-info">
                                    <div class="preview-info-item">
                                        <span class="preview-info-label">Messages totaux :</span>
                                        <span class="preview-info-value">${this._getMessageCount()}</span>
                                    </div>
                                    <div class="preview-info-item">
                                        <span class="preview-info-label">Messages utilisateur :</span>
                                        <span class="preview-info-value">${this._getUserMessageCount()}</span>
                                    </div>
                                    <div class="preview-info-item">
                                        <span class="preview-info-label">Messages assistant :</span>
                                        <span class="preview-info-value">${this._getAssistantMessageCount()}</span>
                                    </div>
                                    <div class="preview-info-item">
                                        <span class="preview-info-label">Format :</span>
                                        <span class="preview-info-value">${this._selectedFormat.toUpperCase()}</span>
                                    </div>
                                </div>
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
                            icon="📥"
                            @button-click="${this._handleExport}"
                        >
                            Télécharger
                        </claude-button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('export-dialog', ExportDialog);
