/**
 * Conversation Bridge - IPC handlers for agents, history, ask, and listen features
 */
const { ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const authService = require('../../features/common/services/authService');
const agentProfileService = require('../../features/common/services/agentProfileService');
const conversationHistoryService = require('../../features/common/services/conversationHistoryService');
const exportService = require('../../features/common/services/exportService');
const askService = require('../../features/ask/askService');
const browserService = require('../../features/browser/browserService');
const listenService = require('../../features/listen/listenService');

module.exports = {
    initialize() {
        // Agent Profiles
        ipcMain.handle('agent:get-available-profiles', () => agentProfileService.getAvailableProfiles());
        ipcMain.handle('agent:get-active-profile', () => agentProfileService.getCurrentProfile());
        ipcMain.handle('agent:set-active-profile', async (event, profileId) => {
            const userId = authService.getCurrentUserId();
            const success = await agentProfileService.setActiveProfile(userId, profileId);
            return { success };
        });

        // Conversation History (Phase 2)
        ipcMain.handle('history:get-all-sessions', async (event, options) => {
            const userId = authService.getCurrentUserId();
            return await conversationHistoryService.getAllSessions(userId, options);
        });
        ipcMain.handle('history:search-sessions', async (event, query, filters) => {
            const userId = authService.getCurrentUserId();
            return await conversationHistoryService.searchSessions(userId, query, filters);
        });
        ipcMain.handle('history:get-session-messages', async (event, sessionId) => {
            return await conversationHistoryService.getSessionMessages(sessionId);
        });
        ipcMain.handle('history:get-stats', async () => {
            const userId = authService.getCurrentUserId();
            return await conversationHistoryService.getSessionStats(userId);
        });
        ipcMain.handle('history:update-metadata', async (event, sessionId, metadata) => {
            return await conversationHistoryService.updateSessionMetadata(sessionId, metadata);
        });
        ipcMain.handle('history:delete-session', async (event, sessionId) => {
            return await conversationHistoryService.deleteSession(sessionId);
        });
        ipcMain.handle('history:generate-title', async (event, sessionId) => {
            return await conversationHistoryService.generateTitleFromContent(sessionId);
        });

        // Export Features (Phase 5)
        ipcMain.handle('export:conversation-json', async (event, sessionId) => {
            try {
                const session = await conversationHistoryService.getSession(sessionId);
                if (!session) {
                    throw new Error('Session not found');
                }

                const suggestedFilename = exportService.getSuggestedFilename(session, 'json');

                const result = await dialog.showSaveDialog({
                    title: 'Export Conversation to JSON',
                    defaultPath: path.join(os.homedir(), 'Downloads', suggestedFilename),
                    filters: [
                        { name: 'JSON Files', extensions: ['json'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled || !result.filePath) {
                    return { success: false, cancelled: true };
                }

                return await exportService.exportToJSON(sessionId, result.filePath);
            } catch (error) {
                console.error('[ConversationBridge] Error exporting to JSON:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('export:conversation-markdown', async (event, sessionId) => {
            try {
                const session = await conversationHistoryService.getSession(sessionId);
                if (!session) {
                    throw new Error('Session not found');
                }

                const suggestedFilename = exportService.getSuggestedFilename(session, 'markdown');

                const result = await dialog.showSaveDialog({
                    title: 'Export Conversation to Markdown',
                    defaultPath: path.join(os.homedir(), 'Downloads', suggestedFilename),
                    filters: [
                        { name: 'Markdown Files', extensions: ['md'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled || !result.filePath) {
                    return { success: false, cancelled: true };
                }

                return await exportService.exportToMarkdown(sessionId, result.filePath);
            } catch (error) {
                console.error('[ConversationBridge] Error exporting to Markdown:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('export:conversation-pdf', async (event, sessionId) => {
            try {
                const session = await conversationHistoryService.getSession(sessionId);
                if (!session) {
                    throw new Error('Session not found');
                }

                const suggestedFilename = exportService.getSuggestedFilename(session, 'pdf');

                const result = await dialog.showSaveDialog({
                    title: 'Export Conversation to PDF',
                    defaultPath: path.join(os.homedir(), 'Downloads', suggestedFilename),
                    filters: [
                        { name: 'PDF Files', extensions: ['pdf'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled || !result.filePath) {
                    return { success: false, cancelled: true };
                }

                return await exportService.exportToPDF(sessionId, result.filePath);
            } catch (error) {
                console.error('[ConversationBridge] Error exporting to PDF:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('export:conversation-docx', async (event, sessionId) => {
            try {
                const session = await conversationHistoryService.getSession(sessionId);
                if (!session) {
                    throw new Error('Session not found');
                }

                const suggestedFilename = exportService.getSuggestedFilename(session, 'docx');

                const result = await dialog.showSaveDialog({
                    title: 'Export Conversation to DOCX',
                    defaultPath: path.join(os.homedir(), 'Downloads', suggestedFilename),
                    filters: [
                        { name: 'Word Documents', extensions: ['docx'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled || !result.filePath) {
                    return { success: false, cancelled: true };
                }

                return await exportService.exportToDOCX(sessionId, result.filePath);
            } catch (error) {
                console.error('[ConversationBridge] Error exporting to DOCX:', error);
                return { success: false, error: error.message };
            }
        });

        // Ask Feature
        ipcMain.handle('ask:sendQuestionFromAsk', async (event, userPrompt) => await askService.sendMessage(userPrompt));
        ipcMain.handle('ask:sendQuestionFromSummary', async (event, userPrompt) => await askService.sendMessage(userPrompt));

        // Claude UI Integration - Enhanced Ask handlers
        ipcMain.handle('ask:sendMessage', async (event, { message, files = [], conversationHistory = [] }) => {
            try {
                console.log('[ConversationBridge] ask:sendMessage called from Claude UI');
                // askService.sendMessage already handles conversation history internally via DB
                return await askService.sendMessage(message, conversationHistory);
            } catch (error) {
                console.error('[ConversationBridge] ask:sendMessage failed:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('ask:getConversations', async () => {
            try {
                const userId = authService.getCurrentUserId();
                const sessions = await conversationHistoryService.getAllSessions(userId, {
                    limit: 50,
                    sortBy: 'updated_at',
                    sortOrder: 'DESC'
                });
                return sessions || [];
            } catch (error) {
                console.error('[ConversationBridge] ask:getConversations failed:', error);
                return [];
            }
        });

        ipcMain.handle('ask:getConversationHistory', async (event, { sessionId }) => {
            try {
                if (!sessionId) {
                    return [];
                }
                return await conversationHistoryService.getSessionMessages(sessionId);
            } catch (error) {
                console.error('[ConversationBridge] ask:getConversationHistory failed:', error);
                return [];
            }
        });

        ipcMain.handle('ask:createSession', async () => {
            try {
                const sessionRepository = require('../../features/common/repositories/session');
                const sessionId = await sessionRepository.getOrCreateActive('ask');
                return { sessionId };
            } catch (error) {
                console.error('[ConversationBridge] ask:createSession failed:', error);
                return { sessionId: null };
            }
        });

        ipcMain.handle('ask:getSessionMessages', async (event, { sessionId }) => {
            try {
                return await conversationHistoryService.getSessionMessages(sessionId);
            } catch (error) {
                console.error('[ConversationBridge] ask:getSessionMessages failed:', error);
                return [];
            }
        });

        ipcMain.handle('ask:deleteSession', async (event, { sessionId }) => {
            try {
                await conversationHistoryService.deleteSession(sessionId);
                return { success: true };
            } catch (error) {
                console.error('[ConversationBridge] ask:deleteSession failed:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('ask:updateSessionTitle', async (event, { sessionId, title }) => {
            try {
                await conversationHistoryService.updateSessionMetadata(sessionId, { title });
                return { success: true };
            } catch (error) {
                console.error('[ConversationBridge] ask:updateSessionTitle failed:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('ask:stopGeneration', async () => {
            try {
                // askService has abortController for stopping streams
                if (askService.abortController) {
                    askService.abortController.abort('User cancelled generation');
                    return { success: true };
                }
                return { success: false, error: 'No active generation to stop' };
            } catch (error) {
                console.error('[ConversationBridge] ask:stopGeneration failed:', error);
                return { success: false, error: error.message };
            }
        });

        // Original Ask handlers
        ipcMain.handle('ask:toggleAskButton', async () => await askService.toggleAskButton());
        ipcMain.handle('ask:closeAskWindow', async () => await askService.closeAskWindow());
        ipcMain.handle('ask:minimizeAskWindow', async () => await askService.minimizeAskWindow());
        ipcMain.handle('ask:showListenWindow', async () => await askService.showListenWindow());
        ipcMain.handle('ask:setBrowserMode', async (event, browserMode) => {
            try {
                const internalBridge = require('../../bridge/internalBridge');
                internalBridge.emit('window:setAskBrowserMode', { browserMode });
                return { success: true };
            } catch (error) {
                console.error('[ConversationBridge] ask:setBrowserMode failed', error.message);
                return { success: false, error: error.message };
            }
        });

        // Browser Feature
        ipcMain.handle('browser:show', async (event, url) => {
            console.log('[ConversationBridge] browser:show called', { url });
            try {
                const result = await browserService.showBrowser(url);
                return result;
            } catch (error) {
                console.error('[ConversationBridge] browser:show failed', error.message);
                return { success: false, error: error.message };
            }
        });
        ipcMain.handle('browser:navigateTo', async (event, url) => {
            console.log('[ConversationBridge] browser:navigateTo called', { url });
            try {
                const result = await browserService.navigateTo(url);
                return result;
            } catch (error) {
                console.error('[ConversationBridge] browser:navigateTo failed', error.message);
                return { success: false, error: error.message };
            }
        });
        ipcMain.handle('browser:close', async () => {
            console.log('[ConversationBridge] browser:close called');
            try {
                const result = await browserService.closeBrowser();
                return result;
            } catch (error) {
                console.error('[ConversationBridge] browser:close failed', error.message);
                return { success: false, error: error.message };
            }
        });

        // Listen Feature
        ipcMain.handle('listen:sendMicAudio', async (event, { data, mimeType }) => await listenService.handleSendMicAudioContent(data, mimeType));
        ipcMain.handle('listen:sendSystemAudio', async (event, { data, mimeType }) => {
            const result = await listenService.sttService.sendSystemAudioContent(data, mimeType);
            if (result.success) {
                listenService.sendToRenderer('system-audio-data', { data });
            }
            return result;
        });
        ipcMain.handle('listen:startMacosSystemAudio', async () => await listenService.handleStartMacosAudio());
        ipcMain.handle('listen:stopMacosSystemAudio', async () => await listenService.handleStopMacosAudio());
        ipcMain.handle('update-google-search-setting', async (event, enabled) => await listenService.handleUpdateGoogleSearchSetting(enabled));
        ipcMain.handle('listen:isSessionActive', async () => await listenService.isSessionActive());
        ipcMain.handle('listen:changeSession', async (event, listenButtonText) => {
            console.log('[ConversationBridge] listen:changeSession from mainheader', listenButtonText);
            try {
                await listenService.handleListenRequest(listenButtonText);
                return { success: true };
            } catch (error) {
                console.error('[ConversationBridge] listen:changeSession failed', error.message);
                return { success: false, error: error.message };
            }
        });
        ipcMain.handle('listen:hideWindow', async () => {
            try {
                const internalBridge = require('../../bridge/internalBridge');
                internalBridge.emit('window:requestVisibility', { name: 'listen', visible: false });
                return { success: true };
            } catch (error) {
                console.error('[ConversationBridge] listen:hideWindow failed', error.message);
                return { success: false, error: error.message };
            }
        });

        console.log('[ConversationBridge] Initialized');
    },

    // Renderer로 상태를 전송
    sendAskProgress(win, progress) {
        win.webContents.send('feature:ask:progress', progress);
    }
};
