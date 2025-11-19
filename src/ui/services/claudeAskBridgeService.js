/**
 * ClaudeAskBridgeService - IPC Bridge for Claude UI → Ask Service
 *
 * This service connects the Claude UI (renderer) to the Ask Service (main process)
 * via Electron IPC. It handles:
 * - Sending messages to AI
 * - Receiving streaming responses
 * - Loading conversation history
 * - Managing sessions
 */

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

export class ClaudeAskBridgeService {
    constructor() {
        this.listeners = new Map();
        this.currentSessionId = null;

        // Setup IPC listeners if available
        if (ipcRenderer) {
            this._setupIpcListeners();
        } else {
            console.warn('[ClaudeAskBridge] IPC not available, running in mock mode');
        }
    }

    /**
     * Setup IPC event listeners for streaming and state updates
     * @private
     */
    _setupIpcListeners() {
        // Listen for state updates from Ask service
        ipcRenderer.on('ask:stateUpdate', (event, state) => {
            this._notifyListeners('stateUpdate', state);
        });

        // Listen for stream errors
        ipcRenderer.on('ask-response-stream-error', (event, { error }) => {
            this._notifyListeners('error', { error });
        });

        // Listen for agent switches
        ipcRenderer.on('agent-switched', (event, data) => {
            this._notifyListeners('agentSwitched', data);
        });

        console.log('[ClaudeAskBridge] IPC listeners setup complete');
    }

    /**
     * Subscribe to events (stateUpdate, error, agentSwitched)
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }

    /**
     * Notify all listeners of an event
     * @private
     */
    _notifyListeners(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[ClaudeAskBridge] Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Send a message to the AI
     * @param {string} message - User message
     * @param {Array} files - Attached files
     * @param {Array} conversationHistory - Previous messages
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async sendMessage(message, files = [], conversationHistory = []) {
        if (!ipcRenderer) {
            console.warn('[ClaudeAskBridge] IPC not available, using mock response');
            return this._mockSendMessage(message, files);
        }

        try {
            console.log('[ClaudeAskBridge] Sending message to Ask service:', message.substring(0, 50));

            // Invoke Ask service via IPC
            const result = await ipcRenderer.invoke('ask:sendMessage', {
                message,
                files,
                conversationHistory
            });

            return result;
        } catch (error) {
            console.error('[ClaudeAskBridge] Error sending message:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load conversation history for current session
     * @returns {Promise<Array>}
     */
    async loadConversationHistory() {
        if (!ipcRenderer) {
            return this._mockConversationHistory();
        }

        try {
            const history = await ipcRenderer.invoke('ask:getConversationHistory', {
                sessionId: this.currentSessionId
            });
            return history || [];
        } catch (error) {
            console.error('[ClaudeAskBridge] Error loading conversation history:', error);
            return [];
        }
    }

    /**
     * Load all conversations/sessions
     * @returns {Promise<Array>}
     */
    async loadConversations() {
        if (!ipcRenderer) {
            return this._mockConversations();
        }

        try {
            const conversations = await ipcRenderer.invoke('ask:getConversations');
            return conversations || [];
        } catch (error) {
            console.error('[ClaudeAskBridge] Error loading conversations:', error);
            return [];
        }
    }

    /**
     * Create a new conversation/session
     * @returns {Promise<{sessionId: string}>}
     */
    async createNewConversation() {
        if (!ipcRenderer) {
            return { sessionId: `mock-session-${Date.now()}` };
        }

        try {
            const result = await ipcRenderer.invoke('ask:createSession');
            this.currentSessionId = result.sessionId;
            return result;
        } catch (error) {
            console.error('[ClaudeAskBridge] Error creating conversation:', error);
            return { sessionId: null };
        }
    }

    /**
     * Switch to an existing conversation
     * @param {string} sessionId - Session ID
     * @returns {Promise<Array>} Messages in the session
     */
    async switchConversation(sessionId) {
        if (!ipcRenderer) {
            return this._mockConversationHistory();
        }

        try {
            this.currentSessionId = sessionId;
            const messages = await ipcRenderer.invoke('ask:getSessionMessages', { sessionId });
            return messages || [];
        } catch (error) {
            console.error('[ClaudeAskBridge] Error switching conversation:', error);
            return [];
        }
    }

    /**
     * Delete a conversation
     * @param {string} sessionId - Session ID
     * @returns {Promise<{success: boolean}>}
     */
    async deleteConversation(sessionId) {
        if (!ipcRenderer) {
            return { success: true };
        }

        try {
            await ipcRenderer.invoke('ask:deleteSession', { sessionId });
            return { success: true };
        } catch (error) {
            console.error('[ClaudeAskBridge] Error deleting conversation:', error);
            return { success: false };
        }
    }

    /**
     * Update conversation title
     * @param {string} sessionId - Session ID
     * @param {string} title - New title
     * @returns {Promise<{success: boolean}>}
     */
    async updateConversationTitle(sessionId, title) {
        if (!ipcRenderer) {
            return { success: true };
        }

        try {
            await ipcRenderer.invoke('ask:updateSessionTitle', { sessionId, title });
            return { success: true };
        } catch (error) {
            console.error('[ClaudeAskBridge] Error updating conversation title:', error);
            return { success: false };
        }
    }

    /**
     * Stop current streaming response
     * @returns {Promise<{success: boolean}>}
     */
    async stopGeneration() {
        if (!ipcRenderer) {
            return { success: true };
        }

        try {
            await ipcRenderer.invoke('ask:stopGeneration');
            return { success: true };
        } catch (error) {
            console.error('[ClaudeAskBridge] Error stopping generation:', error);
            return { success: false };
        }
    }

    // ========================================
    // MOCK METHODS (for development/testing)
    // ========================================

    /**
     * Mock send message for development
     * @private
     */
    _mockSendMessage(message, files = []) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate state update (loading)
                this._notifyListeners('stateUpdate', {
                    isLoading: true,
                    isStreaming: false,
                    currentQuestion: message,
                    currentResponse: ''
                });

                // Simulate streaming after 500ms
                setTimeout(() => {
                    this._notifyListeners('stateUpdate', {
                        isLoading: false,
                        isStreaming: true,
                        currentQuestion: message,
                        currentResponse: ''
                    });

                    // Simulate streaming chunks
                    const response = `Ceci est une réponse de démonstration à votre question : "${message}". ${files.length > 0 ? `J'ai reçu ${files.length} fichier(s).` : ''}\n\nL'intégration avec le service Ask est maintenant **active** ! 🎉`;
                    let currentResponse = '';
                    let index = 0;

                    const streamInterval = setInterval(() => {
                        if (index < response.length) {
                            const chunk = response.substring(index, index + 5);
                            currentResponse += chunk;
                            index += 5;

                            this._notifyListeners('stateUpdate', {
                                isLoading: false,
                                isStreaming: true,
                                currentQuestion: message,
                                currentResponse
                            });
                        } else {
                            clearInterval(streamInterval);
                            this._notifyListeners('stateUpdate', {
                                isLoading: false,
                                isStreaming: false,
                                currentQuestion: message,
                                currentResponse
                            });
                        }
                    }, 50);
                }, 500);

                resolve({ success: true });
            }, 100);
        });
    }

    /**
     * Mock conversation history
     * @private
     */
    _mockConversationHistory() {
        return [
            {
                id: '1',
                role: 'user',
                content: 'Comment créer un composant React ?',
                created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '2',
                role: 'assistant',
                content: 'Voici comment créer un composant React...',
                created_at: new Date(Date.now() - 3500000).toISOString()
            }
        ];
    }

    /**
     * Mock conversations list
     * @private
     */
    _mockConversations() {
        return [
            {
                id: '1',
                title: 'Comment créer un composant React ?',
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                message_count: 4
            },
            {
                id: '2',
                title: 'Expliquer les closures en JavaScript',
                updated_at: new Date(Date.now() - 3600000).toISOString(),
                created_at: new Date(Date.now() - 3600000).toISOString(),
                message_count: 2
            }
        ];
    }
}

// Singleton instance
export const claudeAskBridgeService = new ClaudeAskBridgeService();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.__claudeAskBridgeService = claudeAskBridgeService;
}
