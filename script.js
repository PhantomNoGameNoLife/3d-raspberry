// Bootstrap-Enhanced Raspberry Website - Optimized JavaScript

// Configuration
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 80,
    debounceDelay: 100,
    intersectionThreshold: 0.1
};

// State Management
const state = {
    currentFilter: 'all',
    isScrolling: false,
    animations: new Map(),
    isDarkMode: true // Default to dark mode
};

// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Theme Toggle Functions
const toggleTheme = () => {
    state.isDarkMode = !state.isDarkMode;
    const body = document.body;
    const themeIcon = $('#themeIcon');
    
    if (state.isDarkMode) {
        body.classList.remove('light-mode');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
};

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        state.isDarkMode = false;
        document.body.classList.add('light-mode');
        $('#themeIcon').className = 'fas fa-sun';
    }
};

// Navigation Functions
const updateActiveNavLink = () => {
    const sections = $$('section[id]');
    const scrollPos = window.scrollY + CONFIG.scrollOffset;
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    $$('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

// Smooth Scrolling
const smoothScrollTo = (target, duration = 1000) => {
    const targetElement = $(target);
    if (!targetElement) return;
    
    const startPosition = window.pageYOffset;
    const targetPosition = targetElement.offsetTop - CONFIG.scrollOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    };
    
    requestAnimationFrame(animation);
};

// Recipe Filtering
const filterRecipes = (filter) => {
    state.currentFilter = filter;
    
    // Update filter buttons
    $$('.recipe-filters .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Filter recipe cards
    $$('[data-category]').forEach(card => {
        const categories = card.dataset.category?.split(' ') || [];
        const shouldShow = filter === 'all' || categories.includes(filter);
        
        const cardElement = card.closest('.col-lg-4, .col-md-6');
        if (cardElement) {
            cardElement.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                cardElement.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        }
    });
};

// Number Animation
const animateNumber = (element, target, duration = 2000) => {
    const start = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeOutCubic(progress);
        const current = start + (target - start) * ease;
        
        element.textContent = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
};

// Intersection Observer for Animations
const createIntersectionObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add reveal animation
                element.classList.add('aos-animate');
                
                // Animate numbers
                if (element.classList.contains('value') && element.dataset.target) {
                    const target = parseFloat(element.dataset.target);
                    animateNumber(element, target);
                }
                
                observer.unobserve(element);
            }
        });
    }, {
        threshold: CONFIG.intersectionThreshold,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements with AOS attributes
    $$('[data-aos]').forEach(el => observer.observe(el));
    
    // Observe nutrition values
    $$('.value[data-target]').forEach(el => observer.observe(el));
};

// Contact Form Handling
const handleContactForm = (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');
    
    // Simulate form submission
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
        
        // Show success message
        showNotification('Message sent successfully!', 'success');
    }, 2000);
};

// Notification System
const showNotification = (message, type = 'info') => {
    // Create Bootstrap toast
    const toastContainer = $('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '11';
    document.body.appendChild(container);
    return container;
};

// Parallax Effect
const handleParallax = throttle(() => {
    const scrolled = window.pageYOffset;
    const parallaxElements = $$('.floating-raspberry');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        const rotation = scrolled * speed * 0.1;
        element.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
    });
}, 16);

// Scroll Effects
const handleScroll = throttle(() => {
    const scrollY = window.scrollY;
    const header = $('.header');
    
    // Update header background
    if (header) {
        header.classList.toggle('scrolled', scrollY > 50);
    }
    
    // Update active navigation
    updateActiveNavLink();
    
    // Handle parallax
    handleParallax();
}, 16);

// Recipe Card Interactions
const handleRecipeCardClick = (card) => {
    card.classList.toggle('flipped');
};

// Initialize Event Listeners
const initEventListeners = () => {
    // Theme toggle
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Navigation links
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
                
                // Close mobile menu if open
                const navbarCollapse = $('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navbarCollapse)?.hide();
                }
            }
        });
    });
    
    // Recipe filters
    $$('.recipe-filters .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterRecipes(btn.dataset.filter);
        });
    });
    
    // Recipe cards
    $$('.recipe-card').forEach(card => {
        card.addEventListener('click', () => handleRecipeCardClick(card));
    });
    
    // Contact form
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter form
    const newsletterForm = $('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                showNotification('Thank you for subscribing!', 'success');
                newsletterForm.reset();
            }
        });
    }
    
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize events
    window.addEventListener('resize', debounce(() => {
        updateActiveNavLink();
    }, CONFIG.debounceDelay));
    
    // System theme change detection
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            state.isDarkMode = e.matches;
            if (e.matches) {
                document.body.classList.remove('light-mode');
                $('#themeIcon').className = 'fas fa-moon';
            } else {
                document.body.classList.add('light-mode');
                $('#themeIcon').className = 'fas fa-sun';
            }
        }
    });
};

// Performance Optimizations
const optimizePerformance = () => {
    // Preload critical images
    const criticalImages = [
        './images/raspberry_1.jpg',
        './images/raspberry_2.jpeg',
        './images/raspberry_3.jpeg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Enable GPU acceleration for animated elements
    $$('.floating-raspberry, .hero-3d-sphere, .nutrition-chart').forEach(el => {
        el.style.willChange = 'transform';
    });
    
    // Lazy load non-critical images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        $$('img[data-src]').forEach(img => imageObserver.observe(img));
    }
};

// Initialize Application
const init = () => {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    try {
        // Initialize theme first
        initTheme();
        
        // Initialize components
        initEventListeners();
        createIntersectionObserver();
        optimizePerformance();
        
        // Set initial states
        updateActiveNavLink();
        
        // Add loaded class to body
        document.body.classList.add('loaded');
        
        console.log('🍓 Bootstrap Raspberry Bliss website initialized successfully!');
    } catch (error) {
        console.error('Error initializing website:', error);
    }
};

// Start the application
init();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        smoothScrollTo,
        filterRecipes,
        showNotification,
        toggleTheme,
        CONFIG
    };
}

