import { html, css, LitElement, unsafeHTML } from '../../assets/lit-core-2.7.4.min.js';
import '../base/ClaudeAvatar.js';
import './MessageActionBar.js';

/**
 * MessageAssistant - Assistant message component with Claude.ai styling
 *
 * Features:
 * - Aligned left
 * - Transparent background
 * - Avatar + name header
 * - Markdown rendering with syntax highlighting
 * - Action bar on hover (copy, thumbs up/down, regenerate, share)
 * - Code blocks with copy button
 *
 * @example
 * <message-assistant
 *   .content=${this.message.content}
 *   .timestamp=${this.message.created_at}
 *   .assistantName=${"Lucide"}
 *   .isStreaming=${false}
 * ></message-assistant>
 */
export class MessageAssistant extends LitElement {
    static properties = {
        content: { type: String },
        timestamp: { type: String },
        assistantName: { type: String },
        isStreaming: { type: Boolean },
        showActions: { type: Boolean, state: true },
        messageId: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .message-wrapper {
            display: flex;
            justify-content: flex-start;
            gap: 12px;
            width: 100%;
            position: relative;
        }

        .message-wrapper:hover .action-bar-wrapper {
            opacity: 1;
            pointer-events: auto;
        }

        .avatar-wrapper {
            flex-shrink: 0;
            align-self: flex-start;
            margin-top: 4px;
        }

        .message-container {
            display: flex;
            flex-direction: column;
            max-width: 100%;
            flex: 1;
            min-width: 0;
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .assistant-name {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .timestamp {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .message-content {
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Markdown styling */
        .message-content :is(h1, h2, h3, h4, h5, h6) {
            margin-top: 24px;
            margin-bottom: 12px;
            font-weight: 600;
            line-height: 1.3;
        }

        .message-content h1 { font-size: 28px; }
        .message-content h2 { font-size: 24px; }
        .message-content h3 { font-size: 20px; }

        .message-content p {
            margin: 12px 0;
        }

        .message-content ul,
        .message-content ol {
            margin: 12px 0;
            padding-left: 24px;
        }

        .message-content li {
            margin: 6px 0;
        }

        .message-content a {
            color: var(--claude-accent-orange, #D97706);
            text-decoration: underline;
            transition: color var(--claude-transition-fast, 150ms) ease;
        }

        .message-content a:hover {
            color: var(--claude-accent-orange-dark, #B45309);
        }

        /* Code blocks */
        .message-content pre {
            background: var(--claude-code-bg, #2d2d2d);
            border-radius: var(--radius-md, 8px);
            padding: 16px;
            overflow-x: auto;
            margin: 16px 0;
            position: relative;
        }

        .message-content code {
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: 14px;
            color: var(--claude-code-text, #e8e8e8);
        }

        .message-content p code,
        .message-content li code {
            background: var(--claude-code-inline-bg, #F5F5F0);
            color: var(--claude-text-primary, #1a1a1a);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 14px;
        }

        .message-content blockquote {
            border-left: 3px solid var(--claude-border-normal, #d4d4cf);
            padding-left: 16px;
            margin: 16px 0;
            color: var(--claude-text-secondary, #6b6b6b);
            font-style: italic;
        }

        .message-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }

        .message-content th,
        .message-content td {
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            padding: 8px 12px;
            text-align: left;
        }

        .message-content th {
            background: var(--claude-bg-tertiary, #FAFAF8);
            font-weight: 600;
        }

        .message-content hr {
            border: none;
            border-top: 1px solid var(--claude-border-subtle, #e5e5e0);
            margin: 24px 0;
        }

        /* Streaming cursor */
        .streaming-cursor {
            display: inline-block;
            width: 2px;
            height: 1em;
            background: var(--claude-text-primary, #1a1a1a);
            margin-left: 2px;
            animation: blink 1s step-end infinite;
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }

        /* Action bar */
        .action-bar-wrapper {
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--claude-transition-fast, 150ms) ease;
            margin-top: 8px;
        }

        /* Animation */
        @keyframes messageEnter {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        :host(.entering) .message-wrapper {
            animation: messageEnter var(--claude-transition-slow, 300ms) var(--claude-easing-smooth, ease);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .message-content {
                font-size: 15px;
            }

            .message-content pre {
                padding: 12px;
                font-size: 13px;
            }
        }

        /* Scrollbar for code blocks */
        .message-content pre::-webkit-scrollbar {
            height: 8px;
        }

        .message-content pre::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
        }

        .message-content pre::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }

        .message-content pre::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
    `;

    constructor() {
        super();
        this.content = '';
        this.timestamp = '';
        this.assistantName = 'Lucide';
        this.isStreaming = false;
        this.showActions = false;
        this.messageId = '';
    }

    firstUpdated() {
        // Add entering animation
        this.classList.add('entering');
        setTimeout(() => this.classList.remove('entering'), 300);
    }

    _formatTimestamp(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    _renderMarkdown(content) {
        if (!content) return '';

        // Simple markdown rendering (will be enhanced with marked.js later)
        // For now, basic HTML escaping and newline conversion
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');

        // Basic markdown patterns
        // Bold: **text**
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        // Italic: *text*
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        // Inline code: `code`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Code blocks: ```code```
        html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

        // Links: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        return html;
    }

    _handleCopy() {
        navigator.clipboard.writeText(this.content).then(() => {
            this.dispatchEvent(new CustomEvent('message-copied', {
                detail: { messageId: this.messageId },
                bubbles: true,
                composed: true
            }));
        });
    }

    _handleThumbsUp() {
        this.dispatchEvent(new CustomEvent('message-feedback', {
            detail: { messageId: this.messageId, feedback: 'positive' },
            bubbles: true,
            composed: true
        }));
    }

    _handleThumbsDown() {
        this.dispatchEvent(new CustomEvent('message-feedback', {
            detail: { messageId: this.messageId, feedback: 'negative' },
            bubbles: true,
            composed: true
        }));
    }

    _handleRegenerate() {
        this.dispatchEvent(new CustomEvent('message-regenerate', {
            detail: { messageId: this.messageId },
            bubbles: true,
            composed: true
        }));
    }

    _handleShare() {
        this.dispatchEvent(new CustomEvent('message-share', {
            detail: { messageId: this.messageId },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const renderedContent = this._renderMarkdown(this.content);

        return html`
            <div class="message-wrapper">
                <div class="avatar-wrapper">
                    <claude-avatar type="assistant" size="md"></claude-avatar>
                </div>

                <div class="message-container">
                    <div class="message-header">
                        <span class="assistant-name">${this.assistantName}</span>
                        ${this.timestamp ? html`
                            <span class="timestamp">${this._formatTimestamp(this.timestamp)}</span>
                        ` : ''}
                    </div>

                    <div class="message-content">
                        ${unsafeHTML(renderedContent)}
                        ${this.isStreaming ? html`<span class="streaming-cursor"></span>` : ''}
                    </div>

                    ${!this.isStreaming ? html`
                        <div class="action-bar-wrapper">
                            <message-action-bar
                                @action-copy="${this._handleCopy}"
                                @action-thumbs-up="${this._handleThumbsUp}"
                                @action-thumbs-down="${this._handleThumbsDown}"
                                @action-regenerate="${this._handleRegenerate}"
                                @action-share="${this._handleShare}"
                            ></message-action-bar>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('message-assistant', MessageAssistant);
