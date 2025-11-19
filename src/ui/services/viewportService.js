/**
 * Viewport Service
 *
 * Manages viewport size detection and responsive breakpoints
 * - Mobile/Tablet/Desktop detection
 * - Breakpoint listeners
 * - Touch capability detection
 * - Orientation change detection
 */

class ViewportService {
    constructor(customBreakpoints = {}) {
        // Default breakpoints (can be overridden)
        const defaultBreakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1280,
        };

        // Merge custom breakpoints with defaults
        this.breakpoints = {
            ...defaultBreakpoints,
            ...customBreakpoints,
        };

        this.listeners = new Set();
        this.mediaQueryListeners = []; // Store media query listeners for cleanup
        this.currentBreakpoint = this._getCurrentBreakpoint();
        this.isTouchDevice = this._detectTouch();
        this.orientation = this._getOrientation();

        this._init();
    }

    /**
     * Update breakpoints dynamically
     * @param {Object} newBreakpoints - New breakpoint values
     */
    setBreakpoints(newBreakpoints) {
        this.breakpoints = {
            ...this.breakpoints,
            ...newBreakpoints,
        };

        // Re-setup media query listeners with new breakpoints
        this._setupMediaQueryListeners();

        // Update current breakpoint
        const oldBreakpoint = this.currentBreakpoint;
        this.currentBreakpoint = this._getCurrentBreakpoint();

        if (oldBreakpoint !== this.currentBreakpoint) {
            this._notifyListeners({
                breakpoint: this.currentBreakpoint,
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
    }

    /**
     * Initialize viewport service
     * @private
     */
    _init() {
        // Listen to window resize
        window.addEventListener('resize', this._handleResize.bind(this));

        // Listen to orientation change
        window.addEventListener('orientationchange', this._handleOrientationChange.bind(this));

        // Listen to media query changes for better performance
        this._setupMediaQueryListeners();
    }

    /**
     * Set up media query listeners for each breakpoint
     * @private
     */
    _setupMediaQueryListeners() {
        // Clean up existing listeners
        this.mediaQueryListeners.forEach(({ query, handler }) => {
            query.removeEventListener('change', handler);
        });
        this.mediaQueryListeners = [];

        // Mobile breakpoint
        const mobileQuery = window.matchMedia(`(max-width: ${this.breakpoints.mobile - 1}px)`);
        const mobileHandler = (e) => {
            if (e.matches) {
                this._updateBreakpoint('mobile');
            }
        };
        mobileQuery.addEventListener('change', mobileHandler);
        this.mediaQueryListeners.push({ query: mobileQuery, handler: mobileHandler });

        // Tablet breakpoint
        const tabletQuery = window.matchMedia(
            `(min-width: ${this.breakpoints.mobile}px) and (max-width: ${this.breakpoints.tablet - 1}px)`
        );
        const tabletHandler = (e) => {
            if (e.matches) {
                this._updateBreakpoint('tablet');
            }
        };
        tabletQuery.addEventListener('change', tabletHandler);
        this.mediaQueryListeners.push({ query: tabletQuery, handler: tabletHandler });

        // Desktop breakpoint
        const desktopQuery = window.matchMedia(`(min-width: ${this.breakpoints.desktop}px)`);
        const desktopHandler = (e) => {
            if (e.matches) {
                this._updateBreakpoint('desktop');
            }
        };
        desktopQuery.addEventListener('change', desktopHandler);
        this.mediaQueryListeners.push({ query: desktopQuery, handler: desktopHandler });
    }

    /**
     * Handle window resize
     * @private
     */
    _handleResize() {
        const newBreakpoint = this._getCurrentBreakpoint();
        if (newBreakpoint !== this.currentBreakpoint) {
            this._updateBreakpoint(newBreakpoint);
        }
    }

    /**
     * Handle orientation change
     * @private
     */
    _handleOrientationChange() {
        const newOrientation = this._getOrientation();
        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            this._notifyListeners();
        }
    }

    /**
     * Update current breakpoint
     * @private
     */
    _updateBreakpoint(breakpoint) {
        this.currentBreakpoint = breakpoint;
        this._notifyListeners();
    }

    /**
     * Get current breakpoint based on window width
     * @private
     */
    _getCurrentBreakpoint() {
        const width = window.innerWidth;

        if (width < this.breakpoints.mobile) {
            return 'mobile';
        } else if (width < this.breakpoints.tablet) {
            return 'tablet';
        } else if (width < this.breakpoints.desktop) {
            return 'desktop';
        } else {
            return 'wide';
        }
    }

    /**
     * Detect if device has touch capability
     * @private
     */
    _detectTouch() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    /**
     * Get current orientation
     * @private
     */
    _getOrientation() {
        if (window.innerHeight > window.innerWidth) {
            return 'portrait';
        }
        return 'landscape';
    }

    /**
     * Check if current viewport is mobile
     * @returns {boolean}
     */
    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }

    /**
     * Check if current viewport is tablet
     * @returns {boolean}
     */
    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }

    /**
     * Check if current viewport is desktop
     * @returns {boolean}
     */
    isDesktop() {
        return this.currentBreakpoint === 'desktop' || this.currentBreakpoint === 'wide';
    }

    /**
     * Check if current viewport is mobile or tablet
     * @returns {boolean}
     */
    isMobileOrTablet() {
        return this.isMobile() || this.isTablet();
    }

    /**
     * Check if device has touch capability
     * @returns {boolean}
     */
    hasTouch() {
        return this.isTouchDevice;
    }

    /**
     * Check if orientation is portrait
     * @returns {boolean}
     */
    isPortrait() {
        return this.orientation === 'portrait';
    }

    /**
     * Check if orientation is landscape
     * @returns {boolean}
     */
    isLandscape() {
        return this.orientation === 'landscape';
    }

    /**
     * Get window dimensions
     * @returns {Object} { width, height }
     */
    getDimensions() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    /**
     * Get current breakpoint
     * @returns {string} 'mobile' | 'tablet' | 'desktop' | 'wide'
     */
    getBreakpoint() {
        return this.currentBreakpoint;
    }

    /**
     * Subscribe to viewport changes
     * @param {Function} callback - Called when viewport changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);

        // Call immediately with current state
        callback({
            breakpoint: this.currentBreakpoint,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            hasTouch: this.isTouchDevice,
            orientation: this.orientation,
            dimensions: this.getDimensions(),
        });

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Notify all listeners of viewport change
     * @private
     */
    _notifyListeners() {
        const state = {
            breakpoint: this.currentBreakpoint,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            hasTouch: this.isTouchDevice,
            orientation: this.orientation,
            dimensions: this.getDimensions(),
        };

        this.listeners.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('[ViewportService] Error in listener:', error);
            }
        });
    }

    /**
     * Add CSS classes to document based on viewport
     */
    updateDocumentClasses() {
        const root = document.documentElement;

        // Remove all breakpoint classes
        root.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop', 'viewport-wide');
        root.classList.remove('viewport-touch', 'viewport-no-touch');
        root.classList.remove('orientation-portrait', 'orientation-landscape');

        // Add current breakpoint class
        root.classList.add(`viewport-${this.currentBreakpoint}`);

        // Add touch class
        if (this.isTouchDevice) {
            root.classList.add('viewport-touch');
        } else {
            root.classList.add('viewport-no-touch');
        }

        // Add orientation class
        root.classList.add(`orientation-${this.orientation}`);
    }
}

// Export singleton instance
export const viewportService = new ViewportService();

// Update document classes initially and on changes
viewportService.updateDocumentClasses();
viewportService.subscribe(() => {
    viewportService.updateDocumentClasses();
});
