import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { statisticsService } from '../../services/statisticsService.js';
import '../base/ClaudeButton.js';

/**
 * StatisticsPanel - Panel showing usage statistics and analytics
 *
 * Features:
 * - Overall statistics (conversations, messages, tokens)
 * - Activity timeline
 * - Hour/day distribution charts
 * - Top conversations
 * - Export statistics
 *
 * @example
 * <statistics-panel
 *   .conversations=${this.conversations}
 * ></statistics-panel>
 */
export class StatisticsPanel extends LitElement {
    static properties = {
        conversations: { type: Array },
        _stats: { type: Object, state: true },
        _timeline: { type: Array, state: true },
        _period: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
            padding: 24px;
            overflow-y: auto;
            max-height: 100%;
        }

        .stats-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 32px;
        }

        .title {
            font-size: var(--claude-font-size-2xl, 32px);
            font-weight: 700;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .subtitle {
            font-size: var(--claude-font-size-base, 16px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 12px;
            padding: 20px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--claude-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
        }

        .stat-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }

        .stat-value {
            font-size: var(--claude-font-size-2xl, 32px);
            font-weight: 700;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Section */
        .section {
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
        }

        /* Period Selector */
        .period-selector {
            display: flex;
            gap: 8px;
            border-radius: 8px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            padding: 4px;
        }

        .period-btn {
            padding: 6px 16px;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 500;
            color: var(--claude-text-secondary, #6b6b6b);
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .period-btn:hover {
            background: rgba(0, 0, 0, 0.04);
        }

        .period-btn.active {
            background: var(--claude-accent-orange, #D97706);
            color: white;
        }

        /* Simple Bar Chart */
        .chart {
            margin-top: 20px;
        }

        .chart-bars {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            height: 200px;
            padding: 8px 0;
        }

        .bar-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .bar {
            width: 100%;
            background: var(--claude-accent-orange, #D97706);
            border-radius: 4px 4px 0 0;
            transition: all var(--claude-transition-normal, 200ms) ease;
            position: relative;
            min-height: 4px;
        }

        .bar:hover {
            background: var(--claude-accent-orange-dark, #B45309);
            transform: scaleY(1.05);
        }

        .bar-value {
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: var(--claude-font-size-xs, 11px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
        }

        .bar-label {
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-secondary, #6b6b6b);
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }

        /* Top List */
        .top-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .top-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 8px;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .top-item:hover {
            background: var(--claude-border-subtle, #e5e5e0);
        }

        .top-rank {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 700;
            color: var(--claude-accent-orange, #D97706);
            min-width: 32px;
            text-align: center;
        }

        .top-content {
            flex: 1;
            min-width: 0;
        }

        .top-title {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .top-meta {
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .top-count {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-secondary, #6b6b6b);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 64px 24px;
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .empty-text {
            font-size: var(--claude-font-size-base, 16px);
        }

        /* Export Button */
        .export-section {
            display: flex;
            justify-content: center;
            margin-top: 32px;
        }

        /* Scrollbar */
        :host::-webkit-scrollbar {
            width: 8px;
        }

        :host::-webkit-scrollbar-track {
            background: transparent;
        }

        :host::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        :host::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Mobile */
        @media (max-width: 768px) {
            :host {
                padding: 16px;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .section {
                padding: 16px;
            }

            .chart-bars {
                height: 150px;
            }
        }
    `;

    constructor() {
        super();
        this.conversations = [];
        this._stats = null;
        this._timeline = [];
        this._period = 'week';
    }

    updated(changedProperties) {
        if (changedProperties.has('conversations')) {
            this._updateStatistics();
        }
    }

    _updateStatistics() {
        this._stats = statisticsService.getOverallStatistics(this.conversations);
        this._timeline = statisticsService.getActivityTimeline(this.conversations, this._period, 7);
    }

    _handlePeriodChange(period) {
        this._period = period;
        const count = period === 'day' ? 7 : period === 'week' ? 7 : 6;
        this._timeline = statisticsService.getActivityTimeline(this.conversations, period, count);
    }

    _handleExportStatistics() {
        try {
            const json = statisticsService.exportStatistics(this.conversations);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lucide-statistics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.dispatchEvent(new CustomEvent('export-success', {
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[StatisticsPanel] Export error:', error);
            this.dispatchEvent(new CustomEvent('export-error', {
                detail: { error },
                bubbles: true,
                composed: true
            }));
        }
    }

    _renderStatsCards() {
        if (!this._stats) return '';

        return html`
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💬</div>
                    <div class="stat-value">${this._stats.totalConversations}</div>
                    <div class="stat-label">Conversations</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📨</div>
                    <div class="stat-value">${statisticsService.formatNumber(this._stats.totalMessages)}</div>
                    <div class="stat-label">Messages</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🔤</div>
                    <div class="stat-value">${statisticsService.formatNumber(this._stats.estimatedTokens)}</div>
                    <div class="stat-label">Tokens estimés</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${this._stats.avgMessagesPerConversation}</div>
                    <div class="stat-label">Messages/Conv. (moy.)</div>
                </div>
            </div>
        `;
    }

    _renderTimeline() {
        if (!this._timeline || this._timeline.length === 0) return '';

        const maxMessages = Math.max(...this._timeline.map(d => d.messages), 1);

        return html`
            <div class="section">
                <div class="section-header">
                    <div class="section-title">📈 Activité</div>
                    <div class="period-selector">
                        <button
                            class="period-btn ${this._period === 'day' ? 'active' : ''}"
                            @click="${() => this._handlePeriodChange('day')}"
                        >
                            Jour
                        </button>
                        <button
                            class="period-btn ${this._period === 'week' ? 'active' : ''}"
                            @click="${() => this._handlePeriodChange('week')}"
                        >
                            Semaine
                        </button>
                        <button
                            class="period-btn ${this._period === 'month' ? 'active' : ''}"
                            @click="${() => this._handlePeriodChange('month')}"
                        >
                            Mois
                        </button>
                    </div>
                </div>

                <div class="chart">
                    <div class="chart-bars">
                        ${this._timeline.map(point => {
                            const height = (point.messages / maxMessages) * 100;
                            return html`
                                <div class="bar-container">
                                    <div
                                        class="bar"
                                        style="height: ${height}%"
                                        title="${point.messages} messages"
                                    >
                                        ${point.messages > 0 ? html`
                                            <div class="bar-value">${point.messages}</div>
                                        ` : ''}
                                    </div>
                                    <div class="bar-label">${point.label}</div>
                                </div>
                            `;
                        })}
                    </div>
                </div>
            </div>
        `;
    }

    _renderTopConversations() {
        const topConversations = statisticsService.getTopConversations(this.conversations, 5);

        if (topConversations.length === 0) return '';

        return html`
            <div class="section">
                <div class="section-header">
                    <div class="section-title">🏆 Top Conversations</div>
                </div>

                <div class="top-list">
                    ${topConversations.map((conv, index) => html`
                        <div class="top-item">
                            <div class="top-rank">#${index + 1}</div>
                            <div class="top-content">
                                <div class="top-title">${conv.title}</div>
                                <div class="top-meta">
                                    ${new Date(conv.created_at).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                            <div class="top-count">${conv.messageCount}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.conversations || this.conversations.length === 0) {
            return html`
                <div class="stats-container">
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <div class="empty-text">
                            Aucune donnée disponible.<br>
                            Commencez par créer des conversations !
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="stats-container">
                <div class="header">
                    <div class="title">
                        <span>📊</span>
                        <span>Statistiques & Analytiques</span>
                    </div>
                    <div class="subtitle">
                        Aperçu de votre utilisation de Lucide
                    </div>
                </div>

                ${this._renderStatsCards()}
                ${this._renderTimeline()}
                ${this._renderTopConversations()}

                <div class="export-section">
                    <claude-button
                        variant="secondary"
                        icon="📥"
                        @click="${this._handleExportStatistics}"
                    >
                        Exporter les statistiques (JSON)
                    </claude-button>
                </div>
            </div>
        `;
    }
}

customElements.define('statistics-panel', StatisticsPanel);
