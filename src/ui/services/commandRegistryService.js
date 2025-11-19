/**
 * commandRegistryService - Central registry for commands and keyboard shortcuts
 *
 * Features:
 * - Register commands with metadata (name, shortcut, category, icon)
 * - Execute commands by ID
 * - Fuzzy search for command palette
 * - Keyboard shortcut management
 * - Command categories for organization
 * - Command history tracking
 *
 * @example
 * commandRegistryService.register({
 *   id: 'new-conversation',
 *   name: 'Nouvelle conversation',
 *   shortcut: 'Cmd+K',
 *   category: 'conversation',
 *   icon: '💬',
 *   execute: () => { ... }
 * });
 */
class CommandRegistryService {
    constructor() {
        this.commands = new Map();
        this.shortcuts = new Map();
        this.categories = new Map();
        this.commandHistory = [];
        this.maxHistorySize = 10;
    }

    /**
     * Register a command
     * @param {Object} command - Command definition
     * @param {string} command.id - Unique identifier
     * @param {string} command.name - Display name
     * @param {string} command.description - Optional description
     * @param {string} command.shortcut - Keyboard shortcut (e.g., 'Cmd+K', 'Ctrl+Shift+P')
     * @param {string} command.category - Category (conversation, navigation, editing, etc.)
     * @param {string} command.icon - Icon/emoji
     * @param {Function} command.execute - Function to execute
     * @param {Function} command.isEnabled - Optional function to check if command is enabled
     */
    register(command) {
        if (!command.id) {
            console.error('[CommandRegistry] Command must have an id');
            return;
        }

        if (!command.name) {
            console.error('[CommandRegistry] Command must have a name');
            return;
        }

        if (!command.execute || typeof command.execute !== 'function') {
            console.error('[CommandRegistry] Command must have an execute function');
            return;
        }

        // Store command
        this.commands.set(command.id, {
            id: command.id,
            name: command.name,
            description: command.description || '',
            shortcut: command.shortcut || '',
            category: command.category || 'other',
            icon: command.icon || '⚡',
            execute: command.execute,
            isEnabled: command.isEnabled || (() => true),
            keywords: command.keywords || [],
        });

        // Register shortcut if provided
        if (command.shortcut) {
            const normalizedShortcut = this._normalizeShortcut(command.shortcut);
            this.shortcuts.set(normalizedShortcut, command.id);
        }

        // Add to category
        if (!this.categories.has(command.category)) {
            this.categories.set(command.category, []);
        }
        this.categories.get(command.category).push(command.id);

        console.log('[CommandRegistry] Registered command:', command.id);
    }

    /**
     * Unregister a command
     * @param {string} commandId - Command ID
     */
    unregister(commandId) {
        const command = this.commands.get(commandId);
        if (!command) return;

        // Remove from commands
        this.commands.delete(commandId);

        // Remove shortcut
        if (command.shortcut) {
            const normalizedShortcut = this._normalizeShortcut(command.shortcut);
            this.shortcuts.delete(normalizedShortcut);
        }

        // Remove from category
        const categoryCommands = this.categories.get(command.category);
        if (categoryCommands) {
            const index = categoryCommands.indexOf(commandId);
            if (index > -1) {
                categoryCommands.splice(index, 1);
            }
        }

        console.log('[CommandRegistry] Unregistered command:', commandId);
    }

    /**
     * Execute a command by ID
     * @param {string} commandId - Command ID
     * @param {*} args - Arguments to pass to command
     * @returns {Promise<*>} Command result
     */
    async execute(commandId, ...args) {
        const command = this.commands.get(commandId);
        if (!command) {
            console.error('[CommandRegistry] Command not found:', commandId);
            return;
        }

        // Check if command is enabled
        if (!command.isEnabled()) {
            console.warn('[CommandRegistry] Command is disabled:', commandId);
            return;
        }

        try {
            // Add to history
            this._addToHistory(commandId);

            // Execute command
            const result = await command.execute(...args);
            console.log('[CommandRegistry] Executed command:', commandId);
            return result;
        } catch (error) {
            console.error('[CommandRegistry] Error executing command:', commandId, error);
            throw error;
        }
    }

    /**
     * Execute a command by keyboard shortcut
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {Promise<boolean>} True if command was executed
     */
    async executeByShortcut(event) {
        const shortcut = this._eventToShortcut(event);
        const commandId = this.shortcuts.get(shortcut);

        if (!commandId) {
            return false;
        }

        // Prevent default browser behavior
        event.preventDefault();
        event.stopPropagation();

        await this.execute(commandId);
        return true;
    }

    /**
     * Search commands with fuzzy matching
     * @param {string} query - Search query
     * @returns {Array<Object>} Matching commands sorted by relevance
     */
    search(query) {
        if (!query || query.trim() === '') {
            // Return recent commands if no query
            return this._getRecentCommands();
        }

        const normalizedQuery = query.toLowerCase().trim();
        const results = [];

        for (const [id, command] of this.commands.entries()) {
            // Skip disabled commands
            if (!command.isEnabled()) {
                continue;
            }

            const score = this._fuzzyMatch(normalizedQuery, command);
            if (score > 0) {
                results.push({
                    ...command,
                    score
                });
            }
        }

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        return results;
    }

    /**
     * Get all commands in a category
     * @param {string} category - Category name
     * @returns {Array<Object>} Commands in category
     */
    getCategory(category) {
        const commandIds = this.categories.get(category) || [];
        return commandIds
            .map(id => this.commands.get(id))
            .filter(cmd => cmd && cmd.isEnabled());
    }

    /**
     * Get all categories
     * @returns {Array<string>} Category names
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * Get command by ID
     * @param {string} commandId - Command ID
     * @returns {Object|null} Command or null
     */
    getCommand(commandId) {
        return this.commands.get(commandId) || null;
    }

    /**
     * Get all commands
     * @returns {Array<Object>} All commands
     */
    getAllCommands() {
        return Array.from(this.commands.values()).filter(cmd => cmd.isEnabled());
    }

    /**
     * Normalize keyboard shortcut string
     * @private
     * @param {string} shortcut - Shortcut string (e.g., 'Cmd+K', 'Ctrl+Shift+P')
     * @returns {string} Normalized shortcut
     */
    _normalizeShortcut(shortcut) {
        const parts = shortcut.split('+').map(p => p.trim().toLowerCase());

        // Replace Cmd with Meta (browser standard)
        const normalized = parts.map(part => {
            if (part === 'cmd' || part === 'command') return 'meta';
            if (part === 'ctrl' || part === 'control') return 'ctrl';
            return part;
        });

        // Sort modifiers for consistency
        const modifiers = normalized.filter(p => ['meta', 'ctrl', 'alt', 'shift'].includes(p)).sort();
        const key = normalized.find(p => !['meta', 'ctrl', 'alt', 'shift'].includes(p));

        return [...modifiers, key].join('+');
    }

    /**
     * Convert keyboard event to shortcut string
     * @private
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Shortcut string
     */
    _eventToShortcut(event) {
        const modifiers = [];

        if (event.metaKey) modifiers.push('meta');
        if (event.ctrlKey) modifiers.push('ctrl');
        if (event.altKey) modifiers.push('alt');
        if (event.shiftKey) modifiers.push('shift');

        const key = event.key.toLowerCase();

        return [...modifiers.sort(), key].join('+');
    }

    /**
     * Fuzzy match query against command
     * @private
     * @param {string} query - Normalized query
     * @param {Object} command - Command object
     * @returns {number} Match score (0 = no match, higher = better match)
     */
    _fuzzyMatch(query, command) {
        let score = 0;

        const name = command.name.toLowerCase();
        const description = command.description.toLowerCase();
        const category = command.category.toLowerCase();
        const keywords = command.keywords.map(k => k.toLowerCase());

        // Exact name match (highest score)
        if (name === query) {
            return 1000;
        }

        // Name starts with query (high score)
        if (name.startsWith(query)) {
            score += 500;
        }

        // Name contains query (medium score)
        if (name.includes(query)) {
            score += 300;
        }

        // Description contains query (low score)
        if (description.includes(query)) {
            score += 100;
        }

        // Category matches (low score)
        if (category.includes(query)) {
            score += 50;
        }

        // Keyword matches (medium score)
        for (const keyword of keywords) {
            if (keyword.includes(query)) {
                score += 200;
                break;
            }
        }

        // Fuzzy character matching (very low score)
        let queryIndex = 0;
        for (let i = 0; i < name.length && queryIndex < query.length; i++) {
            if (name[i] === query[queryIndex]) {
                queryIndex++;
                score += 10;
            }
        }

        return score;
    }

    /**
     * Add command to history
     * @private
     * @param {string} commandId - Command ID
     */
    _addToHistory(commandId) {
        // Remove if already in history
        const index = this.commandHistory.indexOf(commandId);
        if (index > -1) {
            this.commandHistory.splice(index, 1);
        }

        // Add to front
        this.commandHistory.unshift(commandId);

        // Trim to max size
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Get recent commands
     * @private
     * @returns {Array<Object>} Recent commands
     */
    _getRecentCommands() {
        return this.commandHistory
            .map(id => this.commands.get(id))
            .filter(cmd => cmd && cmd.isEnabled())
            .slice(0, 5);
    }

    /**
     * Format shortcut for display
     * @param {string} shortcut - Shortcut string
     * @returns {string} Formatted shortcut for display
     */
    formatShortcut(shortcut) {
        if (!shortcut) return '';

        const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

        return shortcut
            .split('+')
            .map(part => {
                const lower = part.toLowerCase();
                if (lower === 'cmd' || lower === 'command' || lower === 'meta') {
                    return isMac ? '⌘' : 'Ctrl';
                }
                if (lower === 'ctrl' || lower === 'control') {
                    return isMac ? '⌃' : 'Ctrl';
                }
                if (lower === 'alt' || lower === 'option') {
                    return isMac ? '⌥' : 'Alt';
                }
                if (lower === 'shift') {
                    return isMac ? '⇧' : 'Shift';
                }
                return part.toUpperCase();
            })
            .join(isMac ? '' : '+');
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands.clear();
        this.shortcuts.clear();
        this.categories.clear();
        this.commandHistory = [];
        console.log('[CommandRegistry] Cleared all commands');
    }
}

// Export singleton instance
export const commandRegistryService = new CommandRegistryService();
