import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { tagService } from '../../services/tagService.js';
import '../base/ClaudeButton.js';

/**
 * TagManager - Dialog for managing conversation tags
 *
 * Features:
 * - View current tags
 * - Add/remove tags
 * - Create new tags with color picker
 * - Tag suggestions based on content
 * - Search existing tags
 *
 * @example
 * <tag-manager
 *   ?open=${this.tagManagerOpen}
 *   .conversation=${this.currentConversation}
 *   @close=${this.handleClose}
 * ></tag-manager>
 */
export class TagManager extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        conversation: { type: Object },
        _currentTags: { type: Array, state: true },
        _allTags: { type: Array, state: true },
        _suggestions: { type: Array, state: true },
        _searchQuery: { type: String, state: true },
        _newTagName: { type: String, state: true },
        _newTagColor: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-modal, 1000);
            align-items: center;
            justify-content: center;
        }

        :host([open]) {
            display: flex;
        }

        /* Overlay */
        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Modal */
        .modal {
            position: relative;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 16px;
            box-shadow: var(--claude-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.15));
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        /* Header */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .header-title {
            font-size: var(--claude-font-size-xl, 24px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .close-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-size: 20px;
        }

        .close-button:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Content */
        .content {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .section {
            margin-bottom: 24px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 12px;
        }

        /* Current Tags */
        .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .tag-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            color: white;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .tag-chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .tag-remove {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            font-size: 12px;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .tag-remove:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Empty state */
        .empty-tags {
            text-align: center;
            padding: 32px 16px;
            color: var(--claude-text-tertiary, #9b9b9b);
            font-size: var(--claude-font-size-sm, 13px);
        }

        /* Add Tag Section */
        .add-tag-form {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }

        .tag-input {
            flex: 1;
            padding: 10px 14px;
            font-size: var(--claude-font-size-base, 16px);
            border: 2px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            outline: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
            color: var(--claude-text-primary, #1a1a1a);
            background: var(--claude-bg-secondary, #FFFFFF);
        }

        .tag-input:focus {
            border-color: var(--claude-accent-orange, #D97706);
        }

        .color-picker {
            width: 48px;
            height: 42px;
            border: 2px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            cursor: pointer;
            outline: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .color-picker:hover {
            border-color: var(--claude-accent-orange, #D97706);
        }

        /* Suggestions */
        .suggestion-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .suggestion-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            color: white;
            background: var(--chip-color);
            cursor: pointer;
            border: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .suggestion-chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .suggestion-icon {
            font-size: 14px;
        }

        /* Scrollbar */
        .content::-webkit-scrollbar {
            width: 6px;
        }

        .content::-webkit-scrollbar-track {
            background: transparent;
        }

        .content::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .content::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Mobile */
        @media (max-width: 768px) {
            .modal {
                width: 95%;
                max-height: 90vh;
            }

            .add-tag-form {
                flex-direction: column;
            }

            .color-picker {
                width: 100%;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.conversation = null;
        this._currentTags = [];
        this._allTags = [];
        this._suggestions = [];
        this._searchQuery = '';
        this._newTagName = '';
        this._newTagColor = '#3B82F6';
        this._unsubscribe = null;
    }

    updated(changedProperties) {
        if (changedProperties.has('open') && this.open) {
            this._loadData();
        }

        if (changedProperties.has('conversation') && this.conversation) {
            this._loadData();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        // Subscribe to tag changes
        this._unsubscribe = tagService.subscribe(() => {
            if (this.open && this.conversation) {
                this._loadData();
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _loadData() {
        if (!this.conversation) return;

        // Load current tags
        this._currentTags = tagService.getConversationTags(this.conversation.id);

        // Load all tags
        this._allTags = tagService.getAllTags();

        // Load suggestions
        this._suggestions = tagService.suggestTags(this.conversation);
    }

    _handleClose() {
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true
        }));
    }

    _handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            this._handleClose();
        }
    }

    _handleAddTag() {
        if (!this._newTagName.trim()) return;

        try {
            // Create or find tag
            let tag = tagService.findTagByName(this._newTagName);
            if (!tag) {
                tag = tagService.createTag({
                    name: this._newTagName,
                    color: this._newTagColor,
                });
            }

            // Add to conversation
            tagService.addTagToConversation(this.conversation.id, tag.id);

            // Reset form
            this._newTagName = '';
            this._newTagColor = '#3B82F6';

            // Dispatch change event
            this._dispatchChange();
        } catch (error) {
            console.error('[TagManager] Error adding tag:', error);
        }
    }

    _handleRemoveTag(tagId) {
        tagService.removeTagFromConversation(this.conversation.id, tagId);
        this._dispatchChange();
    }

    _handleAddSuggestion(suggestion) {
        try {
            // Create or find tag
            let tag = tagService.findTagByName(suggestion.name);
            if (!tag) {
                tag = tagService.createTag({
                    name: suggestion.name,
                    color: suggestion.color,
                });
            }

            // Add to conversation
            tagService.addTagToConversation(this.conversation.id, tag.id);

            // Dispatch change event
            this._dispatchChange();
        } catch (error) {
            console.error('[TagManager] Error adding suggestion:', error);
        }
    }

    _handleInputKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this._handleAddTag();
        }
    }

    _dispatchChange() {
        this.dispatchEvent(new CustomEvent('tags-changed', {
            detail: { conversationId: this.conversation.id },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        if (!this.conversation) {
            return html``;
        }

        return html`
            <div class="overlay" @click="${this._handleOverlayClick}">
                <div class="modal" @click="${(e) => e.stopPropagation()}">
                    <!-- Header -->
                    <div class="header">
                        <div class="header-title">
                            <span>🏷️</span>
                            <span>Gérer les tags</span>
                        </div>
                        <button class="close-button" @click="${this._handleClose}">
                            ✕
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <!-- Current Tags -->
                        <div class="section">
                            <div class="section-title">Tags actuels</div>
                            ${this._currentTags.length > 0 ? html`
                                <div class="tags-list">
                                    ${this._currentTags.map(tag => html`
                                        <div class="tag-chip" style="background: ${tag.color}">
                                            <span>${tag.name}</span>
                                            <button
                                                class="tag-remove"
                                                @click="${() => this._handleRemoveTag(tag.id)}"
                                                title="Supprimer"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    `)}
                                </div>
                            ` : html`
                                <div class="empty-tags">
                                    Aucun tag pour cette conversation
                                </div>
                            `}
                        </div>

                        <!-- Add Tag -->
                        <div class="section">
                            <div class="section-title">Ajouter un tag</div>
                            <div class="add-tag-form">
                                <input
                                    type="text"
                                    class="tag-input"
                                    placeholder="Nom du tag..."
                                    .value="${this._newTagName}"
                                    @input="${(e) => { this._newTagName = e.target.value; }}"
                                    @keypress="${this._handleInputKeyPress}"
                                />
                                <input
                                    type="color"
                                    class="color-picker"
                                    .value="${this._newTagColor}"
                                    @input="${(e) => { this._newTagColor = e.target.value; }}"
                                    title="Couleur du tag"
                                />
                                <claude-button
                                    variant="primary"
                                    @click="${this._handleAddTag}"
                                >
                                    Ajouter
                                </claude-button>
                            </div>
                        </div>

                        <!-- Suggestions -->
                        ${this._suggestions.length > 0 ? html`
                            <div class="section">
                                <div class="section-title">Suggestions</div>
                                <div class="suggestion-chips">
                                    ${this._suggestions.map(suggestion => html`
                                        <button
                                            class="suggestion-chip"
                                            style="--chip-color: ${suggestion.color}"
                                            @click="${() => this._handleAddSuggestion(suggestion)}"
                                        >
                                            <span class="suggestion-icon">+</span>
                                            <span>${suggestion.name}</span>
                                        </button>
                                    `)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('tag-manager', TagManager);
