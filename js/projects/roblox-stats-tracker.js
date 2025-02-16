function initStatsAnimation() {
    const stats = {
        players: {
            base: 65,
            variance: 25,
            format: (n) => n.toLocaleString()
        },
        visits: {
            base: 425000,      // Starting at 425,000
            speed: {
                min: 100,      // Minimum 100 visits per second
                max: 250       // Maximum 250 visits per second
            },
            format: (n) => n.toLocaleString()  // Changed to full number format
        },
        favorites: {
            base: 12500,       // Starting at 12,500
            trend: 15,         // 15 favorites per second base increase
            variance: 20,      // Can deviate by ±20 favorites per second
            format: (n) => n.toLocaleString()  // Changed to full number format
        }
    };

    let startTime = Date.now();
    let lastTime = startTime;
    let visitCount = stats.visits.base;
    let favoriteCount = stats.favorites.base;

    function animate() {
        const now = Date.now();
        const dt = (now - lastTime) / 1000; // Time delta in seconds
        lastTime = now;
        const totalElapsed = (now - startTime) / 1000;

        Object.entries(stats).forEach(([key, config]) => {
            const element = document.querySelector(`.stat[data-stat="${key}"] .value`);
            if (!element) return;

            let value;
            switch(key) {
                case 'players':
                    // Faster fluctuations with smaller amplitude
                    const microWave = Math.sin(totalElapsed * 2.5) * 0.4;    // Very fast, tiny changes
                    const fastWave = Math.sin(totalElapsed * 1.2) * 0.35;    // Fast, small changes
                    const slowWave = Math.sin(totalElapsed * 0.3) * 0.25;    // Slow, underlying trend
                    value = config.base + (microWave + fastWave + slowWave) * config.variance;
                    break;

                case 'visits':
                    // Much faster increase for fuller numbers
                    const speedMultiplier = 1 + Math.sin(totalElapsed * 0.5) * 0.5; // Varies between 0.5 and 1.5
                    const currentSpeed = (config.speed.min + config.speed.max) / 2 * speedMultiplier;
                    visitCount += currentSpeed * dt;
                    value = visitCount;
                    break;

                case 'favorites':
                    // Faster changes with fuller numbers
                    const baseTrend = config.trend * dt * (1 + Math.sin(totalElapsed * 0.7) * 0.3);
                    const randomFactor = (Math.random() - 0.3) * config.variance * dt * 2;
                    favoriteCount += baseTrend + randomFactor;
                    value = favoriteCount;
                    break;
            }
            
            element.textContent = config.format(Math.round(value));
        });

        requestAnimationFrame(animate);
    }

    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTime = Date.now();
                lastTime = startTime;
                visitCount = stats.visits.base;
                favoriteCount = stats.favorites.base;
                requestAnimationFrame(animate);
            }
        });
    }, { threshold: 0.1 });

    const statsTracker = document.querySelector('.stats-tracker');
    if (statsTracker) {
        observer.observe(statsTracker);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initStatsAnimation);
