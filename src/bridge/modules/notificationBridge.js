/**
 * Notification Bridge - IPC handlers for desktop notifications
 */
const { ipcMain, Notification } = require('electron');

module.exports = {
    initialize() {
        // Handle notification send from renderer
        ipcMain.on('notification:send', (event, options) => {
            const {
                title = 'Lucide',
                body = '',
                icon = null,
                silent = false,
            } = options;

            // Check if notifications are supported
            if (!Notification.isSupported()) {
                console.warn('[NotificationBridge] Desktop notifications not supported');
                return;
            }

            try {
                // Create notification
                const notification = new Notification({
                    title,
                    body,
                    silent,
                    icon: icon || null, // Can be a path to an icon
                });

                // Handle click - focus the window
                notification.on('click', () => {
                    const { BrowserWindow } = require('electron');
                    const windows = BrowserWindow.getAllWindows();

                    // Focus the first visible window
                    if (windows.length > 0) {
                        const mainWindow = windows[0];
                        if (mainWindow.isMinimized()) {
                            mainWindow.restore();
                        }
                        mainWindow.focus();
                    }
                });

                // Show the notification
                notification.show();

                console.log('[NotificationBridge] Notification sent:', { title, body });
            } catch (error) {
                console.error('[NotificationBridge] Error sending notification:', error);
            }
        });

        console.log('[NotificationBridge] Initialized');
    }
};
