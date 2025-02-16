// Set up Intersection Observer for fade-in elements
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// Scrolling animation for languages
function initLanguageScroll() {
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
        const scrollSpeed = 50;
        let currentPosition = 0;
        let lastTimestamp = 0;

        const itemHeight = 80;
        const itemPadding = 10;
        const totalItemHeight = itemHeight + itemPadding;
        const itemCount = 8;
        const singleSetHeight = totalItemHeight * itemCount;

        function animate(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const elapsed = timestamp - lastTimestamp;

            const delta = (scrollSpeed * elapsed) / 1000;
            currentPosition += delta;

            if (currentPosition >= singleSetHeight) {
                currentPosition = 0;
            }

            scrollContainer.style.transform = `translateY(${-currentPosition}px)`;

            lastTimestamp = timestamp;
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
}