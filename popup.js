var backgroundPage = chrome.extension.getBackgroundPage();

function updateUI(status) {
  // Get current status to properly display UI
  setPlayPauseButton(status.playing);
  setRepeat(status.repeating);
  setMute(status.muted);
  setTitle(status.title);
  setLike(status.liking);

  console.log(status)
}

function executeBackgroundCommand(command) {
  return backgroundPage.executeCommand.bind(null, command);
}

document.addEventListener('DOMContentLoaded', function () {

  backgroundPage.emitPageStatus();

  // Setup Listeners
  document.getElementById('nzqm-play-pause-button').addEventListener('click', executeBackgroundCommand('play-or-pause'));
  document.getElementById('nzqm-previous-button').addEventListener('click', executeBackgroundCommand('previous'));
  document.getElementById('nzqm-next-button').addEventListener('click', executeBackgroundCommand('next'));
  document.getElementById('nzqm-repeat-button').addEventListener('click', executeBackgroundCommand('repeat'));
  document.getElementById('nzqm-volume-button').addEventListener('click', executeBackgroundCommand('mute-unmute'));
  document.getElementById('nzqm-like-button').addEventListener('click', executeBackgroundCommand('like'));

});

function setPlayPauseButton(playing) {
  var image = document.getElementById('nzqm-play-pause');
  var marquee = document.getElementById('nzqm-title');

  if (playing) {
    image.src = 'img/pause.svg';
    marquee.setAttribute('scrollamount', "5");
  } else {
    image.src = 'img/play.svg';
    marquee.setAttribute('scrollamount', "3");
  }
}

function setRepeat(repeating) {
  var image = document.getElementById('nzqm-replay');
  if (repeating === 1) {
    image.src = 'img/repeat_one.svg';
  } else if (repeating === 2) {
    image.src = 'img/repeat_all.svg';
  } else {
    image.src = 'img/repeat.svg';
  }
}

function setMute(muted) {
  var image = document.getElementById('nzqm-volume');
  if (muted) {
    image.src = 'img/mute.svg';
  } else {
    image.src = 'img/max_volume.svg';
  }
}

function setLike(liking) {
  var image = document.getElementById('nzqm-like-icon');
  if (liking) {
    image.src = 'img/like.svg'
  } else {
    image.src = 'img/dislike.svg';
  }

}

function setTitle(title) {
  var marquee = document.getElementById('nzqm-title');
  marquee.innerHTML = title;
}


chrome.runtime.onMessage.addListener(updateUI);
