// ===== GLOBAL VARIABLES =====
let audioContext;
let analyser;
let audioSource;
let audioElement;
let animationFrameId;
let timerPopupTimeout;
let reactionPopupTimeout;
let audioPlaying = false;

const canvas = document.getElementById('waveform-canvas');
const ctx = canvas.getContext('2d');

// ===== CONFIGURATION (Everything hardcoded now) =====
const CONFIG = {
    MASTER_PASSWORD: '145ridhimehta',  // Your password here
    AUDIO_URL: '/audio/surprise.mp3',  // Audio file in public/audio/
    PHONE_NUMBERS: [
        '+91XXXXXXXXXX',  // Card 1
        '+91XXXXXXXXXX',  // Card 2
        '+91XXXXXXXXXX',  // Card 3
        '+91XXXXXXXXXX',  // Card 4
        '+91XXXXXXXXXX'   // Card 5
    ]
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after page loads
    setTimeout(() => {
        document.getElementById('loading-overlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-overlay').style.display = 'none';
        }, 500);
    }, 1000);
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Start Phase 1
    startPhase1();
    
    // Setup window resize handler for canvas
    window.addEventListener('resize', handleResize);
});

// ===== PHASE 1: TYPING INTRODUCTION =====
async function startPhase1() {
    const text = "Hello, ";
    const text2 = "Ridhi";
    const text3 = "Mehta";
    const finalText = "Ready for the surprise?";
    
    const typingText = document.getElementById('typing-text');
    const inputContainer = document.getElementById('phase-1-input');
    const yesInput = document.getElementById('yes-input');
    
    // Initial typing animation
    await typeText(typingText, text, 100);
    await delay(800); // Uneven pause
    
    // Type first name
    typingText.textContent = text;
    await typeText(typingText, text + text2, 120);
    
    // Type last name
    typingText.textContent = text + text2;
    await typeText(typingText, text + text2 + " " + text3, 120);
    
    // Clear and show final text
    await delay(400);
    typingText.textContent = "";
    await typeText(typingText, finalText, 80);
    
    // Remove cursor and show input
    typingText.style.opacity = '0';
    await delay(300);
    
    typingText.textContent = finalText;
    typingText.style.opacity = '1';
    typingText.style.animation = 'none';
    
    inputContainer.classList.remove('hidden');
    yesInput.focus();
    
    // Listen for "Yes" input (case-insensitive)
    yesInput.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase() === 'yes') {
            proceedToPhase2();
        }
    });
    
    // Allow Enter key as well
    yesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.toLowerCase() === 'yes') {
            proceedToPhase2();
        }
    });
}

// ===== PHASE 2: EMOTIONAL CORE =====
async function startPhase2() {
    const emotionalText = document.getElementById('emotional-text');
    const readyButton = document.getElementById('ready-button');
    
    const message = [
        "If you are reading this, it means you trusted your heart enough to stay curious.",
        "The notes you just read did not arrive randomly.",
        "They were written by people who know you in different ways, at different times, and with different kinds of love.",
        "Some words felt familiar.",
        "Some may have surprised you.",
        "Some may have made you pause for a second longer than others.",
        "This page is connected to those cards — not to test you, but to gently remind you of something simple:",
        "you are remembered, you are valued, and you matter more than you realise.",
        "Take a breath.",
        "Read slowly.",
        "The real message is waiting — and you already have everything you need to reach it."
    ];
    
    for (let i = 0; i < message.length; i++) {
        await typeParagraph(emotionalText, message[i] + (i < message.length - 1 ? "\n\n" : ""));
        await delay(1000); // Pause between paragraphs
    }
    
    // Remove cursor and show button
    emotionalText.style.opacity = '0';
    await delay(300);
    
    emotionalText.textContent = message.join("\n\n");
    emotionalText.style.opacity = '1';
    
    await delay(800);
    readyButton.classList.remove('hidden');
    
    readyButton.addEventListener('click', proceedToPhase4);
}

// ===== PHASE 4: PASSWORD PAGE =====
function startPhase4() {
    const passwordInput = document.getElementById('password-input');
    const unlockButton = document.getElementById('unlock-button');
    const passwordHint = document.getElementById('password-hint');
    const closeHint = document.getElementById('close-hint');
    const closeHintX = document.getElementById('close-hint-x');
    const hintPopup = document.getElementById('hint-popup');
    
    // Show reaction popup after 2 seconds
    reactionPopupTimeout = setTimeout(showReactionPopup, 2000);
    
    // Filter input to only allow lowercase letters and numbers
    passwordInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    });
    
    // Unlock button click
    unlockButton.addEventListener('click', authenticatePassword);
    
    // Enter key support for password
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authenticatePassword();
        }
    });
    
    // Password hint
    passwordHint.addEventListener('click', (e) => {
        e.preventDefault();
        hintPopup.classList.remove('hidden');
    });
    
    // Close hint buttons
    closeHint.addEventListener('click', () => {
        hintPopup.classList.add('hidden');
    });
    
    closeHintX.addEventListener('click', () => {
        hintPopup.classList.add('hidden');
    });
}

// ===== SIMPLE PASSWORD CHECK =====
async function authenticatePassword() {
    const passwordInput = document.getElementById('password-input');
    const authMessage = document.getElementById('auth-message');
    const password = passwordInput.value.trim();
    
    console.log('Password attempt:', password);
    
    if (!password) {
        showAuthMessage('Please enter a password', 'error');
        return;
    }
    
    // Simple password check
    if (password === CONFIG.MASTER_PASSWORD) {
        showAuthMessage('Password verified! Unlocking your surprise...', 'success');
        
        // Clear any pending timers
        if (reactionPopupTimeout) clearTimeout(reactionPopupTimeout);
        
        // Transition to Phase 5 after delay
        setTimeout(() => {
            transitionToPhase('phase-4', 'phase-5', startPhase5);
        }, 1500);
    } else {
        showAuthMessage('Oops! Try Again!!', 'error');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ===== PHASE 5: AUDIO SURPRISE =====
async function startPhase5() {
    const successAnimation = document.getElementById('success-animation');
    const audioPlayer = document.getElementById('audio-player');
    
    // Show success animation
    successAnimation.classList.remove('hidden');
    
    // Trigger success effects
    triggerSuccessAnimation();
    
    // After animation, show audio player
    setTimeout(async () => {
        successAnimation.classList.add('hidden');
        audioPlayer.classList.remove('hidden');
        
        // Setup audio controls and visualization
        await setupAudioPlayer();
        
        // Start timer for next popup (4 minutes)
        startTimerPopup();
        
    }, 4000); // Show animation for 4 seconds
}

async function setupAudioPlayer() {
    try {
        // Get audio URL directly from config
        const audioUrl = CONFIG.AUDIO_URL;
        
        // Setup audio element
        audioElement = document.getElementById('hidden-audio');
        audioElement.src = audioUrl;
        
        // Setup audio controls
        setupAudioControls();
        
        // Setup visualization
        await setupAudioVisualization();
        
        // Update volume display
        updateVolumeDisplay();
        
        // Handle audio load errors
        audioElement.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
            showAuthMessage('Error loading audio. Please try again.', 'error');
        });
        
    } catch (error) {
        console.error('Error setting up audio:', error);
        showAuthMessage('Unable to load audio. Please try again.', 'error');
        
        // Fallback: Try to use direct path if available
        audioElement = document.getElementById('hidden-audio');
        audioElement.src = '/audio/surprise.mp3';
        setupAudioControls();
    }
}

// ===== AUDIO CONTROLS & VISUALIZATION =====
function setupAudioControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const replayBtn = document.getElementById('replay-btn');
    const downloadBtn = document.getElementById('download-btn');
    const progressSlider = document.getElementById('progress-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const speedSelect = document.getElementById('speed-select');
    const currentTimeSpan = document.getElementById('current-time');
    const durationTimeSpan = document.getElementById('duration-time');
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Replay functionality
    replayBtn.addEventListener('click', () => {
        if (audioElement) {
            audioElement.currentTime = 0;
            if (!audioPlaying) {
                togglePlayPause();
            }
        }
    });
    
    // Download functionality
    downloadBtn.addEventListener('click', () => {
        if (audioElement && audioElement.src) {
            downloadAudio(audioElement.src);
        }
    });
    
    // Progress slider
    if (audioElement) {
        audioElement.addEventListener('loadedmetadata', () => {
            const duration = audioElement.duration;
            durationTimeSpan.textContent = formatTime(duration);
            progressSlider.max = Math.floor(duration);
        });
        
        audioElement.addEventListener('timeupdate', () => {
            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration;
            
            currentTimeSpan.textContent = formatTime(currentTime);
            
            if (duration) {
                const progress = (currentTime / duration) * 100;
                progressSlider.value = progress;
            }
        });
        
        progressSlider.addEventListener('input', (e) => {
            if (audioElement && audioElement.duration) {
                const seekTime = (e.target.value / 100) * audioElement.duration;
                audioElement.currentTime = seekTime;
            }
        });
    }
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        if (audioElement) {
            audioElement.volume = volume;
        }
        updateVolumeDisplay();
    });
    
    // Playback speed
    speedSelect.addEventListener('change', (e) => {
        if (audioElement) {
            audioElement.playbackRate = parseFloat(e.target.value);
        }
    });
    
    // Handle audio end
    if (audioElement) {
        audioElement.addEventListener('ended', () => {
            audioPlaying = false;
            const playIcon = playPauseBtn.querySelector('i');
            playIcon.className = 'fas fa-play';
            playPauseBtn.querySelector('.btn-text').textContent = 'Play';
            
            // Stop visualization
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Hide audio background
            document.getElementById('audio-bg').classList.remove('active');
        });
    }
}

async function setupAudioVisualization() {
    if (!audioElement || !canvas) return;
    
    try {
        // Initialize AudioContext
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        // Create source from audio element
        audioSource = audioContext.createMediaElementSource(audioElement);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Setup canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Start visualization
        visualizeWaveform();
        
    } catch (error) {
        console.error('Error setting up audio visualization:', error);
    }
}

function visualizeWaveform() {
    if (!analyser || !canvas) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        animationFrameId = requestAnimationFrame(draw);
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw waveform
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;
            
            // Create gradient for bars
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        // Draw center line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    draw();
}

function togglePlayPause() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = playPauseBtn.querySelector('i');
    const btnText = playPauseBtn.querySelector('.btn-text');
    
    if (!audioElement) return;
    
    // Resume audio context if suspended (required for autoplay policies)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (audioPlaying) {
        // Pause audio
        audioElement.pause();
        audioPlaying = false;
        playIcon.className = 'fas fa-play';
        btnText.textContent = 'Play';
        
        // Stop visualization animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Hide audio background
        document.getElementById('audio-bg').classList.remove('active');
        
    } else {
        // Play audio
        audioElement.play()
            .then(() => {
                audioPlaying = true;
                playIcon.className = 'fas fa-pause';
                btnText.textContent = 'Pause';
                
                // Start visualization if not already running
                if (!animationFrameId && analyser) {
                    visualizeWaveform();
                }
                
                // Show audio background
                document.getElementById('audio-bg').classList.add('active');
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                showAuthMessage('Click the play button to start audio', 'error');
            });
    }
}

function downloadAudio(url) {
    try {
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'personal-message-for-you.mp3';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show download confirmation
        showToast('Download started! Your personal message is being saved.');
        
    } catch (error) {
        console.error('Error downloading audio:', error);
        showToast('Download failed. Please try again.');
    }
}

// ===== PHASE 6: CALL PAGE =====
function startPhase6() {
    const cardBoxes = document.querySelectorAll('.card-box');
    
    // Update phone numbers in HTML
    cardBoxes.forEach((box, index) => {
        const phoneNumber = CONFIG.PHONE_NUMBERS[index] || '+91XXXXXXXXXX';
        box.setAttribute('data-number', phoneNumber);
        
        box.addEventListener('click', () => {
            if (phoneNumber && phoneNumber !== '+91XXXXXXXXXX') {
                // Confirm before calling
                if (confirm(`Call ${phoneNumber}?`)) {
                    window.location.href = `tel:${phoneNumber}`;
                }
            } else {
                showToast('Phone number not configured for this card.');
            }
        });
    });
}

// ===== REACTION POPUP =====
function showReactionPopup() {
    const reactionPopup = document.getElementById('reaction-popup');
    const submitButton = document.getElementById('submit-reaction');
    const skipButton = document.getElementById('skip-reaction');
    const closeButton = document.getElementById('close-reaction');
    const reactionText = document.getElementById('reaction-text');
    const charCount = document.getElementById('char-count');
    
    reactionPopup.classList.remove('hidden');
    
    // Update character count
    reactionText.addEventListener('input', () => {
        charCount.textContent = reactionText.value.length;
    });
    
    // Submit reaction
    submitButton.addEventListener('click', async () => {
        const text = reactionText.value.trim();
        
        if (text) {
            saveReactionLocal(text);
        }
        
        reactionPopup.classList.add('hidden');
    });
    
    // Skip reaction
    skipButton.addEventListener('click', () => {
        reactionPopup.classList.add('hidden');
    });
    
    // Close button
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            reactionPopup.classList.add('hidden');
        });
    }
}

// ===== SIMPLE REACTION STORAGE (LocalStorage) =====
function saveReactionLocal(text) {
    try {
        // Save to localStorage
        const reactions = JSON.parse(localStorage.getItem('surpriseReactions') || '[]');
        reactions.push({
            text: text.trim(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('surpriseReactions', JSON.stringify(reactions));
        
        // Log to console for debugging
        console.log('Reaction saved:', {
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            timestamp: new Date().toISOString(),
            totalReactions: reactions.length
        });
        
        // Optionally, you can view all reactions in console
        // console.log('All reactions:', reactions);
        
    } catch (error) {
        console.error('Error saving reaction:', error);
    }
}

// Helper function to view saved reactions (for debugging)
function viewSavedReactions() {
    const reactions = JSON.parse(localStorage.getItem('surpriseReactions') || '[]');
    console.log('Total reactions saved:', reactions.length);
    reactions.forEach((r, i) => {
        console.log(`${i + 1}. ${r.date}: ${r.text.substring(0, 100)}...`);
    });
    return reactions;
}

// ===== TIMER POPUP =====
function startTimerPopup() {
    timerPopupTimeout = setTimeout(showTimerPopup, 4 * 60 * 1000); // 4 minutes
}

function showTimerPopup() {
    const timerPopup = document.getElementById('timer-popup');
    const hearAgainBtn = document.getElementById('hear-again');
    const callNowBtn = document.getElementById('call-now');
    const hearThenCallBtn = document.getElementById('hear-then-call');
    
    timerPopup.classList.remove('hidden');
    
    // Remove existing listeners to prevent duplicates
    const newHearAgainBtn = hearAgainBtn.cloneNode(true);
    const newCallNowBtn = callNowBtn.cloneNode(true);
    const newHearThenCallBtn = hearThenCallBtn.cloneNode(true);
    
    hearAgainBtn.parentNode.replaceChild(newHearAgainBtn, hearAgainBtn);
    callNowBtn.parentNode.replaceChild(newCallNowBtn, callNowBtn);
    hearThenCallBtn.parentNode.replaceChild(newHearThenCallBtn, hearThenCallBtn);
    
    // Listen Again
    newHearAgainBtn.addEventListener('click', () => {
        timerPopup.classList.add('hidden');
        startTimerPopup(); // Restart timer
    });
    
    // Call Now
    newCallNowBtn.addEventListener('click', () => {
        timerPopup.classList.add('hidden');
        
        // Navigate to call page
        transitionToPhase('phase-5', 'phase-6', startPhase6);
    });
    
    // Listen Then Call
    newHearThenCallBtn.addEventListener('click', () => {
        timerPopup.classList.add('hidden');
        
        // Replay audio
        if (audioElement) {
            audioElement.currentTime = 0;
            if (!audioPlaying) {
                togglePlayPause();
            }
        }
        
        startTimerPopup(); // Restart timer
    });
}

// ===== HELPER FUNCTIONS =====
async function typeText(element, text, speed = 100) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        
        function typeChar() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                resolve();
            }
        }
        
        typeChar();
    });
}

async function typeParagraph(element, text, speed = 50) {
    return new Promise(resolve => {
        const currentText = element.textContent;
        let i = 0;
        
        function typeChar() {
            if (i < text.length) {
                element.textContent = currentText + text.substring(0, i + 1);
                i++;
                setTimeout(typeChar, speed);
            } else {
                resolve();
            }
        }
        
        typeChar();
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function proceedToPhase2() {
    transitionToPhase('phase-1', 'phase-2', startPhase2);
}

function proceedToPhase4() {
    transitionToPhase('phase-2', 'phase-4', startPhase4);
}

function transitionToPhase(fromId, toId, callback) {
    const fromPhase = document.getElementById(fromId);
    const toPhase = document.getElementById(toId);
    
    fromPhase.classList.remove('active');
    setTimeout(() => {
        fromPhase.classList.add('hidden');
        toPhase.classList.remove('hidden');
        setTimeout(() => {
            toPhase.classList.add('active');
            if (callback) callback();
        }, 50);
    }, 500);
}

function showAuthMessage(message, type) {
    const authMessage = document.getElementById('auth-message');
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    
    setTimeout(() => {
        authMessage.textContent = '';
        authMessage.className = 'auth-message';
    }, 3000);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-gradient);
        color: white;
        padding: 12px 24px;
        border-radius: var(--border-radius-md);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: var(--shadow-md);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateVolumeDisplay() {
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    if (volumeSlider && volumeValue) {
        volumeValue.textContent = `${volumeSlider.value}%`;
    }
}

function triggerSuccessAnimation() {
    // Create confetti effect using CSS particles
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.animation = 'float-particle 3s infinite';
    });
    
    // Add some random confetti
    setTimeout(() => {
        createConfetti();
    }, 500);
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b'];
    const container = document.querySelector('.success-animation');
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 2px;
            top: 50%;
            left: 50%;
            animation: confetti-fall ${1 + Math.random()}s ease-in forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        container.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => confetti.remove(), 2000);
    }
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
    
    // Change cursor style on interactive elements
    const interactiveElements = document.querySelectorAll('button, input, .card-box, .hint-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.backgroundColor = 'transparent';
        });
    });
}

// ===== WINDOW RESIZE HANDLER =====
function handleResize() {
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    // Clean up audio resources
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }
    
    if (audioContext) {
        audioContext.close();
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    if (timerPopupTimeout) {
        clearTimeout(timerPopupTimeout);
    }
    
    if (reactionPopupTimeout) {
        clearTimeout(reactionPopupTimeout);
    }
});

// Add confetti animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, 400px) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
    
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 2px;
    }
`;
document.head.appendChild(style);

// For debugging: view all saved reactions
// Uncomment this line to see reactions in console:
// window.viewReactions = viewSavedReactions;
