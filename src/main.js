let debug = 0;
// 512 columns make up one image
// each column is 8.3ms long
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const CHANNELS = 2;
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
const SAMPLE_RATE = 44100;
const IMG_DATA = {
    offset: 0,
    left: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        amplitudeData: null,
        pointer: 0,
                        // "Welcome to the digital stone age" - Ron Barry
        timeStamps: [
            691479, 956699, 1226764, 1488444, 1746346, 2003886, 2253818,            //0
            2495501, 2738833, 2981916, 3295249, 3549540, 3812059, 4072272,          //7
            4322136, 4575677, 4822611, 5060736, 5312170, 5569428, 5809626,          //14
            6060410, 6312643, 6581734, 6837650, 7088915, 7340062, 7597294,          //21
            7843816, 8098952, 8356665, 8598180, 8873049, 9132202, 9386246,          //28
            9642641, 9897876, 10149529, 10422986, 10672601, 10931249, 11187243,     //35
            11444253, 11702810, 11961521, 12220751, 12480495, 12724703, 12977799,   //42
            13234000, 13492635, 13752796, 13998981, 14249093, 14495646, 14746329,   //49
            14999878, 15249029, 15499590, 15755055, 15996882, 16247674, 16493176,   //56
            16748591, 17006625, 17265784, 17511919, 17772949, 18015077, 18278128,   //63
            18541817, 18838219, 19081581, 19338182, 19582170, 19829758, 20078770,   //70
            20354900                                                                //77
        ],
        colors: [
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",   //0
            "bnw", "bnw", "bnw", "red", "grn", "blu", "red", "grn", "blu", "bnw",   //10
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",   //20
            "blu", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",   //30
            "bnw", "red", "grn", "blu", "red", "grn", "blu", "red", "grn", "blu",   //40
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",   //50
            "blu", "red", "grn", "blu", "bnw", "red", "grn", "blu", "red", "grn",   //60
            "blu", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw",             //70
        ],
    },

    right: {
        go: true,
        amplitudeData: null,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        pointer: 0,
        timeStamps: [
            748881, 995880, 1256346, 1519980, 1776918, 2029338, 2275851,            //0
            2522144, 2774972, 3023788, 3288648, 3537656, 3790711, 4046923,          //7
            4299934, 4548285, 4804358, 5055090, 5310427, 5566445, 5819090,          //14
            6069487, 6325550, 6582765, 6836043, 7093042, 7351177, 7600559,          //21
            7849962, 8115741, 8366424, 8624873, 8877756, 9129103, 9377380,          //28
            9625985, 9876773, 10129022, 10380286, 10629822, 10889655, 11140077,     //35
            11396186, 11641174, 11900453, 12143850, 12398103, 12654434, 12911229,   //42
            13170090, 13427893, 13692082, 13946719, 14205961, 14468525, 14719864,   //49
            14959214, 15213806, 15469032, 15723726, 15973659, 16223783, 16476165,   //56
            16738170, 16996230, 17249097, 17504002, 17764240, 18023237, 18294660,   //63
            18550444, 18831088, 19079192, 19331292, 19592658, 19839241, 20089443,   //70 
            20338733                                                                //77
        ],
        colors: [
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",   //0
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",   //10
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",   //20
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",   //30
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",   //40
            "bnw", "bnw", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "bnw",   //50
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red",   //60
            "grn", "blu", "bnw", "red", "grn", "blu", "bnw", "bnw",             //70
        ],
    }
}


const audioContext = new AudioContext({
    sampleRate: SAMPLE_RATE,
});
const analyzer = audioContext.createAnalyser();

let dom = {};
let context;
let audio;
let leftChannelData;
let rightChannelData;
let gotAudio = false;

function getAudio(){
    fetch(`./src/assets/audio/voyager.mp3`)
    //fetch(`./src/assets/audio/384kHzStereo.wav`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
            leftChannelData = decodedAudio.getChannelData(0);
            rightChannelData = decodedAudio.getChannelData(1);
            if (debug) console.log(`Sample rate: ${decodedAudio.sampleRate}`)
            if (debug) console.log(`Length ${leftChannelData.length / decodedAudio.sampleRate}`);
            let leftAmplitudeData = Array.from(leftChannelData, sample => sample);
            let rightAmplitudeData = Array.from(rightChannelData, sample => Math.abs(sample));
            IMG_DATA.left.amplitudeData = Array.from(leftChannelData, sample => sample);
            IMG_DATA.right.amplitudeData = Array.from(rightChannelData, sample => sample);
            printAudioBufferTimeFrame(leftAmplitudeData, 0, 1);

            gotAudio = true;
            console.log(`Got audio`);
        })
        .catch(error => {
            if (debug) console.log('Error fetching or decoding audio: ', error);
        })
}

//test print float values
function printAudioBuffer(buf1, buf2) {
    if (debug) console.log(buf1.length / 44100);
    if (debug) console.log(buf2.length);
    for (let i = 0; i < 10; i++) {
        //if (debug) console.log(`buf1: ${buf1[i]}, buf2: ${buf2[i]}`);
    }
    return;
}

function printAudioBufferTimeFrame(buf, startTime, endTime) {
    let startSample = Math.floor(startTime * SAMPLE_RATE);
    let endSample = Math.floor(endTime * SAMPLE_RATE);
    if (debug) console.log(`between: ${startTime} and ${endTime}`);
    if (debug) console.log(`start: ${startSample} + end: ${endSample}`);
 
    let total = 0
    let max = 0;
    for (let i = startSample; i < endSample; i++) {
        //if (debug) console.log(`${i} buf: ${buf[i]}`);
        if (buf[i] > max) {
            max = buf[i];
        }
        //if (debug) console.log(`${i} diff: ${buf[i] - buf[i-1]}`)
        total += 1;
    }
    if (debug) console.log(total);
    if (debug) console.log(max);
}

function updateOscilloscope(channel, index) {
}

function visualizeAudio(audioBuffer) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    //analyser.connect(audioContext.destination);

    //analyser setup
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        analyser.getByteTimeDomainData(dataArray);

        context.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

        const bufferLength = dataArray.length;
        const sliceWidth = dom.canvas.width / bufferLength;
        let x = 0;

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(0,0,0)';

        for (let i = 0; i < bufferLength; i++) {
            const sample = dataArray[i] / 128.0;
            const y = (sample * dom.canvas.height) / 2;

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }

            x += sliceWidth;
        }

        context.lineTo(dom.canvas.width, dom.canvas.height / 2);
        context.stroke();
    }

    source.start(0);
    renderFrame();
}

function findNextPeak(channel, position) {
    const LOCAL_MIN = position + 730;
    const LOCAL_MAX = position + 740;
    
    if (LOCAL_MAX > channel.amplitudeData.length) return;

    let newMax = 0;
    let newPosition = position;

    for (let i = LOCAL_MIN; i < LOCAL_MAX; i++){
        if (channel.amplitudeData[i] > newMax) {
            newMax = channel.amplitudeData[i];
            newPosition = i;
        }
    }
    channel.pointer = newPosition;
}

function drawSingleLine(channel, position, wIndex, rgb) {
    let canvas = channel.imageCanvas;
    let context = canvas.getContext('2d', { willReadFrequently: true });


    let previousImageData = context.getImageData(wIndex, 0, 1, CANVAS_HEIGHT);
    let linePixelRow = previousImageData.data;

    for (let i = 0; i < CANVAS_HEIGHT; i++) {
        let intensity = Math.floor(108 - channel.amplitudeData[position + i] * 2555);
        if (rgb === "bnw") {
            linePixelRow[0+i*4] = intensity; //red
            linePixelRow[1+i*4] = intensity; //green
            linePixelRow[2+i*4] = intensity; //blue
        } else if (rgb === "red") {
            linePixelRow[0+i*4] = intensity; //red
            linePixelRow[1+i*4] = 0; //green
            linePixelRow[2+i*4] = 0; //blue
        } else if (rgb === "grn") {
            linePixelRow[1+i*4] = intensity; //green
        } else if (rgb === "blu") {
            linePixelRow[2+i*4] = intensity; //blue
        }
        linePixelRow[3+i*4] = 255;
    }

    context.putImageData(previousImageData, wIndex, 0);

}

function displayImage(channel, index) {
    channel.go = false;
    channel.pointer = channel.timeStamps[index];
    let oldPosition;

    let i = 0;
    const rgb = channel.colors[IMG_DATA.offset];

    const interval = setInterval(() => {
        if (i === CANVAS_WIDTH) {
            clearInterval(interval);
            setTimeout(() => {
                channel.go = true;
            }, 500);
            return;
        }
        drawSingleLine(channel, channel.pointer, i, rgb);

        if (i % 2 === 0 && i!= 0) {
            findNextPeak(channel, oldPosition);
        } else {
            oldPosition = channel.pointer;
            channel.pointer += CANVAS_HEIGHT;
        }
        i++;
    }, 8);
}

function updateImageOffset(caller, num) {

    if (caller === "slider") {
        IMG_DATA.offset = num;
        console.log(IMG_DATA.offset);
        return;
    }  

    if (IMG_DATA.offset < 78) {
        IMG_DATA.offset += 1;
    } else {
        IMG_DATA.offset = 0;
    }
    console.log(IMG_DATA.offset);
}

function startDisplayingChannel(channel, updater) {
    setInterval(() => {
        if (!gotAudio) return;
        if (channel.go) {
            displayImage(channel, IMG_DATA.offset);
            updateOscilloscope(channel, IMG_DATA.offset);

            //prevents updateImageOffset() from getting called twice
            if (updater) updateImageOffset("auto", 0);
        }
    }, 1000);
}

function init() {
	dom = {
        leftCanvas: document.querySelector('.left-canvas'),
        rightCanvas: document.querySelector('.right-canvas'),
        canvas: document.querySelector('#leftWaveformCanvas'),
        drawBtn: document.querySelector("#draw-circle"),
        imgSelector: document.querySelector("#imgSelector"),
	};

    IMG_DATA.right.oscilliscopeCanvas = document.querySelector("#rightWaveformCanvas");
    IMG_DATA.right.imageCanvas = document.querySelector("#rightChannelImage");
    IMG_DATA.left.oscilliscopeCanvas = document.querySelector("#leftWaveformCanvas");
    IMG_DATA.left.imageCanvas = document.querySelector("#leftChannelImage");
    
    CANVAS_WIDTH = IMG_DATA.right.imageCanvas.width;
    CANVAS_HEIGHT = IMG_DATA.right.imageCanvas.height;
    getAudio();
    
    context = dom.canvas.getContext('2d', { willReadFrequently: true });

    dom.imgSelector.addEventListener('input', () => {
        updateImageOffset("slider", Number(dom.imgSelector.value));
        console.log(`SLIDER MOVED`);
    });

    dom.drawBtn.addEventListener('click', () => {
        startDisplayingChannel(IMG_DATA.left, 0);
        startDisplayingChannel(IMG_DATA.right, 1);
    });

}

document.addEventListener('DOMContentLoaded', init);

