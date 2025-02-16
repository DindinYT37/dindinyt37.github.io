// Format Utils

function initFormatAnimation() {
    const formatText = document.querySelector('.format-text');
    if (!formatText) return;

    const fonts = [
        "'Arial', sans-serif",
        "'Times New Roman', serif",
        "'Courier New', monospace",
        "'Georgia', serif",
        "'Verdana', sans-serif",
        "'Trebuchet MS', sans-serif",
        "'Palatino', serif",
        "'Garamond', serif",
        "'Bookman', serif",
        "'Comic Sans MS', cursive",
        "'Impact', sans-serif",
        "'Lucida Console', monospace",
        "'Tahoma', sans-serif",
        "'Helvetica', sans-serif"
    ];

    const commonThemes = [
        { fg: '#000000', bg: '#ffffff' }, // Black on White
        { fg: '#ffffff', bg: '#000000' }, // White on Black
        { fg: '#2c1810', bg: '#f5f5dc' }  // Dark Brown on Beige
    ];

    function getRelativeLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];
    }

    function adjustColorForContrast(fgHSL, bgHSL) {
        const fgRGB = hslToRgb(fgHSL.h, fgHSL.s, fgHSL.l);
        const bgRGB = hslToRgb(bgHSL.h, bgHSL.s, bgHSL.l);

        const fgLum = getRelativeLuminance(...fgRGB);
        const bgLum = getRelativeLuminance(...bgRGB);
        let contrast = getContrastRatio(fgLum, bgLum);

        // Aim for minimum contrast ratio of 6:1
        if (contrast < 6) {
            // Adjust lightness to improve contrast
            if (fgLum < bgLum) {
                // Make text darker
                fgHSL.l = Math.max(0, Math.min(100, fgHSL.l - 30)); // Increased adjustment
                fgHSL.s = Math.min(100, fgHSL.s + 20);
            } else {
                // Make text lighter
                fgHSL.l = Math.max(0, Math.min(100, fgHSL.l + 30)); // Increased adjustment
                fgHSL.s = Math.min(100, fgHSL.s + 20);
            }
        }

        return { fgHSL, bgHSL };
    }

    function getRandomHSL() {
        return {
            h: Math.random() * 360,
            s: 30 + Math.random() * 60, // 30-90%
            l: 20 + Math.random() * 60  // 20-80%
        };
    }

    function invertHSL(hsl) {
        // Round lightness to nearest 20% step
        const currentStep = Math.round(hsl.l / 20);
        const nextStep = hsl.l < 50 ? currentStep + 1 : currentStep - 1;
        const invertedL = nextStep * 20;

        return {
            h: (hsl.h + 180) % 360,     // Opposite hue
            s: Math.min(20, hsl.s),     // Cap saturation at 20%
            l: invertedL                 // Step lightness
        };
    }

    function hslToString(hsl) {
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    function getRandomTheme() {
        if (Math.random() < 0.3) {
            return commonThemes[Math.floor(Math.random() * commonThemes.length)];
        }

        const fgHSL = getRandomHSL();
        const bgHSL = invertHSL(fgHSL);
        const adjustedColors = adjustColorForContrast(fgHSL, bgHSL);

        return {
            fg: hslToString(adjustedColors.fgHSL),
            bg: hslToString(adjustedColors.bgHSL)
        };
    }

    function updateFormat() {
        const theme = getRandomTheme();
        const style = {
            fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
            fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
            fontStyle: Math.random() > 0.5 ? 'italic' : 'normal',
            color: theme.fg,
            backgroundColor: theme.bg,
            // Only change skew 20% of the time
            transform: Math.random() > 0.8 ?
                `skew(${-20 + Math.random() * 40}deg) scale(${0.8 + Math.random() * 0.4})` :
                `scale(${0.8 + Math.random() * 0.4})`
        };

        Object.assign(formatText.style, style);
    }

    setInterval(updateFormat, 200); // Update every 200ms
    updateFormat();
}

// Call this after DOM is loaded
document.addEventListener('DOMContentLoaded', initFormatAnimation);


// Crypto Utils Animation
function initCryptoAnimation() {
    const cryptoIcon = document.querySelector('.util-item[data-util="crypto"]');
    if (!cryptoIcon) return;

    const words = ['password', 'secret', 'token', 'message', 'data', 'text', 'hello', 'world', 
                  'encrypt', 'secure', 'private', 'key', 'string', 'info'];
    
    const symbols = '!@#$%^&*+=?><{}[]~';
    let animationFrame;
    const floatingTexts = [];

    class FloatingText {
        constructor(isInput) {
            this.isInput = isInput;
            this.element = document.createElement('div');
            
            // Get the icon element and its bounds
            const iconElement = cryptoIcon.querySelector('.util-icon');
            const iconBounds = iconElement.getBoundingClientRect();
            
            this.element.style.cssText = `
                position: absolute;
                font-family: 'JetBrains Mono';
                font-size: 12px;
                white-space: nowrap;
                pointer-events: none;
                opacity: ${isInput ? '0' : '1'};
                transition: ${isInput ? 'opacity 0.3s ease-in' : 'opacity 0.3s ease-out'};
                top: ${iconBounds.height / 2}px;
                line-height: 1;
                z-index: 0;
            `;
            
            if (isInput) {
                this.element.style.color = '#6e8efb';
                this.element.textContent = words[Math.floor(Math.random() * words.length)];
                this.x = -50; // Start closer
                this.element.style.right = `${iconBounds.width + 10}px`; // Closer to icon
                this.element.style.transform = 'translate(0, -50%)';
                // Fade in input text after being added to DOM
                requestAnimationFrame(() => this.element.style.opacity = '1');
            } else {
                this.element.style.color = '#ff8e8e';
                this.element.textContent = this.generateJumble(6);
                this.x = 0;
                this.element.style.left = `${iconBounds.width + 5}px`; // Start just outside icon
                this.element.style.transform = 'translate(0, -50%)';
            }
            
            cryptoIcon.appendChild(this.element);
        }

        generateJumble(length) {
            return Array(length).fill()
                .map(() => symbols[Math.floor(Math.random() * symbols.length)])
                .join('');
        }

        update(deltaTime) {
            const speed = this.isInput ? 60 : 60; // Same speed for both
            this.x += (speed * deltaTime);
            
            const iconElement = cryptoIcon.querySelector('.util-icon');
            const iconBounds = iconElement.getBoundingClientRect();
            
            if (this.isInput) {
                this.element.style.transform = `translate(${this.x}px, -50%)`;
                // Remove when text reaches just before icon center
                if (this.x > iconBounds.width * 0.3) { // Remove at 30% of icon width
                    this.element.remove();
                    return false;
                }
            } else {
                this.element.style.transform = `translate(${this.x}px, -50%)`;
                // Remove later, matching input timing
                if (this.x > iconBounds.width * 1.7) { // Increased travel distance
                    // Start fade out for output text
                    this.element.style.opacity = '0';
                    // Remove after fade animation
                    setTimeout(() => this.element.remove(), 300);
                    return false;
                }
            }
            return true;
        }
    }

    let lastSpawnTime = 0;
    let lastUpdateTime = 0;

    function animate(timestamp) {
        if (!lastUpdateTime) lastUpdateTime = timestamp;
        if (!lastSpawnTime) lastSpawnTime = timestamp;

        const deltaTime = (timestamp - lastUpdateTime) / 1000;
        const timeSinceSpawn = timestamp - lastSpawnTime;

        // Spawn new texts every 600ms (increased frequency)
        if (timeSinceSpawn > 600) {
            floatingTexts.push(new FloatingText(true));  // Input text
            floatingTexts.push(new FloatingText(false)); // Output text
            lastSpawnTime = timestamp;
        }

        // Update existing texts
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            if (!floatingTexts[i].update(deltaTime)) {
                floatingTexts.splice(i, 1);
            }
        }

        lastUpdateTime = timestamp;
        animationFrame = requestAnimationFrame(animate);
    }

    // Start/stop animation based on visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lastUpdateTime = 0;
                lastSpawnTime = 0;
                animationFrame = requestAnimationFrame(animate);
            } else {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                // Clean up existing texts
                floatingTexts.forEach(text => text.element.remove());
                floatingTexts.length = 0;
            }
        });
    }, { threshold: 0.1 });

    observer.observe(cryptoIcon);

    // Add this CSS rule to ensure the icon stays on top
    const style = document.createElement('style');
    style.textContent = `
        .roblox-utils .util-item[data-util="crypto"] .util-icon {
            position: relative;
            z-index: 1;
        }
    `;
    document.head.appendChild(style);
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    initFormatAnimation();
    initCryptoAnimation();
});