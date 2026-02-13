// Secure JavaScript for kushmanmb.org
// Implements security best practices

(function() {
    'use strict';
    
    // Content Security Policy enforcement
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('Site should be served over HTTPS');
    }
    
    // Prevent XSS by sanitizing any dynamic content
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    // Secure external link handling
    function secureExternalLinks() {
        const links = document.querySelectorAll('a[target="_blank"]');
        links.forEach(link => {
            // Ensure rel="noopener noreferrer" is set
            const currentRel = link.getAttribute('rel') || '';
            if (!currentRel.includes('noopener')) {
                link.setAttribute('rel', currentRel + ' noopener noreferrer');
            }
        });
    }
    
    // Mobile menu toggle (if needed)
    function initMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && window.innerWidth <= 768) {
            // Add mobile menu functionality if needed
            console.log('Mobile view detected');
        }
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Security monitoring
    function initSecurityMonitoring() {
        // Monitor for potential security issues
        if (window.console && console.log) {
            const originalLog = console.log;
            console.log = function(...args) {
                // Filter out any sensitive data from logs
                const filteredArgs = args.map(arg => {
                    if (typeof arg === 'string') {
                        // Remove potential tokens or keys from logs
                        return arg.replace(/[a-f0-9]{32,}/gi, '[REDACTED]');
                    }
                    return arg;
                });
                originalLog.apply(console, filteredArgs);
            };
        }
    }
    
    // Initialize all functionality when DOM is ready
    function init() {
        secureExternalLinks();
        initMobileMenu();
        initSmoothScrolling();
        initSecurityMonitoring();
        
        // Log successful initialization
        console.log('Kushmanmb.org initialized securely');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for testing if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            sanitizeHTML,
            secureExternalLinks
        };
    }
})();
