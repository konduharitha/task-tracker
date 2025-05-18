class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.timerId = null;
        this.currentMode = 'pomodoro';
        this.modes = {
            pomodoro: { time: 25, title: 'Time to focus!' },
            shortBreak: { time: 5, title: 'Time for a short break!' },
            longBreak: { time: 15, title: 'Time for a long break!' }
        };
        this.originalTitle = document.title;
        
        // Create audio element with a different sound URL
        this.audio = new Audio('https://cdn.freesound.org/previews/263/263133_2064400-lq.mp3');
        this.audio.volume = 0.80;
        
        // DOM elements
        this.display = document.querySelector('.timer-display');
        this.startButton = document.querySelector('.timer-controls .start');
        this.resetButton = document.querySelector('.timer-controls .reset');
        this.modeButtons = document.querySelectorAll('.timer-mode button');
        this.statusText = document.querySelector('.timer-status');
        
        // Progress circle elements
        this.progressBar = document.querySelector('.timer-progress-circle .progress-bar');
        this.progressCircumference = 2 * Math.PI * 145; // 2πr where r=145
        this.progressBar.style.strokeDasharray = this.progressCircumference;
        this.progressBar.style.strokeDashoffset = 0;
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.setupAudio();
    }

    setupAudio() {
        // Preload the audio
        this.audio.load();
        
        // Add click event to ensure audio can play
        document.addEventListener('click', () => {
            // Try to play and immediately pause to enable audio
            this.audio.play().then(() => {
                this.audio.pause();
                this.audio.currentTime = 0;
            }).catch(error => {
                console.log('Audio playback failed:', error);
            });
        }, { once: true });
    }

    initializeEventListeners() {
        // Start/Pause button
        this.startButton.addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });

        // Reset button
        this.resetButton.addEventListener('click', () => this.reset());

        // Mode buttons
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const minutes = parseInt(button.dataset.time);
                this.setTime(minutes);
                this.updateModeButtons(button);
            });
        });
    }

    updateModeButtons(activeButton) {
        this.modeButtons.forEach(button => button.classList.remove('active'));
        activeButton.classList.add('active');
        
        // Update current mode and status
        const mode = activeButton.dataset.mode || 'pomodoro';
        this.currentMode = mode;
        this.statusText.textContent = this.modes[mode].title;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    updateDisplay() {
        this.display.textContent = this.formatTime(Math.max(0, this.timeLeft));
        
        // Update progress circle
        if (this.isRunning) {
            const totalTime = this.modes[this.currentMode].time * 60;
            const progress = this.timeLeft / totalTime;
            const offset = this.progressCircumference * (1 - progress);
            this.progressBar.style.strokeDashoffset = offset;
            this.progressBar.classList.add('active');
        } else {
            this.progressBar.classList.remove('active');
        }
    }

    start() {
        if (!this.isRunning && this.timeLeft > 0) {
            this.isRunning = true;
            this.startButton.textContent = 'Pause';
            this.startButton.classList.remove('start');
            this.startButton.classList.add('pause');
            this.display.classList.add('active');
            this.progressBar.classList.add('active');
            
            this.timerId = setInterval(() => {
                this.timeLeft--;
                
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.playAlarm();
                    this.pause();
                    this.reset(); // Auto reset when timer reaches zero
                }
                
                this.updateDisplay();
            }, 1000);
        } else if (this.timeLeft <= 0) {
            // If timer is at 0, reset it before starting
            this.reset();
            this.start();
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timerId);
            this.startButton.textContent = 'Start';
            this.startButton.classList.remove('pause');
            this.startButton.classList.add('start');
            this.display.classList.remove('active');
            this.progressBar.classList.remove('active');
            document.title = this.originalTitle;
        }
    }

    reset() {
        this.pause();
        const activeButton = document.querySelector('.timer-mode button.active');
        const mode = activeButton.dataset.mode || 'pomodoro';
        this.setTime(this.modes[mode].time);
    }

    setTime(minutes) {
        this.pause();
        this.timeLeft = minutes * 60;
        this.progressBar.style.strokeDashoffset = 0;
        this.updateDisplay();
    }

    async playAlarm() {
        try {
            // Create a new Audio instance for each play to avoid conflicts
            const alarmSound = new Audio(this.audio.src);
            alarmSound.volume = this.audio.volume;
            
            // Update page title
            document.title = `⏰ ${this.modes[this.currentMode].title} - ${this.originalTitle}`;
            
            // Play the sound three times
            for (let i = 0; i < 3; i++) {
                await new Promise(resolve => {
                    alarmSound.play();
                    setTimeout(resolve, 700); // Wait 700ms between beeps
                });
            }

            // Reset title after 5 seconds
            setTimeout(() => {
                document.title = this.originalTitle;
            }, 5000);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
}

// Initialize Pomodoro Timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 