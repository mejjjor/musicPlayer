import Player from "./Player";
var $ = require('jquery');
require('jquery-ui');

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {
    var player = new Player(document.getElementById("audio"));
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

$(function() {
    $("form").on("submit", function(e) {
        e.preventDefault();
        // prepare the request
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(document.getElementById("search").value).replace(/%20/g, "+"),
            maxResults: 10
        });
        // execute the request
        request.execute(function(response) {
            var results = response.result;
            $("#results").html("");
            $.each(results.items, function(index, item) {
                $.get("tpl/item.html", function(data) {
                    $("#results").append(tplawesome(data, [{
                        "title": item.snippet.title,
                        "videoid": item.id.videoId
                    }]));
                });
            });
            resetVideoHeight();
        });
    });

    $(window).on("resize", resetVideoHeight);
});

function resetVideoHeight() {
    $(".video").css("height", $("#results").width() * 9 / 16);
}
