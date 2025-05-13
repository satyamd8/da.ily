let stages = ["study", "break", "long study", "long break"];
let stagesTime = ["25:00", "5:00", "35:00", "15:00"];
let index = 0;
let intervalId;
let timeLeft;

const current = document.getElementById("current");
const displayTimer = document.querySelector(".clock");

// Initialize timer based on current stage time
function initializeTimer() {
    const [mins, secs] = conversion(stagesTime[index]);
    timeLeft = mins * 60 + secs;
    updateDisplay();
}

// Start/Pause Timer
function playPause() {
    if (!intervalId) {
        timer();
        console.log("Timer start");
    } else {
        clearInterval(intervalId);
        intervalId = null;
        console.log("Timer pause");
    }
}

// Reset Timer for current stage
function reset() {
    initializeTimer();
    console.log("Reset timer");
}

// Adjust study time (+1 / -1 min) or (+5 / -5 sec)
function adjustTime(type, value) {
    let [min, sec] = conversion(stagesTime[0]); // Always adjust study time (index 0)

    if (type === 'min') {
        min = Math.max(0, min + value);
    } else if (type === 'sec') {
        sec += value * 5;
        if (sec >= 60) {
            sec = 0;
            min++;
        } else if (sec < 0) {
            if (min > 0) {
                sec = 55;
                min--;
            } else {
                sec = 0;
            }
        }
    }

    stagesTime[0] = formatTime(min * 60 + sec); // Update study time string

    // Dynamically adjust break, long study & long break (40% of study time)
    let extraTime = Math.round((min * 60 + sec) * 0.4);
    stagesTime[1] = formatTime(extraTime); // break
    stagesTime[2] = formatTime(extraTime); // long study
    stagesTime[3] = formatTime(extraTime); // long break

    // Re-initialize current timer if on study
    if (current.textContent === "study") {
        initializeTimer();
    }

    console.log(`Updated stagesTime: ${stagesTime}`);
}

// Countdown Timer Logic
function timer() {
    intervalId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            // Switch to next stage
            index = (index + 1) % stages.length;
            current.textContent = stages[index];
            initializeTimer();
        }
    }, 1000);
}

// Update Timer Display MM:SS
function updateDisplay() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    displayTimer.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Convert "MM:SS" to [min, sec]
function conversion(timerStr) {
    let [mins, secs] = timerStr.split(':').map(Number);
    return [mins, secs];
}

// Format seconds into "MM:SS"
function formatTime(totalSeconds) {
    let min = Math.floor(totalSeconds / 60);
    let sec = totalSeconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Initialize first load
initializeTimer();