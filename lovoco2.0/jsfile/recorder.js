/* ***********************************Proprietary Notice****************************************
This Software and the intellectual property therein is property of GoVivace. 
Unauthorized copying, duplication,
or any other improper use not directly authorized by the company is strictly prohibited.
 Copyright 2010-2015
********************************************************************************************* 
*/


(function(window){

  var WORKER_PATH = 'recorderWorker.js';
//  var completeBlob= new Blob([],{type:'audio/wav'}); 
  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    // bufferSize, numInputChannels, numOutputChannels
    // TODO: make it: 1, 1
      //this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
      //createJavaScriptNode is obsolete- removed from Chrome on 16th July
    this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
    }

    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffer' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type

      });
    }

    this.exportRAW = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/raw';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportRAW',
        type: type
      });
    }

    this.export16kMono = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/raw';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'export16kMono',
        type: type
      });
    }

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //TODO: this should not be necessary (try to remove it)
  };

  Recorder.forceDownload = function(blob,filename){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename||'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }


  this.downloadWav1= function(Blob){
          var url = (window.URL || window.webkitURL).createObjectURL(Blob);
          document.getElementById('play').setAttribute('src',url);
        
          var link = window.document.createElement('a');
          link.href = url;
          link.download ='output.wav';
          var click = document.createEvent("Event");
          click.initEvent("click", true, true);
          link.dispatchEvent(click);  
  }
   
    this.downloadWav =function(blob){

          var urlBlob = (window.URL || window.webkitURL).createObjectURL(blob);
          document.getElementById('play').setAttribute('src',urlBlob);
     
  
        /*  var x = document.createElement("AUDIO");
              x.src=url;
              x.play();*/
        /* var audio = document.createElement("audio");
           if (audio != null && audio.canPlayType && audio.canPlayType("audio/mpeg"))
              {
                audio.src = url;
                audio.play();
              }
        */
   
}

 window.Recorder = Recorder;

})(window);