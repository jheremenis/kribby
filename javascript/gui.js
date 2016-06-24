
//==============================================================================
// SPEAKERS
//==============================================================================
/*
(function () {
    // config
    var DOMspeaker = document.getElementById("speaker");   //dom element of the audio tag
    var DOMplaylist = $(".audio #playlist"); //dom element of the playlist containing list items
    var DOMplayPause = $(".audio #playPause");    //dome element of the play/pause button
    var DOMnext = $(".audio #next");         //dom element of the button next
    var INTvolume = 75;                      //initial volume in percentage
    var audioLocation = "audio/";            //directory location of audio
    var genre = "vanilla/";                   //genre playing EG: audio/vanilla
    var playOrPause = "play";

    // functionality
    DOMnext.on('click', function () {
        nextAudio();
    });
    DOMplayPause.on('click', function () {
        if (playOrPause == "play") {
            playAudio();
            playOrPause = "pause";  //switch to pause
        }
        else if (playOrPause == "pause") {
            DOMspeaker.pause();
            playOrPause = "play";   //switch to play
        }
    });
    DOMplaylist.children().on('click', function () {
        playAudio($(this).find('a').data('src'));
    });


    DOMspeaker.onended = function () {
        nextAudio();
    };

    function playAudio(prefSong) {
        var currentItem = $('li.active a');
        var song = prefSong || currentItem.attr("data-src");
        var sourcy = audioLocation + genre + song + ".mp3";
        DOMspeaker.setAttribute('src', sourcy);
        DOMspeaker.play();
    }

    function nextAudio() {
        var next = $('li.active').removeClass('active').next();
        if (next.length) {
            next.addClass('active');
        } else {
            //add to first
            DOMplaylist.children().first().addClass('active');
        }

        var currentItem = $('li.active a');
        var sourcy = audioLocation + genre + currentItem.attr("data-src") + ".mp3";
        DOMspeaker.setAttribute('src', sourcy);
        DOMspeaker.play();
    }

//==============================================================================
//  EQUALIZER
//==============================================================================
    var canEqualizer = document.getElementById('equalizer'),
            ctx = canEqualizer.getContext('2d');



// here we create the chain
    var audio = document.getElementById('speaker'),
            audioContext = new AudioContext(),
            source = audioContext.createMediaElementSource(audio),
            analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    setInterval(function () {
        var freqData = new Uint8Array(analyser.frequencyBinCount);

        analyser.getByteFrequencyData(freqData);

        ctx.clearRect(0, 0, canEqualizer.width, canEqualizer.height);

        for (var i = 0; i < freqData.length; i++) {
            var magnitude = freqData[i];

            ctx.fillStyle = "lightgrey";
            ctx.fillRect(i * 0.5, canEqualizer.height, 5, -magnitude * 0.75);
        }
    }, 33);
})();

*/