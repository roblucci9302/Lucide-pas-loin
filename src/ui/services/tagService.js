/**
 * tagService - Service for managing conversation tags
 *
 * Features:
 * - Create, update, delete tags
 * - Associate tags with conversations
 * - Filter conversations by tags
 * - Tag suggestions based on content
 * - Tag colors and metadata
 * - LocalStorage persistence
 *
 * @example
 * tagService.createTag({ name: 'Work', color: '#4F46E5' });
 * tagService.addTagToConversation(conversationId, 'Work');
 */
class TagService {
    constructor() {
        this.tags = new Map(); // tagId -> { id, name, color, count }
        this.conversationTags = new Map(); // conversationId -> Set<tagId>
        this.storageKey = 'lucide-tags';
        this.conversationTagsKey = 'lucide-conversation-tags';
        this.subscribers = new Set();
        this._loadFromStorage();
    }

    /**
     * Load tags from localStorage
     * @private
     */
    _loadFromStorage() {
        try {
            // Load tags
            const tagsData = localStorage.getItem(this.storageKey);
            if (tagsData) {
                const parsed = JSON.parse(tagsData);
                parsed.forEach(tag => {
                    this.tags.set(tag.id, tag);
                });
            }

            // Load conversation tags
            const conversationTagsData = localStorage.getItem(this.conversationTagsKey);
            if (conversationTagsData) {
                const parsed = JSON.parse(conversationTagsData);
                Object.entries(parsed).forEach(([conversationId, tagIds]) => {
                    this.conversationTags.set(conversationId, new Set(tagIds));
                });
            }

            console.log('[TagService] Loaded', this.tags.size, 'tags');
        } catch (error) {
            console.error('[TagService] Error loading from storage:', error);
        }
    }

    /**
     * Save tags to localStorage
     * @private
     */
    _saveToStorage() {
        try {
            // Save tags
            const tagsArray = Array.from(this.tags.values());
            localStorage.setItem(this.storageKey, JSON.stringify(tagsArray));

            // Save conversation tags
            const conversationTagsObj = {};
            this.conversationTags.forEach((tagIds, conversationId) => {
                conversationTagsObj[conversationId] = Array.from(tagIds);
            });
            localStorage.setItem(this.conversationTagsKey, JSON.stringify(conversationTagsObj));

            this._notifySubscribers();
        } catch (error) {
            console.error('[TagService] Error saving to storage:', error);
        }
    }

    /**
     * Generate unique tag ID
     * @private
     * @returns {string} Unique ID
     */
    _generateId() {
        return `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Create a new tag
     * @param {Object} tagData - Tag data
     * @param {string} tagData.name - Tag name
     * @param {string} tagData.color - Tag color (hex)
     * @returns {Object} Created tag
     */
    createTag({ name, color }) {
        if (!name || name.trim() === '') {
            throw new Error('Tag name is required');
        }

        const normalizedName = name.trim();

        // Check if tag already exists
        const existing = this.findTagByName(normalizedName);
        if (existing) {
            return existing;
        }

        const tag = {
            id: this._generateId(),
            name: normalizedName,
            color: color || this._getRandomColor(),
            count: 0,
            created_at: new Date().toISOString(),
        };

        this.tags.set(tag.id, tag);
        this._saveToStorage();

        console.log('[TagService] Created tag:', tag.name);
        return tag;
    }

    /**
     * Update a tag
     * @param {string} tagId - Tag ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated tag or null
     */
    updateTag(tagId, updates) {
        const tag = this.tags.get(tagId);
        if (!tag) {
            console.error('[TagService] Tag not found:', tagId);
            return null;
        }

        if (updates.name) {
            tag.name = updates.name.trim();
        }

        if (updates.color) {
            tag.color = updates.color;
        }

        this.tags.set(tagId, tag);
        this._saveToStorage();

        console.log('[TagService] Updated tag:', tag.name);
        return tag;
    }

    /**
     * Delete a tag
     * @param {string} tagId - Tag ID
     * @returns {boolean} True if deleted
     */
    deleteTag(tagId) {
        const tag = this.tags.get(tagId);
        if (!tag) {
            return false;
        }

        // Remove tag from all conversations
        this.conversationTags.forEach((tagIds, conversationId) => {
            if (tagIds.has(tagId)) {
                tagIds.delete(tagId);
            }
        });

        this.tags.delete(tagId);
        this._saveToStorage();

        console.log('[TagService] Deleted tag:', tag.name);
        return true;
    }

    /**
     * Get all tags
     * @returns {Array<Object>} All tags
     */
    getAllTags() {
        return Array.from(this.tags.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get tag by ID
     * @param {string} tagId - Tag ID
     * @returns {Object|null} Tag or null
     */
    getTag(tagId) {
        return this.tags.get(tagId) || null;
    }

    /**
     * Find tag by name (case-insensitive)
     * @param {string} name - Tag name
     * @returns {Object|null} Tag or null
     */
    findTagByName(name) {
        const normalizedName = name.toLowerCase().trim();
        for (const tag of this.tags.values()) {
            if (tag.name.toLowerCase() === normalizedName) {
                return tag;
            }
        }
        return null;
    }

    /**
     * Add tag to conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} tagId - Tag ID or tag name
     * @returns {boolean} True if added
     */
    addTagToConversation(conversationId, tagId) {
        // If tagId is actually a name, find or create the tag
        let tag = this.tags.get(tagId);
        if (!tag) {
            tag = this.findTagByName(tagId);
            if (!tag) {
                // Create new tag
                tag = this.createTag({ name: tagId });
            }
        }

        if (!this.conversationTags.has(conversationId)) {
            this.conversationTags.set(conversationId, new Set());
        }

        const tagIds = this.conversationTags.get(conversationId);
        const wasAdded = !tagIds.has(tag.id);

        if (wasAdded) {
            tagIds.add(tag.id);
            tag.count++;
            this._saveToStorage();
            console.log('[TagService] Added tag to conversation:', tag.name);
        }

        return wasAdded;
    }

    /**
     * Remove tag from conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} tagId - Tag ID
     * @returns {boolean} True if removed
     */
    removeTagFromConversation(conversationId, tagId) {
        const tagIds = this.conversationTags.get(conversationId);
        if (!tagIds || !tagIds.has(tagId)) {
            return false;
        }

        tagIds.delete(tagId);

        // Update tag count
        const tag = this.tags.get(tagId);
        if (tag) {
            tag.count = Math.max(0, tag.count - 1);
        }

        this._saveToStorage();
        console.log('[TagService] Removed tag from conversation');
        return true;
    }

    /**
     * Get tags for a conversation
     * @param {string} conversationId - Conversation ID
     * @returns {Array<Object>} Tags
     */
    getConversationTags(conversationId) {
        const tagIds = this.conversationTags.get(conversationId);
        if (!tagIds) {
            return [];
        }

        return Array.from(tagIds)
            .map(tagId => this.tags.get(tagId))
            .filter(tag => tag !== undefined)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get conversations with a specific tag
     * @param {string} tagId - Tag ID
     * @returns {Array<string>} Conversation IDs
     */
    getConversationsWithTag(tagId) {
        const conversationIds = [];

        this.conversationTags.forEach((tagIds, conversationId) => {
            if (tagIds.has(tagId)) {
                conversationIds.push(conversationId);
            }
        });

        return conversationIds;
    }

    /**
     * Filter conversations by tags
     * @param {Array<Object>} conversations - All conversations
     * @param {Array<string>} filterTagIds - Tag IDs to filter by
     * @param {string} filterMode - 'any' or 'all'
     * @returns {Array<Object>} Filtered conversations
     */
    filterConversationsByTags(conversations, filterTagIds, filterMode = 'any') {
        if (!filterTagIds || filterTagIds.length === 0) {
            return conversations;
        }

        return conversations.filter(conversation => {
            const conversationTagIds = this.conversationTags.get(conversation.id);
            if (!conversationTagIds || conversationTagIds.size === 0) {
                return false;
            }

            if (filterMode === 'all') {
                // All filter tags must be present
                return filterTagIds.every(tagId => conversationTagIds.has(tagId));
            } else {
                // At least one filter tag must be present
                return filterTagIds.some(tagId => conversationTagIds.has(tagId));
            }
        });
    }

    /**
     * Suggest tags based on conversation content
     * @param {Object} conversation - Conversation object
     * @returns {Array<Object>} Suggested tags
     */
    suggestTags(conversation) {
        const suggestions = [];

        if (!conversation) {
            return suggestions;
        }

        const title = conversation.title || '';
        const content = this._getConversationContent(conversation);
        const text = `${title} ${content}`.toLowerCase();

        // Predefined tag suggestions based on keywords
        const tagPatterns = [
            { keywords: ['code', 'programming', 'debug', 'error', 'function'], tag: { name: 'Code', color: '#10B981' } },
            { keywords: ['work', 'project', 'task', 'deadline', 'meeting'], tag: { name: 'Work', color: '#3B82F6' } },
            { keywords: ['learn', 'tutorial', 'how to', 'explain', 'understand'], tag: { name: 'Learning', color: '#F59E0B' } },
            { keywords: ['bug', 'fix', 'issue', 'problem', 'error'], tag: { name: 'Bug Fix', color: '#EF4444' } },
            { keywords: ['idea', 'brainstorm', 'think', 'concept', 'plan'], tag: { name: 'Ideas', color: '#8B5CF6' } },
            { keywords: ['research', 'analyze', 'study', 'investigate'], tag: { name: 'Research', color: '#06B6D4' } },
            { keywords: ['design', 'ui', 'ux', 'interface', 'layout'], tag: { name: 'Design', color: '#EC4899' } },
            { keywords: ['data', 'analysis', 'statistics', 'chart', 'graph'], tag: { name: 'Data', color: '#14B8A6' } },
        ];

        tagPatterns.forEach(pattern => {
            const matchCount = pattern.keywords.filter(keyword => text.includes(keyword)).length;
            if (matchCount > 0) {
                // Check if tag doesn't already exist for this conversation
                const existingTag = this.findTagByName(pattern.tag.name);
                const conversationTags = this.getConversationTags(conversation.id);
                const alreadyHasTag = conversationTags.some(t => t.name === pattern.tag.name);

                if (!alreadyHasTag) {
                    suggestions.push({
                        ...pattern.tag,
                        id: existingTag?.id || this._generateId(),
                        relevance: matchCount,
                    });
                }
            }
        });

        // Sort by relevance
        suggestions.sort((a, b) => b.relevance - a.relevance);

        return suggestions.slice(0, 3); // Return top 3 suggestions
    }

    /**
     * Get conversation content for analysis
     * @private
     * @param {Object} conversation - Conversation object
     * @returns {string} Content text
     */
    _getConversationContent(conversation) {
        if (!conversation.messages || conversation.messages.length === 0) {
            return '';
        }

        // Get first few messages for analysis
        return conversation.messages
            .slice(0, 5)
            .map(msg => msg.content)
            .join(' ')
            .substring(0, 500);
    }

    /**
     * Get random color for new tags
     * @private
     * @returns {string} Hex color
     */
    _getRandomColor() {
        const colors = [
            '#EF4444', // Red
            '#F59E0B', // Amber
            '#10B981', // Green
            '#3B82F6', // Blue
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#14B8A6', // Teal
            '#6366F1', // Indigo
            '#F97316', // Orange
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Update tag usage counts
     * @private
     */
    _updateTagCounts() {
        // Reset all counts
        this.tags.forEach(tag => {
            tag.count = 0;
        });

        // Recount from conversations
        this.conversationTags.forEach((tagIds) => {
            tagIds.forEach(tagId => {
                const tag = this.tags.get(tagId);
                if (tag) {
                    tag.count++;
                }
            });
        });
    }

    /**
     * Subscribe to tag changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify subscribers of changes
     * @private
     */
    _notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('[TagService] Subscriber error:', error);
            }
        });
    }

    /**
     * Clear all tags and data
     */
    clear() {
        this.tags.clear();
        this.conversationTags.clear();
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.conversationTagsKey);
        this._notifySubscribers();
        console.log('[TagService] Cleared all data');
    }
}

// Export singleton instance
export const tagService = new TagService();
