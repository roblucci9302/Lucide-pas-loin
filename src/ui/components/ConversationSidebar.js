import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import './base/ClaudeButton.js';
import './base/ClaudeAvatar.js';

/**
 * ConversationSidebar - Sidebar with conversations, modes, and profiles
 *
 * Structure:
 * - Logo + New Conversation button
 * - Modes (Ask, Listen, Browser)
 * - Recent Conversations (grouped by date)
 * - Profiles
 * - Settings + User
 *
 * @example
 * <conversation-sidebar
 *   .conversations=${this.conversations}
 *   .currentMode=${this.currentMode}
 *   @mode-changed=${this.handleModeChange}
 *   @conversation-selected=${this.handleConversationSelect}
 * ></conversation-sidebar>
 */
export class ConversationSidebar extends LitElement {
    static properties = {
        conversations: { type: Array },
        currentMode: { type: String }, // 'ask' | 'listen' | 'browser'
        currentConversationId: { type: String },
        profiles: { type: Array },
        currentProfile: { type: String },
        userName: { type: String },
        userAvatar: { type: String },
        searchQuery: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
            height: 100%;
            overflow: hidden;
        }

        .sidebar-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: var(--claude-sidebar-bg, #FFFFFF);
            padding: var(--claude-sidebar-padding, 16px);
            gap: 16px;
        }

        /* Header Section */
        .header {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background: var(--claude-accent-orange, #D97706);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 18px;
        }

        .logo-text {
            font-size: var(--claude-font-size-lg, 20px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .new-conversation-btn {
            width: 100%;
        }

        /* Search Section */
        .search-container {
            position: relative;
            width: 100%;
        }

        .search-input {
            width: 100%;
            padding: 10px 12px 10px 36px;
            border: 1px solid var(--claude-border-light, #e5e5e0);
            border-radius: 8px;
            background: var(--claude-input-bg, #FFFFFF);
            color: var(--claude-text-primary, #1a1a1a);
            font-size: var(--claude-font-size-sm, 13px);
            font-family: inherit;
            transition: all var(--claude-transition-fast, 150ms) ease;
            outline: none;
        }

        .search-input::placeholder {
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .search-input:focus {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-input-focus-bg, #FFFFFF);
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: var(--claude-text-tertiary, #9b9b9b);
            pointer-events: none;
        }

        .search-clear {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: none;
            background: transparent;
            color: var(--claude-text-tertiary, #9b9b9b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .search-clear:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Modes Section */
        .modes {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .section-title {
            font-size: var(--claude-font-size-xs, 12px);
            font-weight: 600;
            color: var(--claude-text-tertiary, #9b9b9b);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px 4px 12px;
        }

        .mode-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: var(--claude-sidebar-item-padding, 12px 16px);
            border-radius: var(--claude-sidebar-item-radius, 8px);
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) var(--claude-easing-smooth, ease);
            user-select: none;
        }

        .mode-item:hover {
            background: var(--claude-sidebar-hover, #F5F5F0);
        }

        .mode-item.active {
            background: var(--claude-sidebar-active, #FEF3C7);
            font-weight: 500;
        }

        .mode-icon {
            font-size: 18px;
            width: 20px;
            text-align: center;
        }

        .mode-label {
            flex: 1;
            font-size: var(--claude-font-size-base, 16px);
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Conversations Section */
        .conversations {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
            margin: 0 -8px;
            padding: 0 8px;
        }

        .conversation-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .group-title {
            font-size: var(--claude-font-size-xs, 12px);
            font-weight: 600;
            color: var(--claude-text-tertiary, #9b9b9b);
            padding: 8px 12px 4px 12px;
        }

        .conversation-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: var(--claude-sidebar-item-radius, 8px);
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) var(--claude-easing-smooth, ease);
            position: relative;
            min-height: 44px;
        }

        .conversation-item:hover {
            background: var(--claude-sidebar-hover, #F5F5F0);
        }

        .conversation-item.active {
            background: var(--claude-sidebar-active, #FEF3C7);
        }

        .conversation-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .conversation-title {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .conversation-title mark {
            background: var(--claude-highlight-bg, #FEF3C7);
            color: var(--claude-accent-orange-dark, #B45309);
            font-weight: 600;
            padding: 0 2px;
            border-radius: 2px;
        }

        .conversation-time {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .conversation-actions {
            display: none;
            gap: 4px;
        }

        .conversation-item:hover .conversation-actions {
            display: flex;
        }

        .action-btn {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .action-btn:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        /* Profiles Section */
        .profiles {
            display: flex;
            flex-direction: column;
            gap: 4px;
            border-top: 1px solid var(--claude-sidebar-border, #e5e5e0);
            padding-top: 12px;
        }

        .profile-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: var(--claude-sidebar-item-radius, 8px);
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .profile-item:hover {
            background: var(--claude-sidebar-hover, #F5F5F0);
        }

        .profile-item.active {
            background: var(--claude-sidebar-active, #FEF3C7);
        }

        .profile-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--claude-accent-orange, #D97706);
        }

        .profile-label {
            flex: 1;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Footer Section */
        .footer {
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-top: 1px solid var(--claude-sidebar-border, #e5e5e0);
            padding-top: 12px;
        }

        .footer-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: var(--claude-sidebar-item-radius, 8px);
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .footer-item:hover {
            background: var(--claude-sidebar-hover, #F5F5F0);
        }

        .footer-icon {
            font-size: 18px;
            width: 20px;
            text-align: center;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .footer-label {
            flex: 1;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Scrollbar styling */
        .conversations::-webkit-scrollbar {
            width: 6px;
        }

        .conversations::-webkit-scrollbar-track {
            background: transparent;
        }

        .conversations::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .conversations::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Empty state */
        .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: var(--claude-text-tertiary, #9b9b9b);
            font-size: var(--claude-font-size-sm, 13px);
        }

        /* Divider */
        .divider {
            height: 1px;
            background: var(--claude-sidebar-border, #e5e5e0);
            margin: 8px 0;
        }
    `;

    constructor() {
        super();
        this.conversations = [];
        this.currentMode = 'ask';
        this.currentConversationId = null;
        this.profiles = [
            { id: 'lucide_assistant', name: 'Assistant Lucide' },
            { id: 'developer', name: 'Développeur' },
            { id: 'analyst', name: 'Analyste' }
        ];
        this.currentProfile = 'lucide_assistant';
        this.userName = 'Utilisateur';
        this.userAvatar = '';
        this.searchQuery = '';
    }

    _handleNewConversation() {
        this.dispatchEvent(new CustomEvent('new-conversation', {
            bubbles: true,
            composed: true
        }));
    }

    _handleModeChange(mode) {
        this.currentMode = mode;
        this.dispatchEvent(new CustomEvent('mode-changed', {
            detail: { mode },
            bubbles: true,
            composed: true
        }));
    }

    _handleConversationSelect(conversation) {
        this.currentConversationId = conversation.id;
        this.dispatchEvent(new CustomEvent('conversation-selected', {
            detail: { conversation },
            bubbles: true,
            composed: true
        }));
    }

    _handleProfileChange(profile) {
        this.currentProfile = profile.id;
        this.dispatchEvent(new CustomEvent('profile-changed', {
            detail: { profile },
            bubbles: true,
            composed: true
        }));
    }

    _handleSettings() {
        this.dispatchEvent(new CustomEvent('settings-open', {
            bubbles: true,
            composed: true
        }));
    }

    _handleSearchInput(e) {
        this.searchQuery = e.target.value;
    }

    _handleSearchClear() {
        this.searchQuery = '';
        // Focus back on search input
        const searchInput = this.shadowRoot.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    _handleRenameClick(e, conversation) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('conversation-rename', {
            detail: { conversation },
            bubbles: true,
            composed: true
        }));
    }

    _handleDeleteClick(e, conversation) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('conversation-delete', {
            detail: { conversation },
            bubbles: true,
            composed: true
        }));
    }

    _filterConversations(conversations) {
        if (!this.searchQuery || this.searchQuery.trim() === '') {
            return conversations;
        }

        const query = this.searchQuery.toLowerCase().trim();
        return conversations.filter(conv => {
            const title = (conv.title || 'Nouvelle conversation').toLowerCase();
            return title.includes(query);
        });
    }

    _highlightText(text, query) {
        if (!query || query.trim() === '') {
            return text;
        }

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    _formatTime(timestamp) {
        if (!timestamp) return '';

        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    _groupConversations() {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Apply search filter first
        const filteredConversations = this._filterConversations(this.conversations);

        filteredConversations.forEach(conv => {
            const convDate = new Date(conv.updated_at || conv.created_at);

            if (convDate >= today) {
                groups.today.push(conv);
            } else if (convDate >= yesterday) {
                groups.yesterday.push(conv);
            } else if (convDate >= weekAgo) {
                groups.thisWeek.push(conv);
            } else {
                groups.older.push(conv);
            }
        });

        return groups;
    }

    _renderConversationGroup(title, conversations) {
        if (conversations.length === 0) return '';

        return html`
            <div class="conversation-group">
                <div class="group-title">${title}</div>
                ${conversations.map(conv => {
                    const conversationTitle = conv.title || 'Nouvelle conversation';
                    const highlightedTitle = this._highlightText(conversationTitle, this.searchQuery);

                    return html`
                        <div
                            class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}"
                            @click="${() => this._handleConversationSelect(conv)}"
                        >
                            <div class="conversation-content">
                                <div class="conversation-title" .innerHTML="${highlightedTitle}"></div>
                                <div class="conversation-time">${this._formatTime(conv.updated_at)}</div>
                            </div>
                            <div class="conversation-actions">
                                <button class="action-btn" @click="${(e) => this._handleRenameClick(e, conv)}" title="Renommer">
                                    ✏️
                                </button>
                                <button class="action-btn" @click="${(e) => this._handleDeleteClick(e, conv)}" title="Supprimer">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    render() {
        const modes = [
            { id: 'ask', icon: '💬', label: 'Ask' },
            { id: 'listen', icon: '🎙️', label: 'Listen' },
            { id: 'browser', icon: '🌐', label: 'Browser' }
        ];

        const groups = this._groupConversations();

        return html`
            <div class="sidebar-container">
                <!-- Header -->
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon">L</div>
                        <div class="logo-text">Lucide</div>
                    </div>
                    <claude-button
                        class="new-conversation-btn"
                        variant="primary"
                        size="md"
                        icon="+"
                        @button-click="${this._handleNewConversation}"
                    >
                        Nouvelle conversation
                    </claude-button>

                    <!-- Search -->
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input
                            type="text"
                            class="search-input"
                            placeholder="Rechercher des conversations..."
                            .value="${this.searchQuery}"
                            @input="${this._handleSearchInput}"
                        />
                        ${this.searchQuery ? html`
                            <button
                                class="search-clear"
                                @click="${this._handleSearchClear}"
                                title="Effacer la recherche"
                            >
                                ✕
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Modes -->
                <div class="modes">
                    <div class="section-title">Modes</div>
                    ${modes.map(mode => html`
                        <div
                            class="mode-item ${mode.id === this.currentMode ? 'active' : ''}"
                            @click="${() => this._handleModeChange(mode.id)}"
                        >
                            <span class="mode-icon">${mode.icon}</span>
                            <span class="mode-label">${mode.label}</span>
                        </div>
                    `)}
                </div>

                <div class="divider"></div>

                <!-- Conversations -->
                <div class="conversations">
                    ${this.conversations.length === 0 ? html`
                        <div class="empty-state">
                            Aucune conversation pour le moment.<br>
                            Commencez en cliquant sur "Nouvelle conversation".
                        </div>
                    ` : (() => {
                        const filteredCount = this._filterConversations(this.conversations).length;
                        if (filteredCount === 0 && this.searchQuery) {
                            return html`
                                <div class="empty-state">
                                    🔍<br><br>
                                    Aucune conversation trouvée pour<br>
                                    "<strong>${this.searchQuery}</strong>"
                                </div>
                            `;
                        }
                        return html`
                            <div class="section-title">Conversations</div>
                            ${this._renderConversationGroup('Aujourd\'hui', groups.today)}
                            ${this._renderConversationGroup('Hier', groups.yesterday)}
                            ${this._renderConversationGroup('Cette semaine', groups.thisWeek)}
                            ${this._renderConversationGroup('Plus ancien', groups.older)}
                        `;
                    })()}
                </div>

                <!-- Profiles -->
                <div class="profiles">
                    <div class="section-title">Profils</div>
                    ${this.profiles.map(profile => html`
                        <div
                            class="profile-item ${profile.id === this.currentProfile ? 'active' : ''}"
                            @click="${() => this._handleProfileChange(profile)}"
                        >
                            ${profile.id === this.currentProfile ? html`
                                <div class="profile-indicator"></div>
                            ` : html`
                                <div style="width: 8px;"></div>
                            `}
                            <span class="profile-label">${profile.name}</span>
                        </div>
                    `)}
                </div>

                <!-- Footer -->
                <div class="footer">
                    <div class="footer-item" @click="${this._handleSettings}">
                        <span class="footer-icon">⚙️</span>
                        <span class="footer-label">Paramètres</span>
                    </div>
                    <div class="footer-item">
                        <claude-avatar type="user" size="sm" initials="${this.userName.charAt(0)}"></claude-avatar>
                        <span class="footer-label">${this.userName}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('conversation-sidebar', ConversationSidebar);
