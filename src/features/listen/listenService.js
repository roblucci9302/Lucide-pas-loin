const { BrowserWindow } = require('electron');
const SttService = require('./stt/sttService');
const SummaryService = require('./summary/summaryService');
const responseService = require('./response/responseService');
const liveInsightsService = require('./liveInsights/liveInsightsService');
const { liveInsightsRepository } = require('./liveInsights/repositories');
const notificationService = require('./liveInsights/notificationService'); // Phase 3.3
const authService = require('../common/services/authService');
const sessionRepository = require('../common/repositories/session');
const sttRepository = require('./stt/repositories');
const internalBridge = require('../../bridge/internalBridge');

class ListenService {
    constructor() {
        this.sttService = new SttService();
        this.summaryService = new SummaryService();
        this.currentSessionId = null;
        this.isInitializingSession = false;
        this.lastTranscription = '';

        this.setupServiceCallbacks();
        console.log('[ListenService] Service instance created.');
    }

    setupServiceCallbacks() {
        // STT service callbacks
        this.sttService.setCallbacks({
            onTranscriptionComplete: (speaker, text) => {
                this.handleTranscriptionComplete(speaker, text);
            },
            onStatusUpdate: (status) => {
                this.sendToRenderer('update-status', status);
            }
        });

        // Summary service callbacks
        this.summaryService.setCallbacks({
            onAnalysisComplete: (data) => {
                console.log('📊 Analysis completed:', data);
            },
            onStatusUpdate: (status) => {
                this.sendToRenderer('update-status', status);
            }
        });

        // Response service callbacks (real-time AI suggestions)
        responseService.setCallbacks({
            onSuggestionsReady: (suggestions) => {
                console.log('💬 AI suggestions ready:', suggestions);
                this.sendToRenderer('ai-response-ready', { suggestions });
            },
            onSuggestionsError: (error) => {
                console.error('❌ AI suggestions error:', error.message);
                this.sendToRenderer('ai-response-error', { error: error.message });
            }
        });

        // Live Insights service callbacks (Phase 3)
        liveInsightsService.on('insight-detected', (insight) => {
            console.log(`[LiveInsights] ${insight.priority.toUpperCase()}: ${insight.title}`);

            // Send to renderer for real-time display
            this.sendToRenderer('insight-detected', { insight });

            // Save to database
            this._saveInsightToDatabase(insight);
        });

        liveInsightsService.on('insight-dismissed', (insight) => {
            console.log(`[LiveInsights] Dismissed: ${insight.title}`);
            this.sendToRenderer('insight-dismissed', { insightId: insight.id });
        });

        // Notification service callbacks (Phase 3.3)
        notificationService.on('notification', (notification) => {
            this.sendToRenderer('notification', notification);
        });

        notificationService.on('notification-read', (notification) => {
            this.sendToRenderer('notification-read', notification);
        });

        notificationService.on('all-notifications-read', () => {
            this.sendToRenderer('all-notifications-read', {});
        });

        notificationService.on('notification-expired', (notificationId) => {
            this.sendToRenderer('notification-expired', notificationId);
        });

        notificationService.on('all-notifications-cleared', () => {
            this.sendToRenderer('all-notifications-cleared', {});
        });

        notificationService.on('preferences-updated', (preferences) => {
            this.sendToRenderer('notification-preferences-updated', { preferences });
        });
    }

    sendToRenderer(channel, data) {
        const { windowPool } = require('../../window/windowManager');
        const listenWindow = windowPool?.get('listen');
        
        if (listenWindow && !listenWindow.isDestroyed()) {
            listenWindow.webContents.send(channel, data);
        }
    }

    initialize() {
        // IPC handlers are registered in conversationBridge.js
        // Service callbacks are already set up in constructor via setupServiceCallbacks()
        console.log('[ListenService] Initialized and ready.');
    }

    async handleListenRequest(listenButtonText) {
        const { windowPool } = require('../../window/windowManager');
        const listenWindow = windowPool.get('listen');
        const header = windowPool.get('header');

        try {
            switch (listenButtonText) {
                case 'Écouter':
                    console.log('[ListenService] changeSession to "Listen"');
                    internalBridge.emit('window:requestVisibility', { name: 'listen', visible: true });
                    await this.initializeSession();
                    if (listenWindow && !listenWindow.isDestroyed()) {
                        listenWindow.webContents.send('session-state-changed', { isActive: true });
                    }
                    break;
        
                case 'Stop':
                    console.log('[ListenService] changeSession to "Stop"');
                    await this.closeSession();
                    if (listenWindow && !listenWindow.isDestroyed()) {
                        listenWindow.webContents.send('session-state-changed', { isActive: false });
                    }
                    break;
        
                case 'Terminé':
                    console.log('[ListenService] changeSession to "Done"');
                    internalBridge.emit('window:requestVisibility', { name: 'listen', visible: false });
                    listenWindow.webContents.send('session-state-changed', { isActive: false });
                    break;
        
                default:
                    throw new Error(`[ListenService] unknown listenButtonText: ${listenButtonText}`);
            }
            
            header.webContents.send('listen:changeSessionResult', { success: true });

        } catch (error) {
            console.error('[ListenService] error in handleListenRequest:', error);
            header.webContents.send('listen:changeSessionResult', { success: false });
            throw error; 
        }
    }

    async handleTranscriptionComplete(speaker, text) {
        console.log(`[ListenService] Transcription complete: ${speaker} - ${text}`);

        // Save to database
        await this.saveConversationTurn(speaker, text);

        // Add to summary service for analysis
        this.summaryService.addConversationTurn(speaker, text);

        // Add to response service for real-time suggestions
        responseService.addConversationTurn(speaker, text);

        // Process for live insights (Phase 3)
        liveInsightsService.processConversationTurn(speaker, text);

        // Sauvegarder la dernière transcription si c'est l'utilisateur qui parle
        if (speaker === 'Me') {
            this.lastTranscription = text;

            // Generate real-time AI response suggestions when user finishes speaking
            console.log('[ListenService] User finished speaking, generating response suggestions...');
            responseService.generateSuggestions().catch(error => {
                console.error('[ListenService] Failed to generate suggestions:', error);
            });
        }
    }

    async saveConversationTurn(speaker, transcription) {
        if (!this.currentSessionId) {
            console.error('[DB] Cannot save turn, no active session ID.');
            return;
        }
        if (transcription.trim() === '') return;

        try {
            await sessionRepository.touch(this.currentSessionId);
            await sttRepository.addTranscript({
                sessionId: this.currentSessionId,
                speaker: speaker,
                text: transcription.trim(),
            });
            console.log(`[DB] Saved transcript for session ${this.currentSessionId}: (${speaker})`);
        } catch (error) {
            console.error('Failed to save transcript to DB:', error);
        }
    }

    async initializeNewSession() {
        try {
            // The UID is no longer passed to the repository method directly.
            // The adapter layer handles UID injection. We just ensure a user is available.
            const user = authService.getCurrentUser();
            if (!user) {
                // This case should ideally not happen as authService initializes a default user.
                throw new Error("Cannot initialize session: auth service not ready.");
            }
            
            this.currentSessionId = await sessionRepository.getOrCreateActive('listen');
            console.log(`[DB] New listen session ensured: ${this.currentSessionId}`);

            // Set session ID for summary service
            this.summaryService.setSessionId(this.currentSessionId);

            // Set session ID for live insights service (Phase 3)
            liveInsightsService.setSessionId(this.currentSessionId);

            // Reset conversation history
            this.summaryService.resetConversationHistory();
            responseService.resetConversationHistory();

            console.log('New conversation session started:', this.currentSessionId);
            return true;
        } catch (error) {
            console.error('Failed to initialize new session in DB:', error);
            this.currentSessionId = null;
            return false;
        }
    }

    async initializeSession(language = 'en') {
        if (this.isInitializingSession) {
            console.log('Session initialization already in progress.');
            return false;
        }

        this.isInitializingSession = true;
        this.sendToRenderer('session-initializing', true);
        this.sendToRenderer('update-status', 'Initializing sessions...');

        try {
            // Initialize database session
            const sessionInitialized = await this.initializeNewSession();
            if (!sessionInitialized) {
                throw new Error('Failed to initialize database session');
            }

            /* ---------- STT Initialization Retry Logic ---------- */
            const MAX_RETRY = 10;
            const RETRY_DELAY_MS = 300;   // 0.3 seconds

            let sttReady = false;
            for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
                try {
                    await this.sttService.initializeSttSessions(language);
                    sttReady = true;
                    break;                         // Exit on success
                } catch (err) {
                    console.warn(
                        `[ListenService] STT init attempt ${attempt} failed: ${err.message}`
                    );
                    if (attempt < MAX_RETRY) {
                        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                    }
                }
            }
            if (!sttReady) throw new Error('STT init failed after retries');
            /* ------------------------------------------- */

            console.log('✅ Listen service initialized successfully.');
            
            this.sendToRenderer('update-status', 'Connected. Ready to listen.');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize listen service:', error);
            this.sendToRenderer('update-status', 'Initialization failed.');
            return false;
        } finally {
            this.isInitializingSession = false;
            this.sendToRenderer('session-initializing', false);
            this.sendToRenderer('change-listen-capture-state', { status: "start" });
        }
    }

    async sendMicAudioContent(data, mimeType) {
        return await this.sttService.sendMicAudioContent(data, mimeType);
    }

    async startMacOSAudioCapture() {
        if (process.platform !== 'darwin') {
            throw new Error('macOS audio capture only available on macOS');
        }
        return await this.sttService.startMacOSAudioCapture();
    }

    async stopMacOSAudioCapture() {
        this.sttService.stopMacOSAudioCapture();
    }

    isSessionActive() {
        return this.sttService.isSessionActive();
    }

    async closeSession() {
        try {
            this.sendToRenderer('change-listen-capture-state', { status: "stop" });
            // Close STT sessions
            await this.sttService.closeSessions();

            await this.stopMacOSAudioCapture();

            // End database session
            if (this.currentSessionId) {
                await sessionRepository.end(this.currentSessionId);
                console.log(`[DB] Session ${this.currentSessionId} ended.`);
            }

            // Reset state
            this.currentSessionId = null;
            this.summaryService.resetConversationHistory();
            responseService.resetConversationHistory();
            liveInsightsService.reset(); // Phase 3

            console.log('Listen service session closed.');
            return { success: true };
        } catch (error) {
            console.error('Error closing listen service session:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentSessionData() {
        return {
            sessionId: this.currentSessionId,
            conversationHistory: this.summaryService.getConversationHistory(),
            totalTexts: this.summaryService.getConversationHistory().length,
            analysisData: this.summaryService.getCurrentAnalysisData(),
        };
    }

    getConversationHistory() {
        return this.summaryService.getConversationHistory();
    }

    getLastTranscription() {
        return this.lastTranscription;
    }

    getRecentTranscriptions(count = 3) {
        return this.summaryService.getConversationHistory().slice(-count);
    }

    /**
     * Save insight to database (Phase 3)
     * @private
     */
    async _saveInsightToDatabase(insight) {
        try {
            const uid = authService.getCurrentUserId();

            await liveInsightsRepository.create({
                ...insight,
                user_id: uid
            });

            console.log(`[LiveInsights] Saved to DB: ${insight.type} - ${insight.title}`);
        } catch (error) {
            console.error('[LiveInsights] Failed to save to database:', error);
        }
    }

    _createHandler(asyncFn, successMessage, errorMessage) {
        return async (...args) => {
            try {
                const result = await asyncFn.apply(this, args);
                if (successMessage) console.log(successMessage);
                // `startMacOSAudioCapture`는 성공 시 { success, error } 객체를 반환하지 않으므로,
                // 핸들러가 일관된 응답을 보내도록 여기서 success 객체를 반환합니다.
                // 다른 함수들은 이미 success 객체를 반환합니다.
                return result && typeof result.success !== 'undefined' ? result : { success: true };
            } catch (e) {
                console.error(errorMessage, e);
                return { success: false, error: e.message };
            }
        };
    }

    // `_createHandler`를 사용하여 핸들러들을 동적으로 생성합니다.
    handleSendMicAudioContent = this._createHandler(
        this.sendMicAudioContent,
        null,
        'Error sending user audio:'
    );

    handleStartMacosAudio = this._createHandler(
        async () => {
            if (process.platform !== 'darwin') {
                return { success: false, error: 'macOS audio capture only available on macOS' };
            }
            if (this.sttService.isMacOSAudioRunning?.()) {
                return { success: false, error: 'already_running' };
            }
            await this.startMacOSAudioCapture();
            return { success: true, error: null };
        },
        'macOS audio capture started.',
        'Error starting macOS audio capture:'
    );
    
    handleStopMacosAudio = this._createHandler(
        this.stopMacOSAudioCapture,
        'macOS audio capture stopped.',
        'Error stopping macOS audio capture:'
    );

    handleUpdateGoogleSearchSetting = this._createHandler(
        async (enabled) => {
            console.log('Google Search setting updated to:', enabled);
        },
        null,
        'Error updating Google Search setting:'
    );
}

const listenService = new ListenService();
module.exports = listenService;