import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { commandRegistryService } from '../../services/commandRegistryService.js';

/**
 * CommandPalette - Command palette for quick actions
 *
 * Features:
 * - Fuzzy search for commands
 * - Keyboard navigation (arrows, enter, escape)
 * - Command categories and icons
 * - Keyboard shortcuts display
 * - Recent commands when no query
 * - Beautiful modal interface
 *
 * @example
 * <command-palette
 *   ?open=${this.paletteOpen}
 *   @close=${this.handleClose}
 *   @execute=${this.handleExecute}
 * ></command-palette>
 */
export class CommandPalette extends LitElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        _query: { type: String, state: true },
        _commands: { type: Array, state: true },
        _selectedIndex: { type: Number, state: true },
    };

    static styles = css`
        :host {
            display: none;
            position: fixed;
            inset: 0;
            z-index: var(--claude-z-modal, 1000);
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
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
            animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Palette */
        .palette {
            position: relative;
            background: var(--claude-bg-secondary, #FFFFFF);
            border-radius: 12px;
            box-shadow: var(--claude-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.15));
            width: 90%;
            max-width: 600px;
            max-height: 60vh;
            overflow: hidden;
            animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* Search Input */
        .search-container {
            padding: 16px;
            border-bottom: 1px solid var(--claude-border-subtle, #e5e5e0);
        }

        .search-input {
            width: 100%;
            padding: 12px 16px 12px 48px;
            font-size: var(--claude-font-size-base, 16px);
            border: 2px solid var(--claude-border-normal, #d4d4cf);
            border-radius: 8px;
            outline: none;
            transition: all var(--claude-transition-fast, 150ms) ease;
            background: var(--claude-bg-tertiary, #FAFAF8);
            color: var(--claude-text-primary, #1a1a1a);
            font-family: var(--claude-font-family, system-ui);
        }

        .search-input:focus {
            border-color: var(--claude-accent-orange, #D97706);
            background: var(--claude-bg-secondary, #FFFFFF);
        }

        .search-icon {
            position: absolute;
            left: 32px;
            top: 29px;
            font-size: 18px;
            color: var(--claude-text-tertiary, #9b9b9b);
            pointer-events: none;
        }

        /* Commands List */
        .commands-container {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .commands-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        /* Command Item */
        .command-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all var(--claude-transition-fast, 150ms) ease;
            background: transparent;
            border: none;
            width: 100%;
            text-align: left;
        }

        .command-item:hover {
            background: var(--claude-hover-overlay, rgba(0, 0, 0, 0.04));
        }

        .command-item.selected {
            background: var(--claude-accent-orange-subtle, #FEF3C7);
        }

        .command-icon {
            font-size: 20px;
            flex-shrink: 0;
            width: 24px;
            text-align: center;
        }

        .command-content {
            flex: 1;
            min-width: 0;
        }

        .command-name {
            font-size: var(--claude-font-size-base, 16px);
            font-weight: 500;
            color: var(--claude-text-primary, #1a1a1a);
            margin-bottom: 2px;
        }

        .command-description {
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .command-shortcut {
            flex-shrink: 0;
            display: flex;
            gap: 4px;
            align-items: center;
        }

        .key {
            padding: 3px 6px;
            background: var(--claude-bg-tertiary, #FAFAF8);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 4px;
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: var(--claude-font-size-xs, 11px);
            color: var(--claude-text-secondary, #6b6b6b);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Empty State */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            color: var(--claude-text-tertiary, #9b9b9b);
            text-align: center;
        }

        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .empty-text {
            font-size: var(--claude-font-size-base, 16px);
        }

        /* Footer */
        .palette-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-top: 1px solid var(--claude-border-subtle, #e5e5e0);
            background: var(--claude-bg-tertiary, #FAFAF8);
        }

        .footer-hint {
            display: flex;
            gap: 16px;
            font-size: var(--claude-font-size-xs, 12px);
            color: var(--claude-text-secondary, #6b6b6b);
        }

        .hint-item {
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .hint-key {
            padding: 2px 6px;
            background: var(--claude-bg-secondary, #FFFFFF);
            border: 1px solid var(--claude-border-subtle, #e5e5e0);
            border-radius: 3px;
            font-family: var(--claude-font-family-mono, 'Monaco', monospace);
            font-size: 10px;
        }

        /* Scrollbar */
        .commands-container::-webkit-scrollbar {
            width: 6px;
        }

        .commands-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .commands-container::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .commands-container::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Mobile */
        @media (max-width: 768px) {
            :host {
                padding-top: 10vh;
            }

            .palette {
                width: 95%;
                max-height: 70vh;
            }

            .footer-hint {
                display: none;
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this._query = '';
        this._commands = [];
        this._selectedIndex = 0;
        this._keydownHandler = this._handleKeyDown.bind(this);
    }

    updated(changedProperties) {
        if (changedProperties.has('open')) {
            if (this.open) {
                this._onOpen();
            } else {
                this._onClose();
            }
        }

        if (changedProperties.has('_query')) {
            this._updateCommands();
        }
    }

    _onOpen() {
        // Reset state
        this._query = '';
        this._selectedIndex = 0;
        this._updateCommands();

        // Focus input after a brief delay for animation
        setTimeout(() => {
            const input = this.shadowRoot.querySelector('.search-input');
            if (input) {
                input.focus();
            }
        }, 100);

        // Add keyboard listener
        document.addEventListener('keydown', this._keydownHandler);
    }

    _onClose() {
        // Remove keyboard listener
        document.removeEventListener('keydown', this._keydownHandler);
    }

    _updateCommands() {
        this._commands = commandRegistryService.search(this._query);
        this._selectedIndex = 0;

        // Scroll selected item into view
        this._scrollSelectedIntoView();
    }

    _handleInputChange(e) {
        this._query = e.target.value;
    }

    _handleKeyDown(e) {
        if (!this.open) return;

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this._handleClose();
                break;

            case 'ArrowDown':
                e.preventDefault();
                this._selectNext();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this._selectPrevious();
                break;

            case 'Enter':
                e.preventDefault();
                this._executeSelected();
                break;

            default:
                break;
        }
    }

    _selectNext() {
        if (this._commands.length === 0) return;
        this._selectedIndex = (this._selectedIndex + 1) % this._commands.length;
        this._scrollSelectedIntoView();
    }

    _selectPrevious() {
        if (this._commands.length === 0) return;
        this._selectedIndex = (this._selectedIndex - 1 + this._commands.length) % this._commands.length;
        this._scrollSelectedIntoView();
    }

    _scrollSelectedIntoView() {
        // Wait for render
        setTimeout(() => {
            const selected = this.shadowRoot.querySelector('.command-item.selected');
            if (selected) {
                selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }, 0);
    }

    async _executeSelected() {
        if (this._commands.length === 0) return;

        const command = this._commands[this._selectedIndex];
        if (!command) return;

        // Close palette
        this._handleClose();

        // Dispatch execute event
        this.dispatchEvent(new CustomEvent('execute', {
            detail: { commandId: command.id },
            bubbles: true,
            composed: true
        }));
    }

    _handleCommandClick(command, index) {
        this._selectedIndex = index;
        this._executeSelected();
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

    _renderCommand(command, index) {
        const isSelected = index === this._selectedIndex;

        return html`
            <button
                class="command-item ${isSelected ? 'selected' : ''}"
                @click="${() => this._handleCommandClick(command, index)}"
                @mouseenter="${() => { this._selectedIndex = index; }}"
            >
                <div class="command-icon">${command.icon}</div>
                <div class="command-content">
                    <div class="command-name">${command.name}</div>
                    ${command.description ? html`
                        <div class="command-description">${command.description}</div>
                    ` : ''}
                </div>
                ${command.shortcut ? html`
                    <div class="command-shortcut">
                        ${commandRegistryService.formatShortcut(command.shortcut).split(/(?=[⌘⌃⌥⇧])|\+/).map(key => html`
                            <span class="key">${key}</span>
                        `)}
                    </div>
                ` : ''}
            </button>
        `;
    }

    render() {
        return html`
            <div class="overlay" @click="${this._handleOverlayClick}">
                <div class="palette" @click="${(e) => e.stopPropagation()}">
                    <!-- Search Input -->
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input
                            class="search-input"
                            type="text"
                            placeholder="Rechercher une commande..."
                            .value="${this._query}"
                            @input="${this._handleInputChange}"
                            autocomplete="off"
                            spellcheck="false"
                        />
                    </div>

                    <!-- Commands List -->
                    <div class="commands-container">
                        ${this._commands.length > 0 ? html`
                            <div class="commands-list">
                                ${this._commands.map((cmd, idx) => this._renderCommand(cmd, idx))}
                            </div>
                        ` : html`
                            <div class="empty-state">
                                <div class="empty-icon">🔍</div>
                                <div class="empty-text">
                                    ${this._query ? 'Aucune commande trouvée' : 'Tapez pour rechercher des commandes'}
                                </div>
                            </div>
                        `}
                    </div>

                    <!-- Footer -->
                    <div class="palette-footer">
                        <div class="footer-hint">
                            <div class="hint-item">
                                <span class="hint-key">↑↓</span>
                                <span>Naviguer</span>
                            </div>
                            <div class="hint-item">
                                <span class="hint-key">↵</span>
                                <span>Exécuter</span>
                            </div>
                            <div class="hint-item">
                                <span class="hint-key">Esc</span>
                                <span>Fermer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('command-palette', CommandPalette);
