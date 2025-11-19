import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * FileDropZone - Drag & drop file upload zone
 *
 * Features:
 * - Drag and drop files
 * - Visual feedback during drag
 * - Click to browse files
 * - Multiple file support
 * - File type validation
 * - File size validation
 *
 * @example
 * <file-drop-zone
 *   ?multiple=${true}
 *   accept="image/*,.pdf"
 *   maxSize="10485760"
 *   @files-selected=${this.handleFiles}
 * ></file-drop-zone>
 */
export class FileDropZone extends LitElement {
    static properties = {
        multiple: { type: Boolean },
        accept: { type: String },
        maxSize: { type: Number }, // in bytes
        disabled: { type: Boolean },
        _isDragging: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        .drop-zone {
            position: relative;
            border: 2px dashed var(--claude-border-normal, #d4d4cf);
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            background: var(--claude-bg-tertiary, #FAFAF8);
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .drop-zone:hover:not(.disabled) {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
            transform: translateY(-2px);
        }

        .drop-zone.dragging {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-accent-orange-subtle, #FEF3C7);
            border-width: 3px;
            transform: scale(1.02);
        }

        .drop-zone.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .drop-zone-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            pointer-events: none;
        }

        .drop-icon {
            font-size: 48px;
            opacity: 0.6;
        }

        .drop-zone.dragging .drop-icon {
            animation: bounce 0.5s ease infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .drop-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .drop-description {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .drop-hint {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .file-input {
            display: none;
        }

        /* Compact mode */
        :host([compact]) .drop-zone {
            padding: 16px;
        }

        :host([compact]) .drop-icon {
            font-size: 32px;
        }

        :host([compact]) .drop-title {
            font-size: var(--claude-font-size-base, 16px);
        }
    `;

    constructor() {
        super();
        this.multiple = false;
        this.accept = '';
        this.maxSize = 10485760; // 10MB default
        this.disabled = false;
        this._isDragging = false;
    }

    _handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.disabled) {
            this._isDragging = true;
        }
    }

    _handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    _handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();

        // Only set to false if leaving the drop zone itself
        if (e.target === this.shadowRoot.querySelector('.drop-zone')) {
            this._isDragging = false;
        }
    }

    _handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this._isDragging = false;

        if (this.disabled) return;

        const files = Array.from(e.dataTransfer.files);
        this._handleFiles(files);
    }

    _handleClick() {
        if (this.disabled) return;
        const input = this.shadowRoot.querySelector('.file-input');
        input.click();
    }

    _handleInputChange(e) {
        const files = Array.from(e.target.files);
        this._handleFiles(files);
        // Reset input so same file can be selected again
        e.target.value = '';
    }

    _handleFiles(files) {
        if (files.length === 0) return;

        // Validate files
        const validatedFiles = this._validateFiles(files);

        if (validatedFiles.valid.length > 0) {
            this.dispatchEvent(new CustomEvent('files-selected', {
                detail: {
                    files: validatedFiles.valid,
                    errors: validatedFiles.errors
                },
                bubbles: true,
                composed: true,
            }));
        } else if (validatedFiles.errors.length > 0) {
            // Dispatch error event if all files are invalid
            this.dispatchEvent(new CustomEvent('files-error', {
                detail: { errors: validatedFiles.errors },
                bubbles: true,
                composed: true,
            }));
        }
    }

    _validateFiles(files) {
        const valid = [];
        const errors = [];

        // Limit to single file if not multiple
        const filesToValidate = this.multiple ? files : [files[0]];

        filesToValidate.forEach(file => {
            // Check file size
            if (this.maxSize && file.size > this.maxSize) {
                errors.push({
                    file: file.name,
                    error: 'size',
                    message: `Le fichier ${file.name} dépasse la taille maximale de ${this._formatFileSize(this.maxSize)}`,
                });
                return;
            }

            // Check file type if accept is specified
            if (this.accept) {
                const acceptedTypes = this.accept.split(',').map(t => t.trim());
                const fileType = file.type;
                const fileName = file.name.toLowerCase();

                const isAccepted = acceptedTypes.some(acceptType => {
                    if (acceptType.startsWith('.')) {
                        // Extension check
                        return fileName.endsWith(acceptType.toLowerCase());
                    } else if (acceptType.endsWith('/*')) {
                        // MIME type wildcard (e.g., image/*)
                        const baseType = acceptType.split('/')[0];
                        return fileType.startsWith(baseType + '/');
                    } else {
                        // Exact MIME type
                        return fileType === acceptType;
                    }
                });

                if (!isAccepted) {
                    errors.push({
                        file: file.name,
                        error: 'type',
                        message: `Le type de fichier ${file.name} n'est pas accepté`,
                    });
                    return;
                }
            }

            valid.push(file);
        });

        return { valid, errors };
    }

    _formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    _getAcceptDescription() {
        if (!this.accept) return 'Tous les fichiers';

        const types = this.accept.split(',').map(t => t.trim());
        const descriptions = types.map(type => {
            if (type === 'image/*') return 'images';
            if (type === 'video/*') return 'vidéos';
            if (type === 'audio/*') return 'audio';
            if (type === 'application/pdf') return 'PDF';
            if (type.startsWith('.')) return type;
            return type;
        });

        return descriptions.join(', ');
    }

    render() {
        return html`
            <div
                class="drop-zone ${this._isDragging ? 'dragging' : ''} ${this.disabled ? 'disabled' : ''}"
                @dragenter="${this._handleDragEnter}"
                @dragover="${this._handleDragOver}"
                @dragleave="${this._handleDragLeave}"
                @drop="${this._handleDrop}"
                @click="${this._handleClick}"
            >
                <div class="drop-zone-content">
                    <div class="drop-icon">
                        ${this._isDragging ? '📥' : '📎'}
                    </div>
                    <div class="drop-title">
                        ${this._isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
                    </div>
                    <div class="drop-description">
                        ou cliquez pour parcourir
                    </div>
                    <div class="drop-hint">
                        ${this._getAcceptDescription()} · Max ${this._formatFileSize(this.maxSize)}
                    </div>
                </div>

                <input
                    class="file-input"
                    type="file"
                    ?multiple="${this.multiple}"
                    accept="${this.accept}"
                    @change="${this._handleInputChange}"
                    ?disabled="${this.disabled}"
                />
            </div>
        `;
    }
}

customElements.define('file-drop-zone', FileDropZone);
