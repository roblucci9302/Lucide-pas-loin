/**
 * Performance Utilities
 *
 * Performance monitoring and optimization utilities
 */

/**
 * Debounce function - Limits the rate at which a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - Ensures a function is called at most once in a specified time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * RequestAnimationFrame throttle - Throttle using RAF for smooth animations
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF-throttled function
 */
export function rafThrottle(func) {
    let rafId = null;
    return function executedFunction(...args) {
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                func(...args);
                rafId = null;
            });
        }
    };
}

/**
 * Lazy load images
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source
 */
export function lazyLoadImage(img, src) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                img.src = src;
                observer.unobserve(img);
            }
        });
    });

    observer.observe(img);
}

/**
 * Measure performance of a function
 * @param {Function} func - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {*} Function result
 */
export async function measurePerformance(func, label) {
    const startTime = performance.now();
    const result = await func();
    const endTime = performance.now();

    console.log(`[Performance] ${label}: ${(endTime - startTime).toFixed(2)}ms`);

    return result;
}

/**
 * Create a performance mark
 * @param {string} name - Mark name
 */
export function mark(name) {
    if (performance && performance.mark) {
        performance.mark(name);
    }
}

/**
 * Measure time between two marks
 * @param {string} name - Measure name
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 */
export function measure(name, startMark, endMark) {
    if (performance && performance.measure) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        } catch (error) {
            console.warn(`[Performance] Could not measure ${name}:`, error);
        }
    }
}

/**
 * Batch DOM updates using DocumentFragment
 * @param {HTMLElement} container - Container element
 * @param {Array} elements - Elements to append
 */
export function batchDOMUpdates(container, elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach(el => fragment.appendChild(el));
    container.appendChild(fragment);
}

/**
 * Virtual scrolling helper - Calculate visible items
 * @param {Object} config - Configuration
 * @returns {Object} Visible range
 */
export function calculateVisibleRange(config) {
    const {
        scrollTop,
        containerHeight,
        itemHeight,
        totalItems,
        overscan = 3,
    } = config;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        totalItems - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
}

/**
 * Memoize function results with configurable cache limit
 * @param {Function} func - Function to memoize
 * @param {Object} options - Configuration options
 * @param {number} options.maxSize - Maximum cache size (default: 100)
 * @returns {Function} Memoized function
 */
export function memoize(func, options = {}) {
    const { maxSize = 100 } = options;
    const cache = new Map();

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            // Move to end (LRU strategy)
            const value = cache.get(key);
            cache.delete(key);
            cache.set(key, value);
            return value;
        }

        const result = func(...args);
        cache.set(key, result);

        // Limit cache size using FIFO eviction to prevent memory leaks
        if (cache.size > maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    };
}

/**
 * Defer non-critical tasks
 * @param {Function} func - Function to defer
 * @param {number} priority - Priority (lower = higher priority)
 */
export function defer(func, priority = 0) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => func(), { timeout: 1000 + priority * 100 });
    } else {
        setTimeout(func, priority * 100);
    }
}

/**
 * Preload resources
 * @param {string} url - Resource URL
 * @param {string} as - Resource type (image, script, style, etc.)
 */
export function preload(url, as) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Monitor FPS
 * @param {Function} callback - Callback with FPS value
 */
export function monitorFPS(callback) {
    let lastTime = performance.now();
    let frames = 0;

    function tick() {
        frames++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime));
            callback(fps);

            lastTime = currentTime;
            frames = 0;
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics
 */
export function getPerformanceMetrics() {
    if (!performance || !performance.timing) {
        return null;
    }

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
        // Page load times
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,

        // Network times
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,

        // Render times
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,

        // Navigation timing (if available)
        ...(navigation && {
            redirectTime: navigation.redirectEnd - navigation.redirectStart,
            fetchTime: navigation.responseEnd - navigation.fetchStart,
        }),
    };
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics() {
    const metrics = getPerformanceMetrics();

    if (metrics) {
        console.table(metrics);
    }
}

/**
 * Check if browser supports a feature
 * @param {string} feature - Feature to check
 * @returns {boolean}
 */
export function supportsFeature(feature) {
    const features = {
        webp: () => {
            const canvas = document.createElement('canvas');
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        },
        localStorage: () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        serviceWorker: () => 'serviceWorker' in navigator,
        intersectionObserver: () => 'IntersectionObserver' in window,
        resizeObserver: () => 'ResizeObserver' in window,
    };

    return features[feature] ? features[feature]() : false;
}
