/**
 * notificationService - Service for managing desktop notifications
 *
 * Features:
 * - Electron desktop notifications
 * - Notification permissions management
 * - User preference integration
 * - Multiple notification types (success, info, warning, error)
 * - Notification actions and click handlers
 * - Focus window on notification click
 *
 * @example
 * notificationService.notify({
 *   type: 'success',
 *   title: 'Message Complete',
 *   body: 'Claude has finished responding',
 * });
 */
class NotificationService {
    constructor() {
        this.isSupported = typeof Notification !== 'undefined';
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.settings = null;
        this.isElectron = this._detectElectron();

        console.log('[NotificationService] Initialized', {
            isSupported: this.isSupported,
            permission: this.permission,
            isElectron: this.isElectron,
        });
    }

    /**
     * Detect if running in Electron
     * @private
     * @returns {boolean}
     */
    _detectElectron() {
        return !!(window.electronAPI || navigator.userAgent.includes('Electron'));
    }

    /**
     * Initialize with settings
     * @param {Object} settings - Settings from settingsService
     */
    init(settings) {
        this.settings = settings;

        // Request permission if needed
        if (this.isSupported && this.permission === 'default' && this._isEnabled()) {
            this.requestPermission();
        }
    }

    /**
     * Request notification permission
     * @returns {Promise<string>} Permission state
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('[NotificationService] Notifications not supported');
            return 'denied';
        }

        try {
            this.permission = await Notification.requestPermission();
            console.log('[NotificationService] Permission:', this.permission);
            return this.permission;
        } catch (error) {
            console.error('[NotificationService] Permission request failed:', error);
            return 'denied';
        }
    }

    /**
     * Check if notifications are enabled
     * @private
     * @returns {boolean}
     */
    _isEnabled() {
        if (!this.settings) return true; // Default enabled
        return this.settings.notifications?.enabled !== false;
    }

    /**
     * Check if notification type is enabled
     * @private
     * @param {string} type - Notification type
     * @returns {boolean}
     */
    _isTypeEnabled(type) {
        if (!this.settings || !this.settings.notifications) return true;

        const typeMap = {
            'streaming-complete': 'streamingComplete',
            'new-message': 'newMessage',
            'mention': 'mentions',
            'error': 'errors',
        };

        const settingKey = typeMap[type];
        if (!settingKey) return true;

        return this.settings.notifications[settingKey] !== false;
    }

    /**
     * Send a notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Notification type (streaming-complete, new-message, mention, error)
     * @param {string} options.title - Notification title
     * @param {string} options.body - Notification body
     * @param {string} [options.icon] - Notification icon path
     * @param {string} [options.tag] - Notification tag (for grouping/replacing)
     * @param {boolean} [options.silent] - Silent notification (no sound)
     * @param {Function} [options.onClick] - Click handler
     * @returns {Notification|null} Notification instance or null
     */
    notify(options) {
        const {
            type = 'info',
            title,
            body,
            icon = null,
            tag = null,
            silent = false,
            onClick = null,
        } = options;

        // Check if notifications are enabled
        if (!this._isEnabled()) {
            console.log('[NotificationService] Notifications disabled');
            return null;
        }

        // Check if this notification type is enabled
        if (!this._isTypeEnabled(type)) {
            console.log(`[NotificationService] ${type} notifications disabled`);
            return null;
        }

        // Check support and permission
        if (!this.isSupported || this.permission !== 'granted') {
            console.log('[NotificationService] Not supported or not granted');
            return null;
        }

        try {
            // Use Electron API if available
            if (this.isElectron && window.electronAPI?.sendNotification) {
                window.electronAPI.sendNotification({
                    title,
                    body,
                    icon,
                    silent,
                });

                console.log('[NotificationService] Sent via Electron:', { title, body });
                return null; // Electron handles it
            }

            // Fallback to Web Notification API
            const notification = new Notification(title, {
                body,
                icon: icon || this._getDefaultIcon(type),
                tag: tag || `lucide-${type}`,
                silent,
                badge: '/assets/icons/badge.png',
                requireInteraction: false,
            });

            // Handle click
            notification.onclick = () => {
                console.log('[NotificationService] Notification clicked');

                // Focus window
                if (window.focus) {
                    window.focus();
                }

                // Custom click handler
                if (onClick) {
                    onClick();
                }

                notification.close();
            };

            console.log('[NotificationService] Sent:', { title, body, type });
            return notification;
        } catch (error) {
            console.error('[NotificationService] Failed to send notification:', error);
            return null;
        }
    }

    /**
     * Get default icon for notification type
     * @private
     * @param {string} type - Notification type
     * @returns {string} Icon path
     */
    _getDefaultIcon(type) {
        const iconMap = {
            'success': '✅',
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌',
            'streaming-complete': '✨',
            'new-message': '💬',
            'mention': '🔔',
        };

        return iconMap[type] || 'ℹ️';
    }

    /**
     * Notify when streaming completes
     * @param {Object} options - Options
     * @param {string} options.conversationTitle - Conversation title
     * @param {number} [options.messageLength] - Message length
     */
    notifyStreamingComplete(options) {
        const { conversationTitle = 'Conversation', messageLength = 0 } = options;

        this.notify({
            type: 'streaming-complete',
            title: 'Réponse terminée',
            body: `Claude a terminé sa réponse dans "${conversationTitle}"${messageLength ? ` (${messageLength} caractères)` : ''}`,
            tag: 'streaming-complete',
        });
    }

    /**
     * Notify when new message arrives
     * @param {Object} options - Options
     * @param {string} options.conversationTitle - Conversation title
     * @param {string} options.sender - Sender name (user/assistant)
     * @param {string} [options.preview] - Message preview
     */
    notifyNewMessage(options) {
        const {
            conversationTitle = 'Conversation',
            sender = 'assistant',
            preview = '',
        } = options;

        const senderName = sender === 'user' ? 'Vous' : 'Claude';

        this.notify({
            type: 'new-message',
            title: conversationTitle,
            body: preview ? `${senderName}: ${preview.substring(0, 100)}${preview.length > 100 ? '...' : ''}` : `Nouveau message de ${senderName}`,
            tag: `new-message-${conversationTitle}`,
        });
    }

    /**
     * Notify when mentioned in a message (keyword detection)
     * @param {Object} options - Options
     * @param {string} options.conversationTitle - Conversation title
     * @param {string} options.keyword - Detected keyword
     * @param {string} [options.preview] - Message preview
     */
    notifyMention(options) {
        const {
            conversationTitle = 'Conversation',
            keyword = '',
            preview = '',
        } = options;

        this.notify({
            type: 'mention',
            title: `Mention: "${keyword}"`,
            body: preview ? preview.substring(0, 100) : `Détecté dans "${conversationTitle}"`,
            tag: `mention-${keyword}`,
        });
    }

    /**
     * Notify on error
     * @param {Object} options - Options
     * @param {string} options.title - Error title
     * @param {string} options.message - Error message
     */
    notifyError(options) {
        const { title = 'Erreur', message = '' } = options;

        this.notify({
            type: 'error',
            title,
            body: message,
            tag: 'error',
        });
    }

    /**
     * Test notification (for settings preview)
     */
    sendTestNotification() {
        this.notify({
            type: 'info',
            title: 'Notification de test',
            body: 'Les notifications fonctionnent correctement ! 🎉',
            tag: 'test',
        });
    }

    /**
     * Update settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = settings;
        console.log('[NotificationService] Settings updated:', settings.notifications);
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
