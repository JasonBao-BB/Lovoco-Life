//JavaScript save and post code through XMLHttpRequest Post - Prabhakar Ranjan
(function (window) {
    function get_appropriate_ws_url()
{
    var pcol;
    var u = document.URL;

    /*
     * We open the websocket encrypted if this page came on an
     * https:// url itself, otherwise unencrypted
     */

    if (u.substring(0, 5) == "https") {
        pcol = "wss://";
        u = u.substr(8);
    } else {
        pcol = "ws://";
        if (u.substring(0, 4) == "http")
            u = u.substr(7);
    }

    u = u.split('/');

    /* + "/xxx" bit is for IE10 workaround */

    return pcol + u[0] + "/xxx";
}
    // Defaults
    //var xhr = new XMLHttpRequest();
    //xhr.multipart = true;
    //var url = "https://test.enabledoc.net:49158";   
    //xhr.open('GET', url, true);
    //xhr.send();

var text="";
    /*ifrm = document.createElement("IFRAME");
    ifrm.setAttribute("src", "https://test.govivace.com:49158/");
    ifrm.style.width = 1 + "px";
    ifrm.style.height = 1 + "px";
    document.body.appendChild(ifrm);*/
    var SERVER="wss://services.govivace.com:49155/telephony";
    //var SERVER="ws://services.govivace.com:49154/telephony";
    //var SERVER = "wss://test.govivace.com:49179/models"
  //var SERVER = "wss://test.govivace.com:49166/client/ws/speech"; //"ws://74.96.71.3:49155/client/ws/speech";
 //neel  var SERVER = get_appropriate_ws_url();
    //var SERVER_STATUS = "wss://test.govivace.com:49166/client/ws/status"; //ws://74.96.71.3:49155/client/ws/status";
    var CONTENT_TYPE = "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1";
    // Send blocks  per minute 
    var INTERVAL = 250;
    var TAG_END_OF_SENTENCE = "EOS";
    var RECORDER_WORKER_PATH = 'recorderWorker.js';

    // Error codes (mostly following Android error names and codes)   
     var ERR_NETWORK = 2;
    var ERR_AUDIO = 3;
    var ERR_SERVER = 4;
    var ERR_CLIENT = 5;

    // Event codes
    var MSG_WAITING_MICROPHONE = 1;
    var MSG_MEDIA_STREAM_CREATED = 2;
    var MSG_INIT_RECORDER = 3;
    var MSG_RECORDING = 4;
    var MSG_SEND = 5;
    var MSG_SEND_EMPTY = 6;
    var MSG_SEND_EOS = 7;
    var MSG_WEB_SOCKET = 8;
    var MSG_WEB_SOCKET_OPEN = 9;
    var MSG_WEB_SOCKET_CLOSE = 10;
    var MSG_STOP = 11;
    var MSG_SERVER_CHANGED = 12;

    // Server status codes
    // from http://74.96.71.3:49159/speechRecognition
    var SERVER_STATUS_CODE = {
        0: 'Success', // Usually used when recognition results are sent
        1: 'No speech', // Incoming audio contained a large portion of silence or non-speech
        2: 'Aborted', // Recognition was aborted for some reason
        9: 'No available', // recognizer processes are currently in use and recognition cannot be performed
    };

    // Initialized by init()
    var audioContext;
    var recorder;
    var recorder1;
    // Initialized by startListening()
    var ws=0;
    var intervalKey;
     var flag=1;
     var file;
     var chunk=16*1024;
    // Initialized during construction
    var wsServerStatus;
    var recordingstart=false;
    var connect=false;
    var canvas = null;

    var Dictate = function (cfg) {
        var config = cfg || {};
        config.server = config.server || SERVER;
       // config.serverStatus = config.serverStatus || SERVER_STATUS;
        config.contentType = config.contentType || CONTENT_TYPE;
        config.interval = config.interval || INTERVAL;
        config.recorderWorkerPath = config.recorderWorkerPath || RECORDER_WORKER_PATH;
        config.onReadyForSpeech = config.onReadyForSpeech || function () { };
        config.onEndOfSpeech = config.onEndOfSpeech || function () { };
        config.onPartialResults = config.onPartialResults || function (data) { };
        config.onResults = config.onResults || function (data) { };
        config.onEndOfSession = config.onEndOfSession || function () { };
        config.onEvent = config.onEvent || function (e, data) { };
        config.onHttpPost = config.onHttpPost || function (e, data) { };
        config.onError = config.onError || function (e, data) { };
        config.onServerStatus = config.onServerStatus || {};

       /* if (config.onServerStatus) {
            monitorServerStatus();
        }*/

        // Returns the configuration
        this.getConfig = function () {
            return config;
        }

        // Set up the recorder (incl. asking permission)
        // Initializes audioContext
        // Can be called multiple times.
        // TODO: call something on success (MSG_INIT_RECORDER is currently called)
        /*this.init = function () {
            config.onEvent(MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ...");
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                window.URL = window.URL || window.webkitURL;
                audioContext = new AudioContext();
                 
            } catch (e) {
                // Firefox 24: TypeError: AudioContext is not a constructor
                // Set media.webaudio.enabled = true (in about:config) to fix this.
                config.onError(ERR_CLIENT, "Error initializing Web Audio browser: " + e);
            }

            if (navigator.getUserMedia) {
                navigator.getUserMedia({ audio: true }, startUserMedia, function (e) {
                    config.onError(ERR_CLIENT, "No live audio input in this browser: " + e);
                });
            } else {
                config.onError(ERR_CLIENT, "No user media support");
            }
        }*/
		 this.init = function ()
         {
            var audioSourceConstraints = {};
            config.onEvent(MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ...");
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                window.URL = window.URL || window.webkitURL;
                audioContext = new AudioContext();
				//alert("In the init method");
            } catch (e) {
                // Firefox 24: TypeError: AudioContext is not a constructor
                // Set media.webaudio.enabled = true (in about:config) to fix this.
                config.onError(ERR_CLIENT, "Error initializing Web Audio browser: " + e);
            }
            
            if (navigator.getUserMedia) {
                if (config.audioSourceId) {
                    audioSourceConstraints.audio = {
                        optional: [{ sourceId: config.audioSourceId }]
                    };
                } else {
                    audioSourceConstraints.audio = true;
                }
                navigator.getUserMedia(audioSourceConstraints, startUserMedia, function (e) {
                    config.onError(ERR_CLIENT, "No live audio input in this browser: " + e);
                });
            } else {
                config.onError(ERR_CLIENT, "No user media support");
            }
        }

        function autoselect(el)
        {
            //var el = document.getElementById("p2");
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        /*/Neels
        this.init = function(){
            var audioSourceConstraints = {};
            config.onEvent(MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ...");
        
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            // navigator.mediaDevices------------
            window.URL = window.URL || window.webkitURL;
            audioContext = new AudioContext();
            var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

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
                getUserMedia.call(navigator, constraints, successCallback, errorCallback);
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


            // Not tested for the Microphone compati....
            if(navigator.mediaDevices.getUserMedia){
               // var constraints = { audio: true};
                if (config.audioSourceId) {
                    audioSourceConstraints.audio = {
                        optional: [{ sourceId: config.audioSourceId }]
                    };
                } else {
                    audioSourceConstraints.audio = true;
                }  
           // media.navigator.permission.disabled = false ;
            navigator.mediaDevices.getUserMedia(audioSourceConstraints)
            .then(function(stream){
                console.log("in startUserMedia. .. .. ..  .. . .");
                var input = audioContext.createMediaStreamSource(stream);
                config.onEvent(MSG_MEDIA_STREAM_CREATED, 'Media stream created');

                // This caused the annoying feedback.
                //input.connect(audioContext.destination);

                recorder = new Recorder(input, { workerPath: config.recorderWorkerPath });
                config.onEvent(MSG_INIT_RECORDER, 'Recorder initialized');
            })
            .catch(function(err) {
              console.log(err.name + ": " + err.message);
            });
            //-----------
           }
           else {
                config.onError(ERR_CLIENT, "No user media support");
            } 

             
        }*/
        // Start recording and transcribing
        // Start recording and transcribing
        this.startListening = function () {
            if (!recorder) {
                
                config.onError(ERR_AUDIO, "Recorder undefined");
                return;
            }

            if (ws) {
                cancel();
            }

            try {    
                recorder1.record();
                     //document.getElementById("popup").style.background= "snow";
                      // text="";
                   //  document.getElementById("p1").innerHTML="";
                   console.log("recording start in dicate file");
                   recordingstart=true;
                   $('#file-input').attr('disabled', 'disabled');
                     document.getElementById("p2").innerHTML="";
                     ws = createWebSocket();
            } catch (e) {
                config.onError(ERR_CLIENT, "No web socket support in this browser!");
            }
        }

        // Stop listening, i.e. recording and sending of new input.
        this.stopListening = function () { config.onEvent(MSG_STOP, 'outer Stopped recording');
            // Stop the regular sending of audio
            clearInterval(intervalKey);
            // Stop recording
            if (recorder) {
                console.log("Stopping the recorder....");
                recorder.stop();
                config.onEvent(MSG_STOP, 'Stopped recording');
                // Push the remaining audio to the server
                recorder1.stop();
                recorder.export16kMono(function (blob) {
                    socketSend(blob);
                    console.log("stop recording");
                    socketSend(TAG_END_OF_SENTENCE);
                    recorder.clear();
                }, 'audio/raw');

                recorder1.export16kMono(function (blob) {
                        recorder1.exportWAV(function (item) {
                            if(item.size>44){
                                downloadWav(item);
                                uploadAudio(item,'Audio');
                            }
                            else{
                                cancel();
                                alert("Something gone Wrong. Audio is not recorded properly. Please try again");
                                //$("#span_strength").empty();
                                //document.getElementById("span_strength").innerHTML = status_past;
                                //$("tr.active").children("td").eq(2).text(status_past);
                            }
                        }, 'audio/wav');
                        recorder1.clear();
                    }, 'audio/raw');
                config.onEndOfSpeech();
                 document.getElementById("p2").innerHTML="";
                 recordingstart=false;
                 $('#file-input').removeAttr('disabled');
            } else {
                config.onError(ERR_AUDIO, "Recorder undefined");
            }
          /*  if (ws) {
                ws.close();
                ws = null;
            }*/
        }

        // Cancel everything without waiting on the server
        this.cancel = function () {
            // Stop the regular sending of audio (if present)
            clearInterval(intervalKey);
            if (recorder) {
                recorder.stop();
                recorder.clear();
                config.onEvent(MSG_STOP, 'Stopped recording');
            }
            if (ws) {
                ws.close();
                ws = null;
                recorder1.stop();
                recorder1.clear();
            }
        }

        // Sets the URL of the speech server
        this.setServer = function (server) {
            config.server = server;
            config.onEvent(MSG_SERVER_CHANGED, 'Server changed: ' + server);
        }

        // Sets the URL of the speech server status server
       /* this.setServerStatus = function (serverStatus) {
            config.serverStatus = serverStatus;

            if (config.onServerStatus) {
                monitorServerStatus();
            }

            config.onEvent(MSG_SERVER_CHANGED, 'Server status server changed: ' + serverStatus);
        }*/


        // Private methods
        function startUserMedia(stream) {
            console.log("in startUserMedia. .. .. ..  .. . .");
            var input = audioContext.createMediaStreamSource(stream);
            config.onEvent(MSG_MEDIA_STREAM_CREATED, 'Media stream created');

            // This caused the annoying feedback.
            //input.connect(audioContext.destination);

            recorder = new Recorder(input, { workerPath: config.recorderWorkerPath });
            recorder1 = new Recorder(input, { workerPath: config.recorderWorkerPath });
            config.onEvent(MSG_INIT_RECORDER, 'Recorder initialized');
        }


        document.querySelector('input[type="file"]').addEventListener('change', function(e) {
                         file = $('#file-input')[0].files[0];
                         //console.log(file.length);
                         if(file.size>0)
                         {
                        console.log(file.size);
                        if (ws) {
                        cancel();
                        }
                       ws = createWebSocket();
                   }
                   else
                   {
                    alert("Audio file is not selected properly please try again");
                    return;
                   }
        }, false);


        

        function socketSend(item) {
            if (ws) {  
                var state = ws.readyState;
                if (state == 1) {
                    // If item is an audio blob
                    if (item instanceof Blob) {
                        if (item.size > 0) {
                            ws.send(item);
                            console.log("socket send");
                            config.onEvent(MSG_SEND, 'Send: blob: ' + item.type + ', ' + item.size);
                        } else {
                            config.onEvent(MSG_SEND_EMPTY, 'Send: blob: ' + item.type + ', EMPTY');
                        }
                        // Otherwise it's the EOS tag (string)
                    } else {
                        ws.send(item);
                        config.onEvent(MSG_SEND_EOS, 'Send tag: ' + item);
                    }
                } else {
                    config.onError(ERR_NETWORK, 'WebSocket: readyState!=1: ' + state + ": failed to send: " + item);
                }
            } else {
                config.onError(ERR_CLIENT, 'No web socket connection: failed to send: ' + item);
            }
        }


        function createWebSocket() {
            // TODO: do we need to use a protocol?
            //var ws = new WebSocket("ws://127.0.0.1:8081", "echo-protocol");
            var ws = new WebSocket(config.server); // + '?' + config.contentType);

            ws.onmessage = function (e) {   // Here e is an event Here Event is when message is received
                var data = e.data;
               var lastWordOfTranscript = "";
                config.onEvent(MSG_WEB_SOCKET, data);
                var res1 = JSON.parse(data);
                
                if (res1.status == 9) {
                    drawMic();
                    alert("Speech Recognition Not Available! Kindly Contact support or try again later!");
                }
                if (data instanceof Object && !(data instanceof Blob)) {
                    config.onError(ERR_SERVER, 'WebSocket: onEvent: got Object that is not a Blob');
                } else if (data instanceof Blob) {
                    config.onError(ERR_SERVER, 'WebSocket: got Blob');
                } else {
                    document.getElementsByClassName('image-upload').disabled = true; 
                    var res = JSON.parse(data);
			//console.log(JSON.stringify(data));
            $('#file-input').attr('disabled', 'disabled');
           
                    if (res.status == 0) {
                        /*try {
                            if (res.adaptation_state.type == 'string+gzip+base64') {
                               // SaveReturnedJson(data.toString().replace('"status": 0, ', ''));
                                saveTextAsFile(data.toString().replace('"status": 0, ', ''));
                            //alert(data.toString());
                              //  alert(data.toString().replace('"status": 0, ',''));
                               // config.onEvent(MSG_WEB_SOCKET, data);
                               // config.onResults(res.adaptation_state);
                               console.log("in user profile block");
                            }

                            }
                        catch (err) { }*/
                        try {
                                if(config.server.includes("/client/ws/speech"))
                                {
                                if (res.result.final) {
                                 if (res.result.hypotheses[0].formatted_transcript !=null)
                                    {
                                        text=text+res.result.hypotheses[0].formatted_transcript;
                                 
                                        if (flag)
                                        {
                                            text = text.substr(text.indexOf(" ") + 1);
                                            flag = 0;
                                        }

                                        // Add first word from first fully transcripted text
                                        lastWordOfTranscript =res.result.hypotheses[0].transcript.split(" ").splice(-1)
                                    
                                    }

                                    else
                                        {
                                            text = text+" " + res.result.hypotheses[0].transcript;
                                        }

                                        if (text == null)
                                        {
                                            text = "";
                                        }
                            	
                            	           document.getElementById("p1").innerHTML =  text;
				                            document.getElementById("p2").innerHTML =  lastWordOfTranscript;
                                            config.onResults(res.result.hypotheses);
                            	 
                                    }
                                    else { 
                                        
                                            document.getElementById("p2").innerHTML = res.result.hypotheses[0].transcript;
                                            var data=document.getElementById("p2");
                                                autoselect(data);
                                        
                                        //   console.log(res.result.hypotheses);
                                            config.onPartialResults(res.result.hypotheses);
                                    }
                                }
                                else
                                {
                                    
                                    if (res.result.final) {
                                    if (res.result.hypotheses[0].formatted_transcript !=null)
                                        {
                                            text=text+res.result.hypotheses[0].formatted_transcript;
                                    
                                        }

                                else
                                {
                                    text = text+" " + res.result.hypotheses[0].transcript;
                                }

                                if (text == null)
                                {
                                    text = "";
                                }
                                
                                    document.getElementById("p1").innerHTML =  text;
                                    document.getElementById("p2").innerHTML =  "";
                                    config.onResults(res.result.hypotheses);
                                 
                                }
                                     else { 
                                        if(res.result.hypotheses[0].formatted_transcript!=null)
                                            {
                                                document.getElementById("p2").innerHTML = res.result.hypotheses[0].formatted_transcript;
                                               var data=document.getElementById("p2");
                                                autoselect(data);
                                            }
                                        else
                                            {
                                                document.getElementById("p2").innerHTML = res.result.hypotheses[0].transcript;
                                                var data=document.getElementById("p2");
                                                autoselect(data);
                                            }
                                    //   console.log(res.result.hypotheses);
                                        config.onPartialResults(res.result.hypotheses);
                                    }

                                }

                            }
                            catch (errr)
                            { }

                            } else {
                            config.onError(ERR_SERVER, 'Server error: ' + res.status + ': ' + getDescription(res.status));
                        }
                    }
                }

            // Start recording only if the socket becomes open
            ws.onopen = function (e) {
                
                console.log("connected to u server :)");
                connect=true;
                var count=0;
                if(recordingstart)
                {
                intervalKey = setInterval(function () {
                    
                    recorder.export16kMono(function (blob) {
                        socketSend(blob);  // 
                        recorder.clear();
                    }, 'audio/raw');

                }, config.interval);
                // Start recording
                recorder.record();
                console.log("Recording Starts in Dictate.js");
                config.onReadyForSpeech();
                config.onEvent(MSG_WEB_SOCKET_OPEN, e);
            }
            else
            {
                var index=0;
                while(index<file.size)
                {
                    var fileReader = new FileReader();
                    fileReader.onloadend = function (e) {
                    };
                    var blob=file.slice(index,index+chunk);
                    index+=chunk;
                    //console.log(blob);
                    ws.send(blob);
                    count++;
                    fileReader.readAsBinaryString(blob);
                }
                var fileReader1 = new FileReader();
                  fileReader1.onloadend = function (e) {
                        var arrayBuffer = e.target.result;
                        var fileType = 'audio/wav';
                        var blob = new Blob([arrayBuffer]);
                        downloadWav(blob);
               
                    };
                     fileReader1.readAsArrayBuffer(file);
                ws.send('EOS');
                connect=false;
                //console.log(count);
            }
        };
       
            

            // This can happen if the blob was too big
            // E.g. "Frame size of 65580 bytes exceeds maximum accepted frame size"
            // Status codes
            // http://tools.ietf.org/html/rfc6455#section-7.4.1
            // 1005:
            // 1006:
            ws.onclose = function (e) {
           //     parent.PasteRecognisedText();
                var code = e.code;
                var reason = e.reason;
                var wasClean = e.wasClean;
                // The server closes the connection (only?)
                // when its endpointer triggers.
                console.log("websocket closed");
               // $('#lblSilence').attr('disabled', '');
           $('#file-input').removeAttr('disabled');
           //CanvasObject.GetComponent<Canvas> ().enabled = true;
                config.onEndOfSession();
                clearTranscription();
                config.onEvent(MSG_WEB_SOCKET_CLOSE, e.code + "/" + e.reason + "/" + e.wasClean);
            };


            ws.onerror = function (e) {
                var data = e.data;
                config.onError(ERR_NETWORK, data);
                drawMic();
                alert("Unable to connect to Speech Server!");
            }
            return ws;
        }


       /* function monitorServerStatus() {
            if (wsServerStatus) {
                wsServerStatus.close();
            }
            wsServerStatus = new WebSocket(config.serverStatus);
            wsServerStatus.onmessage = function (evt) {
                config.onServerStatus(JSON.parse(evt.data));
            };
        }*/



        function getDescription(code) {
            if (code in SERVER_STATUS_CODE) {
                return SERVER_STATUS_CODE[code];
            }
            return "Unknown error";
        }

    };

    // Simple class for persisting the transcription.
    // If isFinal==true then a new line is started in the transcription list
    // (which only keeps the final transcriptions).
    var Transcription = function (cfg) {
        var index = 0;
        var list = [];

        this.add = function (text, isFinal) {
            list[index] = text;
            if (isFinal) {
                index++;
            }
        }

        this.toString = function () {
            return list.join('. ');
        }
    }

    window.Dictate = Dictate;
    window.Transcription = Transcription;

})(window);

