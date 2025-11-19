import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * FilePreview - Preview component for uploaded files
 *
 * Features:
 * - Image thumbnails
 * - File type icons
 * - File size display
 * - Remove button
 * - Upload progress
 * - Error states
 *
 * @example
 * <file-preview
 *   .file=${this.file}
 *   .progress=${0.5}
 *   ?error=${false}
 *   @remove=${this.handleRemove}
 * ></file-preview>
 */
export class FilePreview extends LitElement {
    static properties = {
        file: { type: Object },
        progress: { type: Number }, // 0-1, undefined = not uploading
        error: { type: Boolean },
        errorMessage: { type: String },
        _thumbnail: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        .file-preview {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 8px;
            position: relative;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .file-preview:hover {
            border-color: var(--claude-border-normal, #d4d4cf);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .file-preview.error {
            border-color: var(--claude-error, #DC2626);
            background: var(--claude-error-bg, #FEF2F2);
        }

        /* Thumbnail/Icon */
        .file-thumbnail {
            width: 48px;
            height: 48px;
            border-radius: 6px;
            overflow: hidden;
            flex-shrink: 0;
            background: var(--claude-bg-tertiary, #FAFAF8);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .file-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .file-icon {
            font-size: 24px;
        }

        /* File info */
        .file-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .file-name {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .file-size {
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .file-status {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .file-preview.error .file-name {
            color: var(--claude-error, #DC2626);
        }

        .error-message {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-error, #DC2626);
        }

        /* Progress bar */
        .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 0 0 8px 8px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--claude-accent-orange, #D97706);
            transition: width var(--claude-transition-fast, 150ms) ease;
        }

        /* Remove button */
        .remove-button {
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
            flex-shrink: 0;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .remove-button:hover {
            background: var(--claude-error-bg, #FEF2F2);
            color: var(--claude-error, #DC2626);
        }

        .remove-button:active {
            transform: scale(0.9);
        }

        /* Loading spinner */
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--claude-border-subtle, #e5e5e0);
            border-top-color: var(--claude-accent-orange, #D97706);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    constructor() {
        super();
        this.file = null;
        this.progress = undefined;
        this.error = false;
        this.errorMessage = '';
        this._thumbnail = null;
    }

    updated(changedProperties) {
        if (changedProperties.has('file') && this.file) {
            this._generateThumbnail();
        }
    }

    async _generateThumbnail() {
        if (!this.file) return;

        // Generate thumbnail for images
        if (this.file.type.startsWith('image/')) {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this._thumbnail = e.target.result;
                };
                reader.readAsDataURL(this.file);
            } catch (error) {
                console.error('[FilePreview] Error generating thumbnail:', error);
            }
        }
    }

    _handleRemove() {
        this.dispatchEvent(new CustomEvent('remove', {
            detail: { file: this.file },
            bubbles: true,
            composed: true,
        }));
    }

    _formatFileSize(bytes) {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    _getFileIcon(file) {
        if (!file || !file.type) return '📄';

        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎥';
        if (file.type.startsWith('audio/')) return '🎵';
        if (file.type === 'application/pdf') return '📕';
        if (file.type.includes('zip') || file.type.includes('compressed')) return '📦';
        if (file.type.includes('text') || file.type.includes('json')) return '📝';
        if (file.type.includes('spreadsheet') || file.type.includes('excel')) return '📊';
        if (file.type.includes('presentation') || file.type.includes('powerpoint')) return '📽️';
        if (file.type.includes('document') || file.type.includes('word')) return '📄';

        return '📎';
    }

    _renderStatus() {
        if (this.error) {
            return html`
                <div class="file-status">
                    <span>❌</span>
                    <span>Erreur</span>
                </div>
            `;
        }

        if (this.progress !== undefined && this.progress < 1) {
            return html`
                <div class="file-status">
                    <div class="spinner"></div>
                    <span>${Math.round(this.progress * 100)}%</span>
                </div>
            `;
        }

        if (this.progress === 1) {
            return html`
                <div class="file-status">
                    <span>✓</span>
                    <span>Téléchargé</span>
                </div>
            `;
        }

        return '';
    }

    render() {
        if (!this.file) return '';

        return html`
            <div class="file-preview ${this.error ? 'error' : ''}">
                <!-- Thumbnail or icon -->
                <div class="file-thumbnail">
                    ${this._thumbnail ? html`
                        <img src="${this._thumbnail}" alt="${this.file.name}" />
                    ` : html`
                        <div class="file-icon">${this._getFileIcon(this.file)}</div>
                    `}
                </div>

                <!-- File info -->
                <div class="file-info">
                    <div class="file-name" title="${this.file.name}">
                        ${this.file.name}
                    </div>
                    <div class="file-meta">
                        <span class="file-size">${this._formatFileSize(this.file.size)}</span>
                        ${this._renderStatus()}
                    </div>
                    ${this.error && this.errorMessage ? html`
                        <div class="error-message">${this.errorMessage}</div>
                    ` : ''}
                </div>

                <!-- Remove button -->
                <button
                    class="remove-button"
                    @click="${this._handleRemove}"
                    aria-label="Supprimer le fichier"
                    title="Supprimer"
                >
                    ✕
                </button>

                <!-- Progress bar -->
                ${this.progress !== undefined && this.progress < 1 ? html`
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.progress * 100}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('file-preview', FilePreview);
