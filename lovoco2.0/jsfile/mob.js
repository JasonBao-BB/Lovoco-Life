// Global UI elements:
//  - log: event log
//  - trans: transcription window

// Global objects:
//  - isConnected: true iff we are connected to a worker
//  - tt: simple structure for managing the list of hypotheses
//  - dictate: dictate object with control methods 'init', 'startListening', ...
//       and event callbacks onResults, onError, ...
var isConnected = false;

var tt = new Transcription();

var dictate = new Dictate({		
		recorderWorkerPath : 'jsfile/recorderWorker.js',
		onReadyForSpeech : function() {
		    isConnected = true;		    
		    __message("READY FOR SPEECH");		   
			$("#buttonToggleListening").html('Stop');
			$("#buttonToggleListening").addClass('highlight');
			$("#buttonToggleListening").prop("disabled", false);
			$("#buttonCancel").prop("disabled", false);
		},
		onEndOfSpeech : function() {
			__message("END OF SPEECH");
			$("#buttonToggleListening").html('Start');
			$("#buttonToggleListening").prop("disabled", false);			
		},
		onEndOfSession : function() {
			isConnected = false;
			__message("END OF SESSION");			
			$("#buttonToggleListening").html('Start');
			$("#buttonToggleListening").removeClass('highlight');
			$("#buttonToggleListening").prop("disabled", false);
			$("#buttonCancel").prop("disabled", true);
		},
		onServerStatus : function(json) {
			__serverStatus(json.num_workers_available);
			$("#serverStatusBar").toggleClass("highlight", json.num_workers_available == 0);
			// If there are no workers and we are currently not connected
			// then disable the Start/Stop button.
			if (json.num_workers_available == 0 && ! isConnected) {
			    $("#buttonToggleListening").prop("disabled", true);
			    document.getElementById('hfServerStatus').value = "Server Not Available";			    
			} else {
			    document.getElementById('hfServerStatus').value = "Server Available";			    
			    $("#buttonToggleListening").prop("disabled", false);
			}
		},
		onPartialResults : function(hypos) {
		    tt.add(hypos[0].transcript, false);
		    var tts = tt.toString();
		    tts = tts.toString().replace("new line", "<br>");
		    tts = tts.toString().replace("new line.", "<br>");
		    tts = tts.toString().replace("new-line.", "<br>");
		    tts = tts.toString().replace("you line", "<br>");
B
		    tts = tts.toString().replace("you line.", "<br>");
		    tts = tts.toString().replace("you-line.", "<br>");
		    tts = tts.toString().replace("new paragraph", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("new paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("new-paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you paragraph", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you-paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("quotation", '"');
		    tts = tts.toString().replace("..", ".");
		    tts = tts.toString().replace(". .", ".");
			__updateTranscript(tts.toString());
		},
		onResults : function(hypos) {
		    tt.add(hypos[0].transcript, true);
		    var tts = tt.toString();
		    tts = tts.toString().replace("new line", "<br>");
		    tts = tts.toString().replace("new line.", "<br>");
		    tts = tts.toString().replace("new-line.", "<br>");
		    tts = tts.toString().replace("you line", "<br>");
		    tts = tts.toString().replace("you line.", "<br>");
		    tts = tts.toString().replace("you-line.", "<br>");
		    tts = tts.toString().replace("new paragraph", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("new paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("new-paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you paragraph", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("you-paragraph.", "<p>&nbsp;</p>");
		    tts = tts.toString().replace("quotation", '"');
		    tts = tts.toString().replace("..", ".");
		    tts = tts.toString().replace(". .", ".");
			__updateTranscript(tts.toString());
		},
		onError : function(code, data) {
			dictate.cancel();
			__error(code, data);
			// TODO: show error in the GUI
		},
		onEvent : function(code, data) {
			__message(code, data);
		}
	});

// Private methods (called from the callbacks)

function __message(code, data) {
    log.innerHTML = "msg: " + code + ": " + (data || '') + "\n" + log.innerHTML;    
}

function __error(code, data) {
	log.innerHTML = "ERR: " + code + ": " + (data || '') + "\n" + log.innerHTML;
}

function __serverStatus(msg) {
	//serverStatusBar.innerHTML = msg;
}

function __updateTranscript(text) {
    //$("#trans").val(text);   
   // alert(text);
    if (text.toString().trim() != "") {
        parent.SetVisibility(text);
    }
}

// Public methods (called from the GUI)
function toggleListening() {
    if (isConnected) {        
	    dictate.stopListening();	    
	    drawMic();
	    isConnected = false;
	    console.log("toggleListening in mob.js");
    } else {        
        drawLoop();
        console.log("toggleListening in mob.js in connected");
        isConnected = true;
	    dictate.startListening();	    	    
	}
}

function cancel() {
	dictate.cancel();
}

function clearTranscription() {
	tt = new Transcription();
	//$("#trans").val("");
}

$(document).ready(function() {
	
	//dictate.init();

	});
