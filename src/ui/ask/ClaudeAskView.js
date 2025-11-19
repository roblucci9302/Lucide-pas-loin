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
import '../components/settings/SettingsPanel.js';
import '../components/notifications/ToastContainer.js';
import '../components/dialogs/RenameConversationDialog.js';
import '../components/dialogs/ConfirmDialog.js';
import '../components/dialogs/ExportDialog.js';
import '../components/command/CommandPalette.js';
import '../components/tags/TagManager.js';
import '../components/statistics/StatisticsModal.js';
import '../components/search/AdvancedSearchPanel.js';
import { claudeAskBridgeService } from '../services/claudeAskBridgeService.js';
import { toastService } from '../services/toastService.js';
import { exportService } from '../services/exportService.js';
import { commandRegistryService } from '../services/commandRegistryService.js';
import { registerCommands, createCommandContext } from '../services/registerCommands.js';
import { notificationService } from '../services/notificationService.js';

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
        settingsOpen: { type: Boolean, state: true },
        renameDialogOpen: { type: Boolean, state: true },
        deleteDialogOpen: { type: Boolean, state: true },
        exportDialogOpen: { type: Boolean, state: true },
        selectedConversation: { type: Object, state: true },
        showCodeLineNumbers: { type: Boolean, state: true },
        commandPaletteOpen: { type: Boolean, state: true },
        tagManagerOpen: { type: Boolean, state: true },
        statisticsOpen: { type: Boolean, state: true },
        searchOpen: { type: Boolean, state: true },
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
        this.settingsOpen = false;
        this.renameDialogOpen = false;
        this.deleteDialogOpen = false;
        this.exportDialogOpen = false;
        this.selectedConversation = null;
        this.streamingMessageId = null;
        this.commandPaletteOpen = false;
        this.tagManagerOpen = false;
        this.statisticsOpen = false;
        this.searchOpen = false;
        this._unsubscribeStateUpdate = null;
        this._unsubscribeError = null;
        this._keydownHandler = this._handleKeyDown.bind(this);

        // Load code line numbers preference
        const stored = localStorage.getItem('lucide-show-code-line-numbers');
        this.showCodeLineNumbers = stored ? stored === 'true' : false;

        // Listen for code line numbers changes
        this._codeLineNumbersHandler = (e) => {
            this.showCodeLineNumbers = e.detail.showLineNumbers;
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this._loadConversations();
        this._setupBridgeListeners();
        this._setupKeyboardShortcuts();
        this._registerCommands();

        // Listen for code line numbers preference changes
        window.addEventListener('code-line-numbers-changed', this._codeLineNumbersHandler);
    }

    /**
     * Register all commands for command palette
     * @private
     */
    _registerCommands() {
        const context = createCommandContext(this);
        registerCommands(context);
        console.log('[ClaudeAskView] Commands registered');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._teardownBridgeListeners();
        this._teardownKeyboardShortcuts();

        // Remove code line numbers listener
        window.removeEventListener('code-line-numbers-changed', this._codeLineNumbersHandler);
    }

    /**
     * Setup keyboard shortcuts
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', this._keydownHandler);
    }

    /**
     * Teardown keyboard shortcuts
     * @private
     */
    _teardownKeyboardShortcuts() {
        document.removeEventListener('keydown', this._keydownHandler);
    }

    /**
     * Handle keyboard shortcuts
     * @private
     */
    async _handleKeyDown(e) {
        const isMac = /Mac/.test(navigator.platform);
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        // Cmd/Ctrl + P: Open command palette (priority shortcut)
        if (modKey && e.key === 'p') {
            e.preventDefault();
            this.commandPaletteOpen = true;
            return;
        }

        // Try to execute command by shortcut
        const executed = await commandRegistryService.executeByShortcut(e);
        if (executed) {
            return;
        }

        // Esc: Close settings/artifacts/command palette
        if (e.key === 'Escape') {
            if (this.settingsOpen) {
                this.settingsOpen = false;
            } else if (this.artifactsVisible) {
                this._handleArtifactClose();
            }
            return;
        }
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
            toastService.error(`Erreur: ${error}`);

            // Send error notification
            notificationService.notifyError({
                title: 'Erreur',
                message: error.toString(),
            });
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

            // Send notification for streaming complete
            notificationService.notifyStreamingComplete({
                conversationTitle: this.currentConversation?.title || 'Conversation',
                messageLength: state.currentResponse?.length || 0,
            });

            // Check for keyword mentions in the response
            this._checkForKeywordMentions(state.currentResponse);

            this.streamingMessageId = null;
        }
    }

    /**
     * Check for keyword mentions in message content
     * @private
     * @param {string} content - Message content to check
     */
    _checkForKeywordMentions(content) {
        if (!content) return;

        // Get notification settings from localStorage
        const settingsStr = localStorage.getItem('lucide-notification-settings');
        if (!settingsStr) return;

        try {
            const settings = JSON.parse(settingsStr);
            if (!settings.mentions || !settings.keywords || settings.keywords.length === 0) {
                return;
            }

            // Check for keyword matches (case-insensitive)
            const lowerContent = content.toLowerCase();
            for (const keyword of settings.keywords) {
                if (lowerContent.includes(keyword.toLowerCase())) {
                    // Found a keyword mention
                    notificationService.notifyMention({
                        conversationTitle: this.currentConversation?.title || 'Conversation',
                        keyword,
                        preview: this._extractPreview(content, keyword),
                    });

                    // Only notify once per message, even if multiple keywords match
                    break;
                }
            }
        } catch (error) {
            console.error('[ClaudeAskView] Error checking keyword mentions:', error);
        }
    }

    /**
     * Extract preview text around a keyword
     * @private
     * @param {string} content - Full content
     * @param {string} keyword - Keyword to find
     * @returns {string} Preview text
     */
    _extractPreview(content, keyword) {
        const index = content.toLowerCase().indexOf(keyword.toLowerCase());
        if (index === -1) return content.substring(0, 100);

        // Extract ~50 characters before and after the keyword
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + keyword.length + 50);
        let preview = content.substring(start, end);

        // Add ellipsis if truncated
        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';

        return preview;
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
                toastService.error(`Échec de l'envoi: ${result.error}`);
                this.isLoading = false;
            }

            // Note: The response will come through stateUpdate listener
            // which will handle the streaming updates
        } catch (error) {
            console.error('[ClaudeAskView] Error sending message:', error);
            toastService.error(`Erreur lors de l'envoi: ${error.message}`);
            this.isLoading = false;
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

    _handleSettingsOpen() {
        this.settingsOpen = true;
    }

    _handleSettingsClose() {
        this.settingsOpen = false;
    }

    _handleStatisticsOpen() {
        this.statisticsOpen = true;
    }

    _handleStatisticsClose() {
        this.statisticsOpen = false;
    }

    _handleSearchOpen() {
        this.searchOpen = true;
    }

    _handleSearchClose() {
        this.searchOpen = false;
    }

    _handleSearchResultSelected(e) {
        const { conversation, message, messageIndex } = e.detail;

        // Switch to the conversation
        if (conversation.id !== this.currentConversation?.id) {
            this._handleConversationSelect({ detail: { conversation } });
        }

        // Scroll to message
        setTimeout(() => {
            // TODO: Scroll to specific message in the list
            // For now, just close the search
            this.searchOpen = false;
            toastService.success(`Message trouvé dans "${conversation.title || 'Nouvelle conversation'}"`);
        }, 100);
    }

    _handleConversationRename(e) {
        this.selectedConversation = e.detail.conversation;
        this.renameDialogOpen = true;
    }

    _handleConversationDelete(e) {
        this.selectedConversation = e.detail.conversation;
        this.deleteDialogOpen = true;
    }

    async _handleRenameConfirm(e) {
        const newTitle = e.detail.title;

        try {
            const result = await claudeAskBridgeService.updateConversationTitle(
                this.selectedConversation.id,
                newTitle
            );

            if (result.success) {
                // Update conversation in list
                this.conversations = this.conversations.map(conv =>
                    conv.id === this.selectedConversation.id
                        ? { ...conv, title: newTitle }
                        : conv
                );

                // Update current conversation if it's the one being renamed
                if (this.currentConversation?.id === this.selectedConversation.id) {
                    this.currentConversation = { ...this.currentConversation, title: newTitle };
                }

                toastService.success('Conversation renommée avec succès');
            } else {
                toastService.error(`Échec du renommage: ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('[ClaudeAskView] Error renaming conversation:', error);
            toastService.error(`Erreur lors du renommage: ${error.message}`);
        } finally {
            this.renameDialogOpen = false;
            this.selectedConversation = null;
        }
    }

    _handleRenameCancel() {
        this.renameDialogOpen = false;
        this.selectedConversation = null;
    }

    async _handleDeleteConfirm(e) {
        try {
            const result = await claudeAskBridgeService.deleteConversation(
                this.selectedConversation.id
            );

            if (result.success) {
                // Remove conversation from list
                this.conversations = this.conversations.filter(
                    conv => conv.id !== this.selectedConversation.id
                );

                // If deleting current conversation, start new one
                if (this.currentConversation?.id === this.selectedConversation.id) {
                    this._handleNewConversation();
                }

                toastService.success('Conversation supprimée avec succès');

                // Save "don't ask again" preference
                if (e.detail.dontAskAgain) {
                    localStorage.setItem('lucide-skip-delete-confirm', 'true');
                }
            } else {
                toastService.error(`Échec de la suppression: ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('[ClaudeAskView] Error deleting conversation:', error);
            toastService.error(`Erreur lors de la suppression: ${error.message}`);
        } finally {
            this.deleteDialogOpen = false;
            this.selectedConversation = null;
        }
    }

    _handleDeleteCancel() {
        this.deleteDialogOpen = false;
        this.selectedConversation = null;
    }

    _handleConversationExport(e) {
        this.selectedConversation = e.detail.conversation;
        this.exportDialogOpen = true;
    }

    async _handleExportConfirm(e) {
        const {
            format,
            includeMetadata,
            includeTimestamps,
            conversation,
            messages,
        } = e.detail;

        try {
            await exportService.export(format, conversation, messages, {
                includeMetadata,
                includeTimestamps,
            });

            toastService.success(`Conversation exportée en ${format.toUpperCase()} avec succès`);
        } catch (error) {
            console.error('[ClaudeAskView] Error exporting conversation:', error);
            toastService.error(`Erreur lors de l'export: ${error.message}`);
        } finally {
            this.exportDialogOpen = false;
            this.selectedConversation = null;
        }
    }

    _handleExportCancel() {
        this.exportDialogOpen = false;
        this.selectedConversation = null;
    }

    /**
     * Handle manage tags click
     * @private
     */
    _handleManageTags(e) {
        this.selectedConversation = e.detail.conversation;
        this.tagManagerOpen = true;
    }

    /**
     * Handle tag manager close
     * @private
     */
    _handleTagManagerClose() {
        this.tagManagerOpen = false;
        this.selectedConversation = null;
    }

    /**
     * Handle tags changed
     * @private
     */
    _handleTagsChanged(e) {
        // Reload conversations to reflect tag changes
        this._loadConversations();
    }

    /**
     * Handle message action events
     * @private
     */
    _handleMessageAction(e) {
        const { action, messageId, role, content, reaction } = e.detail;

        switch (action) {
            case 'copy':
                this._handleMessageCopy(content);
                break;
            case 'edit-save':
                this._handleMessageEdit(messageId, content);
                break;
            case 'delete':
                this._handleMessageDelete(messageId);
                break;
            case 'reaction':
                this._handleMessageReaction(messageId, reaction);
                break;
            default:
                console.warn('[ClaudeAskView] Unknown message action:', action);
        }
    }

    /**
     * Copy message content to clipboard
     * @private
     */
    async _handleMessageCopy(content) {
        try {
            await navigator.clipboard.writeText(content);
            toastService.success('Message copié dans le presse-papiers');
        } catch (error) {
            console.error('[ClaudeAskView] Error copying message:', error);
            toastService.error('Erreur lors de la copie');
        }
    }

    /**
     * Edit user message
     * @private
     */
    async _handleMessageEdit(messageId, newContent) {
        try {
            // Update message in local state
            this.messages = this.messages.map(msg =>
                msg.id === messageId ? { ...msg, content: newContent } : msg
            );

            // TODO: Update in backend/conversation
            // await claudeAskBridgeService.updateMessage(this.currentConversation.id, messageId, newContent);

            toastService.success('Message modifié');
        } catch (error) {
            console.error('[ClaudeAskView] Error editing message:', error);
            toastService.error('Erreur lors de la modification');
        }
    }

    /**
     * Delete message
     * @private
     */
    async _handleMessageDelete(messageId) {
        try {
            // Remove message from local state
            this.messages = this.messages.filter(msg => msg.id !== messageId);

            // TODO: Delete from backend/conversation
            // await claudeAskBridgeService.deleteMessage(this.currentConversation.id, messageId);

            toastService.success('Message supprimé');
        } catch (error) {
            console.error('[ClaudeAskView] Error deleting message:', error);
            toastService.error('Erreur lors de la suppression');
        }
    }

    /**
     * Handle message reaction (thumbs up/down)
     * @private
     */
    async _handleMessageReaction(messageId, reaction) {
        try {
            // Update message reaction in local state
            this.messages = this.messages.map(msg =>
                msg.id === messageId ? { ...msg, reaction } : msg
            );

            // TODO: Save reaction to backend
            // await claudeAskBridgeService.setMessageReaction(this.currentConversation.id, messageId, reaction);

            if (reaction) {
                toastService.success(reaction === 'up' ? 'Réponse marquée comme utile' : 'Réponse marquée comme non utile');
            }
        } catch (error) {
            console.error('[ClaudeAskView] Error setting reaction:', error);
            toastService.error('Erreur lors de l\'enregistrement de la réaction');
        }
    }

    /**
     * Handle action-copy from MessageActionBar
     * @private
     */
    async _handleActionCopy(e, message) {
        await this._handleMessageCopy(message.content);
    }

    /**
     * Handle action-thumbs-up from MessageActionBar
     * @private
     */
    async _handleActionThumbsUp(e, message) {
        await this._handleMessageReaction(message.id, 'up');
    }

    /**
     * Handle action-thumbs-down from MessageActionBar
     * @private
     */
    async _handleActionThumbsDown(e, message) {
        await this._handleMessageReaction(message.id, 'down');
    }

    /**
     * Handle action-regenerate from MessageActionBar
     * @private
     */
    async _handleActionRegenerate(e, message) {
        try {
            if (!this.currentConversation || this.isLoading) return;

            // Find the user message before this assistant message
            const messageIndex = this.messages.findIndex(msg => msg.id === message.id);
            if (messageIndex <= 0) {
                toastService.error('Impossible de régénérer cette réponse');
                return;
            }

            // Get the previous user message
            let userMessage = null;
            for (let i = messageIndex - 1; i >= 0; i--) {
                if (this.messages[i].role === 'user') {
                    userMessage = this.messages[i];
                    break;
                }
            }

            if (!userMessage) {
                toastService.error('Message utilisateur introuvable');
                return;
            }

            // Remove messages after the user message (including current assistant message)
            this.messages = this.messages.slice(0, this.messages.indexOf(userMessage) + 1);

            // Re-send the user message
            this.isLoading = true;
            const result = await claudeAskBridgeService.sendMessage(
                this.currentConversation.id,
                userMessage.content
            );

            toastService.success('Réponse régénérée');
        } catch (error) {
            console.error('[ClaudeAskView] Error regenerating message:', error);
            this.isLoading = false;
            toastService.error(`Erreur lors de la régénération: ${error.message}`);
        }
    }

    /**
     * Handle action-share from MessageActionBar
     * @private
     */
    async _handleActionShare(e, message) {
        try {
            // Create a shareable text
            const shareText = `Lucide - ${this.currentConversation?.title || 'Conversation'}\n\n${message.content}`;

            if (navigator.share) {
                await navigator.share({
                    title: 'Lucide - Partage de message',
                    text: shareText,
                });
                toastService.success('Message partagé');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareText);
                toastService.success('Lien copié dans le presse-papiers');
            }
        } catch (error) {
            console.error('[ClaudeAskView] Error sharing message:', error);
            if (error.name !== 'AbortError') {
                toastService.error('Erreur lors du partage');
            }
        }
    }

    /**
     * Handle command palette close
     * @private
     */
    _handleCommandPaletteClose() {
        this.commandPaletteOpen = false;
    }

    /**
     * Handle command execution from palette
     * @private
     */
    async _handleCommandExecute(e) {
        const { commandId } = e.detail;
        try {
            await commandRegistryService.execute(commandId);
        } catch (error) {
            console.error('[ClaudeAskView] Error executing command:', error);
            toastService.error(`Erreur lors de l'exécution de la commande: ${error.message}`);
        }
    }

    _renderMessage(message) {
        if (message.role === 'user') {
            return html`
                <message-user
                    .messageId="${message.id}"
                    .content="${message.content}"
                    .timestamp="${message.created_at}"
                    .userName=${"Vous"}
                    ?showAvatar="${false}"
                    ?showActions="${true}"
                    @message-action="${this._handleMessageAction}"
                ></message-user>
            `;
        }

        return html`
            <message-assistant
                .content="${message.content}"
                .timestamp="${message.created_at}"
                .assistantName=${"Lucide"}
                .messageId="${message.id}"
                ?isStreaming="${message.isStreaming || false}"
                ?showLineNumbers="${this.showCodeLineNumbers}"
                @action-copy="${(e) => this._handleActionCopy(e, message)}"
                @action-thumbs-up="${(e) => this._handleActionThumbsUp(e, message)}"
                @action-thumbs-down="${(e) => this._handleActionThumbsDown(e, message)}"
                @action-regenerate="${(e) => this._handleActionRegenerate(e, message)}"
                @action-share="${(e) => this._handleActionShare(e, message)}"
            ></message-assistant>
        `;
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
                        @conversation-export="${this._handleConversationExport}"
                        @conversation-rename="${this._handleConversationRename}"
                        @conversation-delete="${this._handleConversationDelete}"
                        @conversation-manage-tags="${this._handleManageTags}"
                        @mode-changed="${this._handleModeChange}"
                        @statistics-open="${this._handleStatisticsOpen}"
                        @search-open="${this._handleSearchOpen}"
                        @settings-open="${this._handleSettingsOpen}"
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

            <!-- Settings Panel (modal overlay) -->
            <settings-panel
                ?open="${this.settingsOpen}"
                @close="${this._handleSettingsClose}"
            ></settings-panel>

            <!-- Statistics Modal -->
            <statistics-modal
                ?open="${this.statisticsOpen}"
                .conversations="${this.conversations}"
                @close="${this._handleStatisticsClose}"
                @export-success="${() => toastService.success('Statistiques exportées avec succès')}"
                @export-error="${(e) => toastService.error(`Erreur lors de l'export: ${e.detail.error.message}`)}"
            ></statistics-modal>

            <!-- Rename Conversation Dialog -->
            <rename-conversation-dialog
                ?open="${this.renameDialogOpen}"
                .conversationTitle="${this.selectedConversation?.title || ''}"
                @confirm="${this._handleRenameConfirm}"
                @cancel="${this._handleRenameCancel}"
            ></rename-conversation-dialog>

            <!-- Delete Confirmation Dialog -->
            <confirm-dialog
                ?open="${this.deleteDialogOpen}"
                title="Supprimer la conversation"
                message="Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible."
                variant="danger"
                confirmText="Supprimer"
                cancelText="Annuler"
                ?showDontAskAgain="${true}"
                @confirm="${this._handleDeleteConfirm}"
                @cancel="${this._handleDeleteCancel}"
            ></confirm-dialog>

            <!-- Export Conversation Dialog -->
            <export-dialog
                ?open="${this.exportDialogOpen}"
                .conversation="${this.selectedConversation}"
                .messages="${this.messages}"
                @export="${this._handleExportConfirm}"
                @cancel="${this._handleExportCancel}"
            ></export-dialog>

            <!-- Command Palette -->
            <command-palette
                ?open="${this.commandPaletteOpen}"
                @close="${this._handleCommandPaletteClose}"
                @execute="${this._handleCommandExecute}"
            ></command-palette>

            <!-- Tag Manager -->
            <tag-manager
                ?open="${this.tagManagerOpen}"
                .conversation="${this.selectedConversation}"
                @close="${this._handleTagManagerClose}"
                @tags-changed="${this._handleTagsChanged}"
            ></tag-manager>

            <!-- Advanced Search Panel -->
            <advanced-search-panel
                ?open="${this.searchOpen}"
                .conversations="${this.conversations}"
                @close="${this._handleSearchClose}"
                @result-selected="${this._handleSearchResultSelected}"
            ></advanced-search-panel>

            <!-- Toast Container (for notifications) -->
            <toast-container></toast-container>
        `;
    }
}

customElements.define('claude-ask-view', ClaudeAskView);
