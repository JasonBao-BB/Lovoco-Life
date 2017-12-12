/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=100;
var rafID = null;
var canvas = null;


window.onload = function() {
   // alert("")
    console.log("Loading....");

    // grab our canvas
	canvasContext = document.getElementById( "meter" ).getContext("2d");
	canvas = document.getElementById('meter');
	drawMic();
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();
        // Attempt to get audio input
    /*/  ##################  

        var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {
        var constraints = { audio: true };
          // First get ahold of getUserMedia, if present
          var getUserMedia = (navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia);

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if(!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(function(successCallback, errorCallback) {
            getUserMedia.call(navigator, constraints, gotStream, didntGetStream);
          });
                
        }

        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if(navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if(navigator.mediaDevices.getUserMedia === undefined) {
          navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
        }


        
        var constraints = { audio: true };

        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream)
        .catch(didntGetStream);
*/
    //####################
    try {
        // monkeypatch getUserMedia
            navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia({ audio: true }, gotStream, didntGetStream);
        
    } catch (e) {
        didntGetStream();
        alert('getUserMedia threw exception :' + e);
    }
    console.log("Loading finish....");
}


function didntGetStream() {
    drawMic1();
    canvas.disabled = true;
    alert('Stream generation failed.');
}

function gotStream(stream) {
 
    
   dictate.init();
    
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);
   // recorder = new Recorder(mediaStreamSource, { workerPath: "lib/recorderWorker.js"});
    // Create a new volume meter and connect it.
	meter = createAudioMeter(audioContext);
	mediaStreamSource.connect(meter);
    //Add click event handler
    console.log("got the stream .....");
	canvas.addEventListener('click', function () { toggleListening();}, true);


    // kick off the visual updating
   // drawLoop();
}
// Added By Prabhakar Ranjan
function drawMic() {
    window.cancelAnimationFrame(rafID);    
        canvasContext.clearRect(0, 0, WIDTH, HEIGHT);    
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var img = null;// document.getElementById("mic2"); 
        img = document.getElementById("micgreen");
        canvasContext.drawImage(img, centerX - 25, centerY - 25, 50, 50); 
}
function drawMic1() {
    window.cancelAnimationFrame(rafID);
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var img = document.getElementById("mic1");
    canvasContext.drawImage(img, centerX - 12.5, centerY - 12.5, 25, 25);
}
function drawMic2() {
    window.cancelAnimationFrame(rafID);
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var img = document.getElementById("mic");
    canvasContext.drawImage(img, centerX - 12.5, centerY - 12.5, 25, 25);
}
function setSilence(str) {
    var silence = str;
    document.getElementById('lblSilence').innerHTML = silence;
}
//Changed By Prabhakar Ranjan
function drawLoop(time) {
    
    // clear the background   
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    //var radius =8;

    //canvasContext.beginPath();
    
    //canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);   
  
    //// check if we're currently clipping
    //if (meter.checkClipping())
    //    canvasContext.fillStyle = "red";
    //else
    //    canvasContext.fillStyle = "red";
    //// draw a circle based on the current volume
    
    //canvasContext.fill();
    
    //canvasContext.lineWidth = meter.volume * WIDTH * 1.4;
    //canvasContext.strokeStyle = 'red';
    //canvasContext.stroke();
   
    
    // Make sure the image is loaded first otherwise nothing will draw.
   

    // draw a circle based on the current volume
    //canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);

    // set up the next visual callback

    var img = document.getElementById("mic");
    canvasContext.drawImage(img, centerX - 25, centerY - 25,50, 50);
    //canvasContext.drawImage(img, centerX - 25, centerY - 18, 50, 50);
   
    var radius = 60;
    //var startAngle = 1.0001 * Math.PI;
    //var endAngle = Math.PI;
    var startAngle = 1.1 * Math.PI;
    var endAngle = 1.9 * Math.PI;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);   
    // canvasContext.arc(centerX, centerY, radius, startAngle, endAngle, false);
    // check if we're currently clipping
    if (meter.checkClipping()) {
        canvasContext.fillStyle = "green";
        canvasContext.strokeStyle = 'green';
    }
    else {
        canvasContext.fillStyle = "green";
        canvasContext.strokeStyle = 'green';//#0099FF
    }
    // draw a circle based on the current volume
    canvasContext.lineWidth = meter.volume * WIDTH * 1.4;
     
    // line color
      if (canvasContext.lineWidth <= 5) {
        setSilence("0");
    }
    else {
        setSilence("1");
    }
    
    canvasContext.stroke();

    rafID = window.requestAnimationFrame( drawLoop );
}

