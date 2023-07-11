
# Golden Record Images

Real-time decoding and Audio Visualizer of the 116 images present on the Voyager Golden Record using the browser. The speed in which the images are displayed are not representative of those on the record, as device performance is what dictates the speed.

### Table of contents
- [Images](#images)
- [Process](#process)
- [Poor Image Quality?](#poor-image-quality)
- [Acknowledgements](#acknowledgements)

## Images
https://github.com/MarcBaeuerle/Golden-record/assets/92479171/ce1ff0fe-c4e2-4721-a17a-58d55e8fec1a

## Process
The [Verge's video][verge-video] on decoding the images by hand is what initially sparked my interest. Having only seen the calibration circle that they decoded by hand, I wanted to see if I could do the rest.

They gave a set of instructions on the steps to follow, despite that and [Ron Barry's article][Ron-article], I was still left scratching my head as not all of the details were clear. Here is a jist of the journey to getting the first calibration image.

![Process picture 1][process-1]

The brief instructions that I followed outlined that each column of the image was about 8ms long. However, this didn't translate well when looking at the audio file, as a file with 44.1kHz sample rate meant that 1ms represented 44 samples which could land on either column. After some digging, I found that with a 44.1kHz sample rate, each line would be exactly 367 samples. Which resulted in this image: 

![Process picture 2][process-2]

Now that the image was somewhat aligned, the slanting became an issue.
When looking at the audio file through audacity, we can see that the distance between the audio peaks are not exactly 367 samples.

![Process picture 3][process-3]

This stumped me for quite a while, but it turned out that the distance between every other peak was ALWAYS 367 * 2 sample apart, which represents 2 columns on an image. With that tiny change in the implementation, and some small bug fixes, we get the intended calibration picture.

![Process picture 4][process-4]

After that, it was just rinse and repeat with the other pictures, with the only difference being the color pictures being comprised of 3 overlapping images each representing Red, Green and Blue respectively.

## Poor Image Quality?
Malte Gruber gives a good explanation as to why all of the images seem to have artifacts, which is a side effect of the digitization of the record. 

More can be read [here][Malte-explain].


## Acknowledgements
- [Ron Barry][Ron-article] 
  - Very useful instructions and insights through his article
- [Malte Gruber][Malte-site] 
  - Useful reference when stuck with some of the HTML Canvas implementations.


[process-1]: ./src/assets/images/process-1.png
[process-2]: ./src/assets/images/process-2.png
[process-3]: ./src/assets/images/process-3.png
[process-4]: ./src/assets/images/process-4.png
[verge-video]: https://www.youtube.com/watch?v=RRuovINxpPc&ab_channel=VergeScience
[Malte-site]: https://maltegruber.github.io/voyager-record-decoder/
[Malte-explain]: https://github.com/MalteGruber/voyager-record-decoder#audio-file-filtering-artifacts
[Ron-article]: https://boingboing.net/2017/09/05/how-to-decode-the-images-on-th.html


