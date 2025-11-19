import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * CodeBlock - Enhanced code block with syntax highlighting
 *
 * Features:
 * - Syntax highlighting with highlight.js
 * - Copy button with visual feedback
 * - Line numbers (optional)
 * - Language badge
 * - Theme-aware (light/dark)
 *
 * @example
 * <code-block
 *   language="javascript"
 *   .code=${codeString}
 *   ?showLineNumbers=${true}
 * ></code-block>
 */
export class CodeBlock extends LitElement {
    static properties = {
        language: { type: String },
        code: { type: String },
        showLineNumbers: { type: Boolean },
        _copied: { type: Boolean, state: true },
        _highlightedCode: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
            margin: 12px 0;
        }

        .code-block-container {
            position: relative;
            background: var(--claude-code-bg, #1e1e1e);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--claude-code-border, #2d2d2d);
        }

        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: var(--claude-code-header-bg, #2d2d2d);
            border-bottom: 1px solid var(--claude-code-border, #3d3d3d);
        }

        .language-badge {
            font-size: var(--claude-font-size-xs, 11px);
            font-weight: 600;
            text-transform: uppercase;
            color: var(--claude-code-language, #9cdcfe);
            letter-spacing: 0.5px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .copy-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: var(--claude-code-copy-bg, #3d3d3d);
            border: 1px solid var(--claude-code-copy-border, #4d4d4d);
            border-radius: 4px;
            color: var(--claude-code-copy-text, #d4d4d4);
            font-size: var(--claude-font-size-xs, 11px);
            font-weight: 500;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-family: inherit;
        }

        .copy-button:hover {
            background: var(--claude-code-copy-hover, #4d4d4d);
            border-color: var(--claude-code-copy-border-hover, #5d5d5d);
        }

        .copy-button.copied {
            background: var(--claude-success-bg, #2ea043);
            border-color: var(--claude-success-border, #3fb950);
            color: white;
        }

        .copy-icon {
            font-size: 14px;
        }

        .code-content {
            display: flex;
            overflow-x: auto;
        }

        .line-numbers {
            padding: 16px 0;
            background: var(--claude-code-line-numbers-bg, #252525);
            color: var(--claude-code-line-numbers, #858585);
            font-size: var(--claude-font-size-sm, 13px);
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            text-align: right;
            user-select: none;
            min-width: 40px;
            border-right: 1px solid var(--claude-code-border, #3d3d3d);
        }

        .line-number {
            padding: 0 12px;
            line-height: 1.5;
        }

        pre {
            flex: 1;
            margin: 0;
            padding: 16px;
            overflow-x: auto;
            background: transparent;
        }

        code {
            font-size: var(--claude-font-size-sm, 13px);
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            line-height: 1.5;
            color: var(--claude-code-text, #d4d4d4);
            display: block;
        }

        /* Scrollbar styling */
        .code-content::-webkit-scrollbar,
        pre::-webkit-scrollbar {
            height: 8px;
        }

        .code-content::-webkit-scrollbar-track,
        pre::-webkit-scrollbar-track {
            background: var(--claude-code-scrollbar-track, #2d2d2d);
        }

        .code-content::-webkit-scrollbar-thumb,
        pre::-webkit-scrollbar-thumb {
            background: var(--claude-code-scrollbar-thumb, #4d4d4d);
            border-radius: 4px;
        }

        .code-content::-webkit-scrollbar-thumb:hover,
        pre::-webkit-scrollbar-thumb:hover {
            background: var(--claude-code-scrollbar-thumb-hover, #5d5d5d);
        }

        /* Syntax highlighting styles - VS Code Dark theme */
        code .hljs-keyword {
            color: #569cd6;
        }

        code .hljs-string {
            color: #ce9178;
        }

        code .hljs-number {
            color: #b5cea8;
        }

        code .hljs-comment {
            color: #6a9955;
            font-style: italic;
        }

        code .hljs-function {
            color: #dcdcaa;
        }

        code .hljs-class {
            color: #4ec9b0;
        }

        code .hljs-variable {
            color: #9cdcfe;
        }

        code .hljs-property {
            color: #9cdcfe;
        }

        code .hljs-operator {
            color: #d4d4d4;
        }

        code .hljs-tag {
            color: #569cd6;
        }

        code .hljs-attr {
            color: #9cdcfe;
        }

        code .hljs-built_in {
            color: #4ec9b0;
        }

        code .hljs-meta {
            color: #808080;
        }

        code .hljs-title {
            color: #dcdcaa;
        }

        code .hljs-params {
            color: #9cdcfe;
        }
    `;

    constructor() {
        super();
        this.language = '';
        this.code = '';
        this.showLineNumbers = false;
        this._copied = false;
        this._highlightedCode = '';
    }

    updated(changedProperties) {
        if (changedProperties.has('code') || changedProperties.has('language')) {
            this._highlightCode();
        }
    }

    _highlightCode() {
        // Check if highlight.js is available
        if (typeof window.hljs !== 'undefined') {
            try {
                if (this.language && window.hljs.getLanguage(this.language)) {
                    // Highlight with specified language
                    const result = window.hljs.highlight(this.code, {
                        language: this.language,
                        ignoreIllegals: true
                    });
                    this._highlightedCode = result.value;
                } else {
                    // Auto-detect language
                    const result = window.hljs.highlightAuto(this.code);
                    this._highlightedCode = result.value;
                    // Update language if detected
                    if (result.language && !this.language) {
                        this.language = result.language;
                    }
                }
            } catch (error) {
                console.error('[CodeBlock] Highlight error:', error);
                this._highlightedCode = this._escapeHtml(this.code);
            }
        } else {
            // Fallback without highlighting
            this._highlightedCode = this._escapeHtml(this.code);
        }
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async _handleCopy() {
        try {
            await navigator.clipboard.writeText(this.code);
            this._copied = true;

            // Reset after 2 seconds
            setTimeout(() => {
                this._copied = false;
            }, 2000);

            // Dispatch event for parent to show toast
            this.dispatchEvent(new CustomEvent('code-copied', {
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[CodeBlock] Copy error:', error);
        }
    }

    _getLineNumbers() {
        const lines = this.code.split('\n');
        return lines.map((_, index) => index + 1);
    }

    _getLanguageDisplay() {
        if (!this.language) return 'code';

        // Map common language codes to display names
        const languageMap = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'py': 'Python',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'C#',
            'csharp': 'C#',
            'rb': 'Ruby',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'php': 'PHP',
            'swift': 'Swift',
            'kt': 'Kotlin',
            'kotlin': 'Kotlin',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML',
            'md': 'Markdown',
            'markdown': 'Markdown',
            'sql': 'SQL',
            'sh': 'Shell',
            'bash': 'Bash',
            'shell': 'Shell',
        };

        return languageMap[this.language.toLowerCase()] || this.language.toUpperCase();
    }

    render() {
        const lineNumbers = this._getLineNumbers();

        return html`
            <div class="code-block-container">
                <div class="code-header">
                    <span class="language-badge">${this._getLanguageDisplay()}</span>
                    <button
                        class="copy-button ${this._copied ? 'copied' : ''}"
                        @click="${this._handleCopy}"
                        title="${this._copied ? 'Copié !' : 'Copier le code'}"
                    >
                        <span class="copy-icon">${this._copied ? '✓' : '📋'}</span>
                        <span>${this._copied ? 'Copié' : 'Copier'}</span>
                    </button>
                </div>
                <div class="code-content">
                    ${this.showLineNumbers ? html`
                        <div class="line-numbers">
                            ${lineNumbers.map(num => html`
                                <div class="line-number">${num}</div>
                            `)}
                        </div>
                    ` : ''}
                    <pre><code .innerHTML="${this._highlightedCode}"></code></pre>
                </div>
            </div>
        `;
    }
}

customElements.define('code-block', CodeBlock);
