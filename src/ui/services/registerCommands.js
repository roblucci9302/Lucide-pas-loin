import { commandRegistryService } from './commandRegistryService.js';

/**
 * registerCommands - Register all available commands for the command palette
 *
 * This function should be called once during app initialization.
 * It registers all commands with their shortcuts, categories, and handlers.
 *
 * @param {Object} context - Context object with references to app components/methods
 * @param {Function} context.newConversation - Create new conversation
 * @param {Function} context.openSettings - Open settings panel
 * @param {Function} context.closeSettings - Close settings panel
 * @param {Function} context.toggleSidebar - Toggle sidebar visibility
 * @param {Function} context.toggleArtifacts - Toggle artifacts panel
 * @param {Function} context.exportConversation - Export current conversation
 * @param {Function} context.renameConversation - Rename current conversation
 * @param {Function} context.deleteConversation - Delete current conversation
 * @param {Function} context.copyLastMessage - Copy last assistant message
 * @param {Function} context.focusInput - Focus message input
 * @param {Function} context.getCurrentConversation - Get current conversation
 */
export function registerCommands(context) {
    // Clear existing commands
    commandRegistryService.clear();

    // === CONVERSATION COMMANDS ===
    commandRegistryService.register({
        id: 'new-conversation',
        name: 'Nouvelle conversation',
        description: 'Créer une nouvelle conversation vide',
        shortcut: 'Cmd+K',
        category: 'conversation',
        icon: '💬',
        execute: () => {
            context.newConversation();
        },
    });

    commandRegistryService.register({
        id: 'rename-conversation',
        name: 'Renommer la conversation',
        description: 'Modifier le titre de la conversation courante',
        shortcut: 'Cmd+R',
        category: 'conversation',
        icon: '✏️',
        execute: () => {
            context.renameConversation();
        },
        isEnabled: () => !!context.getCurrentConversation(),
    });

    commandRegistryService.register({
        id: 'delete-conversation',
        name: 'Supprimer la conversation',
        description: 'Supprimer définitivement la conversation courante',
        shortcut: 'Cmd+Shift+Backspace',
        category: 'conversation',
        icon: '🗑️',
        execute: () => {
            context.deleteConversation();
        },
        isEnabled: () => !!context.getCurrentConversation(),
    });

    commandRegistryService.register({
        id: 'export-conversation',
        name: 'Exporter la conversation',
        description: 'Exporter en Markdown, JSON ou PDF',
        shortcut: 'Cmd+E',
        category: 'conversation',
        icon: '📥',
        execute: () => {
            context.exportConversation();
        },
        isEnabled: () => !!context.getCurrentConversation(),
    });

    // === NAVIGATION COMMANDS ===
    commandRegistryService.register({
        id: 'toggle-sidebar',
        name: 'Afficher/Masquer la barre latérale',
        description: 'Basculer la visibilité de la barre latérale',
        shortcut: 'Cmd+B',
        category: 'navigation',
        icon: '📂',
        execute: () => {
            context.toggleSidebar();
        },
    });

    commandRegistryService.register({
        id: 'toggle-artifacts',
        name: 'Afficher/Masquer les artefacts',
        description: 'Basculer la visibilité du panneau des artefacts',
        shortcut: 'Cmd+.',
        category: 'navigation',
        icon: '📋',
        execute: () => {
            context.toggleArtifacts();
        },
    });

    commandRegistryService.register({
        id: 'focus-input',
        name: 'Focus sur le champ de saisie',
        description: 'Placer le curseur dans le champ de message',
        shortcut: 'Cmd+L',
        category: 'navigation',
        icon: '✍️',
        execute: () => {
            context.focusInput();
        },
    });

    commandRegistryService.register({
        id: 'scroll-to-top',
        name: 'Retour en haut',
        description: 'Faire défiler jusqu\'en haut de la conversation',
        shortcut: 'Cmd+Home',
        category: 'navigation',
        icon: '⬆️',
        execute: () => {
            context.scrollToTop();
        },
    });

    commandRegistryService.register({
        id: 'scroll-to-bottom',
        name: 'Aller en bas',
        description: 'Faire défiler jusqu\'en bas de la conversation',
        shortcut: 'Cmd+End',
        category: 'navigation',
        icon: '⬇️',
        execute: () => {
            context.scrollToBottom();
        },
    });

    // === SETTINGS COMMANDS ===
    commandRegistryService.register({
        id: 'open-settings',
        name: 'Ouvrir les paramètres',
        description: 'Accéder aux paramètres de l\'application',
        shortcut: 'Cmd+,',
        category: 'settings',
        icon: '⚙️',
        execute: () => {
            context.openSettings();
        },
    });

    commandRegistryService.register({
        id: 'toggle-theme',
        name: 'Changer de thème',
        description: 'Basculer entre les thèmes clair et sombre',
        shortcut: 'Cmd+Shift+T',
        category: 'settings',
        icon: '🌓',
        execute: () => {
            context.toggleTheme();
        },
    });

    commandRegistryService.register({
        id: 'toggle-ui-mode',
        name: 'Changer de mode UI',
        description: 'Basculer entre l\'interface Classic et Claude',
        shortcut: 'Cmd+Shift+M',
        category: 'settings',
        icon: '🎨',
        execute: () => {
            context.toggleUIMode();
        },
    });

    commandRegistryService.register({
        id: 'toggle-line-numbers',
        name: 'Numéros de ligne',
        description: 'Activer/désactiver les numéros de ligne dans le code',
        category: 'settings',
        icon: '🔢',
        execute: () => {
            context.toggleLineNumbers();
        },
    });

    // === EDITING COMMANDS ===
    commandRegistryService.register({
        id: 'copy-last-message',
        name: 'Copier le dernier message',
        description: 'Copier la dernière réponse de l\'assistant',
        shortcut: 'Cmd+Shift+C',
        category: 'editing',
        icon: '📋',
        execute: () => {
            context.copyLastMessage();
        },
        isEnabled: () => {
            const conv = context.getCurrentConversation();
            return conv && conv.messages && conv.messages.length > 0;
        },
    });

    commandRegistryService.register({
        id: 'clear-input',
        name: 'Effacer le champ de saisie',
        description: 'Vider le champ de message',
        shortcut: 'Cmd+Shift+K',
        category: 'editing',
        icon: '🧹',
        execute: () => {
            context.clearInput();
        },
    });

    // === SEARCH COMMANDS ===
    commandRegistryService.register({
        id: 'search-conversations',
        name: 'Rechercher dans les conversations',
        description: 'Rechercher du texte dans toutes les conversations',
        shortcut: 'Cmd+F',
        category: 'search',
        icon: '🔍',
        execute: () => {
            context.openSearch();
        },
    });

    // === HELP COMMANDS ===
    commandRegistryService.register({
        id: 'show-shortcuts',
        name: 'Afficher les raccourcis',
        description: 'Liste de tous les raccourcis clavier disponibles',
        shortcut: 'Cmd+/',
        category: 'help',
        icon: '❓',
        execute: () => {
            context.showShortcuts();
        },
    });

    commandRegistryService.register({
        id: 'show-command-palette',
        name: 'Palette de commandes',
        description: 'Ouvrir la palette de commandes',
        shortcut: 'Cmd+P',
        category: 'help',
        icon: '⌘',
        execute: () => {
            // This is handled by the app itself
        },
    });

    console.log('[RegisterCommands] Registered', commandRegistryService.getAllCommands().length, 'commands');
}

/**
 * Get command context from ClaudeAskView instance
 * @param {ClaudeAskView} view - ClaudeAskView instance
 * @returns {Object} Command context
 */
export function createCommandContext(view) {
    return {
        // Conversation actions
        newConversation: () => view._handleNewConversation(),

        renameConversation: () => {
            if (view.currentConversation) {
                view.selectedConversation = view.currentConversation;
                view.renameDialogOpen = true;
            }
        },

        deleteConversation: () => {
            if (view.currentConversation) {
                view.selectedConversation = view.currentConversation;
                view.deleteDialogOpen = true;
            }
        },

        exportConversation: () => {
            if (view.currentConversation) {
                view.selectedConversation = view.currentConversation;
                view.exportDialogOpen = true;
            }
        },

        // Navigation actions
        toggleSidebar: () => {
            view.sidebarVisible = !view.sidebarVisible;
        },

        toggleArtifacts: () => {
            view.artifactsVisible = !view.artifactsVisible;
        },

        focusInput: () => {
            const inputArea = view.shadowRoot?.querySelector('claude-input-area');
            if (inputArea) {
                const textarea = inputArea.shadowRoot?.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                }
            }
        },

        scrollToTop: () => {
            const messagesArea = view.shadowRoot?.querySelector('.messages-area');
            if (messagesArea) {
                messagesArea.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },

        scrollToBottom: () => {
            const messagesArea = view.shadowRoot?.querySelector('.messages-area');
            if (messagesArea) {
                messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
            }
        },

        // Settings actions
        openSettings: () => {
            view.settingsOpen = true;
        },

        closeSettings: () => {
            view.settingsOpen = false;
        },

        toggleTheme: () => {
            const { uiModeService } = window;
            if (uiModeService) {
                const currentTheme = uiModeService.getTheme();
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                uiModeService.setTheme(newTheme);
            }
        },

        toggleUIMode: () => {
            const { uiModeService } = window;
            if (uiModeService) {
                const currentMode = uiModeService.getMode();
                const newMode = currentMode === 'classic' ? 'claude' : 'classic';
                uiModeService.setMode(newMode);
            }
        },

        toggleLineNumbers: () => {
            const stored = localStorage.getItem('lucide-show-code-line-numbers');
            const current = stored === 'true';
            const newValue = !current;
            localStorage.setItem('lucide-show-code-line-numbers', newValue.toString());

            window.dispatchEvent(new CustomEvent('code-line-numbers-changed', {
                detail: { showLineNumbers: newValue }
            }));
        },

        // Editing actions
        copyLastMessage: () => {
            const messages = view.messages || [];
            const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAssistantMessage) {
                navigator.clipboard.writeText(lastAssistantMessage.content).then(() => {
                    const { toastService } = window;
                    if (toastService) {
                        toastService.success('Message copié dans le presse-papier');
                    }
                });
            }
        },

        clearInput: () => {
            view.inputValue = '';
        },

        // Search actions
        openSearch: () => {
            const sidebar = view.shadowRoot?.querySelector('conversation-sidebar');
            if (sidebar) {
                const searchInput = sidebar.shadowRoot?.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        },

        // Help actions
        showShortcuts: () => {
            view.settingsOpen = true;
        },

        // Getters
        getCurrentConversation: () => view.currentConversation,
    };
}
