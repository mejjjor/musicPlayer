var Completely = require("./complete.ly.1.0.1.min.js");

var $ = require("jquery");

export default class Search {
    constructor(search, musicPlayer) {
        this.musicPlayer = musicPlayer;
        this.suggest = Completely.completely(search, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#933',
        });
        this.suggest.onChange = (text) => {
            this.suggest.startFrom = text.length;
            var width = search.offsetWidth - this.suggest.dropDown.style.left.slice(0, -2);
            if (width < 30) {
                this.suggest.dropDown.style.visibility = 'hidden';
                this.suggest.hint.style.visibility = 'hidden';
            }
            this.suggest.dropDown.style.maxWidth = width + "px";
        }
        search.addEventListener("blur", (e) => {
            this.suggest.dropDown.style.visibility = 'hidden';
            this.suggest.hint.style.visibility = 'hidden';
        }, true);
        search.addEventListener("focus", (e) => {
            if ((search.offsetWidth - this.suggest.dropDown.style.left.slice(0, -2)) >= 30) {
                this.suggest.dropDown.style.visibility = 'visible';
                this.suggest.hint.style.visibility = 'visible';
            }
        }, true);

        this.suggest.input.addEventListener("keyup", (e) => {
            this.suggestionEvent(e);
        }, true);
        this.suggest.input.addEventListener("paste", (e) => {
            this.suggestionEvent(e);
        }, true);
        this.suggest.input.addEventListener("click", (e) => {
            this.suggestionEvent(e);
        }, true);
    }

    suggestionEvent(e) {
        if (e.keyCode >= 37 && e.keyCode <= 40)
            return;
        if (e.keyCode == 13) {
            this.suggest.dropDown.style.visibility = 'hidden';
            this.suggest.hint.style.visibility = 'hidden';
            return;
        }
        this.suggest.dropDown.style.visibility = 'visible';
        this.suggest.hint.style.visibility = 'visible';

        var apiKey = 'AIzaSyDrc_XoIlz_HqMflR0CHHOyatGemqwgAvo';
        var query = this.suggest.input.value;

        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(this.suggest.input.value).replace(/%20/g, "+"),
            maxResults: 10
        });
        // execute the request
        if (query != "") {
            request.execute((response) => {
                $("#results").html("");
                var results = response.result;
                $.each(results.items, (index, item) => {
                    var div = document.createElement("div");
                    var icon = document.createElement("i");
                    icon.className = "fa fa-plus-circle fa-3x";
                    div.appendChild(icon);
                    var thumbnail = document.createElement("img");
                    thumbnail.setAttribute("src", item.snippet.thumbnails.default.url);
                    div.appendChild(thumbnail);
                    var title = document.createElement("div");
                    title.innerHTML = item.snippet.title;
                    div.appendChild(title);
                    document.getElementById("results").appendChild(div);

                    icon.addEventListener("click", () => {
                        this.musicPlayer.addVideoToPlaylist(item.snippet.title, item.id.videoId);
                    });
                });
            });
        }

        if (query === "") {
            this.suggest.dropDown.style.visibility = 'hidden';
        } else {
            $.ajax({
                url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
                dataType: 'jsonp',
                success: (data, textStatus, request) => {
                    this.suggest.options = _.map(data[1], function(o) {
                        return o[0].substring(query.length)
                    });;
                    this.suggest.repaint();
                }
            });
        }
    }
}
