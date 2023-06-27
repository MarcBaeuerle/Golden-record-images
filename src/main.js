// 512 columns make up one image
// each column is 8.3ms long
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const CHANNELS = 2;
const CANVAS_HEIGHT = 364;
const CANVAS_WIDTH = 512;
const SAMPLE_RATE = 44100;
const red = 0;
const grn = 1;
const blu = 2
const bnw = 255;
const IMAGE_DATA = {
    imagesPerChannel: 78,
    lineTime: 0.017,
    imageTime: 520 * 0.017,
    left: {
        amplitudeData: null,
        pointer: 0,
        timeStamps: [
            691496, 956716, 691863
        ],
        colors: [
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, red, grn, blu,   //0
            bnw, bnw, bnw, red, grn, blu, red, grn, blu, bnw,   //10
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, red, grn,   //20
            blu, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw,   //30
            bnw, red, grn, blu, red, grn, blu, red, grn, blu,   //40
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, red, grn,   //50
            blu, red, grn, blu, bnw, red, grn, blu, red, grn,   //60
            blu, red, grn, blu, bnw, bnw, bnw, bnw,             //70
        ],
        orientation: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,   //0
            0, 0, 2, 2, 2, 2, 0, 0, 0, 0,   //10
            0, 0, 0, 1, 1, 1, 1, 1, 1, 1,   //20
            1, 1, 1, 1, 1, 1, 0, 0, 1, 1,   //30
            1, 1, 1, 1, 1, 1, 1, 0, 0, 0,   //40
            0, 0, 1, 0, 0, 0, 0, 0, 0, 0,   //50
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1,   //60
            1, 1, 1, 1, 2, 1, 1, 1,         //70
        ]
    },

    right: {
        amplitudeData: null,
        pointer: 0,
        timeStamps: [

        ],
        colors: [
            red, grn, blu, bnw, bnw, bnw, bnw, red, grn, blu,   //0
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw,   //10
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, red, grn, blu,   //20
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw,   //30
            red, grn, blu, bnw, bnw, bnw, bnw, red, grn, blu,   //40
            bnw, bnw, red, grn, blu, bnw, bnw, bnw, bnw, bnw,   //50
            bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, bnw, red,   //60
            grn, blu, bnw, red, grn, blu, bnw, bnw,             //70
        ],
        orientation: [
            1, 1, 1, 0, 0, 0, 0, 1, 1, 1,   //0
            0, 0, 1, 1, 0, 1, 0, 1, 1, 0,   //10
            0, 0, 0, 0, 0, 1, 0, 0, 0, 0,   //20
            0, 0, 0, 0, 0, 0, 1, 0, 0, 0,   //30
            0, 0, 0, 0, 0, 0, 1, 1, 1, 1,   //40
            0, 1, 0, 0, 0, 1, 0, 0, 0, 1,   //50
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,   //60
            0, 0, 1, 0, 0, 0, 0, 2,         //70
        ]
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


function getAudio(){
    fetch(`./src/assets/audio/voyager.mp3`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
            leftChannelData = decodedAudio.getChannelData(0);
            rightChannelData = decodedAudio.getChannelData(1);
            console.log(`Sample rate: ${decodedAudio.sampleRate}`)
            console.log(`Length ${leftChannelData.length / decodedAudio.sampleRate}`);
            let leftAmplitudeData = Array.from(leftChannelData, sample => sample);
            let rightAmplitudeData = Array.from(rightChannelData, sample => Math.abs(sample));
            IMAGE_DATA.left.amplitudeData = Array.from(leftChannelData, sample => sample);
            //printAudioBuffer(leftAmplitudeData, rightAmplitudeData);
            printAudioBufferTimeFrame(leftAmplitudeData, 0, 1);
            //visualizeAudio(decodedAudio);
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
    let startSample = Math.floor(startTime * SAMPLE_RATE);
    let endSample = Math.floor(endTime * SAMPLE_RATE);
    console.log(`between: ${startTime} and ${endTime}`);
    console.log(`start: ${startSample} + end: ${endSample}`);
 
    let total = 0
    let max = 0;
    for (let i = startSample; i < endSample; i++) {
        //console.log(`${i} buf: ${buf[i]}`);
        if (buf[i] > max) {
            max = buf[i];
        }
        //console.log(`${i} diff: ${buf[i] - buf[i-1]}`)
        total += 1;
    }
    console.log(total);
    console.log(max);
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

function drawFunc() {
    let canvas = dom.leftChannelImage;
    let ctx = canvas.getContext("2d");
    let w = canvas.width, h = canvas.height;
    
    let scanlineImageData = ctx.createImageData(w, 1);
    let scanlinePixelRow = scanlineImageData.data;

    let imageData = ctx.getImageData(0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(imageData, 0, -2);

    for (let i = 0; i < w; i++) {
        let intensity = 100;
        scanlinePixelRow[0+i*4] = intensity;
        scanlinePixelRow[1+i*4] = intensity;
        scanlinePixelRow[2+i*4] = intensity;
        scanlinePixelRow[3+i*4] = 255;
    }

    //ctx.putImageData(scanlineImageData, 0, h - 2);
    ctx.putImageData(scanlineImageData, 0, h - 1);
}

function drawSingleLine(channel, offset, wIndex) {
    let canvas = dom.leftChannelImage
    let context = canvas.getContext('2d');

    let lineImageData = context.createImageData(1, CANVAS_HEIGHT);
    let linePixelRow = lineImageData.data;

    //Shift the previous rows to make room for a new row 
    //let imageData = context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //context.putImageData(imageData, 1, 0);

    console.log(channel.pointer);
    for (let i = 0; i < CANVAS_HEIGHT; i++) {
       // let intensity = 108 - channel.amplitudeData[channel.pointer] * 2555;
        //let intensity = 108 - channel.amplitudeData[i] * 2555;
        let intensity = 108 - channel.amplitudeData[offset + i] * 2555;
        linePixelRow[0+i*4] = intensity;
        linePixelRow[1+i*4] = intensity;
        linePixelRow[2+i*4] = intensity;
        linePixelRow[3+i*4] = 255;
    }

    context.putImageData(lineImageData, wIndex, 0);

}

function init() {
	dom = {
        button: document.querySelector('button'),
        leftCanvas: document.querySelector('.left-canvas'),
        rightCanvas: document.querySelector('.right-canvas'),
        canvas: document.querySelector('#waveformCanvas'),
        leftChannelImage: document.querySelector("#leftChannelImage"),
        drawBtn: document.querySelector("#draw-circle"),
	};
    getAudio();
    
    context = dom.canvas.getContext('2d');

    dom.button.addEventListener('click', () => {
        console.log(`getting data 1 sec`);
    });

    dom.drawBtn.addEventListener('click', () => {
        IMAGE_DATA.left.pointer = IMAGE_DATA.left.timeStamps[0];
        for (let i = 0; i < CANVAS_WIDTH; i++) {
            drawSingleLine(IMAGE_DATA.left, IMAGE_DATA.left.pointer, i);
            IMAGE_DATA.left.pointer += CANVAS_HEIGHT;
            if (i % 2 === 0) {
                IMAGE_DATA.left.pointer += 6;
            }
        }
        console.log(IMAGE_DATA.left.pointer);
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


