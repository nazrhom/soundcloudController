var backgroundPage = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function() {

  // Get current status to properly display UI
  backgroundPage.detectPageStatus(function(status) {
    console.log(status)
    if (status.playing) togglePlayPauseButton();
    if (status.repeating) toggleRepeat();
  });

  // Setup Listeners
  document.getElementById("play-pause-button").addEventListener("click",   backgroundPage.executeCommand.bind(null, 'play-or-pause'));
  document.getElementById("previous-button").addEventListener("click", backgroundPage.executeCommand.bind(null, 'previous'));
  document.getElementById("next-button").addEventListener("click", backgroundPage.executeCommand.bind(null, 'next'));
  document.getElementById("repeat-button").addEventListener("click", backgroundPage.executeCommand.bind(null, 'repeat'));

});

function togglePlayPauseButton () {
  var image = document.getElementById('play-pause');
  if (image.src.match('play')) {
    image.src = 'img/pause.svg';
  } else {
    image.src = 'img/play.svg';
  }
}

function toggleRepeat() {
    var image = document.getElementById('replay');
    if (image.src.match('repeat')) {
        image.src = 'img/bam.svg';
    } else {
        image.src = 'img/repeat.svg';
    }
}


chrome.runtime.onMessage.addListener(
  function(request) {
    if (request.command == 'play-or-pause') {
      togglePlayPauseButton();
    } else if (request.command == 'repeat') {
      toggleRepeat();
    }
  }
)
