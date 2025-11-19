import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { notificationService } from '../../services/notificationService.js';
import '../base/ClaudeButton.js';

/**
 * NotificationSettings - Component for managing notification preferences
 *
 * Features:
 * - Enable/disable notifications globally
 * - Toggle specific notification types
 * - Add/remove notification keywords
 * - Test notification button
 *
 * @example
 * <notification-settings
 *   .settings=${this.notificationSettings}
 *   @settings-changed=${this.handleSettingsChanged}
 * ></notification-settings>
 */
export class NotificationSettings extends LitElement {
    static properties = {
        settings: { type: Object },
        _newKeyword: { type: String, state: true },
    };

    static styles = css`
        :host {
            display: block;
        }

        /* Section Container */
        .settings-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .section-title {
            font-size: var(--claude-font-size-lg, 18px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 4px;
        }

        .section-description {
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-text-secondary, #6b6b6b);
            margin-bottom: 12px;
        }

        /* Toggle Option */
        .toggle-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 12px;
            transition: background var(--claude-transition-fast, 150ms) ease;
        }

        .toggle-option:hover {
            background: var(--claude-border-subtle, #e5e5e0);
        }

        .toggle-option.disabled {
            opacity: 0.5;
            pointer-events: none;
        }

        .toggle-label-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        }

        .toggle-label {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .toggle-description {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .toggle-icon {
            font-size: 18px;
        }

        /* Toggle Switch */
        .toggle-switch {
            position: relative;
            width: 48px;
            height: 28px;
            flex-shrink: 0;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--claude-border-normal, #d4d4cf);
            border-radius: 28px;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .toggle-slider::before {
            content: '';
            position: absolute;
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background: white;
            border-radius: 50%;
            transition: all var(--claude-transition-fast, 150ms) ease;
        }

        .toggle-switch input:checked + .toggle-slider {
            background: var(--claude-accent-orange, #D97706);
        }

        .toggle-switch input:checked + .toggle-slider::before {
            transform: translateX(20px);
        }

        .toggle-switch:hover .toggle-slider {
            opacity: 0.9;
        }

        /* Keywords Section */
        .keywords-section {
            margin-top: 8px;
        }

        .keywords-header {
            font-size: var(--claude-font-size-sm, 13px);
            font-weight: 600;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 8px;
        }

        .keyword-input-container {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        .keyword-input {
            flex: 1;
            padding: 8px 12px;
            font-size: var(--claude-font-size-sm, 13px);
            border: 2px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            outline: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
            color: var(--claude-text-primary, #1a1a1a);
            background: var(--claude-bg-secondary, #FFFFFF);
        }

        .keyword-input:focus {
            border-color: var(--claude-accent-orange, #D97706);
        }

        .keyword-input::placeholder {
            color: var(--claude-text-tertiary, #9b9b9b);
        }

        .keywords-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .keyword-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--claude-accent-orange-subtle, #FEF3C7);
            border: 1px solid var(--claude-accent-orange, #D97706);
            border-radius: 16px;
            font-size: var(--claude-font-size-sm, 13px);
            color: var(--claude-accent-orange-dark, #B45309);
            font-weight: 500;
        }

        .keyword-remove {
            background: transparent;
            border: none;
            color: var(--claude-accent-orange-dark, #B45309);
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

        .keyword-remove:hover {
            background: rgba(0, 0, 0, 0.1);
        }

        .empty-keywords {
            text-align: center;
            padding: 16px;
            color: var(--claude-text-tertiary, #9b9b9b);
            font-size: var(--claude-font-size-xs, 12px);
            background: var(--claude-bg-tertiary, #FAFAF8);
            border-radius: 8px;
        }

        /* Test Button */
        .test-section {
            padding-top: 8px;
            border-top: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        /* Mobile */
        @media (max-width: 768px) {
            .toggle-option {
                padding: 12px;
            }

            .keyword-input-container {
                flex-direction: column;
            }
        }
    `;

    constructor() {
        super();
        this.settings = {
            enabled: true,
            streamingComplete: true,
            newMessage: false,
            mentions: true,
            errors: true,
            keywords: [],
        };
        this._newKeyword = '';
    }

    _handleToggleChange(field, event) {
        const newSettings = {
            ...this.settings,
            [field]: event.target.checked,
        };

        this._dispatchChange(newSettings);
    }

    _handleAddKeyword() {
        const keyword = this._newKeyword.trim();
        if (!keyword || this.settings.keywords.includes(keyword)) {
            return;
        }

        const newSettings = {
            ...this.settings,
            keywords: [...this.settings.keywords, keyword],
        };

        this._newKeyword = '';
        this._dispatchChange(newSettings);
    }

    _handleRemoveKeyword(keyword) {
        const newSettings = {
            ...this.settings,
            keywords: this.settings.keywords.filter(k => k !== keyword),
        };

        this._dispatchChange(newSettings);
    }

    _handleKeywordInputKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this._handleAddKeyword();
        }
    }

    _handleTestNotification() {
        notificationService.sendTestNotification();
    }

    _dispatchChange(newSettings) {
        this.dispatchEvent(new CustomEvent('settings-changed', {
            detail: { notifications: newSettings },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        const isEnabled = this.settings.enabled;

        return html`
            <div class="settings-section">
                <div class="section-title">🔔 Notifications</div>
                <div class="section-description">
                    Configurez les notifications de bureau pour rester informé des événements importants
                </div>

                <!-- Global Enable/Disable -->
                <div class="toggle-option">
                    <div class="toggle-label-container">
                        <div class="toggle-label">
                            <span class="toggle-icon">🔔</span>
                            <span>Activer les notifications</span>
                        </div>
                        <div class="toggle-description">
                            Activer ou désactiver toutes les notifications de bureau
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            .checked=${this.settings.enabled}
                            @change=${(e) => this._handleToggleChange('enabled', e)}
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Streaming Complete -->
                <div class="toggle-option ${!isEnabled ? 'disabled' : ''}">
                    <div class="toggle-label-container">
                        <div class="toggle-label">
                            <span class="toggle-icon">✨</span>
                            <span>Réponse terminée</span>
                        </div>
                        <div class="toggle-description">
                            Notifier quand Claude termine une réponse
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            .checked=${this.settings.streamingComplete}
                            @change=${(e) => this._handleToggleChange('streamingComplete', e)}
                            ?disabled=${!isEnabled}
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- New Message -->
                <div class="toggle-option ${!isEnabled ? 'disabled' : ''}">
                    <div class="toggle-label-container">
                        <div class="toggle-label">
                            <span class="toggle-icon">💬</span>
                            <span>Nouveau message</span>
                        </div>
                        <div class="toggle-description">
                            Notifier à la réception d'un nouveau message
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            .checked=${this.settings.newMessage}
                            @change=${(e) => this._handleToggleChange('newMessage', e)}
                            ?disabled=${!isEnabled}
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Mentions/Keywords -->
                <div class="toggle-option ${!isEnabled ? 'disabled' : ''}">
                    <div class="toggle-label-container">
                        <div class="toggle-label">
                            <span class="toggle-icon">🔍</span>
                            <span>Mots-clés détectés</span>
                        </div>
                        <div class="toggle-description">
                            Notifier quand des mots-clés spécifiques sont détectés
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            .checked=${this.settings.mentions}
                            @change=${(e) => this._handleToggleChange('mentions', e)}
                            ?disabled=${!isEnabled}
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Keywords -->
                ${this.settings.mentions && isEnabled ? html`
                    <div class="keywords-section">
                        <div class="keywords-header">Mots-clés à surveiller</div>
                        <div class="keyword-input-container">
                            <input
                                type="text"
                                class="keyword-input"
                                placeholder="Ajouter un mot-clé..."
                                .value=${this._newKeyword}
                                @input=${(e) => { this._newKeyword = e.target.value; }}
                                @keypress=${this._handleKeywordInputKeyPress}
                            />
                            <claude-button
                                variant="secondary"
                                @click=${this._handleAddKeyword}
                            >
                                Ajouter
                            </claude-button>
                        </div>
                        ${this.settings.keywords.length > 0 ? html`
                            <div class="keywords-list">
                                ${this.settings.keywords.map(keyword => html`
                                    <div class="keyword-chip">
                                        <span>${keyword}</span>
                                        <button
                                            class="keyword-remove"
                                            @click=${() => this._handleRemoveKeyword(keyword)}
                                            title="Supprimer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                `)}
                            </div>
                        ` : html`
                            <div class="empty-keywords">
                                Aucun mot-clé configuré
                            </div>
                        `}
                    </div>
                ` : ''}

                <!-- Errors -->
                <div class="toggle-option ${!isEnabled ? 'disabled' : ''}">
                    <div class="toggle-label-container">
                        <div class="toggle-label">
                            <span class="toggle-icon">❌</span>
                            <span>Erreurs</span>
                        </div>
                        <div class="toggle-description">
                            Notifier en cas d'erreur
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            .checked=${this.settings.errors}
                            @change=${(e) => this._handleToggleChange('errors', e)}
                            ?disabled=${!isEnabled}
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Test Notification -->
                <div class="test-section">
                    <claude-button
                        variant="secondary"
                        icon="🔔"
                        @click=${this._handleTestNotification}
                        ?disabled=${!isEnabled}
                    >
                        Tester les notifications
                    </claude-button>
                </div>
            </div>
        `;
    }
}

customElements.define('notification-settings', NotificationSettings);
