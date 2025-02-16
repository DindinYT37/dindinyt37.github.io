// IP Tracker Animation
function initIPTrackerAnimation() {
    const diagrams = document.querySelectorAll('.network-diagram');
    diagrams.forEach(diagram => {
        const canvas = diagram.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        let animationFrame;
        let startTime = null;
        let isHovered = false;

        // Define nodes
        const nodes = {
            ipTracker: {
                icon: '⌨️',
                label: 'IP Tracker',
                color: '#6e8efb',
                basePos: { x: 0.5, y: 0.25 },      // Keep centered, high
                hoverPos: { x: 0.5, y: 0.25 }      // Keep same position
            },
            csvFile: {
                icon: '📄',
                label: 'CSV',
                color: '#6e8efb',
                basePos: { x: 0.15, y: 0.65 },     // Left side
                hoverPos: { x: 0.15, y: 0.65 }     // Keep same position
            },
            apiServer: {
                icon: '🖥️',
                label: 'API Server',
                color: '#ff8e8e',
                basePos: { x: 0.85, y: 0.65 },     // Right side
                hoverPos: { x: 0.85, y: 0.65 }     // Keep same position
            },
            ipCheck: {
                icon: '❓',
                label: 'IP Changed?',
                color: '#6e8efb',
                basePos: { x: 0.32, y: 0.45 },     // Positioned between IP Tracker and CSV
                hoverPos: { x: 0.32, y: 0.45 }     // Keep same position
            }
        };

        let requestData = {
            active: false,
            position: { x: 0, y: 0 },
            phase: 0, // 0: to API, 1: to IP Tracker, 2: to IP Check, 3: to CSV or fade
            progress: 0,
            ipChanged: false
        };

        function drawNode(node, x, y, progress = 1) {
            ctx.save();

            // Enhanced glow effect
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 20;

            // Larger background for better visibility
            ctx.beginPath();
            ctx.fillStyle = 'rgba(17, 18, 19, 0.9)';
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2;
            ctx.arc(x, y, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw icon
            ctx.shadowBlur = 0;
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(node.icon, x, y);

            // Draw label with background
            ctx.font = '10px "JetBrains Mono"';
            const labelMetrics = ctx.measureText(node.label);
            const labelWidth = labelMetrics.width + 16;
            const labelHeight = 18;
            const labelY = y + 35;

            // Label background
            ctx.fillStyle = 'rgba(17, 18, 19, 0.9)';
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - labelWidth / 2, labelY - labelHeight / 2, labelWidth, labelHeight, 4);
            ctx.fill();
            ctx.stroke();

            // Label text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(node.label, x, labelY);

            ctx.restore();
        }

        function drawConnection(startNode, endNode, progress = 1) {
            const start = getCurrentPosition(startNode, progress);
            const end = getCurrentPosition(endNode, progress);

            // Calculate direction vector
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Increased padding for more space around nodes
            const padding = 28;
            const ratio = padding / distance;

            // Adjust start and end points
            const adjustedStart = {
                x: start.x + dx * ratio,
                y: start.y + dy * ratio
            };
            const adjustedEnd = {
                x: end.x - dx * ratio,
                y: end.y - dy * ratio
            };

            // Draw line with enhanced gradient
            const gradient = ctx.createLinearGradient(
                adjustedStart.x, adjustedStart.y,
                adjustedEnd.x, adjustedEnd.y
            );
            gradient.addColorStop(0, `${startNode.color}40`);  // More transparent
            gradient.addColorStop(0.5, `${startNode.color}80`); // More solid in middle
            gradient.addColorStop(1, `${endNode.color}40`);    // More transparent

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.moveTo(adjustedStart.x, adjustedStart.y);
            ctx.lineTo(adjustedEnd.x, adjustedEnd.y);
            ctx.stroke();
        }

        function getCurrentPosition(node, progress) {
            const base = node.basePos;
            const hover = node.hoverPos;
            const x = canvas.width * (base.x + (hover.x - base.x) * progress);
            const y = canvas.height * (base.y + (hover.y - base.y) * progress);
            return { x, y };
        }

        function drawRequest() {
            if (!requestData.active) return;

            ctx.save();
            ctx.beginPath();

            // Calculate opacity based on phase and progress
            let opacity = 1;
            if (requestData.phase === 3 && !requestData.ipChanged) {
                opacity = Math.max(0, 1 - (requestData.progress * 2));
            }

            // Change color based on direction (after getting response from API)
            const color = requestData.phase >= 1 ? '#ff8e8e' : '#6e8efb';
            ctx.fillStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
            ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity})`;

            // Draw packet
            const size = 8;
            ctx.translate(requestData.position.x, requestData.position.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-size / 2, -size / 2, size, size);

            ctx.restore();
        }

        // Helper function to convert hex to rgb
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?
                `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '110, 142, 251';
        }

        function updateRequestPosition(progress) {
            requestData.progress = progress;
            const ipTrackerPos = getCurrentPosition(nodes.ipTracker, isHovered ? 1 : 0);
            const apiServerPos = getCurrentPosition(nodes.apiServer, isHovered ? 1 : 0);
            const ipCheckPos = getCurrentPosition(nodes.ipCheck, isHovered ? 1 : 0);
            const csvFilePos = getCurrentPosition(nodes.csvFile, isHovered ? 1 : 0);

            const lastPos = requestData.position;

            switch (requestData.phase) {
                case 0: // To API Server
                    requestData.position = lerpPosition(ipTrackerPos, apiServerPos, progress);
                    break;
                case 1: // Back to IP Tracker
                    requestData.position = lerpPosition(apiServerPos, ipTrackerPos, progress);
                    break;
                case 2: // To IP Check
                    requestData.position = lerpPosition(ipTrackerPos, ipCheckPos, progress);
                    // Only trigger shake when we're close to the IP Check node and haven't triggered yet
                    if (progress > 0.9 && !requestData.hasTriggeredShake) {
                        requestData.hasTriggeredShake = true;
                        // Calculate actual distance to node to ensure we're really close
                        const dist = Math.hypot(
                            requestData.position.x - ipCheckPos.x,
                            requestData.position.y - ipCheckPos.y
                        );
                        if (dist < 10) { // Only shake if we're within 10 pixels
                            shakeIPCheckNode(requestData.ipChanged);
                        }
                    }
                    break;
                case 3: // To CSV or fade
                    if (requestData.ipChanged) {
                        requestData.position = lerpPosition(ipCheckPos, csvFilePos, progress);
                    } else {
                        requestData.position = ipCheckPos;
                        if (progress > 0.5 && !requestData.fadeStarted) {
                            requestData.fadeStarted = true;
                            requestData.active = false;
                        }
                    }
                    break;
            }
        }

        function animate(timestamp) {
            if (!startTime) {
                startTime = timestamp;
                requestData = {
                    active: true,
                    position: { x: 0, y: 0 },
                    phase: 0,
                    progress: 0,
                    ipChanged: false, // force horizontal shake on first cycle
                    firstCycle: true, // flag to indicate first cycle
                    hasTriggeredShake: false,
                    fadeStarted: false
                };
            }

            const cycleTime = 6000;
            const elapsed = (timestamp - startTime) % cycleTime;
            const progress = elapsed / cycleTime;
            const phaseProgress = (progress * 4) % 1;
            const currentPhase = Math.floor((progress * 4) % 4);

            if (currentPhase !== requestData.phase) {
                requestData.phase = currentPhase;
                if (currentPhase === 0) {
                    // On cycle reset, if first cycle, always use horizontal shake
                    if (requestData.firstCycle) {
                        requestData.ipChanged = false;
                        requestData.firstCycle = false;
                    } else {
                        requestData.ipChanged = Math.random() < 0.3;
                    }
                    requestData.hasTriggeredShake = false;
                    requestData.fadeStarted = false;
                    requestData.active = true;
                }
            }

            setupCanvas();

            // Draw connections
            drawConnection(nodes.ipTracker, nodes.ipCheck, isHovered ? 1 : 0);
            drawConnection(nodes.ipCheck, nodes.csvFile, isHovered ? 1 : 0);
            drawConnection(nodes.ipTracker, nodes.apiServer, isHovered ? 1 : 0);

            // Update and draw request with proper opacity
            updateRequestPosition(phaseProgress);
            drawRequest();

            // Draw nodes
            Object.values(nodes).forEach(node => {
                const pos = getCurrentPosition(node, isHovered ? 1 : 0);
                drawNode(node, pos.x, pos.y);
            });

            // Continue animation
            animationFrame = requestAnimationFrame(animate);
        }

        function shakeIPCheckNode(ipChanged) {
            const ipCheck = nodes.ipCheck;
            let shakeStartTime = performance.now();
            const animDuration = ipChanged ? 300 : 400; // Slower shake, faster nod
            const amplitude = ipChanged ? 0.006 : 0.002; // Smaller nod, subtler shake
            const frequency = ipChanged ? 2 : 3; // Fewer, more pronounced shakes

            // Store original positions and color
            const originalX = 0.32;
            const originalY = 0.45;
            const originalColor = ipCheck.color;

            // Change color based on result
            ipCheck.color = ipChanged ? '#4CAF50' : '#f44336'; // Green for success, red for failure

            function shakeFrame(timestamp) {
                const elapsed = timestamp - shakeStartTime;
                if (elapsed < animDuration) {
                    const progress = elapsed / animDuration;

                    if (ipChanged) {
                        // Quicker, smaller nod
                        const offset = Math.sin(progress * Math.PI * 2) * amplitude;
                        ipCheck.basePos = {
                            x: originalX,
                            y: originalY + offset
                        };
                        ipCheck.hoverPos = {
                            x: originalX,
                            y: originalY + offset
                        };
                    } else {
                        // Smoother, more deliberate shake
                        const easing = Math.sin(progress * Math.PI);
                        const offset = Math.sin(progress * Math.PI * frequency) * amplitude;
                        // Add slight horizontal drift to make shake feel more natural
                        const drift = (progress < 0.5 ? progress : 1 - progress) * amplitude * 0.5;
                        ipCheck.basePos = {
                            x: originalX + offset + drift,
                            y: originalY
                        };
                        ipCheck.hoverPos = {
                            x: originalX + offset + drift,
                            y: originalY
                        };
                    }
                    requestAnimationFrame(shakeFrame);
                } else {
                    // Reset position and color
                    ipCheck.basePos = { x: originalX, y: originalY };
                    ipCheck.hoverPos = { x: originalX, y: originalY };
                    ipCheck.color = originalColor;
                }
            }

            requestAnimationFrame(shakeFrame);
        }

        function lerpPosition(start, end, progress) {
            return {
                x: start.x + (end.x - start.x) * progress,
                y: start.y + (end.y - start.y) * progress
            };
        }

        // Handle hover state
        diagram.closest('.project-card').addEventListener('mouseenter', () => {
            isHovered = true;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            // Reset node positions before starting new animation
            nodes.ipCheck.basePos = { x: 0.32, y: 0.45 };
            nodes.ipCheck.hoverPos = { x: 0.32, y: 0.45 };
            startTime = performance.now();
            animationFrame = requestAnimationFrame(animate);
        });

        // Handle hover state
        diagram.closest('.project-card').addEventListener('mouseenter', () => {
            isHovered = true;
            // Reset animation cycle on hover
            startTime = null;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            // Reset node positions
            Object.values(nodes).forEach(node => {
                if (node.currentShakeAnimation) {
                    cancelAnimationFrame(node.currentShakeAnimation);
                }
                // Reset to original positions
                if (node === nodes.ipCheck) {
                    node.basePos.x = 0.32;
                    node.basePos.y = 0.45;
                    node.hoverPos.x = 0.32;
                    node.hoverPos.y = 0.45;
                }
            });
            animationFrame = requestAnimationFrame(animate);
        });

        diagram.closest('.project-card').addEventListener('mouseleave', () => {
            isHovered = false;
            // Reset animation cycle on leave
            startTime = null;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(animate);
        });

        // Add resize observer for the project card
        const projectCard = diagram.closest('.project-card');
        const resizeObserver = new ResizeObserver(() => {
            setupCanvas();
            // Draw the current state instead of calling undefined drawLines
            if (!startTime) {
                startTime = performance.now();
            }
            animate(performance.now());
        });
        resizeObserver.observe(projectCard);

        function setupCanvas() {
            // Get the current dimensions of the diagram
            const rect = diagram.getBoundingClientRect();

            const width = rect.width;
            const height = rect.height;

            // Set physical canvas size
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;

            // Scale context for high DPI displays
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            // Set display size
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }

        // Handle visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setupCanvas();
                    startTime = null;
                    animationFrame = requestAnimationFrame(animate);
                } else {
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }
                }
            });
        }, { threshold: 0.1 });

        observer.observe(diagram);

        // Fix transition observer
        diagram.closest('.project-card').addEventListener('transitionrun', () => {
            if (!startTime) {
                startTime = performance.now();
            }
            animate(performance.now());
        });
    });
}