/**
 * Analytics Service - Phase 4
 * Provides analytics and metrics for meeting sessions
 */

const sessionRepository = require('../common/repositories/session');
const { liveInsightsRepository } = require('../listen/liveInsights/repositories');
const sttRepository = require('../listen/stt/repositories');

class AnalyticsService {
    constructor() {
        console.log('[AnalyticsService] Initialized');
    }

    /**
     * Get overview statistics for all sessions
     * @param {Object} options - Filter options
     * @returns {Promise<Object>} Overview statistics
     */
    async getOverviewStats(options = {}) {
        try {
            const { startDate, endDate, userId } = options;

            // Get all sessions
            const allSessions = await sessionRepository.getAll();

            // Filter sessions
            let sessions = allSessions;
            if (startDate) {
                sessions = sessions.filter(s => s.created_at >= startDate);
            }
            if (endDate) {
                sessions = sessions.filter(s => s.created_at <= endDate);
            }
            if (userId) {
                sessions = sessions.filter(s => s.user_id === userId);
            }

            // Calculate statistics
            const totalSessions = sessions.length;
            const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

            // Get insights statistics
            const insightsStats = await this._getInsightsStats(sessions.map(s => s.id));

            // Get transcription statistics
            const transcriptionStats = await this._getTranscriptionStats(sessions.map(s => s.id));

            return {
                totalSessions,
                totalDuration,
                avgDuration,
                totalInsights: insightsStats.total,
                avgInsightsPerSession: totalSessions > 0 ? insightsStats.total / totalSessions : 0,
                insightsByType: insightsStats.byType,
                insightsByPriority: insightsStats.byPriority,
                totalTranscriptions: transcriptionStats.total,
                avgTranscriptionsPerSession: totalSessions > 0 ? transcriptionStats.total / totalSessions : 0,
                mostProductiveDay: this._getMostProductiveDay(sessions),
                avgSessionsPerWeek: this._getAvgSessionsPerWeek(sessions),
                timeDistribution: this._getTimeDistribution(sessions)
            };
        } catch (error) {
            console.error('[AnalyticsService] Error getting overview stats:', error);
            throw error;
        }
    }

    /**
     * Get detailed session analytics
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session analytics
     */
    async getSessionAnalytics(sessionId) {
        try {
            const session = await sessionRepository.getById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            // Get insights for session
            const insights = await liveInsightsRepository.getBySessionId(sessionId);

            // Get transcriptions for session
            const transcriptions = await sttRepository.getBySessionId(sessionId);

            // Calculate metrics
            const insightsByType = this._groupBy(insights, 'type');
            const insightsByPriority = this._groupBy(insights, 'priority');
            const insightsTimeline = this._createTimeline(insights);

            // Sentiment analysis
            const sentimentDistribution = this._analyzeSentiment(insights);

            // Speaker statistics
            const speakerStats = this._calculateSpeakerStats(transcriptions, insights);

            // Keyword extraction
            const keywords = this._extractKeywords(transcriptions);

            return {
                session,
                metrics: {
                    duration: session.duration,
                    totalInsights: insights.length,
                    totalTranscriptions: transcriptions.length,
                    wordsSpoken: this._countWords(transcriptions),
                    avgWordsPerMinute: this._calculateWPM(transcriptions, session.duration)
                },
                insights: {
                    byType: insightsByType,
                    byPriority: insightsByPriority,
                    timeline: insightsTimeline,
                    sentiment: sentimentDistribution
                },
                speakers: speakerStats,
                keywords: keywords.slice(0, 10), // Top 10 keywords
                engagement: this._calculateEngagement(insights, transcriptions, session.duration)
            };
        } catch (error) {
            console.error('[AnalyticsService] Error getting session analytics:', error);
            throw error;
        }
    }

    /**
     * Get trending topics across sessions
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} Trending topics
     */
    async getTrendingTopics(options = {}) {
        try {
            const { limit = 10, startDate, endDate } = options;

            // Get all sessions in range
            const allSessions = await sessionRepository.getAll();
            let sessions = allSessions;

            if (startDate) {
                sessions = sessions.filter(s => s.created_at >= startDate);
            }
            if (endDate) {
                sessions = sessions.filter(s => s.created_at <= endDate);
            }

            const sessionIds = sessions.map(s => s.id);
            const allInsights = [];

            // Collect all insights
            for (const sessionId of sessionIds) {
                const insights = await liveInsightsRepository.getBySessionId(sessionId);
                allInsights.push(...insights);
            }

            // Extract topics from insights
            const topicCounts = new Map();

            allInsights.forEach(insight => {
                // Extract topics from recurring insights
                if (insight.type === 'recurring' && insight.metadata?.topic) {
                    const topic = insight.metadata.topic;
                    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
                }

                // Extract keywords from titles
                const words = this._extractWordsFromText(insight.title);
                words.forEach(word => {
                    if (word.length > 4) { // Filter short words
                        topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
                    }
                });
            });

            // Sort by frequency
            const trending = Array.from(topicCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([topic, count]) => ({ topic, count }));

            return trending;
        } catch (error) {
            console.error('[AnalyticsService] Error getting trending topics:', error);
            throw error;
        }
    }

    /**
     * Get insights statistics for sessions
     * @private
     */
    async _getInsightsStats(sessionIds) {
        const allInsights = [];

        for (const sessionId of sessionIds) {
            const insights = await liveInsightsRepository.getBySessionId(sessionId);
            allInsights.push(...insights);
        }

        const byType = this._groupBy(allInsights, 'type');
        const byPriority = this._groupBy(allInsights, 'priority');

        return {
            total: allInsights.length,
            byType,
            byPriority
        };
    }

    /**
     * Get transcription statistics for sessions
     * @private
     */
    async _getTranscriptionStats(sessionIds) {
        let total = 0;

        for (const sessionId of sessionIds) {
            const transcriptions = await sttRepository.getBySessionId(sessionId);
            total += transcriptions.length;
        }

        return { total };
    }

    /**
     * Get most productive day of the week
     * @private
     */
    _getMostProductiveDay(sessions) {
        const dayCounts = {};

        sessions.forEach(session => {
            const day = new Date(session.created_at).getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[day];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        });

        let maxDay = null;
        let maxCount = 0;

        for (const [day, count] of Object.entries(dayCounts)) {
            if (count > maxCount) {
                maxCount = count;
                maxDay = day;
            }
        }

        return { day: maxDay, count: maxCount };
    }

    /**
     * Get average sessions per week
     * @private
     */
    _getAvgSessionsPerWeek(sessions) {
        if (sessions.length === 0) return 0;

        const timestamps = sessions.map(s => s.created_at).sort((a, b) => a - b);
        const firstDate = timestamps[0];
        const lastDate = timestamps[timestamps.length - 1];

        const weeksDiff = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000);

        return weeksDiff > 0 ? sessions.length / weeksDiff : sessions.length;
    }

    /**
     * Get time distribution of sessions
     * @private
     */
    _getTimeDistribution(sessions) {
        const hourCounts = {};

        sessions.forEach(session => {
            const hour = new Date(session.created_at).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        return hourCounts;
    }

    /**
     * Group items by property
     * @private
     */
    _groupBy(items, property) {
        const groups = {};

        items.forEach(item => {
            const key = item[property] || 'unknown';
            groups[key] = (groups[key] || 0) + 1;
        });

        return groups;
    }

    /**
     * Create timeline from insights
     * @private
     */
    _createTimeline(insights) {
        return insights
            .map(insight => ({
                timestamp: insight.timestamp,
                type: insight.type,
                title: insight.title,
                priority: insight.priority
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Analyze sentiment distribution
     * @private
     */
    _analyzeSentiment(insights) {
        const distribution = {
            positive: 0,
            neutral: 0,
            negative: 0,
            urgent: 0,
            collaborative: 0,
            unknown: 0
        };

        insights.forEach(insight => {
            const sentiment = insight.sentiment || 'unknown';
            distribution[sentiment] = (distribution[sentiment] || 0) + 1;
        });

        return distribution;
    }

    /**
     * Calculate speaker statistics
     * @private
     */
    _calculateSpeakerStats(transcriptions, insights) {
        const stats = {};

        transcriptions.forEach(t => {
            const speaker = t.speaker || 'Unknown';
            if (!stats[speaker]) {
                stats[speaker] = {
                    transcriptionCount: 0,
                    wordCount: 0,
                    insightsGenerated: 0
                };
            }
            stats[speaker].transcriptionCount++;
            stats[speaker].wordCount += this._countWordsInText(t.text);
        });

        insights.forEach(insight => {
            const speaker = insight.speaker || 'Unknown';
            if (stats[speaker]) {
                stats[speaker].insightsGenerated++;
            }
        });

        return stats;
    }

    /**
     * Extract keywords from transcriptions
     * @private
     */
    _extractKeywords(transcriptions) {
        const wordCounts = new Map();
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from']);

        transcriptions.forEach(t => {
            const words = this._extractWordsFromText(t.text);
            words.forEach(word => {
                if (word.length > 3 && !stopWords.has(word.toLowerCase())) {
                    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
                }
            });
        });

        return Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([word, count]) => ({ word, count }));
    }

    /**
     * Extract words from text
     * @private
     */
    _extractWordsFromText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    /**
     * Count words in transcriptions
     * @private
     */
    _countWords(transcriptions) {
        return transcriptions.reduce((sum, t) => sum + this._countWordsInText(t.text), 0);
    }

    /**
     * Count words in text
     * @private
     */
    _countWordsInText(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Calculate words per minute
     * @private
     */
    _calculateWPM(transcriptions, duration) {
        if (!duration) return 0;
        const totalWords = this._countWords(transcriptions);
        const minutes = duration / (60 * 1000);
        return minutes > 0 ? totalWords / minutes : 0;
    }

    /**
     * Calculate engagement score
     * @private
     */
    _calculateEngagement(insights, transcriptions, duration) {
        if (!duration) return 0;

        const minutes = duration / (60 * 1000);
        const insightsPerMinute = minutes > 0 ? insights.length / minutes : 0;
        const transcriptionsPerMinute = minutes > 0 ? transcriptions.length / minutes : 0;

        // Engagement score based on activity
        const score = Math.min(100, (insightsPerMinute * 10 + transcriptionsPerMinute * 2) * 10);

        return {
            score: Math.round(score),
            insightsPerMinute: Math.round(insightsPerMinute * 100) / 100,
            transcriptionsPerMinute: Math.round(transcriptionsPerMinute * 100) / 100
        };
    }

    /**
     * Get productivity trends over time
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} Productivity trends
     */
    async getProductivityTrends(options = {}) {
        try {
            const { granularity = 'week', limit = 12 } = options;

            const allSessions = await sessionRepository.getAll();
            const sessions = allSessions.slice(-limit * 7); // Rough estimate

            const trends = [];
            const groupedSessions = this._groupSessionsByTime(sessions, granularity);

            for (const [period, periodSessions] of Object.entries(groupedSessions)) {
                const sessionIds = periodSessions.map(s => s.id);
                const insightsStats = await this._getInsightsStats(sessionIds);

                trends.push({
                    period,
                    sessionCount: periodSessions.length,
                    totalDuration: periodSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
                    totalInsights: insightsStats.total,
                    avgInsightsPerSession: periodSessions.length > 0 ? insightsStats.total / periodSessions.length : 0
                });
            }

            return trends.sort((a, b) => a.period.localeCompare(b.period));
        } catch (error) {
            console.error('[AnalyticsService] Error getting productivity trends:', error);
            throw error;
        }
    }

    /**
     * Group sessions by time period
     * @private
     */
    _groupSessionsByTime(sessions, granularity) {
        const grouped = {};

        sessions.forEach(session => {
            const date = new Date(session.created_at);
            let key;

            if (granularity === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (granularity === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else if (granularity === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(session);
        });

        return grouped;
    }

    /**
     * Compare two sessions
     * @param {string} sessionId1 - First session ID
     * @param {string} sessionId2 - Second session ID
     * @returns {Promise<Object>} Comparison results
     */
    async compareSessions(sessionId1, sessionId2) {
        try {
            const analytics1 = await this.getSessionAnalytics(sessionId1);
            const analytics2 = await this.getSessionAnalytics(sessionId2);

            return {
                session1: analytics1,
                session2: analytics2,
                comparison: {
                    durationDiff: analytics1.metrics.duration - analytics2.metrics.duration,
                    insightsDiff: analytics1.metrics.totalInsights - analytics2.metrics.totalInsights,
                    engagementDiff: analytics1.engagement.score - analytics2.engagement.score
                }
            };
        } catch (error) {
            console.error('[AnalyticsService] Error comparing sessions:', error);
            throw error;
        }
    }
}

// Export singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService;
