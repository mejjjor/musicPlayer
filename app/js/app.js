import Player from "./Player";
import Search from "./Search";
var $ = require("jquery");
var _ = require("lodash");

var player;
var musicPlayer;

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};


domReady(function() {
    musicPlayer = new Player(document.getElementById("audio"));
    var search = new Search(document.getElementById('search'), musicPlayer);
});


global.init = function() {
    gapi.client.setApiKey("AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo");
    gapi.client.load("youtube", "v3", function() {
        // player = new YT.Player('video-placeholder', {
        //     width: 600,
        //     height: 400,
        //     videoId: 'Xa0Q0J5tOP0',
        //     events: {
        //         onReady: initialize
        //     }
        // });
        console.log("YT READDDYY!");
    });
}

global.initialize = function() {
    musicPlayer.initializedVideo();
    // // Update the controls on load
    // updateTimerDisplay();
    // updateProgressBar();

    // // Clear any old interval.
    // var time_update_interval = setInterval(function() {
    //     updateTimerDisplay();
    //     updateProgressBar();
    // }, 1000)
    // clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.

}

function updateTimerDisplay() {
    // Update current time text display.
    $('#current-time').text(formatTime(player.getCurrentTime()));
    $('#duration').text(formatTime(player.getDuration()));
}

function formatTime(time) {
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

$('#progress-bar').on('mouseup touchend', function(e) {

    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = player.getDuration() * (e.target.value / 100);

    // Skip video to new time.
    player.seekTo(newTime);

});

function updateProgressBar() {
    // Update the value of our progress bar accordingly.
    $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
}

$('#play').on('click', function() {
   // player.playVideo();
});

$('#pause').on('click', function() {
   // player.pauseVideo();
});
