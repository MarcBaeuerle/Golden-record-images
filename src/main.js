
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const CHANNELS = 2;
const HERTZ = 44100;
const CANVAS_HEIGHT = 390;
const CANVAS_WIDTH = 520;


const audioContext = new AudioContext({
    sampleRate: 44100,
});
const analyzer = audioContext.createAnalyser();

let dom = {};
let audio;
let leftChannelData;
let rightChannelData;

const testBuffer = audioContext.createBuffer(
    CHANNELS,
    HERTZ * 1,
    HERTZ
)

function getAudio(){
    fetch(`./src/assets/audio/voyager.mp3`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
            leftChannelData = decodedAudio.getChannelData(0);
            rightChannelData = decodedAudio.getChannelData(1);
            console.log(`Sample rate: ${decodedAudio.sampleRate}`)
            let leftAmplitudeData = Array.from(leftChannelData, sample => Math.abs(sample));
            let rightAmplitudeData = Array.from(rightChannelData, sample => Math.abs(sample));
            //printAudioBuffer(leftAmplitudeData, rightAmplitudeData);
            printAudioBufferTimeFrame(leftAmplitudeData, 900, 901);
        })
        .catch(error => {
            console.log('Error fetching or decoding audio: ', error);
        })
}

//test print float values
function printAudioBuffer(buf1, buf2) {
    console.log(buf1.length / 44100);
    console.log(buf2.length);
    for (let i = 0; i < 10; i++) {
        //console.log(`buf1: ${buf1[i]}, buf2: ${buf2[i]}`);
    }
    return;
}

function printAudioBufferTimeFrame(buf, startTime, endTime) {
    let startSample = Math.floor(startTime * audioContext.samplerate);
    let endSample = Math.floor(endTime * audioContext.samplerate);


    for (let i = startSample; i < endSample; i++) {
        console.log(`buf: ${buf[i]}`);
    }


}

function audioTest(var1) {
    console.log(var1);
}

function populateCanvas() {
    for (let i = 0; i < CANVAS_HEIGHT; i++) {

    }
    
}

function init() {
	dom = {
        button: document.querySelector('button'),
        leftCanvas: document.querySelector('.left-canvas'),
        rightCanvas: document.querySelector('.right-canvas'),
	};

    dom.button.addEventListener('click', () => {
        console.log(`getting data 1 sec`);
        getAudio();
    });
}

document.addEventListener('DOMContentLoaded', init);
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


