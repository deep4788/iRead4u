var speechUtteranceChunker = function (utt, settings, callback) {
    settings = settings || {};
    var newUtt;
    var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
    if(utt.voice && utt.voice.voiceURI === 'native') { // Not part of the spec
        newUtt = utt;
        newUtt.text = txt;
        newUtt.addEventListener('end', function () {
            if(speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
            }
            if(callback !== undefined) {
                callback();
            }
        });
    }
    else {
        var chunkLength = (settings && settings.chunkLength) || 160;
        var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
        var chunkArr = txt.match(pattRegex);

        if(chunkArr[0] === undefined || chunkArr[0].length <= 2) {
            //Call once all text has been spoken
            if(callback !== undefined) {
                callback();
            }
            return;
        }
        var chunk = chunkArr[0];
        newUtt = new SpeechSynthesisUtterance(chunk);
        var x;
        for(x in utt) {
            if(utt.hasOwnProperty(x) && x !== 'text') {
                newUtt[x] = utt[x];
            }
        }
        newUtt.addEventListener('end', function () {
            if(speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
                return;
            }
            settings.offset = settings.offset || 0;
            settings.offset += chunk.length - 1;
            speechUtteranceChunker(utt, settings, callback);
        });
    }

    if(settings.modifier) {
        settings.modifier(newUtt);
    }

    //IMPORTANT!! Do not remove console.log: Logging the object fixes some onend firing issues
    console.log(newUtt);

    //Placing the speak invocation inside a callback fixes ordering and onend issues
    setTimeout(function() { speechSynthesis.speak(newUtt); }, 0);
};

//Add a listener for a click event on browserAction to make the text-to-speech
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();" },
        function(selection) {
            var speechMessage = new SpeechSynthesisUtterance(selection[0]);
            speechMessage.voiceURI = 'Google US English';
            speechMessage.rate = 1;  //0.1 to 10
            speechMessage.lang = 'en-US';
            speechUtteranceChunker(speechMessage, {
                chunkLength: 120
                }, function () {
                    console.log('Done');
            });
        });
});

//Add a listener for a keyboard shortcut that triggers an action to make the text-to-speech
chrome.commands.onCommand.addListener(function(command) {
    if(command == "read-highlighted") {
        chrome.tabs.executeScript({
            code: "window.getSelection().toString();" },
            function(selection) {
                var speechMessage = new SpeechSynthesisUtterance(selection[0]);
                speechMessage.voiceURI = 'Google US English';
                speechMessage.rate = 1;  //0.1 to 10
                speechMessage.lang = 'en-US';
                speechUtteranceChunker(speechMessage, {
                    chunkLength: 120
                    }, function () {
                        console.log('Done');
                });
            });
    }
});

/*
 * NOTE: There is an issue with Google Chrome Speech Synthesis where long texts pause mid-speaking.
 * I have used a fix for this that takes in a speechUtterance object and intelligently chunks it into
 * smaller blocks of text that are stringed together one after the other. Basically, you can play any
 * length of text.
 *
 * Credit for this fix (speechUtteranceChunker() function) goes to:
 *  http://stackoverflow.com/questions/21947730/chrome-speech-synthesis-with-longer-texts/23808155#23808155
 *  https://gist.github.com/woollsta/2d146f13878a301b36d7#file-chunkify-js
 */
