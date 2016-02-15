import Player from "./Player";
var completely = require("./complete.ly.1.0.1.min.js");
var $ = require("jquery");
var _ = require("lodash");

var player;
var suggest;

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

global.init = function() {
    gapi.client.setApiKey("AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo");
    gapi.client.load("youtube", "v3", function() {
            // player = new YT.Player('video-placeholder', {
            //     width: 600,
            //     height: 400,
            //     videoId: 'Xa0Q0J5tOP0',
            //     playerVars: {
            //         color: 'white',
            //         playlist: 'taJ60kskkns,FG0fTKAqZ5g'
            //     },
            //     events: {
            //         onReady: initialize
            //     }
            // });

    });
}

function initialize(){

    // Update the controls on load
    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    var time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000)
    clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.

}

function updateTimerDisplay(){
    // Update current time text display.
    $('#current-time').text(formatTime( player.getCurrentTime() ));
    $('#duration').text(formatTime( player.getDuration() ));
}

function formatTime(time){
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

$('#progress-bar').on('mouseup touchend', function (e) {

    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = player.getDuration() * (e.target.value / 100);

    // Skip video to new time.
    player.seekTo(newTime);

});
function updateProgressBar(){
    // Update the value of our progress bar accordingly.
    $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
}

$('#play').on('click', function () {
    player.playVideo();
});

$('#pause').on('click', function () {
    player.pauseVideo();
});

domReady(function() {

    var player = new Player(document.getElementById("audio"));
    var search = document.getElementById('search');
    suggest = completely.completely(search, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#933',
    });
    suggest.onChange = function(text) {
        suggest.startFrom = text.length;
        var width = search.offsetWidth - suggest.dropDown.style.left.slice(0, -2);
        if (width < 30) {
            suggest.dropDown.style.visibility = 'hidden';
            suggest.hint.style.visibility = 'hidden';
        }
        suggest.dropDown.style.maxWidth = width + "px";
    }
    search.addEventListener("blur", function(e) {
        suggest.dropDown.style.visibility = 'hidden';
        suggest.hint.style.visibility = 'hidden';
    }, true);
    search.addEventListener("focus", function(e) {
        if ((search.offsetWidth - suggest.dropDown.style.left.slice(0, -2)) >= 30) {
            suggest.dropDown.style.visibility = 'visible';
            suggest.hint.style.visibility = 'visible';
        }
    }, true);

    suggest.input.addEventListener("keyup", suggestionEvent, true);
    suggest.input.addEventListener("paste", suggestionEvent, true);
    suggest.input.addEventListener("click", suggestionEvent, true);


});



function tplawesome(e, t) {
    var res = e;
    for (var n = 0; n < t.length; n++) {
        res = res.replace(/\{\{(.*?)\}\}/g, function(e, r) {
            return t[n][r]
        })
    }
    return res;
}



function suggestionEvent(e) {
    if (e.keyCode >= 37 && e.keyCode <= 40)
        return;
    if (e.keyCode == 13) {
        suggest.dropDown.style.visibility = 'hidden';
        suggest.hint.style.visibility = 'hidden';
        return;
    }
    suggest.dropDown.style.visibility = 'visible';
    suggest.hint.style.visibility = 'visible';

    var apiKey = 'AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo';
    var query = suggest.input.value;

    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: encodeURIComponent(suggest.input.value).replace(/%20/g, "+"),
        maxResults: 10
    });
    // execute the request
    if (query != "") {
        request.execute(function(response) {
            $("#results").html("");
            var results = response.result;
            $.each(results.items, function(index, item) {
                $.get("tpl/item.html", function(data) {
                    $("#results").append(tplawesome(data, [{
                        "title": item.snippet.title,
                        "videoId": item.id.videoId,
                        "thumbnailsUrl": item.snippet.thumbnails.default.url

                    }]));
                });
            });
        });
    }


    if (query === "") {
        suggest.dropDown.style.visibility = 'hidden';
    } else {
        $.ajax({
            url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
            dataType: 'jsonp',
            success: function(data, textStatus, request) {
                suggest.options = _.map(data[1], function(o) {
                    return o[0].substring(query.length)
                });;

                suggest.repaint();

            }
        });
    }
}
