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
// function pause(){
//     if(playPause === true){
//         playPause = false;
//     }
// }
// function play(){
//     if(playPause===false){
//         playPause = true;
//     }
// }