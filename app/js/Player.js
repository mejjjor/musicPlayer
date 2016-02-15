var jsmediatags = require("jsmediatags");
var Sortable = require("./sortable");
var _ = require("lodash");

export default class Player {
    constructor(div) {
        //audio player
        this.audio = document.createElement("audio");
        div.appendChild(this.audio);
        this.audio.onended = () => {
            this.playNext();
        }

        div.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.stopPropagation();

        }, true);
        div.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.getFiles(_.values(e.dataTransfer.files));

        }, true);

        //control
        var progressTime = document.createElement("input");
        progressTime.setAttribute("min", 0);
        progressTime.setAttribute("max", 100);
        progressTime.setAttribute("value", 0);
        progressTime.setAttribute("type", "range");
        div.appendChild(progressTime);
        progressTime.addEventListener("input", () => {
            if (this.audio.currentSrc != "") {
                this.audio.currentTime = this.audio.duration * progressTime.value / 100;
            } else {
                progressTime.value = 0;
            }
        }, false);

        var timer = document.createElement("span");
        div.appendChild(timer);

        this.audio.addEventListener("timeupdate", () => {
            progressTime.value = this.audio.currentTime * 100 / this.audio.duration;
            timer.innerHTML = this.formatTime(this.audio.currentTime);
        });

        var volumeOn = document.createElement("i");
        volumeOn.className = "fa fa-volume-up fa-2x";
        volumeOn.style.display = 'none';
        div.appendChild(volumeOn);

        var volumeOff = document.createElement("i");
        volumeOff.className = "fa fa-volume-off fa-2x";
        div.appendChild(volumeOff);
        volumeOn.addEventListener("click", () => {
            if (this.audio.currentSrc != "") {
                this.audio.volume = 1;
                volumeOn.style.display = 'none';
                volumeOff.style.display = 'inline';
            }
        }, false);
        volumeOff.addEventListener("click", () => {
            if (this.audio.currentSrc != "") {
                this.audio.volume = 0;
                volumeOn.style.display = 'inline';
                volumeOff.style.display = 'none';
            }
        }, false);

        //playlist
        this.playlist = document.createElement("ol");
        var sortable = Sortable.create(this.playlist, {
            animation: 150,
            onEnd: (evt) => {
                let el = this.dataPlaylist[this.currentIndex];
                this.dataPlaylist.splice(evt.newIndex, 0, this.dataPlaylist.splice(evt.oldIndex, 1)[0]);
                this.currentIndex = this.dataPlaylist.indexOf(el);
            }
        });
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
        inputFile.addEventListener("change", () => {
            this.getFiles(_.values(inputFile.files));
        });
    }

    addToPlaylist(data, file) {
        var dataFile = {
            file: file,
            url: URL.createObjectURL(file)
        }
        this.dataPlaylist.push(dataFile);
        var playlistItem = document.createElement("li");
        playlistItem.setAttribute("draggable", "true");
        var iconPause = document.createElement("i");
        iconPause.className = "fa fa-pause-circle fa-3x";
        iconPause.style.display = 'none';
        iconPause.addEventListener("click", () => {
            this.audio.pause();
            iconPause.style.display = 'none';
            iconPlay.style.display = 'block';
        });

        var iconPlay = document.createElement("i");
        iconPlay.className = "fa fa-play-circle fa-3x";
        var audio = this.audio;
        iconPlay.addEventListener("click", () => {
            if (audio.currentSrc === dataFile.url && !audio.ended) {
                audio.play();
            } else {
                this.playTrack(dataFile);
            }
            iconPause.style.display = 'block';
            iconPlay.style.display = 'none';
        });

        playlistItem.appendChild(iconPlay);
        playlistItem.appendChild(iconPause);
        var trackInfo = document.createElement("div");
        var artist = document.createElement("div");
        // var regex = /\w(\w| )+\w[^.mp3| |.acc]/g;
        // if (data.artist === undefined)
        //     data.artist = regex.exec(file.name)[0];
        artist.innerHTML = data.artist;
        var title = document.createElement("div");
        // if (data.title === undefined)
        //     data.artist = regex.exec(file.name)[1];
        title.innerHTML = data.title;
        trackInfo.appendChild(artist);
        trackInfo.appendChild(title);
        playlistItem.appendChild(trackInfo);
        var userInfo = document.createElement("div");
        userInfo.innerHTML = "  user + picture !"
        playlistItem.appendChild(userInfo);
        this.playlist.appendChild(playlistItem);
    }

    playNext() {
        if (this.currentIndex < this.dataPlaylist.length && this.currentIndex != -1) {
            this.playlist.childNodes[this.currentIndex + 1].childNodes[0].style.display = 'none';
            this.playlist.childNodes[this.currentIndex + 1].childNodes[1].style.display = 'block';
            this.playTrack(this.dataPlaylist[this.currentIndex + 1]);
        }
    }

    playTrack(dataFile) {

        if (this.currentIndex != -1) {
            this.playlist.childNodes[this.currentIndex].className = "";
            this.playlist.childNodes[this.currentIndex].childNodes[0].style.display = 'block';
            this.playlist.childNodes[this.currentIndex].childNodes[1].style.display = 'none';
        }
        if (dataFile != undefined) {
            this.audio.setAttribute("src", dataFile.url);
            this.audio.play();
            this.currentIndex = this.dataPlaylist.indexOf(dataFile);
            if (this.currentIndex != -1) {
                this.playlist.childNodes[this.currentIndex].className = "currentTrack";
            }
        }
    }

    getFiles(files) {
        for (let file of files) {
            ((file) => {
                jsmediatags.read(file, {
                    onSuccess: (tag) => {
                        this.addToPlaylist(tag.tags, file);
                    },
                    onError: function(error) {
                        console.log(error.info);
                    }
                });
            })(file);
        }
    }

    formatTime(time) {
        if (isNaN(time)) {
            return "0 : 0";
        }
        time = Math.round(time);
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return minutes + ":" + seconds;
    }
}
