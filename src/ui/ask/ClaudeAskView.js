import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import '../layouts/ClaudeLayout.js';
import '../components/ConversationSidebar.js';
import '../components/base/ClaudeInput.js';
import '../components/base/ClaudeButton.js';
import '../components/base/ClaudeAvatar.js';

/**
 * ClaudeAskView - Ask interface with Claude.ai layout
 *
 * Features:
 * - 3-column layout (sidebar, chat, artifacts)
 * - Conversations list in sidebar
 * - Messages centered (max 800px)
 * - Fixed input at bottom
 * - Contextual artifacts panel
 *
 * @example
 * <claude-ask-view></claude-ask-view>
 */
export class ClaudeAskView extends LitElement {
    static properties = {
        conversations: { type: Array },
        currentConversation: { type: Object },
        messages: { type: Array },
        inputValue: { type: String },
        isLoading: { type: Boolean },
        sidebarVisible: { type: Boolean },
        artifactsVisible: { type: Boolean },
        currentMode: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: var(--claude-bg-primary, #F5F5F0);
        }

        /* Chat container */
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
        }

        /* Messages area */
        .messages-area {
            flex: 1;
            overflow-y: auto;
            padding: var(--claude-chat-padding, 24px) 0;
            display: flex;
            flex-direction: column;
            gap: var(--claude-message-gap, 24px);
        }

        /* Input area (fixed at bottom) */
        .input-area {
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

        .input-container {
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: var(--claude-input-bg, #FFFFFF);
            border: 1px solid var(--claude-input-border, #e5e5e0);
            border-radius: var(--claude-input-radius, 24px);
            padding: 12px 16px;
            transition: border-color var(--claude-transition-base, 200ms) ease;
        }

        .input-container:focus-within {
            border-color: var(--claude-input-border-focus, #D97706);
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
        }

        claude-input {
            flex: 1;
        }

        .send-button {
            flex-shrink: 0;
        }

        .attach-button {
            flex-shrink: 0;
        }

        .input-footer {
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            padding: 0 16px;
        }

        /* Send button (circular) */
        .send-btn {
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
        }

        .send-btn:hover:not(:disabled) {
            background: var(--claude-send-btn-bg-hover, #B45309);
            transform: scale(1.05);
        }

        .send-btn:disabled {
            background: var(--claude-send-btn-bg-disabled, #e5e5e0);
            cursor: not-allowed;
            opacity: 0.5;
        }

        /* Messages */
        .message-wrapper {
            display: flex;
            gap: 12px;
            max-width: 100%;
        }

        .message-wrapper.user {
            justify-content: flex-end;
        }

        .message-wrapper.assistant {
            justify-content: flex-start;
        }

        .message {
            max-width: 70%;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .message.user .message-content {
            background: var(--claude-message-user-bg, #F5F5F0);
            border-radius: 16px;
            padding: 12px 16px;
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
        }

        .message.assistant {
            max-width: 100%;
        }

        .message.assistant .message-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .message.assistant .assistant-name {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .message.assistant .message-content {
            background: transparent;
            padding: 0;
            font-size: var(--claude-font-size-base, 16px);
            line-height: var(--claude-line-height-normal, 1.6);
            color: var(--claude-text-primary, #1a1a1a);
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
            font-size: var(--claude-font-size-xl, 24px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .empty-description {
            font-size: var(--claude-font-size-base, 16px);
            max-width: 400px;
        }

        /* Loading indicator */
        .loading-indicator {
            display: flex;
            gap: 8px;
            padding: 12px 16px;
        }

        .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--claude-text-tertiary, #9b9b9b);
            animation: loadingDot 1.4s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes loadingDot {
            0%, 80%, 100% {
                opacity: 0.3;
                transform: scale(0.8);
            }
            40% {
                opacity: 1;
                transform: scale(1.2);
            }
        }

        /* Scrollbar */
        .messages-area::-webkit-scrollbar {
            width: 6px;
        }

        .messages-area::-webkit-scrollbar-track {
            background: transparent;
        }

        .messages-area::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .messages-area::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }
    `;

    constructor() {
        super();
        this.conversations = [];
        this.currentConversation = null;
        this.messages = [];
        this.inputValue = '';
        this.isLoading = false;
        this.sidebarVisible = true;
        this.artifactsVisible = false;
        this.currentMode = 'ask';
    }

    async connectedCallback() {
        super.connectedCallback();
        await this._loadConversations();
    }

    async _loadConversations() {
        // TODO: Load from conversationHistoryService via IPC
        // For now, mock data
        this.conversations = [
            {
                id: '1',
                title: 'Comment créer un composant React ?',
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Expliquer les closures en JavaScript',
                updated_at: new Date(Date.now() - 3600000).toISOString(),
                created_at: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }

    _handleInput(e) {
        this.inputValue = e.detail.value;
    }

    _handleSubmit() {
        if (!this.inputValue.trim() || this.isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: this.inputValue,
            created_at: new Date().toISOString()
        };

        this.messages = [...this.messages, userMessage];
        this.inputValue = '';
        this.isLoading = true;

        // TODO: Send to AI via IPC
        // Mock response
        setTimeout(() => {
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Ceci est une réponse de démonstration. L\'intégration avec le service Ask sera ajoutée prochainement.',
                created_at: new Date().toISOString()
            };
            this.messages = [...this.messages, assistantMessage];
            this.isLoading = false;
        }, 1500);
    }

    _handleKeyDown(e) {
        if (e.detail.originalEvent.key === 'Enter' && !e.detail.originalEvent.shiftKey) {
            this._handleSubmit();
        }
    }

    _handleNewConversation() {
        this.currentConversation = null;
        this.messages = [];
        this.inputValue = '';
    }

    _handleConversationSelect(e) {
        this.currentConversation = e.detail.conversation;
        // TODO: Load messages for this conversation
        this.messages = [];
    }

    _handleModeChange(e) {
        this.currentMode = e.detail.mode;
        // Dispatch to parent to switch view
        this.dispatchEvent(new CustomEvent('view-change-requested', {
            detail: { view: e.detail.mode },
            bubbles: true,
            composed: true
        }));
    }

    _renderMessage(message) {
        if (message.role === 'user') {
            return html`
                <div class="message-wrapper user">
                    <div class="message user">
                        <div class="message-content">${message.content}</div>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="message-wrapper assistant">
                <div class="message assistant">
                    <div class="message-header">
                        <claude-avatar type="assistant" size="sm"></claude-avatar>
                        <span class="assistant-name">Lucide</span>
                    </div>
                    <div class="message-content">${message.content}</div>
                </div>
            </div>
        `;
    }

    _renderMessages() {
        if (this.messages.length === 0) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <div class="empty-title">Nouvelle conversation</div>
                    <div class="empty-description">
                        Commencez une conversation avec Lucide en posant une question ci-dessous.
                    </div>
                </div>
            `;
        }

        return html`
            ${this.messages.map(msg => this._renderMessage(msg))}
            ${this.isLoading ? html`
                <div class="message-wrapper assistant">
                    <div class="message assistant">
                        <div class="message-header">
                            <claude-avatar type="assistant" size="sm"></claude-avatar>
                            <span class="assistant-name">Lucide</span>
                        </div>
                        <div class="loading-indicator">
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }

    render() {
        return html`
            <claude-layout
                ?sidebar-visible="${this.sidebarVisible}"
                ?artifacts-visible="${this.artifactsVisible}"
            >
                <!-- Sidebar slot -->
                <div slot="sidebar">
                    <conversation-sidebar
                        .conversations="${this.conversations}"
                        .currentMode="${this.currentMode}"
                        .currentConversationId="${this.currentConversation?.id}"
                        @new-conversation="${this._handleNewConversation}"
                        @conversation-selected="${this._handleConversationSelect}"
                        @mode-changed="${this._handleModeChange}"
                    ></conversation-sidebar>
                </div>

                <!-- Main chat slot -->
                <div slot="main">
                    <div class="chat-container">
                        <div class="messages-area">
                            ${this._renderMessages()}
                        </div>

                        <div class="input-area">
                            <div class="input-wrapper">
                                <div class="input-container">
                                    <button class="attach-button" title="Joindre un fichier">
                                        📎
                                    </button>
                                    <claude-input
                                        placeholder="Parler avec Lucide..."
                                        .value="${this.inputValue}"
                                        @input-change="${this._handleInput}"
                                        @keydown="${this._handleKeyDown}"
                                        .maxHeight="${200}"
                                    ></claude-input>
                                    <button
                                        class="send-btn"
                                        ?disabled="${!this.inputValue.trim() || this.isLoading}"
                                        @click="${this._handleSubmit}"
                                        title="Envoyer (Enter)"
                                    >
                                        ↑
                                    </button>
                                </div>
                                <div class="input-footer">
                                    <span>Lucide peut faire des erreurs. Vérifiez les informations importantes.</span>
                                    <span>${this.inputValue.length} caractères</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Artifacts slot (when needed) -->
                <div slot="artifacts">
                    <!-- TODO: Artifacts panel content -->
                    <div style="padding: 24px; color: var(--claude-text-tertiary);">
                        Artifacts panel (à venir)
                    </div>
                </div>
            </claude-layout>
        `;
    }
}

customElements.define('claude-ask-view', ClaudeAskView);
