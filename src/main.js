
//const AUDIO_FILE = new Audio('./assets/audio/voyager.mp3');
const CHANNELS = 2;
const CANVAS_HEIGHT = 390;
const CANVAS_WIDTH = 520;
const SAMPLE_RATE = 44100;

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
            //printAudioBuffer(leftAmplitudeData, rightAmplitudeData);
            printAudioBufferTimeFrame(leftAmplitudeData, 0, 1);
            visualizeAudio(decodedAudio);
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

function init() {
	dom = {
        button: document.querySelector('button'),
        leftCanvas: document.querySelector('.left-canvas'),
        rightCanvas: document.querySelector('.right-canvas'),
        canvas: document.querySelector('#waveformCanvas'),
	};
    
    context = dom.canvas.getContext('2d');

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


