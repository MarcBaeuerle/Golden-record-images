let debug = 1;
let CANVAS_HEIGHT: number;
let CANVAS_WIDTH: number;
const SAMPLE_RATE = 44100;

interface imgObj {
    pause: boolean;
    offset: number;
    left: channelObj;
    right: channelObj;
    changeIndex: boolean;
}

interface channelObj {
    go: boolean;
    imageCanvas: HTMLCanvasElement | null;
    oscilliscopeCanvas: HTMLCanvasElement | null;
    amplitudeData: Array<number>;
    creditsContainer: HTMLElement | null;
    creditsTitle: HTMLElement | null;
    creditsPerson: HTMLElement | null;
    pointer: number;
    timeStamps: Array<number>;
    colors: Array<string>;
    credits: Array<string>;
    space: number;
}

const audioContext = new AudioContext({
    sampleRate: SAMPLE_RATE,
})

let dom = {
    imgSelector: null as HTMLInputElement | null,
    imgNext: null as HTMLInputElement | null,
    imgBack: null as HTMLInputElement | null,
    imgNumber: null as HTMLElement | null,
    pauseBtn: null as HTMLButtonElement | null,
};

function init(): void {
    dom = {
        imgSelector: document.querySelector("#imgSelector"),
        imgNumber: document.querySelector("#imgNumber"),
        pauseBtn: document.querySelector("#pause"),
        imgNext: document.querySelector("#imgNext"),
        imgBack: document.querySelector("#imgBack"),
    }

    dom.imgSelector!.value = '1';

    IMG_DATA.right.oscilliscopeCanvas = document.querySelector("#rightWaveformCanvas");
    IMG_DATA.right.imageCanvas = document.querySelector("#rightChannelImage");
    IMG_DATA.left.oscilliscopeCanvas = document.querySelector("#leftWaveformCanvas");
    IMG_DATA.left.imageCanvas = document.querySelector("#leftChannelImage");

    IMG_DATA.right.creditsContainer = document.querySelector("#rightCredits");
    IMG_DATA.right.creditsTitle = document.querySelector("#rightCreditsTitle");
    IMG_DATA.right.creditsPerson = document.querySelector("#rightCreditsPerson");
    IMG_DATA.left.creditsContainer = document.querySelector("#leftCredits");
    IMG_DATA.left.creditsTitle = document.querySelector("#leftCreditsTitle");
    IMG_DATA.left.creditsPerson = document.querySelector("#leftCreditsPerson");

    CANVAS_WIDTH = IMG_DATA.right.imageCanvas!.width;
    CANVAS_HEIGHT = IMG_DATA.right.imageCanvas!.height;
    getAudio();


    dom.imgSelector?.addEventListener('input', () => {
        updateImageOffset("slider", Number(dom.imgSelector!.value));
    });

    dom.imgBack?.addEventListener('click', () => {
        updateImageOffset("inc", -2);
    });

    dom.imgNext?.addEventListener('click', () => {
        //No idea why increment must be 0 
        updateImageOffset("inc", 0);
    });

    dom.pauseBtn?.addEventListener('click', () => {
        IMG_DATA.pause = !IMG_DATA.pause;
    })
}
document.addEventListener('DOMContentLoaded', init);



/** 
 * Fetches audio through web audio api and decodes the audio into a 
 * Float32 Array
 */
function getAudio(): void {
    fetch(`./src/assets/audio/voyager.mp3`)
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
            const leftChannelData = decodedAudio.getChannelData(0);
            const rightChannelData = decodedAudio.getChannelData(1);

            IMG_DATA.left.amplitudeData = Array.from(leftChannelData, sample => sample)
            IMG_DATA.right.amplitudeData = Array.from(rightChannelData, sample => sample)

            channelHandler(IMG_DATA.left, false);
            channelHandler(IMG_DATA.right, true);
        })
        .catch(error => {
            console.log('Error fetching or decoding audio: ', error);
        })
}

/**
 * Loops displayChannelData to new image offsets.
 * Pretty poor design but ¯\_(ツ)_/¯
 */
function channelHandler(channel: channelObj, updater: boolean): void {
    setInterval(() => {
        if (IMG_DATA.right.go) {
            displayChannelData(channel, IMG_DATA.offset, updater);
        }
    }, 10);

}

function displayChannelData(channel: channelObj, index: number, updater: boolean): void {
    channel.go = false;

    channel.pointer = channel.timeStamps[index];
    let oldPosition: number;

    let i = 0;
    const rgb = channel.colors[IMG_DATA.offset];

    const interval = setInterval(() => {
        if (IMG_DATA.pause) {
            return;
        }
        
        if (IMG_DATA.changeIndex || i === CANVAS_WIDTH) {
            clearInterval(interval);
            let time = IMG_DATA.changeIndex ? 30 : 1000;
            setTimeout(() => {
                channel.go = true;
                IMG_DATA.changeIndex = false;
            }, time);
            return;
        }
        if (i === 1) {
            updateCredits(channel, index);

            //prevents updateImageOffset() from getting called twice
            if (updater) updateImageOffset("auto", 0);
        }
        drawSingleLine(channel, channel.pointer, i, rgb);
        updateOscilliscope(channel, 500);

        if (i % 2 === 0 && i != 0) {
            findNextPeak(channel, oldPosition);
        } else {
            oldPosition = channel.pointer;
            channel.pointer += CANVAS_HEIGHT;
        }
        i++;
    }, 1);

}

/**
 * Increments offset by 1 with each call, unless explicite number is provided
 */
function updateImageOffset(caller: string, num: number): void {
    if (caller === "slider") {
        IMG_DATA.changeIndex = true;
        IMG_DATA.offset = num;
        return;
    } else if (caller === "inc") {
        IMG_DATA.changeIndex = true;
        IMG_DATA.offset += num;
        return;
    }

    (IMG_DATA.offset < 78) ? IMG_DATA.offset++ : IMG_DATA.offset = 0;

    dom.imgSelector!.value = `${IMG_DATA.offset}`;
    dom.imgNumber!.innerText = `${IMG_DATA.offset} / 78`;
    return;
}

/**
 * Converts audio amplitude float into pixels for single line in canvas
 * Each line represents 8ms of audio data.
 */
function drawSingleLine(channel: channelObj, position: number, colIndex: number, rgb: string): void {
    let canvas = channel.imageCanvas;
    let context = canvas!.getContext('2d', { willReadFrequently: true });

    let previousImageData = context!.getImageData(colIndex, 0, 1, CANVAS_HEIGHT);
    let linePixelRow = previousImageData!.data;

    for (let i = 0; i < CANVAS_HEIGHT; i++) {
        let intensity = Math.floor(108 - channel.amplitudeData[position + i] * 2555);
        if (rgb === "bnw") {
            linePixelRow[0 + i * 4] = intensity;    //red
            linePixelRow[1 + i * 4] = intensity;    //green
            linePixelRow[2 + i * 4] = intensity;    //blue
        } else if (rgb === "red") {
            linePixelRow[0 + i * 4] = intensity;    //red
            linePixelRow[1 + i * 4] = 0;            //green
            linePixelRow[2 + i * 4] = 0;            //blue
        } else if (rgb === "grn") {
            linePixelRow[1 + i * 4] = intensity;    //green
        } else {
            linePixelRow[2 + i * 4] = intensity;    //blue
        }

        linePixelRow[3 + i * 4] = 255;
    }

    context!.putImageData(previousImageData, colIndex, 0);
    return;

}

/**
 * Visualizes sound waves through oscilliscope. Each call updates the oscilliscope
 * for `linelength` amount of samples.
 */
function updateOscilliscope(channel: channelObj, linelength: number): void {
    const context = channel.oscilliscopeCanvas!.getContext("2d");
    const zoom = 200;

    const height = channel.oscilliscopeCanvas!.height;
    const width = channel.oscilliscopeCanvas!.width;
    const center = height / 2;
    let x = 0;
    const dx = width / linelength;
    const plotStart = -50;

    context!.clearRect(0, 0, width, height);
    context!.beginPath();
    context!.moveTo(x, center);
    context!.strokeStyle = 'rgb(255,255,255)';

    for (let i = 0; i < linelength; i++) {
        x += dx;
        context!.lineTo(x, center - channel.amplitudeData[i + channel.pointer + plotStart] * zoom);
    }

    context!.stroke();
    return;

}

/**
 * Finds the next amplitude peak in the audio file, which represents a new
 * image column
 */
function findNextPeak(channel: channelObj, position: number): void {
    const LOCAL_MIN = position + 730;
    const LOCAL_MAX = position + 740;

    if (LOCAL_MAX > channel.amplitudeData.length) return;

    let newMax = 0;
    let newPosition = position;

    for (let i = LOCAL_MIN; i < LOCAL_MAX; i++) {
        if (channel.amplitudeData[i] > newMax) {
            newMax = channel.amplitudeData[i];
            newPosition = i;
        }
    }
    channel.pointer = newPosition;
    return;
}

/**
 * Updates the credits text, called when image changes.
 */
function updateCredits(channel: channelObj, position: number): void{
    if (channel.colors[IMG_DATA.offset] === "bnw" || channel.colors[IMG_DATA.offset] === "red") {
        let title = channel.credits[position].split(",")[0];
        let person = channel.credits[position].split(",")[1];

        channel.creditsContainer?.classList.add('changed');


        setTimeout(() => {
            channel.creditsTitle!.innerText = title;
            channel.creditsPerson!.innerText = person;
            channel.creditsContainer?.classList.remove('changed');
        }, 300);
    }
    return;
}

let IMG_DATA: imgObj = {
    pause: false,
    offset: 0,
    changeIndex: false,
    left: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        creditsContainer: null,
        creditsTitle: null,
        creditsPerson: null,
        amplitudeData: [] as number[],
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
        credits: [
            "Calibration Circle, Jon Lomberg",
            "Location of Our Solar System, Frank Drake",
            "Mathematical Definitions, Frank Drake",
            "Physical Unit Definitions, Frank Drake",
            "The Solar System, Frank Drake",
            "The Solar System, Frank Drake",
            "The Sun, HALE Observatories",
            "Solar Spectrum, Cornell NAIC",
            "Solar Spectrum, Cornell NAIC",
            "Solar Spectrum, Cornell NAIC",
            "Mercury, NASA",
            "Mars, NASA",
            "Jupiter, NASA",
            "Home, NASA",
            "Home, NASA",
            "Home, NASA",
            "Clours over Egypt, NASA",
            "Clours over Egypt, NASA",
            "Clours over Egypt, NASA",
            "DNA Bases, Frank Drake",
            "DNA Structure, Jon Lomberg",
            "DNA Structure, Jon Lomberg",
            "Cell Division, Turtox/Cambosco",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Sex Organs, Sinauer Associates Inc.",
            "Human Conception, Jon Lomberg",
            "Human Conception, Lennart Nilsson",
            "Fertilized Ovum, Lennart Nilsson",
            "Human Fetus, Jon Lomberg",
            "Human Fetus, Dr. Frank Allan",
            "Male and Female, Jon Lomberg",
            "Birth, Wayne Miller",
            "Nursing Mother, UN",
            "Nursing Mother, UN",
            "Nursing Mother, UN",
            "Father and Child, Davic Harvey",
            "Father and Child, Davic Harvey",
            "Father and Child, Davic Harvey",
            "Group of Children, Ruby Mera/UNICEF",
            "Group of Children, Ruby Mera/UNICEF",
            "Group of Children, Ruby Mera/UNICEF",
            "Family Portrait, Jon Lomberg",
            "Family Portrait, Nina Leen/Time inc.",
            "Continental Drift, Jon Lomberg",
            "Stucture of the Earth, Jon Lomberg",
            "Heron Island Australia, Jay M. Pasachoff",
            "Seashort Maine, Dick Smith",
            "Snake River and the Grand Tetons, Ansel Adams",
            "Sand Dunes, George F. Mobley",
            "Monument Valley, Ray Manley",
            "Monument Valley, Ray Manley",
            "Monument Valley, Ray Manley",
            "Forest scene with mushrooms, Bruce Dale",
            "Forest scene with mushrooms, Bruce Dale",
            "Forest scene with mushrooms, Bruce Dale",
            "Leaf, Arthur Herrick",
            "Fallen leaves, Jodi Cobb",
            "Fallen leaves, Jodi Cobb",
            "Fallen leaves, Jodi Cobb",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Tree with daffodils, Gardens Winterthur",
            "Tree with daffodils, Gardens Winterthur",
            "Tree with daffodils, Gardens Winterthur",
            "Flying insect with flowers, Stephen Dalton",
            "Evolution of Vertibrates, Jon Lomberg",
            "Seashell, Herman Landshoff",
            "Dolphines, Thomas Nerbia",
        ],
        space: 948540,
    },
    right: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        creditsContainer: null,
        creditsTitle: null,
        creditsPerson: null,
        amplitudeData: [] as number[],
        pointer: 0,
        timeStamps: [
            748881, 995880, 1256346, 1519980, 1776918, 2029338, 2275851,            //0
            2522144, 2774972, 3023788, 3288648, 3537656, 3790711, 4046923,          //7
            4299934, 4548285, 4804358, 5055090, 5310427, 5566445, 5819090,          //14
            6069487, 6325550, 6582765, 6836043, 7093042, 7351177, 7600559,          //21
            7849962, 8115741, 8366424, 8624873, 8877756, 9129103, 9377380,          //28
            9625985, 9876773, 10129022, 10380286, 10639088, 10889655, 11140077,     //35
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
        credits: [
            "School of Fish, David Doubilet",
            "School of Fish, David Doubilet",
            "School of Fish, David Doubilet",
            "Tree Toad in Hand, David Wikstrom",
            "Crocodile, Peter Beard",
            "Eagle, Juan Antonio Fernandez",
            "Waterhole, South Africa Tourist Group.",
            "Chimp and Scientists, Wanna Goodall",
            "Chimp and Scientists, Wanna Goodall",
            "Chimp and Scientists, Wanna Goodall",
            "Bushmen Hunters, Jon Lomberg",
            "Bushmen Hunters, R. Farbman",
            "Guatemalan Man, UN",
            "Dancer from Bali, donna Grosvenor",
            "Andean girls, Joseph Scherschel",
            "Thai Craftsman, Dean Conger",
            "Domesticated ELephant, Peter Kunstadter",
            "Man with Glasses, Jonathan Blair",
            "Man with Dog, Bruce Baumann",
            "Mountain Climber, Gaston Rebuffat",
            "Gymnast Cathy Rigbey, Philip Neonian",
            "Olympic Sprinters, Picturepoint London",
            "Schoolroom, UN",
            "Children with Globe, UN",
            "Cotton harvest, Howell Walker",
            "Grape picker, David Moore",
            "Supermarket, Herman Eckelmann",
            "Diver with Fish, Jerry Greenberg",
            "Diver with Fish, Jerry Greenberg",
            "Diver with Fish, Jerry Greenberg",
            "Fishing Boat, UN",
            "Cooking Fish, Brian Seed",
            "Chinese Dinner Party, Michael Rougier",
            "Licking Eating and Drinking, Hermann Eckelmann",
            "The Great Wall of China, Edward Kim",
            "House Construction (African), UN",
            "Construction scene (Amish country), William Albert Allard",
            "House (Africa), UN",
            "House (New England), Robert Sisson",
            "Modern House (Cloudcroft New Mexico), Frank Drake",
            "House interior with artist and fire, Jim Amos",
            "House interior with artist and fire, Jim Amos",
            "House interior with artist and fire, Jim Amos",
            "Taj Mahal, David Carroll",
            "English city (Oxford), Douglas Gilbert",
            "Boston, Ted Spiegel",
            "UN Building Day, UN",
            "UN Building Night, UN",
            "UN Building Night, UN",
            "UN Building Night, UN",
            "Sydney Opera House, Mike Long",
            "Artisan with drill, Frank Hewlett",
            "Factory interior, Fred Ward",
            "Factory interior, Fred Ward",
            "Factory interior, Fred Ward",
            "Science Museum, Davic Cupp",
            "X-ray of Hand, Herman Eckelmann",
            "Microscope, UN",
            "Street Scene (Pakistin), UN",
            "Street (India), UN",
            "Highway with Trucks, Fred Ward",
            "Golden Gate Bridge, Ansel Adams",
            "Train, Gordon Gahan",
            "Airplane in Flight, Frank Drake",
            "Toronto Airport, Lawson Graphics",
            "Antartic Sno-Cat, National Geographic Society",
            "Radio Telescope, James P. Blair",
            "Arecibo Observatory, Herman Eckelmann",
            "Page from a Book, Cornell NAIC",
            "Astronaut in Space, NASA",
            "Astronaut in Space, NASA",
            "Astronaut in Space, NASA",
            "Titan Centaur Launch, NASA",
            "Sunset, David Harvey",
            "Sunset, David Harvey",
            "Sunset, David Harvey",
            "String Quartet, Philips Recordings",
            "Score of Quartet and Violin, Cornell NAIC",
        ],
        space: 988053,
    }
}

