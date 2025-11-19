import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeButton.js';
import '../code/CodeBlock.js';

/**
 * ArtifactsPanel - Contextual panel for code/preview (Claude.ai style)
 *
 * Features:
 * - Shows code blocks with syntax highlighting
 * - React/HTML preview mode
 * - Markdown rendering
 * - Copy code functionality
 * - Fullscreen mode
 * - Close button
 * - Resize handle
 *
 * @example
 * <artifacts-panel
 *   .artifact=${this.currentArtifact}
 *   @close=${this.handleClose}
 * ></artifacts-panel>
 */
export class ArtifactsPanel extends LitElement {
    static properties = {
        artifact: { type: Object },
        isFullscreen: { type: Boolean, state: true },
        currentTab: { type: String, state: true },
        copiedState: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-left: 1px solid var(--claude-border-subtle, #e5e5e0);
            position: relative;
        }

        :host(.fullscreen) {
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-fullscreen, 1000);
            border-left: none;
        }

        /* Header */
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            background: var(--claude-bg-secondary, #FFFFFF);
            gap: 12px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .artifact-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        .artifact-info {
            flex: 1;
            min-width: 0;
        }

        .artifact-title {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .artifact-type {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .action-button {
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
            font-size: 16px;
            position: relative;
        }

        .action-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        .action-button:active {
            background: var(--claude-active-overlay, rgba(0, 0, 0, 0.08));
            transform: scale(0.95);
        }

        /* Tooltip */
        .tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--claude-text-primary, #1a1a1a);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: var(--claude-font-size-xs, 12px);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
            z-index: 1000;
        }

        .action-button:hover .tooltip {
            opacity: 1;
        }

        /* Copied feedback */
        .copied-feedback {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--claude-success-bg, #ECFDF5);
            color: var(--claude-success-text, #065F46);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: var(--claude-font-size-xs, 12px);
            white-space: nowrap;
            animation: fadeInOut 2s ease;
        }

        @keyframes fadeInOut {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(5px);
            }
            10%, 90% {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateX(-50%) translateY(-5px);
            }
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 4px;
            padding: 8px 20px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            background: var(--claude-bg-tertiary, #FAFAF8);
        }

        .tab {
            padding: 6px 12px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            border-radius: 6px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .tab:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .tab.active {
            background: var(--claude-bg-secondary, #FFFFFF);
            color: var(--claude-text-primary, #1a1a1a);
            box-shadow: var(--claude-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
        }

        /* Content area */
        .panel-content {
            flex: 1;
            overflow-y: auto;
            position: relative;
        }

        /* Code view */
        .code-container {
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .code-container code-block {
            flex: 1;
            overflow: hidden;
        }

        /* Preview view */
        .preview-container {
            height: 100%;
            background: white;
        }

        .preview-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Markdown view */
        .markdown-container {
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
        }

        .markdown-content {
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
            margin-top: 24px;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .markdown-content p {
            margin: 12px 0;
        }

        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 16px;
            color: var(--claude-text-tertiary, #9b9b9b);
            text-align: center;
            padding: 48px 24px;
        }

        .empty-icon {
            font-size: 64px;
            opacity: 0.5;
        }

        .empty-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .empty-description {
            font-size: var(--claude-font-size-base, 16px);
            max-width: 300px;
        }

        /* Resize handle */
        .resize-handle {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            cursor: ew-resize;
            background: transparent;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .resize-handle:hover,
        .resize-handle:active {
            background: var(--claude-accent-orange, #D97706);
        }

        /* Scrollbar */
        .panel-content::-webkit-scrollbar,
        .code-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .panel-content::-webkit-scrollbar-track,
        .code-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .panel-content::-webkit-scrollbar-thumb,
        .code-container::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover,
        .code-container::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .panel-header {
                padding: 12px 16px;
            }

            .tabs {
                padding: 6px 16px;
            }

            .markdown-container {
                padding: 16px;
            }
        }
    `;

    constructor() {
        super();
        this.artifact = null;
        this.isFullscreen = false;
        this.currentTab = 'code';
        this.copiedState = false;
    }

    _handleCopy() {
        if (!this.artifact?.content) return;

        navigator.clipboard.writeText(this.artifact.content).then(() => {
            this.copiedState = true;
            setTimeout(() => {
                this.copiedState = false;
            }, 2000);
        });
    }

    _handleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            this.classList.add('fullscreen');
        } else {
            this.classList.remove('fullscreen');
        }
    }

    _handleClose() {
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true
        }));
    }

    _handleDownload() {
        if (!this.artifact?.content) return;

        const filename = this._getDownloadFilename();
        const blob = new Blob([this.artifact.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    _getDownloadFilename() {
        const title = this.artifact.title || 'artifact';
        const extension = this._getFileExtension(this.artifact.language || this.artifact.type);
        return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
    }

    _getFileExtension(languageOrType) {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            csharp: 'cs',
            html: 'html',
            css: 'css',
            scss: 'scss',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
            bash: 'sh',
            sql: 'sql',
            php: 'php',
            ruby: 'rb',
            go: 'go',
            rust: 'rs',
            swift: 'swift',
            kotlin: 'kt',
        };
        return extensions[languageOrType?.toLowerCase()] || 'txt';
    }

    _handleTabChange(tab) {
        this.currentTab = tab;
    }

    _getArtifactIcon(type) {
        const icons = {
            code: '💻',
            react: '⚛️',
            html: '🌐',
            markdown: '📝',
            text: '📄',
            json: '📋'
        };
        return icons[type] || '📄';
    }

    _getLanguageName(language) {
        const names = {
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            csharp: 'C#',
            html: 'HTML',
            css: 'CSS',
            json: 'JSON',
            markdown: 'Markdown',
            bash: 'Bash',
            sql: 'SQL'
        };
        return names[language] || language?.toUpperCase() || 'CODE';
    }

    _renderCodeView() {
        if (!this.artifact?.content) {
            return this._renderEmptyState();
        }

        return html`
            <div class="code-container">
                <code-block
                    .code="${this.artifact.content}"
                    .language="${this.artifact.language || this.artifact.type || ''}"
                    ?showLineNumbers="${true}"
                    maxHeight="none"
                ></code-block>
            </div>
        `;
    }

    _renderPreviewView() {
        if (!this.artifact?.content) {
            return this._renderEmptyState();
        }

        // Create blob URL for preview
        const blob = new Blob([this.artifact.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        return html`
            <div class="preview-container">
                <iframe
                    class="preview-iframe"
                    src="${url}"
                    sandbox="allow-scripts allow-same-origin"
                    @load="${() => URL.revokeObjectURL(url)}"
                ></iframe>
            </div>
        `;
    }

    _renderMarkdownView() {
        if (!this.artifact?.content) {
            return this._renderEmptyState();
        }

        // Basic markdown rendering (can be enhanced with marked.js)
        const rendered = this._renderMarkdown(this.artifact.content);

        return html`
            <div class="markdown-container">
                <div class="markdown-content">
                    ${rendered}
                </div>
            </div>
        `;
    }

    _renderMarkdown(content) {
        // Simple markdown rendering
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');

        // Bold
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        return html;
    }

    _renderEmptyState() {
        return html`
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <div class="empty-title">Aucun contenu</div>
                <div class="empty-description">
                    Le contenu de l'artifact sera affiché ici
                </div>
            </div>
        `;
    }

    _renderContent() {
        switch (this.currentTab) {
            case 'code':
                return this._renderCodeView();
            case 'preview':
                return this._renderPreviewView();
            case 'markdown':
                return this._renderMarkdownView();
            default:
                return this._renderCodeView();
        }
    }

    _shouldShowTabs() {
        if (!this.artifact) return false;

        const type = this.artifact.type;
        return type === 'html' || type === 'react' || type === 'markdown';
    }

    render() {
        if (!this.artifact) {
            return this._renderEmptyState();
        }

        const showTabs = this._shouldShowTabs();

        return html`
            <!-- Resize handle -->
            <div class="resize-handle"></div>

            <!-- Header -->
            <div class="panel-header">
                <div class="header-left">
                    <span class="artifact-icon">
                        ${this._getArtifactIcon(this.artifact.type)}
                    </span>
                    <div class="artifact-info">
                        <div class="artifact-title">${this.artifact.title || 'Artifact'}</div>
                        <div class="artifact-type">${this.artifact.type || 'code'}</div>
                    </div>
                </div>

                <div class="header-actions">
                    <!-- Copy button -->
                    <button
                        class="action-button"
                        @click="${this._handleCopy}"
                        aria-label="Copier le code"
                    >
                        📋
                        <span class="tooltip">Copier</span>
                        ${this.copiedState ? html`
                            <span class="copied-feedback">✓ Copié !</span>
                        ` : ''}
                    </button>

                    <!-- Download button -->
                    <button
                        class="action-button"
                        @click="${this._handleDownload}"
                        aria-label="Télécharger"
                    >
                        💾
                        <span class="tooltip">Télécharger</span>
                    </button>

                    <!-- Fullscreen button -->
                    <button
                        class="action-button"
                        @click="${this._handleFullscreen}"
                        aria-label="${this.isFullscreen ? 'Quitter plein écran' : 'Plein écran'}"
                    >
                        ${this.isFullscreen ? '⊗' : '⛶'}
                        <span class="tooltip">
                            ${this.isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                        </span>
                    </button>

                    <!-- Close button -->
                    <button
                        class="action-button"
                        @click="${this._handleClose}"
                        aria-label="Fermer"
                    >
                        ✕
                        <span class="tooltip">Fermer</span>
                    </button>
                </div>
            </div>

            <!-- Tabs (conditional) -->
            ${showTabs ? html`
                <div class="tabs">
                    <button
                        class="tab ${this.currentTab === 'code' ? 'active' : ''}"
                        @click="${() => this._handleTabChange('code')}"
                    >
                        Code
                    </button>
                    ${this.artifact.type === 'html' || this.artifact.type === 'react' ? html`
                        <button
                            class="tab ${this.currentTab === 'preview' ? 'active' : ''}"
                            @click="${() => this._handleTabChange('preview')}"
                        >
                            Aperçu
                        </button>
                    ` : ''}
                    ${this.artifact.type === 'markdown' ? html`
                        <button
                            class="tab ${this.currentTab === 'markdown' ? 'active' : ''}"
                            @click="${() => this._handleTabChange('markdown')}"
                        >
                            Rendu
                        </button>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Content -->
            <div class="panel-content">
                ${this._renderContent()}
            </div>
        `;
    }
}

customElements.define('artifacts-panel', ArtifactsPanel);
