import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { tagService } from '../../services/tagService.js';

/**
 * TagFilter - Component for filtering conversations by tags
 *
 * Features:
 * - Display all available tags
 * - Select/deselect tags for filtering
 * - Show conversation count per tag
 * - Filter mode: ANY (at least one) or ALL (all tags)
 * - Collapsible section
 *
 * @example
 * <tag-filter
 *   .selectedTags=${this.selectedTags}
 *   @filter-changed=${this.handleFilterChanged}
 * ></tag-filter>
 */
export class TagFilter extends LitElement {
    static properties = {
        selectedTags: { type: Array },
        _allTags: { type: Array, state: true },
        _isExpanded: { type: Boolean, state: true },
        _filterMode: { type: String, state: true }, // 'any' or 'all'
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .filter-container {
            margin: 16px 0;
        }

        /* Header */
        .filter-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 8px;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .filter-header:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .filter-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .filter-icon {
            font-size: 14px;
        }

        .expand-icon {
            font-size: 12px;
            color: var(--claude-text-tertiary, #9b9b9b);
            transition: transform var(--claude-transition-fast, 150ms) ease;
        }

        .expand-icon.expanded {
            transform: rotate(90deg);
        }

        /* Tags List */
        .tags-list {
            padding: 8px 0;
            display: none;
            flex-direction: column;
            gap: 4px;
        }

        .tags-list.expanded {
            display: flex;
        }

        .tag-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            border: 2px solid transparent;
        }

        .tag-item:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .tag-item.selected {
            background: var(--tag-color-light);
            border-color: var(--tag-color);
        }

        .tag-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;
        }

        .tag-color-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .tag-name {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .tag-count {
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-tertiary, #9b9b9b);
            background: var(--claude-bg-tertiary, #FAFAF8);
            padding: 2px 6px;
            border-radius: 10px;
            flex-shrink: 0;
        }

        /* Filter Mode Toggle */
        .filter-mode {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            margin-top: 8px;
        }

        .mode-label {
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-secondary, #6b6b6b);
            flex: 1;
        }

        .mode-toggle {
            display: flex;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .mode-option {
            padding: 4px 12px;
            font-size: var(--claude-font-size-xs, 11px);
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--claude-text-secondary, #6b6b6b);
            transition: all var(--claude-transition-fast, 150ms) ease;
            font-weight: 500;
        }

        .mode-option.active {
            background: var(--claude-accent-orange, #D97706);
            color: white;
        }

        .mode-option:hover:not(.active) {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        /* Clear Filter */
        .clear-filter {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 6px;
            border: none;
            background: var(--claude-bg-tertiary, #FAFAF8);
            color: var(--claude-text-secondary, #6b6b6b);
            font-size: var(--claude-font-size-sm, 13px);
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            width: 100%;
        }

        .clear-filter:hover {
            background: var(--claude-border-subtle, #e5e5e0);
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Empty State */
        .empty-tags {
            padding: 16px 12px;
            text-align: center;
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }
    `;

    constructor() {
        super();
        this.selectedTags = [];
        this._allTags = [];
        this._isExpanded = true;
        this._filterMode = 'any';
        this._unsubscribe = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._loadTags();

        // Subscribe to tag changes
        this._unsubscribe = tagService.subscribe(() => {
            this._loadTags();
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    _loadTags() {
        this._allTags = tagService.getAllTags();
    }

    _handleToggleExpand() {
        this._isExpanded = !this._isExpanded;
    }

    _handleTagClick(tag) {
        const isSelected = this.selectedTags.includes(tag.id);
        let newSelectedTags;

        if (isSelected) {
            // Remove tag
            newSelectedTags = this.selectedTags.filter(id => id !== tag.id);
        } else {
            // Add tag
            newSelectedTags = [...this.selectedTags, tag.id];
        }

        this._dispatchFilterChange(newSelectedTags, this._filterMode);
    }

    _handleModeChange(mode) {
        this._filterMode = mode;
        if (this.selectedTags.length > 0) {
            this._dispatchFilterChange(this.selectedTags, mode);
        }
    }

    _handleClearFilter() {
        this._dispatchFilterChange([], this._filterMode);
    }

    _dispatchFilterChange(selectedTags, filterMode) {
        this.dispatchEvent(new CustomEvent('filter-changed', {
            detail: {
                selectedTags,
                filterMode,
            },
            bubbles: true,
            composed: true
        }));
    }

    _isTagSelected(tagId) {
        return this.selectedTags.includes(tagId);
    }

    _getTagColorWithOpacity(color, opacity = 0.1) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    render() {
        const hasSelectedTags = this.selectedTags.length > 0;

        return html`
            <div class="filter-container">
                <!-- Header -->
                <div class="filter-header" @click="${this._handleToggleExpand}">
                    <div class="filter-title">
                        <span class="filter-icon">🏷️</span>
                        <span>Tags</span>
                        ${hasSelectedTags ? html`
                            <span class="tag-count">${this.selectedTags.length}</span>
                        ` : ''}
                    </div>
                    <span class="expand-icon ${this._isExpanded ? 'expanded' : ''}">
                        ▶
                    </span>
                </div>

                <!-- Tags List -->
                <div class="tags-list ${this._isExpanded ? 'expanded' : ''}">
                    ${this._allTags.length > 0 ? html`
                        ${this._allTags.map(tag => {
                            const isSelected = this._isTagSelected(tag.id);
                            return html`
                                <div
                                    class="tag-item ${isSelected ? 'selected' : ''}"
                                    style="
                                        --tag-color: ${tag.color};
                                        --tag-color-light: ${this._getTagColorWithOpacity(tag.color, 0.1)};
                                    "
                                    @click="${() => this._handleTagClick(tag)}"
                                >
                                    <div class="tag-left">
                                        <span
                                            class="tag-color-indicator"
                                            style="background: ${tag.color}"
                                        ></span>
                                        <span class="tag-name">${tag.name}</span>
                                    </div>
                                    <span class="tag-count">${tag.count}</span>
                                </div>
                            `;
                        })}

                        ${hasSelectedTags ? html`
                            <!-- Filter Mode -->
                            <div class="filter-mode">
                                <span class="mode-label">Mode :</span>
                                <div class="mode-toggle">
                                    <button
                                        class="mode-option ${this._filterMode === 'any' ? 'active' : ''}"
                                        @click="${() => this._handleModeChange('any')}"
                                        title="Au moins un tag"
                                    >
                                        ANY
                                    </button>
                                    <button
                                        class="mode-option ${this._filterMode === 'all' ? 'active' : ''}"
                                        @click="${() => this._handleModeChange('all')}"
                                        title="Tous les tags"
                                    >
                                        ALL
                                    </button>
                                </div>
                            </div>

                            <!-- Clear Filter -->
                            <button class="clear-filter" @click="${this._handleClearFilter}">
                                <span>✕</span>
                                <span>Effacer les filtres</span>
                            </button>
                        ` : ''}
                    ` : html`
                        <div class="empty-tags">
                            Aucun tag disponible
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}

customElements.define('tag-filter', TagFilter);
