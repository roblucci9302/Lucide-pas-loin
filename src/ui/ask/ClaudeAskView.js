import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import '../layouts/ClaudeLayout.js';
import '../components/ConversationSidebar.js';
import '../components/base/ClaudeInput.js';
import '../components/base/ClaudeButton.js';
import '../components/base/ClaudeAvatar.js';
import '../components/messages/MessageUser.js';
import '../components/messages/MessageAssistant.js';
import '../components/input/ClaudeInputArea.js';
import '../components/artifacts/ArtifactsPanel.js';
import { claudeAskBridgeService } from '../services/claudeAskBridgeService.js';

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
        attachedFiles: { type: Array },
        isLoading: { type: Boolean },
        sidebarVisible: { type: Boolean },
        artifactsVisible: { type: Boolean },
        currentMode: { type: String },
        currentArtifact: { type: Object },
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

        /* Input area - styles handled by ClaudeInputArea component */

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
        this.attachedFiles = [];
        this.isLoading = false;
        this.sidebarVisible = true;
        this.artifactsVisible = false;
        this.currentMode = 'ask';
        this.currentArtifact = null;
        this.streamingMessageId = null;
        this._unsubscribeStateUpdate = null;
        this._unsubscribeError = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this._loadConversations();
        this._setupBridgeListeners();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._teardownBridgeListeners();
    }

    /**
     * Setup listeners for bridge service events
     * @private
     */
    _setupBridgeListeners() {
        // Listen for state updates (streaming)
        this._unsubscribeStateUpdate = claudeAskBridgeService.on('stateUpdate', (state) => {
            console.log('[ClaudeAskView] State update:', state);
            this._handleStateUpdate(state);
        });

        // Listen for errors
        this._unsubscribeError = claudeAskBridgeService.on('error', ({ error }) => {
            console.error('[ClaudeAskView] Error from bridge:', error);
            this.isLoading = false;
            // TODO: Show error notification
        });
    }

    /**
     * Teardown bridge listeners
     * @private
     */
    _teardownBridgeListeners() {
        if (this._unsubscribeStateUpdate) {
            this._unsubscribeStateUpdate();
        }
        if (this._unsubscribeError) {
            this._unsubscribeError();
        }
    }

    /**
     * Handle state updates from Ask service (streaming)
     * @private
     */
    _handleStateUpdate(state) {
        this.isLoading = state.isLoading || false;

        // Update streaming message
        if (state.isStreaming && state.currentResponse) {
            // Find or create streaming message
            if (!this.streamingMessageId) {
                // Create new assistant message for streaming
                const assistantMessage = {
                    id: `streaming-${Date.now()}`,
                    role: 'assistant',
                    content: state.currentResponse,
                    created_at: new Date().toISOString(),
                    isStreaming: true
                };
                this.streamingMessageId = assistantMessage.id;
                this.messages = [...this.messages, assistantMessage];
            } else {
                // Update existing streaming message
                this.messages = this.messages.map(msg =>
                    msg.id === this.streamingMessageId
                        ? { ...msg, content: state.currentResponse, isStreaming: true }
                        : msg
                );
            }
        } else if (!state.isStreaming && state.currentResponse && this.streamingMessageId) {
            // Streaming finished, mark message as complete
            this.messages = this.messages.map(msg =>
                msg.id === this.streamingMessageId
                    ? { ...msg, content: state.currentResponse, isStreaming: false }
                    : msg
            );
            this.streamingMessageId = null;
        }
    }

    async _loadConversations() {
        try {
            console.log('[ClaudeAskView] Loading conversations from bridge...');
            this.conversations = await claudeAskBridgeService.loadConversations();
            console.log(`[ClaudeAskView] Loaded ${this.conversations.length} conversations`);
        } catch (error) {
            console.error('[ClaudeAskView] Error loading conversations:', error);
            this.conversations = [];
        }
    }

    _handleInput(e) {
        this.inputValue = e.detail.value;
    }

    async _handleInputSubmit(e) {
        if ((!this.inputValue.trim() && this.attachedFiles.length === 0) || this.isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: this.inputValue,
            files: this.attachedFiles.length > 0 ? this.attachedFiles : undefined,
            created_at: new Date().toISOString()
        };

        // Add user message to UI immediately
        this.messages = [...this.messages, userMessage];

        // Save input values before clearing
        const messageText = this.inputValue;
        const attachedFiles = this.attachedFiles;

        // Clear input
        this.inputValue = '';
        this.attachedFiles = [];
        this.isLoading = true;

        try {
            // Send message through bridge service
            console.log('[ClaudeAskView] Sending message through bridge...');
            const result = await claudeAskBridgeService.sendMessage(
                messageText,
                attachedFiles,
                this.messages
            );

            if (!result.success) {
                console.error('[ClaudeAskView] Failed to send message:', result.error);
                // TODO: Show error notification
                this.isLoading = false;
            }

            // Note: The response will come through stateUpdate listener
            // which will handle the streaming updates
        } catch (error) {
            console.error('[ClaudeAskView] Error sending message:', error);
            this.isLoading = false;
            // TODO: Show error notification
        }
    }

    _handleFilesAttached(e) {
        this.attachedFiles = e.detail.files;
        console.log('[ClaudeAskView] Files attached:', this.attachedFiles);
    }

    _handleFileRemoved(e) {
        this.attachedFiles = e.detail.files;
        console.log('[ClaudeAskView] File removed, remaining:', this.attachedFiles);
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
                <message-user
                    .content="${message.content}"
                    .timestamp="${message.created_at}"
                    .userName=${"Vous"}
                    ?showAvatar="${false}"
                ></message-user>
            `;
        }

        return html`
            <message-assistant
                .content="${message.content}"
                .timestamp="${message.created_at}"
                .assistantName=${"Lucide"}
                .messageId="${message.id}"
                ?isStreaming="${false}"
                @message-copied="${this._handleMessageCopied}"
                @message-feedback="${this._handleMessageFeedback}"
                @message-regenerate="${this._handleMessageRegenerate}"
                @message-share="${this._handleMessageShare}"
            ></message-assistant>
        `;
    }

    _handleMessageCopied(e) {
        console.log('[ClaudeAskView] Message copied:', e.detail.messageId);
        // TODO: Show toast notification
    }

    _handleMessageFeedback(e) {
        console.log('[ClaudeAskView] Message feedback:', e.detail);
        // TODO: Send feedback to backend
    }

    _handleMessageRegenerate(e) {
        console.log('[ClaudeAskView] Regenerate message:', e.detail.messageId);
        // TODO: Regenerate response
    }

    _handleMessageShare(e) {
        console.log('[ClaudeAskView] Share message:', e.detail.messageId);
        // TODO: Show share dialog
    }

    _handleArtifactClose() {
        this.artifactsVisible = false;
        this.currentArtifact = null;
    }

    _showArtifact(artifact) {
        this.currentArtifact = artifact;
        this.artifactsVisible = true;
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

                        <claude-input-area
                            .value="${this.inputValue}"
                            .attachedFiles="${this.attachedFiles}"
                            ?disabled="${this.isLoading}"
                            placeholder="Parler avec Lucide..."
                            @input-change="${this._handleInput}"
                            @submit="${this._handleInputSubmit}"
                            @files-attached="${this._handleFilesAttached}"
                            @file-removed="${this._handleFileRemoved}"
                        ></claude-input-area>
                    </div>
                </div>

                <!-- Artifacts slot (when needed) -->
                <div slot="artifacts">
                    <artifacts-panel
                        .artifact="${this.currentArtifact}"
                        @close="${this._handleArtifactClose}"
                    ></artifacts-panel>
                </div>
            </claude-layout>
        `;
    }
}

customElements.define('claude-ask-view', ClaudeAskView);
