//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const channels = 2;

const audioCtx = new window.AudioContext();
let source: object;

const ctx = new AudioContext();
const frameCount = ctx.sampleRate * 2.0; 
const myArrayBuffer = ctx.createBuffer(
    channels, 
    frameCount,
    ctx.sampleRate
);

let audio: object;

function getData(): void{
    source = audioCtx.createBufferSource();
    
    fetch(`./src/assets/audio/voyager.mp3`)
    .then(data => data.arrayBuffer())
    .then(ArrayBuffer => audioCtx.decodeAudioData(ArrayBuffer))
    .then(decodedAudio => {
        audio = decodedAudio;
        console.log(typeof audio);
        console.log(`audo decoded`);
    })
}


function playBack():void {
    console.log(`Entered playBack()`);
    const playSound = ctx.createBufferSource();
    //playSound.buffer = audio;
    playSound.connect(ctx.destination);
    playSound.start(ctx.currentTime);
}
function init() :void {
    const button = document.querySelector('button');
    button?.addEventListener('click', playBack);
}

document.addEventListener('DOMContentLoaded', init);
