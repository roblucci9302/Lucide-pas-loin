/**
 * Live Insights Service - Phase 3.1
 * Real-time analysis of conversation to detect patterns, decisions, actions, and key moments
 */

const EventEmitter = require('events');

/**
 * Insight Types
 */
const InsightType = {
    DECISION: 'decision',           // Decision made during meeting
    ACTION: 'action',               // Action item assigned verbally
    DEADLINE: 'deadline',           // Deadline mentioned
    QUESTION: 'question',           // Open question asked
    KEY_POINT: 'key_point',        // Important point to remember
    BLOCKER: 'blocker',            // Obstacle or blocker mentioned
    TOPIC_CHANGE: 'topic_change',  // Change in discussion topic
    RECURRING_TOPIC: 'recurring'    // Topic mentioned multiple times
};

/**
 * Priority Levels
 */
const Priority = {
    HIGH: 'high',       // Critical insights requiring immediate attention
    MEDIUM: 'medium',   // Important but not urgent
    LOW: 'low'         // Nice to know
};

class LiveInsightsService extends EventEmitter {
    constructor() {
        super();
        this.sessionId = null;
        this.insights = [];
        this.conversationBuffer = [];
        this.topicHistory = new Map(); // Track topic frequency
        this.questionTracker = new Set(); // Track open questions

        // Pattern detection configuration
        this.patterns = this._initializePatterns();

        console.log('[LiveInsightsService] Initialized');
    }

    /**
     * Initialize regex patterns for insight detection
     * @private
     */
    _initializePatterns() {
        return {
            // Decision patterns
            decision: [
                /\b(decided|agree[sd]?|concluded|determined|resolved)\b/i,
                /\b(let'?s (go with|use|choose|pick))\b/i,
                /\b(final decision|we'?ll|we will)\b/i,
                /\b(approved|accepted|confirmed)\b/i
            ],

            // Action patterns
            action: [
                /\b(will|gonna|going to|need to|should|must|have to)\s+\w+/i,
                /\b(I'?ll|he'?ll|she'?ll|they'?ll|we'?ll)\s+\w+/i,
                /\b(responsible for|assigned to|in charge of)\b/i,
                /\b(action item|task|todo|to-?do)\b/i
            ],

            // Deadline patterns
            deadline: [
                /\b(by|before|until|deadline|due)\s+(tomorrow|today|tonight|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
                /\b(by|before|until|deadline|due)\s+\w+\s+\d{1,2}/i, // "by March 15"
                /\b(asap|urgent|immediately|right away)\b/i,
                /\b(\d{1,2}:\d{2}\s*[ap]m)\b/i, // Time mentions
                /\b(in\s+\d+\s+(hours?|days?|weeks?|months?))/i
            ],

            // Question patterns
            question: [
                /\b(what|when|where|who|why|how|which|can|could|would|should|do|does|did|is|are|was|were)\b.*\?/i,
                /\b(question|wondering|curious|need to know|clarify)\b/i
            ],

            // Key point patterns
            keyPoint: [
                /\b(important|critical|crucial|key|essential|vital|significant)\b/i,
                /\b(note that|keep in mind|remember|don'?t forget)\b/i,
                /\b(the main|the primary|the core|the key)\b/i
            ],

            // Blocker patterns
            blocker: [
                /\b(blocked|blocker|stuck|can'?t|cannot|unable to|issue|problem)\b/i,
                /\b(waiting for|dependency|depends on|blocked by)\b/i,
                /\b(obstacle|impediment|bottleneck)\b/i
            ]
        };
    }

    /**
     * Set the current session ID
     */
    setSessionId(sessionId) {
        this.sessionId = sessionId;
        this.reset();
        console.log(`[LiveInsightsService] Session set: ${sessionId}`);
    }

    /**
     * Reset service state
     */
    reset() {
        this.insights = [];
        this.conversationBuffer = [];
        this.topicHistory.clear();
        this.questionTracker.clear();
        console.log('[LiveInsightsService] State reset');
    }

    /**
     * Process new conversation turn
     * @param {string} speaker - Speaker identifier
     * @param {string} text - Transcribed text
     */
    processConversationTurn(speaker, text) {
        if (!this.sessionId) {
            console.warn('[LiveInsightsService] No session ID set, skipping processing');
            return;
        }

        // Add to buffer
        this.conversationBuffer.push({ speaker, text, timestamp: Date.now() });

        // Keep buffer to last 10 turns for context
        if (this.conversationBuffer.length > 10) {
            this.conversationBuffer.shift();
        }

        // Analyze the turn
        this._analyzeConversationTurn(speaker, text);
    }

    /**
     * Analyze a conversation turn for insights
     * @private
     */
    _analyzeConversationTurn(speaker, text) {
        const insights = [];

        // Detect decisions
        if (this._matchesPattern(text, this.patterns.decision)) {
            insights.push(this._createInsight(
                InsightType.DECISION,
                `Decision: ${this._extractKeyPhrase(text, 60)}`,
                text,
                speaker,
                this._calculatePriority(text, InsightType.DECISION)
            ));
        }

        // Detect actions
        if (this._matchesPattern(text, this.patterns.action)) {
            insights.push(this._createInsight(
                InsightType.ACTION,
                `Action: ${this._extractKeyPhrase(text, 60)}`,
                text,
                speaker,
                this._calculatePriority(text, InsightType.ACTION)
            ));
        }

        // Detect deadlines
        if (this._matchesPattern(text, this.patterns.deadline)) {
            insights.push(this._createInsight(
                InsightType.DEADLINE,
                `Deadline mentioned: ${this._extractDeadline(text)}`,
                text,
                speaker,
                Priority.HIGH // Deadlines are always high priority
            ));
        }

        // Detect questions
        if (this._matchesPattern(text, this.patterns.question)) {
            const question = this._extractKeyPhrase(text, 80);
            this.questionTracker.add(question);

            insights.push(this._createInsight(
                InsightType.QUESTION,
                `Question: ${question}`,
                text,
                speaker,
                Priority.MEDIUM
            ));
        }

        // Detect key points
        if (this._matchesPattern(text, this.patterns.keyPoint)) {
            insights.push(this._createInsight(
                InsightType.KEY_POINT,
                `Key Point: ${this._extractKeyPhrase(text, 60)}`,
                text,
                speaker,
                Priority.MEDIUM
            ));
        }

        // Detect blockers
        if (this._matchesPattern(text, this.patterns.blocker)) {
            insights.push(this._createInsight(
                InsightType.BLOCKER,
                `Blocker: ${this._extractKeyPhrase(text, 60)}`,
                text,
                speaker,
                Priority.HIGH // Blockers are high priority
            ));
        }

        // Detect topic changes
        const topicChanged = this._detectTopicChange(text);
        if (topicChanged) {
            insights.push(this._createInsight(
                InsightType.TOPIC_CHANGE,
                `Topic shift: ${topicChanged}`,
                text,
                speaker,
                Priority.LOW
            ));
        }

        // Store and emit insights
        insights.forEach(insight => {
            this.insights.push(insight);
            this.emit('insight-detected', insight);
            console.log(`[LiveInsights] ${insight.type}: ${insight.title}`);
        });

        // Check for recurring topics
        this._checkRecurringTopics();
    }

    /**
     * Check if text matches any pattern
     * @private
     */
    _matchesPattern(text, patterns) {
        return patterns.some(pattern => pattern.test(text));
    }

    /**
     * Extract key phrase from text
     * @private
     */
    _extractKeyPhrase(text, maxLength = 60) {
        // Remove extra whitespace
        const cleaned = text.replace(/\s+/g, ' ').trim();

        // If text is short enough, return it
        if (cleaned.length <= maxLength) {
            return cleaned;
        }

        // Try to cut at sentence boundary
        const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
        if (sentences && sentences[0] && sentences[0].length <= maxLength) {
            return sentences[0].trim();
        }

        // Cut at word boundary
        const truncated = cleaned.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        return truncated.substring(0, lastSpace) + '...';
    }

    /**
     * Extract deadline from text
     * @private
     */
    _extractDeadline(text) {
        // Try to find specific date/time patterns
        const timeMatch = text.match(/\b(by|before|until|deadline)\s+([^.!?,]+)/i);
        if (timeMatch) {
            return timeMatch[2].trim();
        }

        const urgentMatch = text.match(/\b(asap|urgent|immediately|right away)\b/i);
        if (urgentMatch) {
            return urgentMatch[1];
        }

        return this._extractKeyPhrase(text, 40);
    }

    /**
     * Calculate priority based on content
     * @private
     */
    _calculatePriority(text, type) {
        const urgentWords = /\b(urgent|critical|asap|immediately|important|crucial)\b/i;

        if (urgentWords.test(text)) {
            return Priority.HIGH;
        }

        // Type-based defaults
        if (type === InsightType.DEADLINE || type === InsightType.BLOCKER) {
            return Priority.HIGH;
        }

        if (type === InsightType.DECISION || type === InsightType.ACTION) {
            return Priority.MEDIUM;
        }

        return Priority.LOW;
    }

    /**
     * Detect topic changes in conversation
     * @private
     */
    _detectTopicChange(text) {
        const topicChangeIndicators = [
            /\b(let'?s talk about|moving on to|next topic|switching to|regarding)\s+([^.!?,]+)/i,
            /\b(now,|so,|anyway,|by the way,)\s+([^.!?,]+)/i
        ];

        for (const pattern of topicChangeIndicators) {
            const match = text.match(pattern);
            if (match) {
                const topic = match[2] ? match[2].trim() : this._extractKeyPhrase(text, 40);

                // Track topic frequency
                const count = (this.topicHistory.get(topic) || 0) + 1;
                this.topicHistory.set(topic, count);

                return topic;
            }
        }

        return null;
    }

    /**
     * Check for recurring topics
     * @private
     */
    _checkRecurringTopics() {
        for (const [topic, count] of this.topicHistory.entries()) {
            if (count >= 3) { // Topic mentioned 3+ times
                const existingRecurring = this.insights.find(
                    i => i.type === InsightType.RECURRING_TOPIC && i.metadata?.topic === topic
                );

                if (!existingRecurring) {
                    const insight = this._createInsight(
                        InsightType.RECURRING_TOPIC,
                        `Recurring topic: ${topic}`,
                        `This topic has been mentioned ${count} times`,
                        'System',
                        Priority.MEDIUM,
                        { topic, count }
                    );

                    this.insights.push(insight);
                    this.emit('insight-detected', insight);
                }
            }
        }
    }

    /**
     * Create insight object
     * @private
     */
    _createInsight(type, title, content, speaker, priority, metadata = {}) {
        return {
            id: this._generateId(),
            session_id: this.sessionId,
            type,
            title,
            content,
            speaker,
            priority,
            timestamp: Date.now(),
            metadata,
            dismissed: false
        };
    }

    /**
     * Generate unique ID
     * @private
     */
    _generateId() {
        return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get all insights for current session
     */
    getAllInsights() {
        return this.insights;
    }

    /**
     * Get insights by type
     */
    getInsightsByType(type) {
        return this.insights.filter(i => i.type === type);
    }

    /**
     * Get insights by priority
     */
    getInsightsByPriority(priority) {
        return this.insights.filter(i => i.priority === priority);
    }

    /**
     * Get active (non-dismissed) insights
     */
    getActiveInsights() {
        return this.insights.filter(i => !i.dismissed);
    }

    /**
     * Dismiss an insight
     */
    dismissInsight(insightId) {
        const insight = this.insights.find(i => i.id === insightId);
        if (insight) {
            insight.dismissed = true;
            this.emit('insight-dismissed', insight);
            return true;
        }
        return false;
    }

    /**
     * Get meeting statistics
     */
    getSessionStatistics() {
        const active = this.getActiveInsights();

        return {
            total: this.insights.length,
            active: active.length,
            byType: {
                decisions: this.getInsightsByType(InsightType.DECISION).length,
                actions: this.getInsightsByType(InsightType.ACTION).length,
                deadlines: this.getInsightsByType(InsightType.DEADLINE).length,
                questions: this.getInsightsByType(InsightType.QUESTION).length,
                keyPoints: this.getInsightsByType(InsightType.KEY_POINT).length,
                blockers: this.getInsightsByType(InsightType.BLOCKER).length,
                topicChanges: this.getInsightsByType(InsightType.TOPIC_CHANGE).length,
                recurring: this.getInsightsByType(InsightType.RECURRING_TOPIC).length
            },
            byPriority: {
                high: this.getInsightsByPriority(Priority.HIGH).length,
                medium: this.getInsightsByPriority(Priority.MEDIUM).length,
                low: this.getInsightsByPriority(Priority.LOW).length
            },
            openQuestions: this.questionTracker.size,
            conversationTurns: this.conversationBuffer.length
        };
    }

    /**
     * Get recent insights (last N)
     */
    getRecentInsights(count = 5) {
        const active = this.getActiveInsights();
        return active.slice(-count).reverse();
    }

    /**
     * Get high priority insights that need attention
     */
    getHighPriorityInsights() {
        return this.insights.filter(
            i => i.priority === Priority.HIGH && !i.dismissed
        );
    }
}

// Export singleton instance
const liveInsightsService = new LiveInsightsService();

// Export types and priorities for use in other modules
liveInsightsService.InsightType = InsightType;
liveInsightsService.Priority = Priority;

module.exports = liveInsightsService;
