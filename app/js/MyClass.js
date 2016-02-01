export default class Player {
    constructor(div) {
        var audio = document.createElement("audio");
        audio.setAttribute("controls","");
        div.appendChild(audio);
    }
}
