// tools.js
let stages = ["study", "break", "long break"];
let stagesTime = ["25:00", "5:00", "15:00"];
let index = 0;
let intervalId;
let timeLeft;

let pomodoroCount = 0; //counts pomodoro cycles before long break

const current = document.getElementById("current");
const displayTimer = document.querySelector(".clock");

// Initialize timer based on current stage time
function initializeTimer() {
    const [mins, secs] = conversion(stagesTime[index]);
    timeLeft = mins * 60 + secs;
    updateDisplay();
    current.textContent = stages[index];
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
    let [min, sec] = conversion(stagesTime[0]);

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

    let studyTime = (min * 60 + sec);
    stagesTime[0] = formatTime(studyTime);

    // Dynamically adjust break, long study & long break (short break = 20%, long break = 60% of study time)
    let shortBreak = Math.floor(studyTime * 0.2);
    let longBreak = Math.floor(studyTime * 0.6)

    stagesTime[1] = formatTime(shortBreak);
    stagesTime[2] = formatTime(longBreak);

    if (current.textContent === "study") {
        initializeTimer();
    }

    console.log(`Updated stagesTime: ${stagesTime}`);
}

// Countdown Timer Logic (keeps timer paused when switching stage)
function timer() {
    const timerEnd = document.getElementById("timer-end");
    timerEnd.volume = 0.25;

    intervalId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            //checks if sound is muted to play timer end audio
            const mute = localStorage.getItem('muteSound') === 'true';
            if (!mute) {
                timerEnd.play();
            }

            clearInterval(intervalId);
            intervalId = null;

            //switches to long break after 4 cycles of study and short break
            if (stages[index] =="study") {
                pomodoroCount++;

                if (pomodoroCount % 4 === 0) {
                    index = stages.indexOf("long break");
                }
                else {
                    index = stages.indexOf("break");
                }
            }
            else {
                if (stages[index] === "long break") {
                    pomodoroCount = 0;
                }
                index = stages.indexOf("study");
            }

            initializeTimer();
            console.log("${stages[index]} is ready to start")
        }
    }, 1000);
}

// Update Timer Display MM:SS
function updateDisplay() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    let formattedTime = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    displayTimer.textContent = formattedTime;

    //updates tab name to show timer
    document.title = `${formattedTime} | ${stages[index][0].toUpperCase() + stages[index].slice(1)}`;
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

// Manual stage switching buttons
function switchToStage(stageName) {
    const targetIndex = stages.indexOf(stageName);
    if (targetIndex !== -1) {
        index = targetIndex;
        initializeTimer();
    }
}


// Go to next stage
function nextStage() {
    //pause
    clearInterval(intervalId);
    intervalId = null;

    //switches to long break after 4 cycles of study and short break
    if (stages[index] =="study") {
        pomodoroCount++;

        if (pomodoroCount % 4 === 0) {
            index = stages.indexOf("long break");
        }
        else {
            index = stages.indexOf("break");
        }
    }
    else {
        if (stages[index] === "long break") {
            pomodoroCount = 0;
        }
        index = stages.indexOf("study");
    }

    current.textContent = stages[index];
    initializeTimer();
    console.log(`Moved to next stage: ${stages[index]}`);
}

// Go to previous stage
function prevStage() {
    //pause
    clearInterval(intervalId);
    intervalId = null;
    
    //switches to long break after 4 cycles of study and short break
    if (stages[index] =="study") {
        pomodoroCount++;

        if (pomodoroCount % 4 === 0) {
            index = stages.indexOf("long break");
        }
        else {
            index = stages.indexOf("break");
        }
    }
    else {
        if (stages[index] === "long break") {
            pomodoroCount = 0;
        }
        index = stages.indexOf("study");
    }

    current.textContent = stages[index];
    initializeTimer();
    console.log(`Moved to previous stage: ${stages[index]}`);
}

initializeTimer();

document.addEventListener('DOMContentLoaded', function () {
    const focusBtn = document.getElementById('focus');
    const nav = document.querySelector('nav');

    focusBtn.addEventListener('click', function () {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', function () {
        if (document.fullscreenElement) {
            nav.classList.add('hide-nav');
        } else {
            nav.classList.remove('hide-nav');
        }
    });
});