import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { advancedSearchService } from '../../services/advancedSearchService.js';
import { debounce } from '../../utils/performance.js';
import '../base/ClaudeButton.js';

/**
 * AdvancedSearchPanel - Advanced search panel with filters and operators
 *
 * Features:
 * - Full-text search with operators
 * - Search filters (date range, role, tags)
 * - Search history and suggestions
 * - Result preview with highlights
 * - Keyboard shortcuts
 *
 * @example
 * <advanced-search-panel
 *   ?open=${this.searchOpen}
 *   .conversations=${this.conversations}
 *   @close=${this.handleClose}
 *   @result-selected=${this.handleResultSelected}
 * ></advanced-search-panel>
 */
export class AdvancedSearchPanel extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        conversations: { type: Array },
        _query: { type: String, state: true },
        _results: { type: Array, state: true },
        _filters: { type: Object, state: true },
        _showFilters: { type: Boolean, state: true },
        _isSearching: { type: Boolean, state: true },
        _searchHistory: { type: Array, state: true },
        _showHistory: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-modal, 1000);
            align-items: flex-start;
            padding-top: 10vh;
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

        /* Panel */
        .search-panel {
            position: relative;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 16px;
            box-shadow: var(--claude-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.15));
            width: 90%;
            max-width: 800px;
            max-height: 70vh;
            margin: 0 auto;
            animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Header */
        .search-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .search-icon {
            font-size: 20px;
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: var(--claude-font-size-lg, 18px);
            color: var(--claude-text-primary, #1a1a1a);
            background: transparent;
        }

        .search-input::placeholder {
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .filter-toggle {
            padding: 6px 12px;
            border: 1px solid var(--claude-border-normal, #d4d4cf);
            background: transparent;
            border-radius: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .filter-toggle:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .filter-toggle.active {
            background: var(--claude-accent-orange, #D97706);
            color: white;
            border-color: var(--claude-accent-orange, #D97706);
        }

        .close-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--claude-text-tertiary, #9b9b9b);
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
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Filters */
        .filters-section {
            padding: 16px 20px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            display: none;
        }

        .filters-section.visible {
            display: block;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .filter-label {
            font-size: var(--claude-font-size-xs, 12px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .filter-input {
            padding: 8px 12px;
            border: 1px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
            outline: none;
            transition: border-color var(--claude-transition-fast, 150ms) ease;
        }

        .filter-input:focus {
            border-color: var(--claude-accent-orange, #D97706);
        }

        .filter-select {
            padding: 8px 12px;
            border: 1px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
            background: var(--claude-bg-secondary, #FFFFFF);
            cursor: pointer;
            outline: none;
        }

        /* Search Help */
        .search-help {
            padding: 12px 20px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .search-help code {
            padding: 2px 6px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 4px;
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: var(--claude-font-size-xs, 11px);
        }

        /* Results */
        .results-section {
            flex: 1;
            overflow-y: auto;
            padding: 12px 0;
        }

        .results-header {
            padding: 8px 20px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
            font-weight: 500;
        }

        .result-item {
            padding: 12px 20px;
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) ease;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .result-item:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.02));
        }

        .result-item:last-child {
            border-bottom: none;
        }

        .result-conversation {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-accent-orange, #D97706);
            margin-bottom: 6px;
        }

        .result-preview {
            font-size: var(--claude-font-size-sm, 13px);
            line-height: 1.5;
            color: var(--claude-text-primary, #1a1a1a);
        }

        .highlight {
            background: var(--claude-accent-orange-subtle, #FEF3C7);
            color: var(--claude-accent-orange-dark, #B45309);
            font-weight: 500;
            padding: 0 2px;
            border-radius: 2px;
        }

        .result-meta {
            margin-top: 6px;
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        /* Search History */
        .history-section {
            padding: 12px 0;
        }

        .history-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 20px;
            margin-bottom: 8px;
        }

        .history-title {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .clear-history {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-tertiary, #9b9b9b);
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .clear-history:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .history-item {
            padding: 8px 20px;
            cursor: pointer;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .history-item:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.02));
        }

        .history-query {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 4px;
        }

        .history-meta {
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        /* Empty State */
        .empty-state {
            padding: 48px 20px;
            text-align: center;
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .empty-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        .empty-text {
            font-size: var(--claude-font-size-sm, 13px);
        }

        /* Scrollbar */
        .results-section::-webkit-scrollbar {
            width: 6px;
        }

        .results-section::-webkit-scrollbar-track {
            background: transparent;
        }

        .results-section::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        /* Mobile */
        @media (max-width: 768px) {
            :host {
                padding-top: 5vh;
            }

            .search-panel {
                width: 95%;
                max-height: 80vh;
            }

            .filters-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.conversations = [];
        this._query = '';
        this._results = [];
        this._filters = {
            role: '',
            dateFrom: '',
            dateTo: '',
            tags: [],
        };
        this._showFilters = false;
        this._isSearching = false;
        this._searchHistory = [];
        this._showHistory = false;

        // Create debounced search function to prevent excessive searches
        this._debouncedSearch = debounce(() => this._performSearch(), 300);
    }

    connectedCallback() {
        super.connectedCallback();
        this._loadSearchHistory();

        // Add keyboard shortcut listener
        this._keyboardListener = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                this.open = true;
                this.requestUpdate();
                setTimeout(() => {
                    const input = this.shadowRoot.querySelector('.search-input');
                    if (input) input.focus();
                }, 100);
            } else if (e.key === 'Escape' && this.open) {
                this._handleClose();
            }
        };

        window.addEventListener('keydown', this._keyboardListener);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._keyboardListener) {
            window.removeEventListener('keydown', this._keyboardListener);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('open') && this.open) {
            // Focus search input when opened
            setTimeout(() => {
                const input = this.shadowRoot.querySelector('.search-input');
                if (input) input.focus();
            }, 100);

            // Load history
            this._loadSearchHistory();
        }
    }

    _handleClose() {
        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true,
        }));
    }

    _handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            this._handleClose();
        }
    }

    _handleQueryInput(e) {
        this._query = e.target.value;

        // Show history if query is empty
        this._showHistory = !this._query.trim();

        // Perform debounced search
        if (this._query.trim()) {
            this._debouncedSearch();
        } else {
            this._results = [];
        }
    }

    _handleQueryKeyPress(e) {
        if (e.key === 'Enter') {
            this._performSearch();
        }
    }

    _toggleFilters() {
        this._showFilters = !this._showFilters;
    }

    _handleFilterChange(field, value) {
        this._filters = {
            ...this._filters,
            [field]: value,
        };

        // Re-search if query exists
        if (this._query.trim()) {
            this._performSearch();
        }
    }

    _performSearch() {
        if (!this._query.trim()) return;

        this._isSearching = true;
        this._showHistory = false;

        try {
            this._results = advancedSearchService.search(this.conversations, {
                query: this._query,
                filters: this._filters,
            });
        } catch (error) {
            console.error('[AdvancedSearchPanel] Search error:', error);
            this._results = [];
        } finally {
            this._isSearching = false;
        }
    }

    _handleResultClick(result) {
        this.dispatchEvent(new CustomEvent('result-selected', {
            detail: {
                conversation: result.conversation,
                message: result.message,
                messageIndex: result.messageIndex,
            },
            bubbles: true,
            composed: true,
        }));

        this._handleClose();
    }

    _loadSearchHistory() {
        this._searchHistory = advancedSearchService.getSearchHistory().slice(0, 10);
        this._showHistory = !this._query.trim();
    }

    _handleHistoryClick(item) {
        this._query = item.query;
        this._filters = item.filters || {};
        this._performSearch();
    }

    _handleClearHistory() {
        advancedSearchService.clearSearchHistory();
        this._loadSearchHistory();
    }

    _renderHighlightedText(text, highlights) {
        if (!highlights || highlights.length === 0) {
            return text;
        }

        // Sort highlights by position
        const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

        const parts = [];
        let lastEnd = 0;

        sortedHighlights.forEach(highlight => {
            // Add text before highlight
            if (highlight.start > lastEnd) {
                parts.push(text.substring(lastEnd, highlight.start));
            }

            // Add highlighted text
            parts.push(html`<span class="highlight">${text.substring(highlight.start, highlight.end)}</span>`);

            lastEnd = highlight.end;
        });

        // Add remaining text
        if (lastEnd < text.length) {
            parts.push(text.substring(lastEnd));
        }

        return parts;
    }

    render() {
        return html`
            <div class="overlay" @click=${this._handleOverlayClick}>
                <div class="search-panel" @click=${(e) => e.stopPropagation()}>
                    <!-- Header -->
                    <div class="search-header">
                        <span class="search-icon">🔍</span>
                        <input
                            type="text"
                            class="search-input"
                            placeholder="Rechercher... (AND, OR, NOT, &quot;exact&quot;, /regex/)"
                            .value=${this._query}
                            @input=${this._handleQueryInput}
                            @keypress=${this._handleQueryKeyPress}
                        />
                        <button
                            class="filter-toggle ${this._showFilters ? 'active' : ''}"
                            @click=${this._toggleFilters}
                        >
                            ${this._showFilters ? '✓ ' : ''}Filtres
                        </button>
                        <button class="close-button" @click=${this._handleClose}>
                            ✕
                        </button>
                    </div>

                    <!-- Filters -->
                    <div class="filters-section ${this._showFilters ? 'visible' : ''}">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="filter-label">Rôle</label>
                                <select
                                    class="filter-select"
                                    .value=${this._filters.role}
                                    @change=${(e) => this._handleFilterChange('role', e.target.value)}
                                >
                                    <option value="">Tous</option>
                                    <option value="user">Utilisateur</option>
                                    <option value="assistant">Assistant</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label class="filter-label">Date début</label>
                                <input
                                    type="date"
                                    class="filter-input"
                                    .value=${this._filters.dateFrom}
                                    @change=${(e) => this._handleFilterChange('dateFrom', e.target.value)}
                                />
                            </div>

                            <div class="filter-group">
                                <label class="filter-label">Date fin</label>
                                <input
                                    type="date"
                                    class="filter-input"
                                    .value=${this._filters.dateTo}
                                    @change=${(e) => this._handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Search Help -->
                    ${this._query.trim() && !this._showHistory ? html`
                        <div class="search-help">
                            💡 Utilisez <code>AND</code>, <code>OR</code>, <code>NOT</code> pour affiner.
                            Guillemets <code>"exact"</code> pour correspondance exacte.
                            Regex <code>/pattern/</code> pour recherche avancée.
                        </div>
                    ` : ''}

                    <!-- Results or History -->
                    <div class="results-section">
                        ${this._showHistory ? this._renderHistory() : this._renderResults()}
                    </div>
                </div>
            </div>
        `;
    }

    _renderHistory() {
        if (this._searchHistory.length === 0) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">
                        Aucun historique de recherche
                    </div>
                </div>
            `;
        }

        return html`
            <div class="history-section">
                <div class="history-header">
                    <span class="history-title">Recherches récentes</span>
                    <button class="clear-history" @click=${this._handleClearHistory}>
                        Effacer
                    </button>
                </div>

                ${this._searchHistory.map(item => html`
                    <div class="history-item" @click=${() => this._handleHistoryClick(item)}>
                        <div class="history-query">${item.query}</div>
                        <div class="history-meta">
                            ${item.resultCount} résultat${item.resultCount !== 1 ? 's' : ''} •
                            ${new Date(item.timestamp).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    _renderResults() {
        if (!this._query.trim()) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">
                        Commencez à taper pour rechercher dans vos conversations
                    </div>
                </div>
            `;
        }

        if (this._isSearching) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">⏳</div>
                    <div class="empty-text">
                        Recherche en cours...
                    </div>
                </div>
            `;
        }

        if (this._results.length === 0) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">
                        Aucun résultat trouvé
                    </div>
                </div>
            `;
        }

        return html`
            <div class="results-header">
                ${this._results.length} résultat${this._results.length !== 1 ? 's' : ''}
            </div>

            ${this._results.map(result => {
                const formatted = advancedSearchService.formatResult(result);
                return html`
                    <div class="result-item" @click=${() => this._handleResultClick(result)}>
                        <div class="result-conversation">
                            ${result.conversation.title || 'Nouvelle conversation'}
                        </div>
                        <div class="result-preview">
                            ${this._renderHighlightedText(formatted.preview, formatted.highlights)}
                        </div>
                        <div class="result-meta">
                            ${result.message.role === 'user' ? '👤 Vous' : '🤖 Lucide'} •
                            ${new Date(result.message.created_at).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                `;
            })}
        `;
    }
}

customElements.define('advanced-search-panel', AdvancedSearchPanel);
