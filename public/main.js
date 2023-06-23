"use strict";
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const CHANNELS = 2;
const HERTZ = 44100;
const audioContext = new AudioContext();
const analyzer = audioContext.createAnalyser();
let audio;
const testBuffer = audioContext.createBuffer(CHANNELS, HERTZ * 1, HERTZ);
function getAudio() {
    fetch(`./src/assets/audio/voyager.mp3`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
        audio = decodedAudio;
        console.log(`got audio ${audio}`);
        audioTest(audio);
    });
}
function audioTest(var1) {
    console.log(var1);
}
function init() {
    const button = document.querySelector('button');
    button === null || button === void 0 ? void 0 : button.addEventListener('click', () => {
        console.log(`getting data 1 src`);
        getAudio();
    });
}
//const source = audioContext.createMediaStreamSource();
//source.connect(analyzer);
//analyzer.connect(distortion);
//const channelData = buffer.getChannelData(0);
//
//for (let i = 0; i < buffer.length; i++) {
//    channelData[i] = Math.random() * 2 - 1;
//}
//
//const whiteNoiseSource = audioContext.createBufferSource()
//whiteNoiseSource.buffer = buffer;
//
//const primaryGainControl = audioContext.createGain();
//primaryGainControl.gain.setValueAtTime(0.05, 0);
//
//whiteNoiseSource.connect(primaryGainControl);
//primaryGainControl.connect(audioContext.destination);
document.addEventListener('DOMContentLoaded', init);
