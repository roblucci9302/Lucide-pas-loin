/**
 * advancedSearchService - Service for advanced search with filters and operators
 *
 * Features:
 * - Full-text search in conversations and messages
 * - Search operators (AND, OR, NOT, exact match, regex)
 * - Filters (date range, role, tags, conversation)
 * - Search history management
 * - Result ranking and highlighting
 *
 * @example
 * const results = advancedSearchService.search(conversations, {
 *   query: 'python AND "machine learning"',
 *   filters: { role: 'assistant', dateFrom: '2024-01-01' }
 * });
 */
class AdvancedSearchService {
    constructor() {
        this.searchHistory = this._loadSearchHistory();
        this.maxHistorySize = 50;
    }

    /**
     * Perform advanced search
     * @param {Array<Object>} conversations - All conversations
     * @param {Object} options - Search options
     * @param {string} options.query - Search query with operators
     * @param {Object} [options.filters] - Search filters
     * @param {string} [options.filters.role] - Filter by role (user/assistant)
     * @param {string} [options.filters.dateFrom] - Filter from date
     * @param {string} [options.filters.dateTo] - Filter to date
     * @param {Array<string>} [options.filters.tags] - Filter by tags
     * @param {string} [options.filters.conversationId] - Search in specific conversation
     * @param {boolean} [options.caseSensitive] - Case sensitive search
     * @param {number} [options.limit] - Limit results
     * @returns {Array<Object>} Search results
     */
    search(conversations, options = {}) {
        const {
            query = '',
            filters = {},
            caseSensitive = false,
            limit = 100,
        } = options;

        if (!query.trim()) {
            return [];
        }

        // Parse query into search terms
        const searchTerms = this._parseQuery(query, caseSensitive);

        // Filter conversations
        let filteredConversations = this._applyFilters(conversations, filters);

        // Search in filtered conversations
        const results = [];

        filteredConversations.forEach(conversation => {
            const messages = conversation.messages || [];

            messages.forEach((message, index) => {
                // Apply role filter
                if (filters.role && message.role !== filters.role) {
                    return;
                }

                // Check if message matches search terms
                const match = this._matchesSearchTerms(message.content, searchTerms, caseSensitive);

                if (match.matches) {
                    results.push({
                        conversation,
                        message,
                        messageIndex: index,
                        matchScore: match.score,
                        highlights: match.highlights,
                    });
                }
            });
        });

        // Sort by match score (highest first)
        results.sort((a, b) => b.matchScore - a.matchScore);

        // Limit results
        const limitedResults = results.slice(0, limit);

        // Save to search history
        this._addToHistory(query, filters, limitedResults.length);

        return limitedResults;
    }

    /**
     * Validate regex pattern for safety (prevent ReDoS attacks)
     * @private
     * @param {string} pattern - Regex pattern to validate
     * @returns {boolean} True if pattern is safe
     */
    _isRegexSafe(pattern) {
        // Maximum pattern length to prevent complexity attacks
        if (pattern.length > 200) {
            console.warn('[AdvancedSearch] Regex pattern too long:', pattern.length);
            return false;
        }

        // Check for dangerous nested quantifiers that can cause ReDoS
        // Examples: (a+)+, (a*)*, (a+)*, (a{1,5})+
        const dangerousPatterns = [
            /\([^)]*[+*]\)[+*{]/,  // (x+)+ or (x*)* or (x+){n}
            /\([^)]*\{[^}]*\}\)[+*{]/,  // (x{n,m})+ or (x{n,m})*
            /\([^)]*[+*]\)\+/,  // (x+)+ or (x*)+
            /\*.*\*/,  // Multiple asterisks
        ];

        for (const dangerous of dangerousPatterns) {
            if (dangerous.test(pattern)) {
                console.warn('[AdvancedSearch] Potentially dangerous regex pattern detected:', pattern);
                return false;
            }
        }

        return true;
    }

    /**
     * Parse query string into search terms with operators
     * @private
     * @param {string} query - Raw query string
     * @param {boolean} caseSensitive - Case sensitive
     * @returns {Object} Parsed search terms
     */
    _parseQuery(query, caseSensitive = false) {
        const terms = {
            and: [],      // Terms that must be present
            or: [],       // Terms where at least one must be present
            not: [],      // Terms that must NOT be present
            exact: [],    // Exact phrase matches
            regex: [],    // Regular expressions
        };

        // Normalize query
        let normalizedQuery = caseSensitive ? query : query.toLowerCase();

        // Extract exact phrases (quoted text)
        const exactMatches = normalizedQuery.match(/"([^"]+)"/g);
        if (exactMatches) {
            exactMatches.forEach(match => {
                const phrase = match.slice(1, -1); // Remove quotes
                terms.exact.push(phrase);
                normalizedQuery = normalizedQuery.replace(match, ''); // Remove from query
            });
        }

        // Extract regex patterns /pattern/
        const regexMatches = normalizedQuery.match(/\/([^\/]+)\//g);
        if (regexMatches) {
            regexMatches.forEach(match => {
                const pattern = match.slice(1, -1); // Remove slashes

                // Validate pattern for safety before creating RegExp
                if (!this._isRegexSafe(pattern)) {
                    console.warn('[AdvancedSearch] Unsafe regex pattern rejected:', pattern);
                    return;
                }

                try {
                    terms.regex.push(new RegExp(pattern, caseSensitive ? '' : 'i'));
                    normalizedQuery = normalizedQuery.replace(match, '');
                } catch (e) {
                    console.warn('[AdvancedSearch] Invalid regex:', pattern);
                }
            });
        }

        // Split remaining query by operators
        const parts = normalizedQuery.split(/\s+/).filter(p => p.trim());

        let currentOperator = 'and'; // Default to AND
        parts.forEach(part => {
            const upperPart = part.toUpperCase();

            if (upperPart === 'AND') {
                currentOperator = 'and';
            } else if (upperPart === 'OR') {
                currentOperator = 'or';
            } else if (upperPart === 'NOT') {
                currentOperator = 'not';
            } else if (part.trim()) {
                terms[currentOperator].push(part.trim());
            }
        });

        return terms;
    }

    /**
     * Check if content matches search terms
     * @private
     * @param {string} content - Content to search in
     * @param {Object} searchTerms - Parsed search terms
     * @param {boolean} caseSensitive - Case sensitive
     * @returns {Object} Match result with score and highlights
     */
    _matchesSearchTerms(content, searchTerms, caseSensitive = false) {
        if (!content) {
            return { matches: false, score: 0, highlights: [] };
        }

        const normalizedContent = caseSensitive ? content : content.toLowerCase();
        let score = 0;
        const highlights = [];

        // Check NOT terms first (must NOT be present)
        for (const term of searchTerms.not) {
            if (normalizedContent.includes(term)) {
                return { matches: false, score: 0, highlights: [] };
            }
        }

        // Check AND terms (all must be present)
        for (const term of searchTerms.and) {
            if (!normalizedContent.includes(term)) {
                return { matches: false, score: 0, highlights: [] };
            }
            score += 10;
            this._addHighlights(content, term, highlights, caseSensitive);
        }

        // Check OR terms (at least one must be present)
        if (searchTerms.or.length > 0) {
            let orMatched = false;
            for (const term of searchTerms.or) {
                if (normalizedContent.includes(term)) {
                    orMatched = true;
                    score += 5;
                    this._addHighlights(content, term, highlights, caseSensitive);
                }
            }
            if (!orMatched) {
                return { matches: false, score: 0, highlights: [] };
            }
        }

        // Check exact phrases
        for (const phrase of searchTerms.exact) {
            if (!normalizedContent.includes(phrase)) {
                return { matches: false, score: 0, highlights: [] };
            }
            score += 20; // Higher score for exact matches
            this._addHighlights(content, phrase, highlights, caseSensitive);
        }

        // Check regex patterns
        for (const regex of searchTerms.regex) {
            if (!regex.test(content)) {
                return { matches: false, score: 0, highlights: [] };
            }
            score += 15;
            // Regex highlights are more complex, skip for now
        }

        // If we got here and have any terms, we have a match
        const hasTerms = searchTerms.and.length > 0 ||
                        searchTerms.or.length > 0 ||
                        searchTerms.exact.length > 0 ||
                        searchTerms.regex.length > 0;

        return {
            matches: hasTerms,
            score: score || 1,
            highlights: highlights,
        };
    }

    /**
     * Add highlight positions for a term in content
     * @private
     */
    _addHighlights(content, term, highlights, caseSensitive) {
        const searchContent = caseSensitive ? content : content.toLowerCase();
        const searchTerm = caseSensitive ? term : term.toLowerCase();

        let index = searchContent.indexOf(searchTerm);
        while (index !== -1) {
            highlights.push({
                start: index,
                end: index + term.length,
                text: content.substring(index, index + term.length),
            });
            index = searchContent.indexOf(searchTerm, index + 1);
        }
    }

    /**
     * Apply filters to conversations
     * @private
     */
    _applyFilters(conversations, filters = {}) {
        let filtered = [...conversations];

        // Filter by conversation ID
        if (filters.conversationId) {
            filtered = filtered.filter(conv => conv.id === filters.conversationId);
        }

        // Filter by date range
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(conv => {
                const convDate = new Date(conv.created_at);
                return convDate >= fromDate;
            });
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(conv => {
                const convDate = new Date(conv.created_at);
                return convDate <= toDate;
            });
        }

        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(conv => {
                if (!conv.tags || conv.tags.length === 0) return false;
                return filters.tags.some(tag => conv.tags.includes(tag));
            });
        }

        return filtered;
    }

    /**
     * Get search history
     * @returns {Array<Object>} Search history
     */
    getSearchHistory() {
        return this.searchHistory;
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this._saveSearchHistory();
    }

    /**
     * Add search to history
     * @private
     */
    _addToHistory(query, filters, resultCount) {
        // Check if already exists
        const existingIndex = this.searchHistory.findIndex(h =>
            h.query === query && JSON.stringify(h.filters) === JSON.stringify(filters)
        );

        const historyItem = {
            query,
            filters,
            resultCount,
            timestamp: new Date().toISOString(),
        };

        if (existingIndex !== -1) {
            // Update existing
            this.searchHistory[existingIndex] = historyItem;
        } else {
            // Add new
            this.searchHistory.unshift(historyItem);

            // Limit history size
            if (this.searchHistory.length > this.maxHistorySize) {
                this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
            }
        }

        this._saveSearchHistory();
    }

    /**
     * Load search history from localStorage
     * @private
     */
    _loadSearchHistory() {
        try {
            const stored = localStorage.getItem('lucide-search-history');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('[AdvancedSearch] Error loading history:', e);
            return [];
        }
    }

    /**
     * Save search history to localStorage
     * @private
     */
    _saveSearchHistory() {
        try {
            localStorage.setItem('lucide-search-history', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.error('[AdvancedSearch] Error saving history:', e);
        }
    }

    /**
     * Get search suggestions based on history
     * @param {string} partial - Partial query
     * @returns {Array<string>} Suggestions
     */
    getSuggestions(partial) {
        if (!partial.trim()) return [];

        const lowerPartial = partial.toLowerCase();
        const suggestions = new Set();

        this.searchHistory.forEach(item => {
            if (item.query.toLowerCase().startsWith(lowerPartial)) {
                suggestions.add(item.query);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }

    /**
     * Format search result for display
     * @param {Object} result - Search result
     * @param {number} contextLength - Length of context to show
     * @returns {Object} Formatted result
     */
    formatResult(result, contextLength = 100) {
        const { message, highlights, matchScore } = result;

        if (highlights.length === 0) {
            // No highlights, show beginning of content
            return {
                preview: message.content.substring(0, contextLength) + '...',
                highlights: [],
            };
        }

        // Get first highlight and show context around it
        const firstHighlight = highlights[0];
        const start = Math.max(0, firstHighlight.start - contextLength / 2);
        const end = Math.min(message.content.length, firstHighlight.end + contextLength / 2);

        let preview = message.content.substring(start, end);
        if (start > 0) preview = '...' + preview;
        if (end < message.content.length) preview = preview + '...';

        // Adjust highlight positions for preview
        const adjustedHighlights = highlights
            .filter(h => h.start >= start && h.end <= end)
            .map(h => ({
                ...h,
                start: h.start - start + (start > 0 ? 3 : 0), // Account for '...'
                end: h.end - start + (start > 0 ? 3 : 0),
            }));

        return {
            preview,
            highlights: adjustedHighlights,
        };
    }
}

// Export singleton instance
export const advancedSearchService = new AdvancedSearchService();
