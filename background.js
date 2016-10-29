//Add a listener for a click event on browserAction to make the text-to-speech
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();" },
        function(selection) {
            var speechMessage = new SpeechSynthesisUtterance();
            speechMessage.voiceURI = 'Google US English';
            speechMessage.rate = 1;  //0.1 to 10
            speechMessage.text = selection[0];
            speechMessage.lang = 'en-US';
            speechSynthesis.speak(speechMessage);
        });
});

//Add a listener for a keyboard shortcut that triggers an action to make the text-to-speech
chrome.commands.onCommand.addListener(function(command) {
    if(command == "read-highlighted") {
        chrome.tabs.executeScript({
            code: "window.getSelection().toString();" },
            function(selection) {
                var speechMessage = new SpeechSynthesisUtterance();
                speechMessage.voiceURI = 'Google US English';
                speechMessage.rate = 1;  //0.1 to 10
                speechMessage.text = selection[0];
                speechMessage.lang = 'en-US';
                speechSynthesis.speak(speechMessage);
            });
    }
});
