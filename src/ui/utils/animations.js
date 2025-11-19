/**
 * Animation Utilities
 *
 * Reusable animation definitions and helpers for consistent animations
 * across the application.
 */

/**
 * CSS Keyframes for common animations
 */
export const animations = {
    // Fade in
    fadeIn: `
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `,

    // Fade in up
    fadeInUp: `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `,

    // Fade in down
    fadeInDown: `
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `,

    // Scale in
    scaleIn: `
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `,

    // Slide in from right
    slideInRight: `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `,

    // Slide in from left
    slideInLeft: `
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `,

    // Bounce
    bounce: `
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
    `,

    // Pulse
    pulse: `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
    `,

    // Shimmer (for loading states)
    shimmer: `
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `,

    // Spin
    spin: `
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `,

    // Shake
    shake: `
        @keyframes shake {
            0%, 100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-10px);
            }
            75% {
                transform: translateX(10px);
            }
        }
    `,
};

/**
 * Animation duration presets
 */
export const durations = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
};

/**
 * Easing functions
 */
export const easings = {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Apply animation to an element
 * @param {HTMLElement} element - Element to animate
 * @param {string} animation - Animation name
 * @param {Object} options - Animation options
 */
export function animate(element, animation, options = {}) {
    const {
        duration = durations.base,
        easing = easings.smooth,
        delay = '0ms',
        fillMode = 'both',
    } = options;

    element.style.animation = `${animation} ${duration} ${easing} ${delay} ${fillMode}`;

    return new Promise(resolve => {
        const handleAnimationEnd = () => {
            element.removeEventListener('animationend', handleAnimationEnd);
            resolve();
        };
        element.addEventListener('animationend', handleAnimationEnd);
    });
}

/**
 * Add entrance animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {string} type - Animation type (fadeIn, slideInUp, etc.)
 */
export function animateEntrance(element, type = 'fadeInUp') {
    return animate(element, type, {
        duration: durations.slow,
        easing: easings.smooth,
    });
}

/**
 * Add exit animation to element
 * @param {HTMLElement} element - Element to animate
 */
export function animateExit(element) {
    element.style.animation = `fadeOut ${durations.base} ${easings.smooth} forwards`;

    return new Promise(resolve => {
        const handleAnimationEnd = () => {
            element.removeEventListener('animationend', handleAnimationEnd);
            resolve();
        };
        element.addEventListener('animationend', handleAnimationEnd);
    });
}

/**
 * Stagger animations for multiple elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {string} animation - Animation name
 * @param {number} staggerDelay - Delay between each element (ms)
 */
export function staggerAnimate(elements, animation, staggerDelay = 50) {
    return Promise.all(
        Array.from(elements).map((element, index) => {
            return animate(element, animation, {
                delay: `${index * staggerDelay}ms`,
                duration: durations.slow,
            });
        })
    );
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Conditionally animate based on user preferences
 * @param {HTMLElement} element - Element to animate
 * @param {string} animation - Animation name
 * @param {Object} options - Animation options
 */
export function safeAnimate(element, animation, options = {}) {
    if (prefersReducedMotion()) {
        return Promise.resolve();
    }
    return animate(element, animation, options);
}

/**
 * Create intersection observer for scroll animations
 * @param {Function} callback - Callback when element enters viewport
 * @param {Object} options - IntersectionObserver options
 */
export function createScrollAnimationObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    };

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
            }
        });
    }, { ...defaultOptions, ...options });
}

/**
 * Auto-animate element on scroll into view
 * @param {HTMLElement} element - Element to animate
 * @param {string} animation - Animation to apply
 */
export function animateOnScroll(element, animation = 'fadeInUp') {
    if (prefersReducedMotion()) {
        return;
    }

    const observer = createScrollAnimationObserver((target) => {
        animate(target, animation, {
            duration: durations.slow,
            easing: easings.smooth,
        });
        observer.unobserve(target);
    });

    observer.observe(element);
}
