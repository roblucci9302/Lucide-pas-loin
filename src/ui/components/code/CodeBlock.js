import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * CodeBlock - Syntax-highlighted code block with line numbers
 *
 * Features:
 * - Syntax highlighting for common languages
 * - Line numbers
 * - Copy button
 * - Language badge
 * - Responsive design
 *
 * @example
 * <code-block
 *   .code=${this.codeString}
 *   language="javascript"
 *   ?showLineNumbers=${true}
 * ></code-block>
 */
export class CodeBlock extends LitElement {
    static properties = {
        code: { type: String },
        language: { type: String },
        showLineNumbers: { type: Boolean },
        maxHeight: { type: String },
        _copiedState: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
            position: relative;
            background: var(--code-bg, #1e1e1e);
            border-radius: 8px;
            overflow: hidden;
        }

        .code-container {
            display: flex;
            overflow: auto;
            max-height: var(--code-max-height, 600px);
        }

        /* Line numbers */
        .line-numbers {
            display: flex;
            flex-direction: column;
            padding: 16px 0;
            background: var(--code-gutter-bg, #252525);
            color: var(--code-gutter-text, #858585);
            font-family: var(--claude-font-family-mono, 'Monaco', 'Consolas', monospace);
            font-size: 13px;
            line-height: 1.6;
            text-align: right;
            user-select: none;
            border-right: 1px solid var(--code-border, #3e3e3e);
            flex-shrink: 0;
        }

        .line-number {
            padding: 0 12px;
            min-height: 20.8px;
        }

        /* Code content */
        .code-content {
            flex: 1;
            padding: 16px;
            overflow-x: auto;
        }

        pre {
            margin: 0;
            padding: 0;
            font-family: var(--claude-font-family-mono, 'Monaco', 'Consolas', monospace);
            font-size: 13px;
            line-height: 1.6;
            color: var(--code-text, #d4d4d4);
        }

        code {
            display: block;
            white-space: pre;
        }

        /* Syntax highlighting colors */
        .token.comment {
            color: #6a9955;
            font-style: italic;
        }

        .token.keyword {
            color: #569cd6;
            font-weight: 600;
        }

        .token.string {
            color: #ce9178;
        }

        .token.number {
            color: #b5cea8;
        }

        .token.function {
            color: #dcdcaa;
        }

        .token.class-name {
            color: #4ec9b0;
        }

        .token.operator {
            color: #d4d4d4;
        }

        .token.punctuation {
            color: #d4d4d4;
        }

        .token.property {
            color: #9cdcfe;
        }

        .token.boolean {
            color: #569cd6;
        }

        .token.constant {
            color: #4fc1ff;
        }

        .token.tag {
            color: #569cd6;
        }

        .token.attr-name {
            color: #9cdcfe;
        }

        .token.attr-value {
            color: #ce9178;
        }

        .token.selector {
            color: #d7ba7d;
        }

        .token.variable {
            color: #9cdcfe;
        }

        /* Header */
        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: var(--code-header-bg, #2d2d2d);
            border-bottom: 1px solid var(--code-border, #3e3e3e);
        }

        .language-badge {
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: 11px;
            font-weight: 600;
            color: var(--code-badge-text, #858585);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .copy-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: transparent;
            border: 1px solid var(--code-border, #3e3e3e);
            border-radius: 4px;
            color: var(--code-text, #d4d4d4);
            font-size: 12px;
            cursor: pointer;
            transition: all 150ms ease;
        }

        .copy-button:hover {
            background: var(--code-hover-bg, #3e3e3e);
            border-color: var(--code-hover-border, #4e4e4e);
        }

        .copy-button.copied {
            border-color: var(--claude-success, #10B981);
            color: var(--claude-success, #10B981);
        }

        /* Scrollbar */
        .code-container::-webkit-scrollbar,
        .code-content::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .code-container::-webkit-scrollbar-track,
        .code-content::-webkit-scrollbar-track {
            background: var(--code-scrollbar-track, #1e1e1e);
        }

        .code-container::-webkit-scrollbar-thumb,
        .code-content::-webkit-scrollbar-thumb {
            background: var(--code-scrollbar-thumb, #3e3e3e);
            border-radius: 4px;
        }

        .code-container::-webkit-scrollbar-thumb:hover,
        .code-content::-webkit-scrollbar-thumb:hover {
            background: var(--code-scrollbar-thumb-hover, #4e4e4e);
        }
    `;

    constructor() {
        super();
        this.code = '';
        this.language = '';
        this.showLineNumbers = true;
        this.maxHeight = '600px';
        this._copiedState = false;
    }

    updated(changedProperties) {
        if (changedProperties.has('maxHeight')) {
            this.style.setProperty('--code-max-height', this.maxHeight);
        }
    }

    _handleCopy() {
        if (!this.code) return;

        navigator.clipboard.writeText(this.code).then(() => {
            this._copiedState = true;
            setTimeout(() => {
                this._copiedState = false;
            }, 2000);
        }).catch(err => {
            console.error('[CodeBlock] Failed to copy:', err);
        });
    }

    _getLanguageDisplayName(lang) {
        const names = {
            js: 'JavaScript',
            javascript: 'JavaScript',
            ts: 'TypeScript',
            typescript: 'TypeScript',
            py: 'Python',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            cs: 'C#',
            csharp: 'C#',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            json: 'JSON',
            xml: 'XML',
            yaml: 'YAML',
            yml: 'YAML',
            md: 'Markdown',
            markdown: 'Markdown',
            bash: 'Bash',
            sh: 'Shell',
            sql: 'SQL',
            php: 'PHP',
            rb: 'Ruby',
            ruby: 'Ruby',
            go: 'Go',
            rust: 'Rust',
            swift: 'Swift',
            kotlin: 'Kotlin',
        };
        return names[lang?.toLowerCase()] || lang?.toUpperCase() || 'CODE';
    }

    /**
     * Simple syntax highlighter for common languages
     */
    _highlightCode(code, language) {
        if (!code) return '';

        let highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Language-specific highlighting
        switch (language?.toLowerCase()) {
            case 'javascript':
            case 'js':
            case 'typescript':
            case 'ts':
                highlighted = this._highlightJavaScript(highlighted);
                break;
            case 'python':
            case 'py':
                highlighted = this._highlightPython(highlighted);
                break;
            case 'html':
                highlighted = this._highlightHTML(highlighted);
                break;
            case 'css':
            case 'scss':
                highlighted = this._highlightCSS(highlighted);
                break;
            case 'json':
                highlighted = this._highlightJSON(highlighted);
                break;
            default:
                highlighted = this._highlightGeneric(highlighted);
        }

        return highlighted;
    }

    _highlightJavaScript(code) {
        // Keywords
        const keywords = 'const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|class|extends|import|export|from|default|new|this|super|static|get|set|typeof|instanceof|in|of|delete|void|yield|null|undefined';
        code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="token keyword">$1</span>');

        // Strings (single and double quotes)
        code = code.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span class="token string">$1</span>');

        // Numbers
        code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

        // Functions
        code = code.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="token function">$1</span>');

        // Comments
        code = code.replace(/(\/\/.*$)/gm, '<span class="token comment">$1</span>');
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');

        // Booleans
        code = code.replace(/\b(true|false)\b/g, '<span class="token boolean">$1</span>');

        return code;
    }

    _highlightPython(code) {
        // Keywords
        const keywords = 'def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|pass|break|continue|yield|lambda|async|await|None|True|False|and|or|not|in|is';
        code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="token keyword">$1</span>');

        // Strings
        code = code.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|'''[\s\S]*?'''|"""[\s\S]*?""")/g, '<span class="token string">$1</span>');

        // Numbers
        code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

        // Functions
        code = code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="token function">$1</span>');

        // Comments
        code = code.replace(/(#.*$)/gm, '<span class="token comment">$1</span>');

        return code;
    }

    _highlightHTML(code) {
        // Tags
        code = code.replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9-]*)/g, '&lt;<span class="token tag">$1</span>');
        code = code.replace(/&gt;/g, '<span class="token punctuation">&gt;</span>');

        // Attributes
        code = code.replace(/\s([a-zA-Z-]+)=/g, ' <span class="token attr-name">$1</span>=');

        // Attribute values
        code = code.replace(/="([^"]*)"/g, '=<span class="token attr-value">"$1"</span>');

        // Comments
        code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>');

        return code;
    }

    _highlightCSS(code) {
        // Selectors
        code = code.replace(/^([^{]+)(?={)/gm, '<span class="token selector">$1</span>');

        // Properties
        code = code.replace(/\b([a-z-]+)(?=\s*:)/g, '<span class="token property">$1</span>');

        // Strings
        code = code.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="token string">$1</span>');

        // Numbers and units
        code = code.replace(/\b(\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms)?)\b/g, '<span class="token number">$1</span>');

        // Comments
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');

        return code;
    }

    _highlightJSON(code) {
        // Keys
        code = code.replace(/"([^"]+)":/g, '<span class="token property">"$1"</span>:');

        // Strings
        code = code.replace(/:\s*"([^"]*)"/g, ': <span class="token string">"$1"</span>');

        // Numbers
        code = code.replace(/:\s*(\d+\.?\d*)/g, ': <span class="token number">$1</span>');

        // Booleans and null
        code = code.replace(/:\s*(true|false|null)/g, ': <span class="token boolean">$1</span>');

        return code;
    }

    _highlightGeneric(code) {
        // Strings
        code = code.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="token string">$1</span>');

        // Numbers
        code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

        // Comments (generic)
        code = code.replace(/(\/\/.*$|#.*$)/gm, '<span class="token comment">$1</span>');
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');

        return code;
    }

    render() {
        const lines = this.code.split('\n');
        const highlightedCode = this._highlightCode(this.code, this.language);
        const highlightedLines = highlightedCode.split('\n');

        return html`
            <!-- Header -->
            <div class="code-header">
                <div class="language-badge">
                    ${this._getLanguageDisplayName(this.language)}
                </div>
                <button
                    class="copy-button ${this._copiedState ? 'copied' : ''}"
                    @click=${this._handleCopy}
                    title="Copier le code"
                >
                    ${this._copiedState ? '✓ Copié' : '📋 Copier'}
                </button>
            </div>

            <!-- Code -->
            <div class="code-container">
                ${this.showLineNumbers ? html`
                    <div class="line-numbers">
                        ${lines.map((_, i) => html`
                            <div class="line-number">${i + 1}</div>
                        `)}
                    </div>
                ` : ''}
                <div class="code-content">
                    <pre><code>${highlightedLines.map(line => html`${this._unsafeHTML(line)}\n`)}</code></pre>
                </div>
            </div>
        `;
    }

    /**
     * Render raw HTML (needed for syntax highlighting)
     * WARNING: Only use with sanitized/escaped content
     */
    _unsafeHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString;
        return template.content;
    }
}

customElements.define('code-block', CodeBlock);
