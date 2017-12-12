var connection = new RTCMultiConnection();

//Set up the socket server

// https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
var SIGNALING_SERVER = 'https://ec2-18-217-2-182.us-east-2.compute.amazonaws.com:8888/';
var recording = 0;
//var SIGNALING_SERVER = 'https://webrtcweb.com:9559/';
connection.openSignalingChannel = function (config) {
    var channel = config.channel || connection.channel || 'default-namespace';
    var sender = Math.round(Math.random() * 9999999999) + 9999999999;

    io.connect(SIGNALING_SERVER).emit('new-channel', {
        channel: channel,
        sender: sender
    });

    var socket = io.connect(SIGNALING_SERVER + channel);
    socket.channel = channel;

    socket.on('connect', function () {
        if (config.callback) config.callback(socket);
    });

    socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data: message
        });
    };

    socket.on('message', config.onmessage);
};

//Set up the controls
connection.session = {
    audio: true,
    video: true,
    screen: true,
    oneway: true
};

//Start streams with RTCMultiConnection
connection.onstream = function (e) {
    appendVideo(e.mediaElement, e.streamid);
};

//Append the video into the parent divs
function appendVideo(video, streamid) {
    video.width = 600;
    video = getVideo(video, streamid);
    videosContainer.insertBefore(video, videosContainer.firstChild);
    rotateVideo(video);
    //scaleVideos();

    document.getElementById('leave-conference').disabled = false;
}

//create the video (camera, screen)
function getVideo(video, streamid) {
    var div = document.createElement('div');
    div.className = 'video-container';

    var button = document.createElement('button');
    button.id = streamid;
    button.innerHTML = 'Start Recording';
    button.onclick = function () {
        this.disabled = true;
        if (this.innerHTML == 'Start Recording') {
            this.innerHTML = 'Stop Recording';
            connection.streams[this.id].startRecording({
                audio: true,
                video: true,
                screen: true
            });
        } else {
            this.innerHTML = 'Start Recording';
            var stream = connection.streams[this.id];
            stream.stopRecording(function (blob) {
                var h2;

                if (blob.audio && !(connection.UA.Chrome && stream.type == 'remote')) {
                    h2 = document.createElement('h2');
                    h2.innerHTML = '<a href="' + URL.createObjectURL(blob.audio) + '" target="_blank">Open recorded ' + blob.audio.type + '</a>';
                    div.appendChild(h2);
                }

                if (blob.video) {
                    h2 = document.createElement('h2');
                    h2.innerHTML = '<a href="' + URL.createObjectURL(blob.video) + '" target="_blank">Open recorded ' + blob.video.type + '</a>';
                    div.appendChild(h2);
                }
            });
        }
        setTimeout(function () {
            button.disabled = false;
        }, 3000);
    };
    div.appendChild(button);
    div.appendChild(video);
    return div;
}

//make a rotate video style
function rotateVideo(mediaElement) {
    mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

connection.onstreamended = function (e) {
    var div = e.mediaElement.parentNode;
    div.style.opacity = 0;
    rotateVideo(div);
    setTimeout(function () {
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
        scaleVideos();
    }, 1000);
};

var sessions = {};
connection.onNewSession = function (session) {
    if (sessions[session.sessionid]) return;
    sessions[session.sessionid] = session;

    var tr = document.createElement('tr');
    tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is running a conference!</td>' +
        '<td><button class="join">Join</button></td>';
    roomsList.insertBefore(tr, roomsList.firstChild);

    var joinRoomButton = tr.querySelector('.join');
    joinRoomButton.setAttribute('data-sessionid', session.sessionid);
    joinRoomButton.onclick = function () {
        this.disabled = true;

        var sessionid = this.getAttribute('data-sessionid');
        session = sessions[sessionid];

        if (!session) throw 'No such session exists.';

        connection.join(session);
    };
};

var videosContainer = document.getElementById('videos-container') || document.body;
var roomsList = document.getElementById('rooms-list');

document.getElementById('setup-new-conference').onclick = function () {
	recording = 1;
    connection.sessionid = (Math.random() * 999999999999).toString().replace('.', '');
    this.disabled = true;
    connection.extra = {
        'session-name': document.getElementById('conference-name').value || 'Anonymous'
    };
    connection.open();
};

document.getElementById('leave-conference').onclick = function () {
    this.disabled = true;
    connection.close();
    location.reload();
};

// setup signaling to search existing sessions
connection.connect();

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<a href="' + location.href + '" target="_blank"><i style="margin-top:15px;" class="material-icons">share</i></a>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
})();

//Resize the videos(screen & camera)
function scaleVideos() {
    var videos = document.querySelectorAll('video'),
        length = videos.length,
        video;

    var minus = 130;
    var windowHeight = 700;
    var windowWidth = 600;
    var windowAspectRatio = windowWidth / windowHeight;
    var videoAspectRatio = 4 / 3;
    var blockAspectRatio;
    var tempVideoWidth = 0;
    var maxVideoWidth = 0;

    for (var i = length; i > 0; i--) {
        blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
        if (blockAspectRatio <= windowAspectRatio) {
            tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
        } else {
            tempVideoWidth = windowWidth / i;
        }
        if (tempVideoWidth > maxVideoWidth)
            maxVideoWidth = tempVideoWidth;
    }
    for (var i = 0; i < length; i++) {
        video = videos[i];
        if (video)
            video.width = maxVideoWidth - minus;
    }
}

window.onresize = scaleVideos;


