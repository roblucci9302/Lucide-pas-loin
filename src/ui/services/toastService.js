/**
 * Toast Service
 * Manages toast notifications globally
 *
 * Usage:
 * toastService.success('Message sent successfully!');
 * toastService.error('Failed to send message');
 * toastService.warning('Connection unstable');
 * toastService.info('New features available');
 */

export class ToastService {
    constructor() {
        this._toasts = [];
        this._listeners = new Set();
        this._nextId = 1;
    }

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @param {string} options.type - Toast type (success, error, warning, info)
     * @param {string} options.message - Toast message
     * @param {number} [options.duration=3000] - Auto-close duration in ms (0 = no auto-close)
     * @param {boolean} [options.closeable=true] - Show close button
     * @returns {number} Toast ID
     */
    show({ type = 'info', message, duration = 3000, closeable = true }) {
        const id = this._nextId++;

        const toast = {
            id,
            type,
            message,
            duration,
            closeable,
            visible: true,
            createdAt: Date.now()
        };

        this._toasts.push(toast);
        this._notifyListeners();

        console.log('[ToastService] Showing toast:', toast);

        return id;
    }

    /**
     * Show a success toast
     * @param {string} message - Toast message
     * @param {number} [duration=3000] - Auto-close duration
     * @returns {number} Toast ID
     */
    success(message, duration = 3000) {
        return this.show({
            type: 'success',
            message,
            duration
        });
    }

    /**
     * Show an error toast
     * @param {string} message - Toast message
     * @param {number} [duration=5000] - Auto-close duration (longer for errors)
     * @returns {number} Toast ID
     */
    error(message, duration = 5000) {
        return this.show({
            type: 'error',
            message,
            duration
        });
    }

    /**
     * Show a warning toast
     * @param {string} message - Toast message
     * @param {number} [duration=4000] - Auto-close duration
     * @returns {number} Toast ID
     */
    warning(message, duration = 4000) {
        return this.show({
            type: 'warning',
            message,
            duration
        });
    }

    /**
     * Show an info toast
     * @param {string} message - Toast message
     * @param {number} [duration=3000] - Auto-close duration
     * @returns {number} Toast ID
     */
    info(message, duration = 3000) {
        return this.show({
            type: 'info',
            message,
            duration
        });
    }

    /**
     * Dismiss a specific toast by ID
     * @param {number} id - Toast ID
     */
    dismiss(id) {
        const index = this._toasts.findIndex(t => t.id === id);
        if (index !== -1) {
            this._toasts.splice(index, 1);
            this._notifyListeners();
            console.log('[ToastService] Dismissed toast:', id);
        }
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        this._toasts = [];
        this._notifyListeners();
        console.log('[ToastService] Dismissed all toasts');
    }

    /**
     * Get all active toasts
     * @returns {Array} List of active toasts
     */
    getToasts() {
        return [...this._toasts];
    }

    /**
     * Subscribe to toast changes
     * @param {Function} callback - Called when toasts change
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this._listeners.add(callback);

        // Return unsubscribe function
        return () => {
            this._listeners.delete(callback);
        };
    }

    /**
     * Notify all listeners of toast changes
     * @private
     */
    _notifyListeners() {
        this._listeners.forEach(callback => {
            try {
                callback(this.getToasts());
            } catch (error) {
                console.error('[ToastService] Error in listener callback:', error);
            }
        });
    }
}

// Singleton instance
export const toastService = new ToastService();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.__toastService = toastService;
}
