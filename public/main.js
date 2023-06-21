"use strict";
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const channels = 2;
const ctx = new AudioContext();
const frameCount = ctx.sampleRate * 2.0;
const myArrayBuffer = ctx.createBuffer(channels, frameCount, ctx.sampleRate);
let audio;
fetch(`./src/assets/audio/voyager.mp3`)
    .then(data => data.arrayBuffer())
    .then(ArrayBuffer => ctx.decodeAudioData(ArrayBuffer))
    .then(decodedAudio => {
    audio = decodedAudio;
    console.log(typeof audio);
    console.log(`audo decoded`);
});
function playBack() {
    console.log(`Entered playBack()`);
    const playSound = ctx.createBufferSource();
    playSound.buffer = audio;
    playSound.connect(ctx.destination);
    playSound.start(ctx.currentTime);
}
function init() {
    const button = document.querySelector('button');
    button === null || button === void 0 ? void 0 : button.addEventListener('click', playBack);
}
document.addEventListener('DOMContentLoaded', init);
