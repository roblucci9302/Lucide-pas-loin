/**
 * statisticsService - Service for collecting and analyzing conversation statistics
 *
 * Features:
 * - Message count tracking (total, by role, by day/week/month)
 * - Token usage estimation
 * - Conversation metrics (count, avg length, most active times)
 * - Activity timeline
 * - Tag usage statistics
 * - Export statistics data
 *
 * @example
 * const stats = statisticsService.getOverallStatistics(conversations);
 * const timeline = statisticsService.getActivityTimeline(conversations, 'week');
 */
class StatisticsService {
    constructor() {
        // Token estimation (rough approximation)
        this.tokensPerCharacter = 0.25; // Approximation for English text
    }

    /**
     * Get overall statistics from conversations
     * @param {Array<Object>} conversations - All conversations
     * @returns {Object} Overall statistics
     */
    getOverallStatistics(conversations) {
        if (!conversations || conversations.length === 0) {
            return this._getEmptyStatistics();
        }

        const stats = {
            totalConversations: conversations.length,
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0,
            totalCharacters: 0,
            estimatedTokens: 0,
            avgMessagesPerConversation: 0,
            avgCharactersPerMessage: 0,
            oldestConversation: null,
            newestConversation: null,
            mostActiveDay: null,
            mostActiveHour: null,
            conversationsWithTags: 0,
        };

        let allMessages = [];
        let oldestDate = null;
        let newestDate = null;

        // Collect all data
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            stats.totalMessages += messages.length;

            messages.forEach(msg => {
                if (msg.role === 'user') {
                    stats.userMessages++;
                } else if (msg.role === 'assistant') {
                    stats.assistantMessages++;
                }

                const content = msg.content || '';
                stats.totalCharacters += content.length;
                allMessages.push(msg);
            });

            // Track oldest/newest
            const convDate = new Date(conv.created_at);
            if (!oldestDate || convDate < oldestDate) {
                oldestDate = convDate;
                stats.oldestConversation = conv;
            }
            if (!newestDate || convDate > newestDate) {
                newestDate = convDate;
                stats.newestConversation = conv;
            }
        });

        // Calculate averages
        stats.avgMessagesPerConversation = stats.totalConversations > 0
            ? Math.round(stats.totalMessages / stats.totalConversations)
            : 0;

        stats.avgCharactersPerMessage = stats.totalMessages > 0
            ? Math.round(stats.totalCharacters / stats.totalMessages)
            : 0;

        stats.estimatedTokens = Math.round(stats.totalCharacters * this.tokensPerCharacter);

        // Most active day/hour
        const { mostActiveDay, mostActiveHour } = this._getMostActiveTime(allMessages);
        stats.mostActiveDay = mostActiveDay;
        stats.mostActiveHour = mostActiveHour;

        return stats;
    }

    /**
     * Get empty statistics object
     * @private
     * @returns {Object} Empty stats
     */
    _getEmptyStatistics() {
        return {
            totalConversations: 0,
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0,
            totalCharacters: 0,
            estimatedTokens: 0,
            avgMessagesPerConversation: 0,
            avgCharactersPerMessage: 0,
            oldestConversation: null,
            newestConversation: null,
            mostActiveDay: null,
            mostActiveHour: null,
            conversationsWithTags: 0,
        };
    }

    /**
     * Get activity timeline data
     * @param {Array<Object>} conversations - All conversations
     * @param {string} period - 'day' | 'week' | 'month'
     * @param {number} count - Number of periods to show
     * @returns {Array<Object>} Timeline data points
     */
    getActivityTimeline(conversations, period = 'week', count = 7) {
        if (!conversations || conversations.length === 0) {
            return [];
        }

        const now = new Date();
        const timeline = [];

        // Generate date ranges
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now);

            if (period === 'day') {
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
            } else if (period === 'week') {
                date.setDate(date.getDate() - (i * 7));
                date.setHours(0, 0, 0, 0);
            } else if (period === 'month') {
                date.setMonth(date.getMonth() - i);
                date.setDate(1);
                date.setHours(0, 0, 0, 0);
            }

            timeline.push({
                date: date,
                label: this._formatPeriodLabel(date, period),
                conversations: 0,
                messages: 0,
                userMessages: 0,
                assistantMessages: 0,
            });
        }

        // Fill in data
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            const convDate = new Date(conv.created_at);

            // Find matching period
            const periodIndex = this._findPeriodIndex(convDate, timeline, period);
            if (periodIndex !== -1) {
                timeline[periodIndex].conversations++;
                timeline[periodIndex].messages += messages.length;

                messages.forEach(msg => {
                    if (msg.role === 'user') {
                        timeline[periodIndex].userMessages++;
                    } else if (msg.role === 'assistant') {
                        timeline[periodIndex].assistantMessages++;
                    }
                });
            }
        });

        return timeline;
    }

    /**
     * Find period index for a date
     * @private
     */
    _findPeriodIndex(date, timeline, period) {
        for (let i = 0; i < timeline.length; i++) {
            const periodStart = timeline[i].date;
            const periodEnd = new Date(periodStart);

            if (period === 'day') {
                periodEnd.setDate(periodEnd.getDate() + 1);
            } else if (period === 'week') {
                periodEnd.setDate(periodEnd.getDate() + 7);
            } else if (period === 'month') {
                periodEnd.setMonth(periodEnd.getMonth() + 1);
            }

            if (date >= periodStart && date < periodEnd) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Format period label
     * @private
     */
    _formatPeriodLabel(date, period) {
        if (period === 'day') {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } else if (period === 'week') {
            return `Sem. ${this._getWeekNumber(date)}`;
        } else if (period === 'month') {
            return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        }
        return '';
    }

    /**
     * Get week number
     * @private
     */
    _getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Get most active time (day and hour)
     * @private
     */
    _getMostActiveTime(messages) {
        if (!messages || messages.length === 0) {
            return { mostActiveDay: null, mostActiveHour: null };
        }

        const dayCount = {};
        const hourCount = {};

        messages.forEach(msg => {
            if (!msg.created_at) return;

            const date = new Date(msg.created_at);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            const hour = date.getHours();

            dayCount[day] = (dayCount[day] || 0) + 1;
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });

        // Find most active day
        let mostActiveDay = null;
        let maxDayCount = 0;
        Object.entries(dayCount).forEach(([day, count]) => {
            if (count > maxDayCount) {
                maxDayCount = count;
                mostActiveDay = day;
            }
        });

        // Find most active hour
        let mostActiveHour = null;
        let maxHourCount = 0;
        Object.entries(hourCount).forEach(([hour, count]) => {
            if (count > maxHourCount) {
                maxHourCount = count;
                mostActiveHour = parseInt(hour);
            }
        });

        return { mostActiveDay, mostActiveHour };
    }

    /**
     * Get hour distribution (24 hours)
     * @param {Array<Object>} conversations - All conversations
     * @returns {Array<Object>} Hour distribution
     */
    getHourDistribution(conversations) {
        const distribution = [];

        // Initialize 24 hours
        for (let i = 0; i < 24; i++) {
            distribution.push({
                hour: i,
                label: `${i.toString().padStart(2, '0')}h`,
                count: 0,
            });
        }

        // Count messages per hour
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            messages.forEach(msg => {
                if (!msg.created_at) return;
                const hour = new Date(msg.created_at).getHours();
                distribution[hour].count++;
            });
        });

        return distribution;
    }

    /**
     * Get day of week distribution
     * @param {Array<Object>} conversations - All conversations
     * @returns {Array<Object>} Day distribution
     */
    getDayDistribution(conversations) {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const distribution = days.map(day => ({
            day,
            count: 0,
        }));

        conversations.forEach(conv => {
            const messages = conv.messages || [];
            messages.forEach(msg => {
                if (!msg.created_at) return;
                const date = new Date(msg.created_at);
                // getDay() returns 0-6 (Sun-Sat), we need Mon-Sun
                let dayIndex = date.getDay() - 1;
                if (dayIndex < 0) dayIndex = 6;
                distribution[dayIndex].count++;
            });
        });

        return distribution;
    }

    /**
     * Get conversation length distribution
     * @param {Array<Object>} conversations - All conversations
     * @returns {Object} Distribution by message count ranges
     */
    getConversationLengthDistribution(conversations) {
        const ranges = [
            { label: '1-5', min: 1, max: 5, count: 0 },
            { label: '6-10', min: 6, max: 10, count: 0 },
            { label: '11-20', min: 11, max: 20, count: 0 },
            { label: '21-50', min: 21, max: 50, count: 0 },
            { label: '50+', min: 51, max: Infinity, count: 0 },
        ];

        conversations.forEach(conv => {
            const messageCount = (conv.messages || []).length;
            const range = ranges.find(r => messageCount >= r.min && messageCount <= r.max);
            if (range) {
                range.count++;
            }
        });

        return ranges;
    }

    /**
     * Get top conversations by message count
     * @param {Array<Object>} conversations - All conversations
     * @param {number} limit - Number of top conversations
     * @returns {Array<Object>} Top conversations
     */
    getTopConversations(conversations, limit = 10) {
        return conversations
            .map(conv => ({
                id: conv.id,
                title: conv.title || 'Nouvelle conversation',
                messageCount: (conv.messages || []).length,
                created_at: conv.created_at,
            }))
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, limit);
    }

    /**
     * Export statistics to JSON
     * @param {Array<Object>} conversations - All conversations
     * @returns {string} JSON string
     */
    exportStatistics(conversations) {
        const data = {
            exportedAt: new Date().toISOString(),
            overall: this.getOverallStatistics(conversations),
            timeline: this.getActivityTimeline(conversations, 'day', 30),
            hourDistribution: this.getHourDistribution(conversations),
            dayDistribution: this.getDayDistribution(conversations),
            lengthDistribution: this.getConversationLengthDistribution(conversations),
            topConversations: this.getTopConversations(conversations, 20),
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Format number with K/M suffix
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Format hour for display
     * @param {number} hour - Hour (0-23)
     * @returns {string} Formatted hour
     */
    formatHour(hour) {
        return `${hour.toString().padStart(2, '0')}h`;
    }
}

// Export singleton instance
export const statisticsService = new StatisticsService();
