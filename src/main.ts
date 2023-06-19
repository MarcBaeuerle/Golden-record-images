const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
console.log('test');
console.log('test');
const audioCtx = new window.AudioContext;
const myScript = document.querySelector('script');

const channels = 2;
const frameCount = audioCtx.sampleRate * 2.0;
const myArrayBuffer = audioCtx.createBuffer(2, frameCount, audioCtx.sampleRate);

function whiteNoise() :void {
    for (let channel = 0; channel < channels; channel++) {
        const nowBuffering = myArrayBuffer;
        console.log('test');

    }
}

function init() :void {
    const button = document.querySelector('button');
    button?.addEventListener('click', whiteNoise );
}

document.addEventListener('DOMContentLoaded', init);
