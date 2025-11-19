import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';

/**
 * ClaudeLayout - 3-column layout for Claude-style UI
 *
 * Layout structure:
 * ┌──────────┬────────────────┬──────────────┐
 * │ Sidebar  │  Main Content  │  Artifacts   │
 * │ (260px)  │   (flexible)   │   (40-60%)   │
 * └──────────┴────────────────┴──────────────┘
 *
 * Features:
 * - Collapsible sidebar
 * - Contextual artifacts panel
 * - Smooth transitions
 * - Responsive breakpoints
 *
 * @example
 * <claude-layout
 *   ?sidebar-visible=${true}
 *   ?artifacts-visible=${false}
 * >
 *   <div slot="sidebar">Sidebar content</div>
 *   <div slot="main">Main content</div>
 *   <div slot="artifacts">Artifacts content</div>
 * </claude-layout>
 */
export class ClaudeLayout extends LitElement {
    static properties = {
        sidebarVisible: { type: Boolean, reflect: true, attribute: 'sidebar-visible' },
        artifactsVisible: { type: Boolean, reflect: true, attribute: 'artifacts-visible' },
        artifactsWidth: { type: String }, // '40%' | '50%' | '60%'
        sidebarCollapsed: { type: Boolean, state: true },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .layout-container {
            display: grid;
            width: 100%;
            height: 100%;
            background: var(--claude-bg-primary, #F5F5F0);
            transition: grid-template-columns var(--claude-transition-slow, 300ms) var(--claude-easing-smooth, ease);
        }

        /* Grid template dynamically adjusts based on visible panels */
        .layout-container.sidebar-visible.artifacts-visible {
            grid-template-columns: var(--claude-sidebar-width, 260px) 1fr var(--artifacts-width, 40%);
        }

        .layout-container.sidebar-visible:not(.artifacts-visible) {
            grid-template-columns: var(--claude-sidebar-width, 260px) 1fr 0px;
        }

        .layout-container:not(.sidebar-visible).artifacts-visible {
            grid-template-columns: 0px 1fr var(--artifacts-width, 40%);
        }

        .layout-container:not(.sidebar-visible):not(.artifacts-visible) {
            grid-template-columns: 0px 1fr 0px;
        }

        /* Sidebar */
        .sidebar {
            background: var(--claude-sidebar-bg, #FFFFFF);
            border-right: 1px solid var(--claude-sidebar-border, #e5e5e0);
            overflow: hidden;
            transition: transform var(--claude-transition-slow, 300ms) var(--claude-easing-smooth, ease),
                        opacity var(--claude-transition-base, 200ms) var(--claude-easing-smooth, ease);
            position: relative;
            z-index: var(--claude-z-sidebar, 100);
        }

        .sidebar.hidden {
            transform: translateX(-100%);
            opacity: 0;
        }

        .sidebar-content {
            width: var(--claude-sidebar-width, 260px);
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }

        /* Main content area */
        .main {
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            padding: 0;
        }

        .main-content {
            width: 100%;
            max-width: var(--claude-chat-max-width, 800px);
            padding: var(--claude-chat-padding, 24px);
            box-sizing: border-box;
        }

        /* Artifacts panel */
        .artifacts {
            background: var(--claude-artifacts-bg, #FFFFFF);
            border-left: 1px solid var(--claude-artifacts-border, #e5e5e0);
            overflow: hidden;
            transition: transform var(--claude-transition-slow, 300ms) var(--claude-easing-smooth, ease),
                        opacity var(--claude-transition-base, 200ms) var(--claude-easing-smooth, ease);
            position: relative;
            z-index: var(--claude-z-artifacts, 400);
        }

        .artifacts.hidden {
            transform: translateX(100%);
            opacity: 0;
        }

        .artifacts-content {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }

        /* Scrollbar styling */
        .sidebar-content::-webkit-scrollbar,
        .main::-webkit-scrollbar,
        .artifacts-content::-webkit-scrollbar {
            width: var(--claude-scrollbar-width, 6px);
        }

        .sidebar-content::-webkit-scrollbar-track,
        .main::-webkit-scrollbar-track,
        .artifacts-content::-webkit-scrollbar-track {
            background: var(--claude-scrollbar-track, transparent);
        }

        .sidebar-content::-webkit-scrollbar-thumb,
        .main::-webkit-scrollbar-thumb,
        .artifacts-content::-webkit-scrollbar-thumb {
            background: var(--claude-scrollbar-thumb, #d4d4cf);
            border-radius: 10px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover,
        .main::-webkit-scrollbar-thumb:hover,
        .artifacts-content::-webkit-scrollbar-thumb:hover {
            background: var(--claude-scrollbar-thumb-hover, #a3a3a0);
        }

        /* Responsive breakpoints */
        @media (max-width: 1024px) {
            .layout-container.sidebar-visible.artifacts-visible {
                grid-template-columns: 240px 1fr 50%;
            }

            .layout-container.sidebar-visible:not(.artifacts-visible) {
                grid-template-columns: 240px 1fr 0px;
            }

            .sidebar-content {
                width: 240px;
            }
        }

        @media (max-width: 768px) {
            /* On mobile, sidebar and artifacts become overlays */
            .layout-container {
                grid-template-columns: 1fr !important;
                position: relative;
            }

            .sidebar,
            .artifacts {
                position: absolute;
                top: 0;
                bottom: 0;
                z-index: 1000;
                box-shadow: var(--claude-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.15));
            }

            .sidebar {
                left: 0;
                width: 80%;
                max-width: 300px;
            }

            .artifacts {
                right: 0;
                width: 90%;
                max-width: 500px;
            }

            .main-content {
                padding: var(--claude-chat-padding, 16px);
            }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            .layout-container,
            .sidebar,
            .artifacts {
                transition: none;
            }
        }

        /* Overlay for mobile when sidebar/artifacts are open */
        .overlay {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            cursor: pointer;
        }

        @media (max-width: 768px) {
            .overlay.visible {
                display: block;
            }
        }
    `;

    constructor() {
        super();
        this.sidebarVisible = true;
        this.artifactsVisible = false;
        this.artifactsWidth = '40%';
        this.sidebarCollapsed = false;
    }

    firstUpdated() {
        // Apply default sidebar visibility based on screen size
        this._updateResponsiveState();
        window.addEventListener('resize', () => this._updateResponsiveState());
    }

    _updateResponsiveState() {
        const isMobile = window.innerWidth < 768;
        if (isMobile && !this.hasAttribute('sidebar-mobile-override')) {
            // On mobile, hide sidebar by default unless overridden
            this.sidebarCollapsed = true;
        }
    }

    toggleSidebar() {
        this.sidebarVisible = !this.sidebarVisible;

        this.dispatchEvent(new CustomEvent('sidebar-toggled', {
            detail: { visible: this.sidebarVisible },
            bubbles: true,
            composed: true
        }));
    }

    toggleArtifacts() {
        this.artifactsVisible = !this.artifactsVisible;

        this.dispatchEvent(new CustomEvent('artifacts-toggled', {
            detail: { visible: this.artifactsVisible },
            bubbles: true,
            composed: true
        }));
    }

    showArtifacts() {
        this.artifactsVisible = true;
    }

    hideArtifacts() {
        this.artifactsVisible = false;
    }

    _handleOverlayClick() {
        // Close sidebar and artifacts on overlay click (mobile)
        this.sidebarVisible = false;
        this.artifactsVisible = false;
    }

    render() {
        const containerClasses = [
            'layout-container',
            this.sidebarVisible ? 'sidebar-visible' : '',
            this.artifactsVisible ? 'artifacts-visible' : ''
        ].filter(Boolean).join(' ');

        const showOverlay = (this.sidebarVisible || this.artifactsVisible) &&
                            window.innerWidth < 768;

        return html`
            <div class="${containerClasses}" style="--artifacts-width: ${this.artifactsWidth}">
                <!-- Sidebar -->
                <aside class="sidebar ${!this.sidebarVisible ? 'hidden' : ''}">
                    <div class="sidebar-content">
                        <slot name="sidebar"></slot>
                    </div>
                </aside>

                <!-- Main content -->
                <main class="main">
                    <div class="main-content">
                        <slot name="main"></slot>
                    </div>
                </main>

                <!-- Artifacts panel -->
                <aside class="artifacts ${!this.artifactsVisible ? 'hidden' : ''}">
                    <div class="artifacts-content">
                        <slot name="artifacts"></slot>
                    </div>
                </aside>

                <!-- Overlay for mobile -->
                ${showOverlay ? html`
                    <div class="overlay visible" @click="${this._handleOverlayClick}"></div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('claude-layout', ClaudeLayout);
