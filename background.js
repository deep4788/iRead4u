
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
    chrome.tabs.executeScript({ code: "window.getSelection().toString();" },
                                function(selection) {
                                    console.log("selection: " + selection[0]);
                                    var speechMessage = new SpeechSynthesisUtterance();
                                    speechMessage.voiceURI = 'Google US English';
                                    speechMessage.rate = 1;  //0.1 to 10
                                    speechMessage.text = selection[0];
                                    speechMessage.lang = 'en-US';
                                    speechSynthesis.speak(speechMessage);
                                });
});
