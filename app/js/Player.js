var jsmediatags = require("jsmediatags");

export default class Player {
    constructor(div) {
        var self = this;
        //audio player
        this.audio = document.createElement("audio");
        this.audio.setAttribute("controls", "");
        div.appendChild(this.audio);
        this.audio.onended = function() {
            self.playNext();
        }

        //playlist
        this.playlist = document.createElement("div");
        this.playlist.setAttribute("id", "playlist");
        div.appendChild(this.playlist);
        this.currentIndex = 0;
        //add song
        var inputFile = document.createElement("input");
        inputFile.setAttribute("id", "inputFile");
        inputFile.setAttribute("type", "file");
        inputFile.setAttribute("multiple", "");
        var label = document.createElement("label");
        label.setAttribute("for", "inputFile");
        var icon = document.createElement("i");
        icon.className = "fa fa-plus-circle fa-3x";
        label.appendChild(icon);
        div.appendChild(inputFile);
        div.appendChild(label);

        //init playlist
        this.dataPlaylist = [];
        inputFile.addEventListener("change", function() {
            for (var i = 0; i < inputFile.files.length; i++) {
                (function(i) {
                    jsmediatags.read(inputFile.files[i], {
                        onSuccess: function(tag) {
                            self.addToPlaylist(tag.tags, inputFile.files[i]);
                        },
                        onError: function(error) {
                            console.log(error.info);
                        }
                    });
                })(i);
            }
        });
    }

    addToPlaylist(data, file) {
        var self = this;
        var playlistItem = document.createElement("div");
        var icon = document.createElement("i");
        icon.className = "fa fa-play-circle fa-3x";
        icon.addEventListener("click", function() {
            self.playTrack(file);
        });
        playlistItem.appendChild(icon);
        var trackInfo = document.createElement("div");
        var artist = document.createElement("div");
        artist.innerHTML = data.artist;
        var title = document.createElement("div");
        title.innerHTML = data.title;
        trackInfo.appendChild(artist);
        trackInfo.appendChild(title);
        playlistItem.appendChild(trackInfo);
		var userInfo = document.createElement("div");
        userInfo.innerHTML = "user + picture !"
        playlistItem.appendChild(userInfo);
        this.playlist.appendChild(playlistItem);
        this.dataPlaylist.push(file);
    }

    playNext() {
    	var self = this;
        if (this.currentIndex < this.dataPlaylist.length) {
            self.playTrack(this.dataPlaylist[this.currentIndex+1]);
        }
    }

    playTrack(file) {
        this.audio.setAttribute("src", URL.createObjectURL(file));
        this.audio.play();
        this.playlist.childNodes[this.currentIndex].className = "";
        this.currentIndex = this.dataPlaylist.indexOf(file);
        this.playlist.childNodes[this.currentIndex].className = "currentTrack";

    }
}
