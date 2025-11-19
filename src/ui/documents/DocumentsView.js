import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import { TranslationMixin } from '../i18n/useTranslation.js';

/**
 * Documents View Component - Phase 4: Knowledge Base
 * Manages document upload, search, and organization
 */
export class DocumentsView extends TranslationMixin(LitElement) {
    static styles = css`
        * {
            font-family: var(--font-family-primary);
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: var(--glass-bg);
            border-radius: var(--radius-lg);
            overflow: hidden;
        }

        .documents-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: var(--padding-md);
            gap: var(--gap-md);
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: var(--padding-sm);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-title {
            font-size: 18px;
            font-weight: 600;
            color: white;
        }

        .upload-btn {
            background: color-mix(in srgb, var(--color-primary-500) 20%, transparent);
            border: 1px solid color-mix(in srgb, var(--color-primary-500) 40%, transparent);
            color: white;
            padding: var(--padding-xs) var(--padding-md);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 13px;
        }

        .upload-btn:hover {
            background: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
        }

        .search-bar {
            display: flex;
            gap: var(--gap-xs);
        }

        .search-input {
            flex: 1;
            padding: var(--space-2-5) var(--space-3-5);
            background: var(--color-white-5);
            border: 1px solid var(--color-white-10);
            border-radius: var(--radius-md);
            color: white;
            font-size: 13px;
        }

        .documents-list {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: var(--gap-xs);
        }

        .document-card {
            background: var(--color-white-5);
            border: 1px solid var(--color-white-10);
            border-radius: var(--radius-md);
            padding: var(--padding-sm);
            cursor: pointer;
            transition: all var(--transition-base) var(--easing-standard);
        }

        .document-card:hover {
            background: var(--color-white-8);
            transform: translateX(4px);
        }

        .doc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--space-1-5);
        }

        .doc-title {
            font-size: 14px;
            font-weight: 500;
            color: white;
        }

        .doc-meta {
            font-size: 11px;
            color: var(--color-white-50);
        }

        .no-documents {
            text-align: center;
            padding: var(--space-15) var(--space-5);
            color: var(--color-white-50);
        }

        .stats {
            display: flex;
            gap: var(--gap-md);
            padding: var(--padding-sm);
            background: var(--color-white-3);
            border-radius: var(--radius-md);
        }

        .stat-item {
            flex: 1;
            text-align: center;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: white;
        }

        .stat-label {
            font-size: 11px;
            color: var(--color-white-50);
            margin-top: var(--space-1);
        }
    `;

    static properties = {
        documents: { type: Array, state: true },
        stats: { type: Object, state: true },
        searchQuery: { type: String, state: true },
        isLoading: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.documents = [];
        this.stats = { total_documents: 0, total_size: 0, indexed_documents: 0 };
        this.searchQuery = '';
        this.isLoading = false;

        this.loadDocuments();
        this.loadStats();
    }

    async loadDocuments() {
        if (!window.api) return;

        this.isLoading = true;

        try {
            this.documents = await window.api.documents.getAllDocuments();
            console.log(`[DocumentsView] Loaded ${this.documents.length} documents`);
        } catch (error) {
            console.error('[DocumentsView] Error loading documents:', error);
            this.documents = [];
        }

        this.isLoading = false;
    }

    async loadStats() {
        if (!window.api) return;

        try {
            this.stats = await window.api.documents.getStats();
        } catch (error) {
            console.error('[DocumentsView] Error loading stats:', error);
        }
    }

    async handleUpload() {
        if (!window.api) return;

        // This would trigger a file picker in the main process
        const result = await window.api.documents.uploadDocument();

        if (result) {
            await this.loadDocuments();
            await this.loadStats();
        }
    }

    async handleSearch(e) {
        this.searchQuery = e.target.value;

        if (this.searchQuery.length < 2) {
            await this.loadDocuments();
            return;
        }

        try {
            this.documents = await window.api.documents.searchDocuments(this.searchQuery);
        } catch (error) {
            console.error('[DocumentsView] Error searching:', error);
        }
    }

    async handleDelete(documentId) {
        if (!window.api || !confirm('Delete this document?')) return;

        try {
            await window.api.documents.deleteDocument(documentId);
            await this.loadDocuments();
            await this.loadStats();
        } catch (error) {
            console.error('[DocumentsView] Error deleting:', error);
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    render() {
        return html`
            <div class="documents-container">
                <div class="header">
                    <div class="header-title">📚 Base de Connaissances</div>
                    <button class="upload-btn" @click=${this.handleUpload}>
                        + Upload Document
                    </button>
                </div>

                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-value">${this.stats.total_documents || 0}</div>
                        <div class="stat-label">Documents</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.formatFileSize(this.stats.total_size || 0)}</div>
                        <div class="stat-label">Storage</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.stats.indexed_documents || 0}</div>
                        <div class="stat-label">Indexed</div>
                    </div>
                </div>

                <div class="search-bar">
                    <input
                        type="text"
                        class="search-input"
                        placeholder="${this.t('documents.searchPlaceholder')}"
                        @input=${this.handleSearch}
                        .value=${this.searchQuery}
                    />
                </div>

                <div class="documents-list">
                    ${this.documents.length === 0 ? html`
                        <div class="no-documents">
                            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                            <div>No documents yet</div>
                            <div style="margin-top: 8px; font-size: 12px;">
                                Upload documents to build your knowledge base
                            </div>
                        </div>
                    ` : this.documents.map(doc => html`
                        <div class="document-card" @click=${() => this.handleDocumentClick(doc)}>
                            <div class="doc-header">
                                <div class="doc-title">
                                    ${this.getFileIcon(doc.file_type)} ${doc.title}
                                </div>
                                <button
                                    @click=${(e) => { e.stopPropagation(); this.handleDelete(doc.id); }}
                                    style="background: rgba(255,100,100,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                                >
                                    Delete
                                </button>
                            </div>
                            <div class="doc-meta">
                                ${doc.filename} • ${this.formatFileSize(doc.file_size)} •
                                ${this.formatDate(doc.created_at)} •
                                ${doc.chunk_count} chunks
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    getFileIcon(fileType) {
        const icons = {
            'pdf': '📕',
            'docx': '📘',
            'txt': '📄',
            'md': '📝'
        };
        return icons[fileType] || '📄';
    }

    handleDocumentClick(doc) {
        console.log('[DocumentsView] Document clicked:', doc.id);
        // Could open a detail view or preview
    }
}

customElements.define('documents-view', DocumentsView);
