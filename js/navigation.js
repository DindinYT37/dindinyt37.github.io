// Navigation state
let isAnimating = false;
let sections;
let navItems;
let currentSection = 0;
let scrollAccumulator = 0;
const SCROLL_THRESHOLD = 250; // Adjust this value to change sensitivity (higher = less sensitive)

// Navigation functions
function transitionToSection(index) {
    if (isAnimating || index === currentSection) return;
    isAnimating = true;

    // Update navigation
    navItems.forEach(i => i.classList.remove('active'));
    navItems[index].classList.add('active');

    // Fade out current section
    sections[currentSection].classList.remove('active');

    // Prepare next section
    const nextSection = sections[index];

    // Reset any fade-in elements
    const fadeElements = nextSection.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.classList.remove('visible');
        // Trigger reflow
        void el.offsetWidth;
        el.classList.add('visible');
    });

    // Activate next section
    nextSection.classList.add('active');

    // Update current section index
    currentSection = index;

    // Reset animation flag after transition
    setTimeout(() => {
        isAnimating = false;
    }, 500);
}

function initNavigation() {
    sections = document.querySelectorAll('.section');
    navItems = document.querySelectorAll('header > div');

    // Initialize first section
    sections[0].classList.add('active');
    navItems[0].classList.add('active');

    // Navigation click handler
    navItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            if (isAnimating || currentSection === index) return;

            // Update navigation
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Transition to new section
            transitionToSection(index);
        });
    });

    // Wheel event handler for smooth section transitions
    document.addEventListener('wheel', function (e) {
        if (isAnimating) return;

        const currentSectionElement = sections[currentSection];

        // Get precise scroll measurements
        const scrollHeight = currentSectionElement.scrollHeight;
        const clientHeight = currentSectionElement.clientHeight;
        const scrollTop = currentSectionElement.scrollTop;

        // Calculate if section is scrollable and scroll positions
        const isScrollable = scrollHeight > clientHeight + 1; // Add 1px threshold for floating point precision
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;

        // For sections with content to scroll
        if (isScrollable) {
            if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
                scrollAccumulator = 0; // Reset accumulator when scrolling within section
                return; // Let the default scroll behavior happen
            }
        }

        // Accumulate scroll delta
        scrollAccumulator += Math.abs(e.deltaY);

        // Only trigger section change if threshold is reached
        if (scrollAccumulator >= SCROLL_THRESHOLD) {
            e.preventDefault();
            scrollAccumulator = 0; // Reset accumulator

            // Section transitions at boundaries
            if (e.deltaY > 0 && currentSection < sections.length - 1) {
                transitionToSection(currentSection + 1);
            } else if (e.deltaY < 0 && currentSection > 0) {
                transitionToSection(currentSection - 1);
            }
        }
    }, { passive: false });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (isAnimating) return;

        const currentSectionElement = sections[currentSection];
        const scrollHeight = currentSectionElement.scrollHeight;
        const clientHeight = currentSectionElement.clientHeight;
        const scrollTop = currentSectionElement.scrollTop;

        const isScrollable = scrollHeight > clientHeight + 1;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;

        // Handle arrow keys for both scrolling and section transitions
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            if (isScrollable && !isAtBottom) {
                // Let native scrolling happen
                return;
            } else if (currentSection < sections.length - 1) {
                e.preventDefault();
                transitionToSection(currentSection + 1);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (isScrollable && !isAtTop) {
                // Let native scrolling happen
                return;
            } else if (currentSection > 0) {
                e.preventDefault();
                transitionToSection(currentSection - 1);
            }
        }
    });
}