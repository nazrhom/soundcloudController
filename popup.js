var backgroundPage = chrome.extension.getBackgroundPage();

function updateUI() {
  // Get current status to properly display UI
  backgroundPage.detectPageStatus(function(status) {
    setPlayPauseButton(status.playing);
    setRepeat(status.repeating);
    setMute(status.muted);
    setTitle(status.title);
  });
}

function executeBackgroundCommand(command) {
  backgroundPage.executeCommand(command);
}

document.addEventListener('DOMContentLoaded', function() {

  updateUI();

  // Setup Listeners
  document.getElementById("play-pause-button").addEventListener("click", executeBackgroundCommand.bind(null, 'play-or-pause'));
  document.getElementById("previous-button").addEventListener("click", executeBackgroundCommand.bind(null, 'previous'));
  document.getElementById("next-button").addEventListener("click", executeBackgroundCommand.bind(null, 'next'));
  document.getElementById("repeat-button").addEventListener("click", executeBackgroundCommand.bind(null, 'repeat'));

});

function setPlayPauseButton (playing) {
  var image = document.getElementById('play-pause');
  var marquee = document.getElementById('titolo');

  if (playing) {
    image.src = 'img/pause.svg';
    marquee.setAttribute('scrollamount', "5");
  } else {
    image.src = 'img/play.svg';
    marquee.setAttribute('scrollamount', "3");
  }
}

function setRepeat(repeating) {
    var image = document.getElementById('replay');
    if (repeating) {
        image.src = 'img/bam.svg';
    } else {
        image.src = 'img/repeat.svg';
    }
}

function setMute(muted) {
    var image = document.getElementById('volume');
    if (muted) {
        image.src = 'img/volume_down.svg';
    } else {
        image.src = 'img/volume_up.svg';
    }
}

function setTitle(title) {
    var marquee = document.getElementById('titolo');
    marquee.innerHTML = title;
}


chrome.runtime.onMessage.addListener(updateUI)
