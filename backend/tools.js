//This will keep track whether the time is running or not
let stages = ["study", "break", "long break"]
let stagesTime = ["25:00", "5:00", "15:00"]
let index = 0
let current = document.getElementById("current")
let displayTimer = document.querySelector(".clock")
let time = conversion(displayTimer.textContent)
let timeLeft = time[0] * 60 + time[1]
let intervalId;

function playPause(){
    if(!intervalId){
        timer();
        console.log("Timer start")
    }else{
        clearInterval(intervalId);
        intervalId = null;
        console.log("Timer pause")
    }
}
function reset(){
    displayTimer.textContent = stagesTime[index];
    time = conversion(displayTimer.textContent)
    timeLeft = time[0] * 60 + time[1]
    console.log("reset timer");
}


function timer(){
    //We want to change the display to show which one we are on now
    //Also include animation
    intervalId = setInterval (()=>{
        let min = parseInt(Math.floor(timeLeft/60))
        let sec = timeLeft % 60

        let format = `${min}:${String(sec).padStart(2, '0')}`;        
        displayTimer.textContent = format

        if(timeLeft > 0){
            timeLeft--;
        }
        else if(timeLeft == 0){
            index++
            current.textContent = stages[index]
            reset()
        }else{
            clearInterval(intervalId)
        }
    }, 1000)
}

function conversion(timer){
    let mins = parseInt(timer.substring(0, timer.indexOf(':')));
    let seconds = parseInt(timer.substring(timer.indexOf(':')+1));
    return [mins,seconds]
}
