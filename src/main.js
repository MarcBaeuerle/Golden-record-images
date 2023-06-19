var AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
console.log('test');
console.log('test');
var audioCtx = new window.AudioContext;
var myScript = document.querySelector('script');
var channels = 2;
var frameCount = audioCtx.sampleRate * 2.0;
var myArrayBuffer = audioCtx.createBuffer(2, frameCount, audioCtx.sampleRate);
function whiteNoise() {
    for (var channel = 0; channel < channels; channel++) {
        var nowBuffering = myArrayBuffer;
        console.log('test');
    }
}
function init() {
    var button = document.querySelector('button');
    button === null || button === void 0 ? void 0 : button.addEventListener('click', whiteNoise);
}
document.addEventListener('DOMContentLoaded', init);
