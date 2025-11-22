/**
 * Feature Bridge - Main orchestrator for all IPC bridges
 * Delegates to specialized bridges for better modularity
 */

// Import all specialized bridges
const settingsBridge = require('./modules/settingsBridge');
const aiModelsBridge = require('./modules/aiModelsBridge');
const conversationBridge = require('./modules/conversationBridge');
const knowledgeBridge = require('./modules/knowledgeBridge');
const authPermissionsBridge = require('./modules/authPermissionsBridge');
const eventsBridge = require('./modules/eventsBridge');
const profileBridge = require('./modules/profileBridge');
const promptBridge = require('./modules/promptBridge'); // Phase WOW 1 - Jour 5
const postMeetingBridge = require('./modules/postMeetingBridge'); // Phase 1 - Meeting Assistant
const participantBridge = require('./modules/participantBridge'); // Phase 2 - Participant Attribution
const emailBridge = require('./modules/emailBridge'); // Phase 2 - Email Generation
const taskBridge = require('./modules/taskBridge'); // Phase 2.3 - Task Management
const liveInsightsBridge = require('./modules/liveInsightsBridge'); // Phase 3 - Live Insights

module.exports = {
    /**
     * Initialize all IPC bridges
     * Delegates to specialized bridges for each domain
     */
    initialize() {
        console.log('[FeatureBridge] Initializing all bridges...');

        // Initialize all specialized bridges
        settingsBridge.initialize();
        aiModelsBridge.initialize();
        conversationBridge.initialize();
        knowledgeBridge.initialize();
        authPermissionsBridge.initialize();
        eventsBridge.initialize();
        profileBridge.initialize();
        promptBridge.initialize(); // Phase WOW 1 - Jour 5
        postMeetingBridge.initialize(); // Phase 1 - Meeting Assistant
        participantBridge.initialize(); // Phase 2 - Participant Attribution
        emailBridge.initialize(); // Phase 2 - Email Generation
        taskBridge.initialize(); // Phase 2.3 - Task Management
        liveInsightsBridge.initialize(); // Phase 3 - Live Insights

        console.log('[FeatureBridge] All bridges initialized successfully');
    },

    /**
     * Cleanup all event listeners to prevent memory leaks
     * Should be called before app shutdown
     */
    cleanup() {
        console.log('[FeatureBridge] Starting cleanup of all bridges...');

        // Cleanup event listeners from eventsBridge
        eventsBridge.cleanup();

        console.log('[FeatureBridge] All bridges cleaned up successfully');
    },

    /**
     * Renderer로 상태를 전송
     * Delegates to conversationBridge
     */
    sendAskProgress(win, progress) {
        conversationBridge.sendAskProgress(win, progress);
    }
};
