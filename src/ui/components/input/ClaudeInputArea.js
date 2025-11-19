import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeInput.js';
import '../upload/FilePreview.js';
import '../upload/FileDropZone.js';

/**
 * ClaudeInputArea - Advanced input area with file attachments (Claude.ai style)
 *
 * Features:
 * - Auto-expanding textarea
 * - File upload with drag & drop
 * - File preview chips (images, PDFs, docs)
 * - Token/character counter
 * - Send button (circular orange)
 * - Attachment button
 * - Footer disclaimer
 * - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
 *
 * @example
 * <claude-input-area
 *   .value=${this.inputValue}
 *   .attachedFiles=${this.files}
 *   @input-change=${this.handleInput}
 *   @submit=${this.handleSubmit}
 *   @files-attached=${this.handleFilesAttached}
 * ></claude-input-area>
 */
export class ClaudeInputArea extends LitElement {
    static properties = {
        value: { type: String },
        placeholder: { type: String },
        disabled: { type: Boolean },
        maxLength: { type: Number },
        attachedFiles: { type: Array },
        isDragging: { type: Boolean, state: true },
        showFileInput: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .input-area-container {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--claude-bg-primary, #F5F5F0);
            padding: 16px 0 24px 0;
            border-top: 1px solid var(--claude-border-subtle, #e5e5e0);
            z-index: var(--claude-z-input, 300);
        }

        .input-wrapper {
            max-width: var(--claude-chat-max-width, 800px);
            margin: 0 auto;
            padding: 0 var(--claude-chat-padding, 24px);
        }

        /* Main input container */
        .input-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: var(--claude-input-bg, #FFFFFF);
            border: 1px solid var(--claude-input-border, #e5e5e0);
            border-radius: var(--claude-input-radius, 24px);
            padding: 12px 16px;
            transition: all var(--claude-transition-base, 200ms) ease;
            position: relative;
        }

        .input-container:focus-within {
            border-color: var(--claude-input-border-focus, #D97706);
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
        }

        .input-container.dragging {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
            border-style: dashed;
        }

        /* Files preview area */
        .files-preview {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        file-preview {
            width: 100%;
        }

        /* Input row */
        .input-row {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        .attach-button {
            flex-shrink: 0;
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
            font-size: 18px;
        }

        .attach-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        .attach-button:active {
            background: var(--claude-active-overlay, rgba(0, 0, 0, 0.08));
        }

        claude-input {
            flex: 1;
        }

        /* Send button (circular) */
        .send-btn {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            border-radius: 50%;
            background: var(--claude-send-btn-bg, #D97706);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all var(--claude-transition-base, 200ms) ease;
            font-size: 16px;
            font-weight: bold;
        }

        .send-btn:hover:not(:disabled) {
            background: var(--claude-send-btn-bg-hover, #B45309);
            transform: scale(1.05);
        }

        .send-btn:active:not(:disabled) {
            transform: scale(0.95);
        }

        .send-btn:disabled {
            background: var(--claude-send-btn-bg-disabled, #e5e5e0);
            cursor: not-allowed;
            opacity: 0.5;
        }

        /* Footer */
        .input-footer {
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            padding: 0 16px;
            gap: 16px;
        }

        .disclaimer {
            flex: 1;
        }

        .counter {
            white-space: nowrap;
        }

        .counter.warning {
            color: var(--claude-warning-text, #92400E);
        }

        .counter.error {
            color: var(--claude-error-text, #991B1B);
        }

        /* Hidden file input */
        input[type="file"] {
            display: none;
        }

        /* Drag & drop overlay */
        .drag-overlay {
            position: absolute;
            inset: 0;
            background: rgba(217, 119, 6, 0.1);
            border: 2px dashed var(--claude-accent-orange, #D97706);
            border-radius: var(--claude-input-radius, 24px);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
        }

        .drag-overlay.visible {
            opacity: 1;
        }

        .drag-text {
            font-size: var(--claude-font-size-base, 16px);
            color: var(--claude-accent-orange, #D97706);
            font-weight: 500;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .input-wrapper {
                padding: 0 16px;
            }

            .input-footer {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
        }
    `;

    constructor() {
        super();
        this.value = '';
        this.placeholder = 'Parler avec Lucide...';
        this.disabled = false;
        this.maxLength = 0;
        this.attachedFiles = [];
        this.isDragging = false;
        this.showFileInput = false;
    }

    connectedCallback() {
        super.connectedCallback();

        // Add drag & drop listeners
        this.addEventListener('dragenter', this._handleDragEnter);
        this.addEventListener('dragover', this._handleDragOver);
        this.addEventListener('dragleave', this._handleDragLeave);
        this.addEventListener('drop', this._handleDrop);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        // Remove drag & drop listeners
        this.removeEventListener('dragenter', this._handleDragEnter);
        this.removeEventListener('dragover', this._handleDragOver);
        this.removeEventListener('dragleave', this._handleDragLeave);
        this.removeEventListener('drop', this._handleDrop);
    }

    _handleInput(e) {
        this.value = e.detail.value;

        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    _handleSubmit() {
        if (!this.value.trim() && this.attachedFiles.length === 0) return;
        if (this.disabled) return;

        this.dispatchEvent(new CustomEvent('submit', {
            detail: {
                value: this.value,
                files: this.attachedFiles
            },
            bubbles: true,
            composed: true
        }));
    }

    _handleKeyDown(e) {
        // Enter to send (without Shift)
        if (e.detail.originalEvent.key === 'Enter' && !e.detail.originalEvent.shiftKey) {
            e.detail.originalEvent.preventDefault();
            this._handleSubmit();
        }
    }

    _handleAttachClick() {
        const fileInput = this.shadowRoot.querySelector('input[type="file"]');
        fileInput?.click();
    }

    _handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this._addFiles(files);

        // Reset input
        e.target.value = '';
    }

    _addFiles(files) {
        const newFiles = files.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type
        }));

        this.attachedFiles = [...this.attachedFiles, ...newFiles];

        this.dispatchEvent(new CustomEvent('files-attached', {
            detail: { files: this.attachedFiles },
            bubbles: true,
            composed: true
        }));
    }

    _removeFile(fileId) {
        this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);

        this.dispatchEvent(new CustomEvent('file-removed', {
            detail: { files: this.attachedFiles },
            bubbles: true,
            composed: true
        }));
    }

    _handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
    }

    _handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
    }

    _handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();

        // Only set to false if leaving the component entirely
        if (e.target === this) {
            this.isDragging = false;
        }
    }

    _handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = false;

        const files = Array.from(e.dataTransfer.files);
        this._addFiles(files);
    }

    _formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    _getFileIcon(type) {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('text/')) return '📝';
        if (type.includes('zip') || type.includes('rar')) return '📦';
        return '📎';
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
        this.attachedFiles = [];

        const input = this.shadowRoot.querySelector('claude-input');
        input?.clear();
    }

    focus() {
        const input = this.shadowRoot.querySelector('claude-input');
        input?.focus();
    }

    render() {
        const canSubmit = (this.value.trim() || this.attachedFiles.length > 0) && !this.disabled;
        const counterClass = this._getCounterClass();

        return html`
            <div class="input-area-container">
                <div class="input-wrapper">
                    <div class="input-container ${this.isDragging ? 'dragging' : ''}">
                        <!-- Files preview -->
                        ${this.attachedFiles.length > 0 ? html`
                            <div class="files-preview">
                                ${this.attachedFiles.map(fileObj => html`
                                    <file-preview
                                        .file="${fileObj.file}"
                                        @remove="${() => this._removeFile(fileObj.id)}"
                                    ></file-preview>
                                `)}
                            </div>
                        ` : ''}

                        <!-- Input row -->
                        <div class="input-row">
                            <button
                                class="attach-button"
                                @click="${this._handleAttachClick}"
                                title="Joindre un fichier"
                                ?disabled="${this.disabled}"
                            >
                                📎
                            </button>

                            <claude-input
                                placeholder="${this.placeholder}"
                                .value="${this.value}"
                                ?disabled="${this.disabled}"
                                .maxLength="${this.maxLength}"
                                @input-change="${this._handleInput}"
                                @keydown="${this._handleKeyDown}"
                            ></claude-input>

                            <button
                                class="send-btn"
                                @click="${this._handleSubmit}"
                                ?disabled="${!canSubmit}"
                                title="Envoyer (Enter)"
                            >
                                ↑
                            </button>
                        </div>

                        <!-- Drag & drop overlay -->
                        <div class="drag-overlay ${this.isDragging ? 'visible' : ''}">
                            <div class="drag-text">📎 Déposez vos fichiers ici</div>
                        </div>

                        <!-- Hidden file input -->
                        <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf,.txt,.doc,.docx,.md"
                            @change="${this._handleFileSelect}"
                        />
                    </div>

                    <!-- Footer -->
                    <div class="input-footer">
                        <span class="disclaimer">
                            Lucide peut faire des erreurs. Vérifiez les informations importantes.
                        </span>
                        <span class="counter ${counterClass}">
                            ${this.value.length}${this.maxLength ? ` / ${this.maxLength}` : ''} caractères
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('claude-input-area', ClaudeInputArea);
