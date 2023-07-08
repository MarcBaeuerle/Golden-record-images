"use strict";
let debug = 0;
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
const SAMPLE_RATE = 44100;
const IMG_DATA = {
    pause: false,
    offset: 0,
    left: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        amplitudeData: [],
        pointer: 0,
        // "Welcome to the digital stone age" - Ron Barry
        timeStamps: [
            691479, 956699, 1226764, 1488444, 1746346, 2003886, 2253818,
            2495501, 2738833, 2981916, 3295249, 3549540, 3812059, 4072272,
            4322136, 4575677, 4822611, 5060736, 5312170, 5569428, 5809626,
            6060410, 6312643, 6581734, 6837650, 7088915, 7340062, 7597294,
            7843816, 8098952, 8356665, 8598180, 8873049, 9132202, 9386246,
            9642641, 9897876, 10149529, 10422986, 10672601, 10931249, 11187243,
            11444253, 11702810, 11961521, 12220751, 12480495, 12724703, 12977799,
            13234000, 13492635, 13752796, 13998981, 14249093, 14495646, 14746329,
            14999878, 15249029, 15499590, 15755055, 15996882, 16247674, 16493176,
            16748591, 17006625, 17265784, 17511919, 17772949, 18015077, 18278128,
            18541817, 18838219, 19081581, 19338182, 19582170, 19829758, 20078770,
            20354900 //77
        ],
        colors: [
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "red", "grn", "blu", "red", "grn", "blu", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",
            "blu", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "red", "grn", "blu", "red", "grn", "blu", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",
            "blu", "red", "grn", "blu", "bnw", "red", "grn", "blu", "red", "grn",
            "blu", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", //70
        ],
        space: 948540,
    },
    right: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        amplitudeData: [],
        pointer: 0,
        timeStamps: [
            748881, 995880, 1256346, 1519980, 1776918, 2029338, 2275851,
            2522144, 2774972, 3023788, 3288648, 3537656, 3790711, 4046923,
            4299934, 4548285, 4804358, 5055090, 5310427, 5566445, 5819090,
            6069487, 6325550, 6582765, 6836043, 7093042, 7351177, 7600559,
            7849962, 8115741, 8366424, 8624873, 8877756, 9129103, 9377380,
            9625985, 9876773, 10129022, 10380286, 10629822, 10889655, 11140077,
            11396186, 11641174, 11900453, 12143850, 12398103, 12654434, 12911229,
            13170090, 13427893, 13692082, 13946719, 14205961, 14468525, 14719864,
            14959214, 15213806, 15469032, 15723726, 15973659, 16223783, 16476165,
            16738170, 16996230, 17249097, 17504002, 17764240, 18023237, 18294660,
            18550444, 18831088, 19079192, 19331292, 19592658, 19839241, 20089443,
            20338733 //77
        ],
        colors: [
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red",
            "grn", "blu", "bnw", "red", "grn", "blu", "bnw", "bnw", //70
        ],
        space: 988053,
    }
};
const audioContext = new AudioContext({
    sampleRate: SAMPLE_RATE,
});
let dom = {
    drawBtn: null,
    imgSelector: null,
    imgNumber: null,
    pauseBtn: null,
};
let gotAudio = false;
function init() {
    var _a, _b, _c;
    dom = {
        drawBtn: document.querySelector("#draw-circle"),
        imgSelector: document.querySelector("#imgSelector"),
        imgNumber: document.querySelector("#imgNumber"),
        pauseBtn: document.querySelector("#pause"),
    };
    // const value = (document.querySelector("#imgSelector") as HTMLInputElement | null)?.value;
    dom.imgSelector.value = '0';
    IMG_DATA.right.oscilliscopeCanvas = document.querySelector("#rightWaveformCanvas");
    IMG_DATA.right.imageCanvas = document.querySelector("#rightChannelImage");
    IMG_DATA.left.oscilliscopeCanvas = document.querySelector("#leftWaveformCanvas");
    IMG_DATA.left.imageCanvas = document.querySelector("#leftChannelImage");
    CANVAS_WIDTH = IMG_DATA.right.imageCanvas.width;
    CANVAS_HEIGHT = IMG_DATA.right.imageCanvas.height;
    getAudio();
    (_a = dom.imgSelector) === null || _a === void 0 ? void 0 : _a.addEventListener('input', () => {
    });
    (_b = dom.drawBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
        // channelHandler(IMG_DATA.left, 0);
        // channelHandler(IMG_DATA.right, 1);
    });
    (_c = dom.pauseBtn) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
        IMG_DATA.pause = !IMG_DATA.pause;
    });
}
/**
 * Fetches audio through web audio api and decodes the audio into a
 * Float32 Array
 */
function getAudio() {
    fetch(`./src/assets/audio/voyager.mp3`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
        const leftChannelData = decodedAudio.getChannelData(0);
        const rightChannelData = decodedAudio.getChannelData(1);
        IMG_DATA.left.amplitudeData = Array.from(leftChannelData, sample => sample);
        IMG_DATA.right.amplitudeData = Array.from(rightChannelData, sample => sample);
        gotAudio = true;
    })
        .catch(error => {
        console.log('Error fetching or decoding audio: ', error);
    });
}
/**
 * Loops displayChannelData to new image offsets.
 * Pretty poor design but ¯\_(ツ)_/¯
 */
function channelHandler(channel, updater) {
    if (!gotAudio)
        return;
    setInterval(() => {
        if (channel.go) {
            displayChannelData(channel, IMG_DATA.offset);
            //prevents updateImageOffset() from getting called twice
            if (updater)
                updateImageOffset("auto", 0);
        }
    }, 1000);
}
function displayChannelData(channel, index) {
    channel.go = false;
    channel.pointer = channel.timeStamps[index];
    let oldPosition;
    let i = 0;
    const rgb = channel.colors[IMG_DATA.offset];
    const interval = setInterval(() => {
        if (IMG_DATA.pause) {
            return;
        }
        if (i === CANVAS_WIDTH) {
            clearInterval(interval);
            setTimeout(() => {
                channel.go = true;
            }, 500);
            return;
        }
        // drawSingleLine(channel, channel.pointer, i, rgb);
        // updateOscilloscope(channel, 500);
        if (i % 2 === 0 && i != 0) {
            // findNextPeak(channel, oldPosition);
        }
        else {
            oldPosition = channel.pointer;
            channel.pointer += CANVAS_HEIGHT;
        }
        i++;
    });
}
/**
 * Increments offset by 1 with each call, unless explicite number is provided
 */
function updateImageOffset(caller, num) {
}
/**
 * Converts audio amplitude float into pixels for single line in canvas
 * Each line represents 8ms of audio data.
 */
function drawSingleLine(channel, position, colIndex, rgb) {
}
/**
 * Visualizes sound waves through oscilliscope. Each call updates the oscilliscope
 * for `linelength` amount of samples.
 */
function updateOscilliscope(channel, lineLength) {
}
