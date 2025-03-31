//This will keep track whether the time is running or not
let is_playing = false;
let intervalId;
let display = document.getElementById("current")

function playPause(){
    if(is_playing == true){
        is_playing = false;
        console.log("is currently paused");
    }else{
        is_playing = true;
        console.log("is currently playing");
    }
}

let clockElement = document.querySelector(".clock");
function reset(){
    clockElement.textContent = "25:00";
    console.log("reset timer");
}

let stages = ["study", "break", "long break"]
let current = document.getElementById("current")
function currentStage(){
    //We want to change the display to show which one we are on now
    //Also include animation
}

//This will unmute the lofi video
function unmuteVideo() {
    let iframe = document.getElementById("youtubePlayer");
    let src = iframe.src.replace("mute=1", "mute=0");
    iframe.src = src; // Reloads video with sound
}