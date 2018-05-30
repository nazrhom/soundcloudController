const backgroundPage = chrome.extension.getBackgroundPage();
let updateTimelineTimeout;
let UI_STATUS;

function updateUI(status) {
  UI_STATUS = status
  // Get current status to properly display UI
  setPlayPauseButton(status.playing, status.songCurrentTime);
  setRepeat(status.repeating);
  setMute(status.muted);
  setArtist(status.artist);
  setTitle(status.title);
  setLike(status.liking);
  setImage(status.image);
  setTime(status.songCurrentTime)
  setTimeLineCursor(status.songCurrentTime, status.songLength)
  console.log(status)
}

function executeBackgroundCommand(command) {
  return backgroundPage.executeCommand.bind(null, command);
}

document.addEventListener('DOMContentLoaded', function () {
  backgroundPage.emitPageStatus();
  applySelectedTheme();

  // Setup Listeners
  document.getElementById('nzqm-play-pause-button').addEventListener('click', executeBackgroundCommand('play-or-pause'));
  document.getElementById('nzqm-previous-button').addEventListener('click', executeBackgroundCommand('previous'));
  document.getElementById('nzqm-next-button').addEventListener('click', executeBackgroundCommand('next'));
  document.getElementById('nzqm-repeat-button').addEventListener('click', executeBackgroundCommand('repeat'));
  document.getElementById('nzqm-volume-button').addEventListener('click', executeBackgroundCommand('mute-unmute'));
  document.getElementById('nzqm-like-button').addEventListener('click', executeBackgroundCommand('like'));
  document.getElementById('nzqm-settings-button').addEventListener('click', openOptionsPage);
  setupAnimation();
});

function setPlayPauseButton(playing, songCurrentTime) {
  var image = document.getElementById('nzqm-play-pause');
  var marquee = document.getElementById('nzqm-title');
  var animation

  if (playing) {
    startTimeline(songCurrentTime);
    image.src = 'img/pause.svg';
    marquee.setAttribute('scrollamount', "5");
  } else {
    if (updateTimelineTimeout) {
      clearTimeout(updateTimelineTimeout)
    }
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

function setArtist(artist) {
  var artistSection = document.querySelector('#nzqm-artist small b');
  artistSection.innerHTML = artist;
}

function setTitle(title) {
  var titleSection = document.getElementById('nzqm-title');
  titleSection.innerHTML = title;
  if (title.length > 24) {
    titleSection.setAttribute('class', 'scroll');
  } else {
    titleSection.setAttribute('class', '');
  }
}

function setImage(image) {
  const playerImage = document.getElementById('nzqm-song-image');
  playerImage.style.backgroundImage = image;
}

function setTime(current) {
  const clock = document.getElementById('nzqm-clock')
  clock.innerHTML = formatTime(current)
}

function setTimeLine(px) {
  const pointer = document.getElementById('nzqm-timer-pointer');
  const background = document.getElementById('nzqm-timer-background');

  pointer.style.left = px + "px";
  background.style.width = px + "px";
}

function setTimeLineCursor(current, max) {
  const bar = document.getElementById('nzqm-timer-bar');
  const maxWidth = bar.clientWidth;
  setTimeLine((current / max) * maxWidth)
}

function formatTime(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = '';

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

function startTimeline(current) {
  var timelineWidth = document.getElementById('nzqm-timer-bar').clientWidth;

  // var timelineSongLength = document.getElementById('nzqm-song-image');
  setTime(current)
  return updateTimeline(current, UI_STATUS.songLength, timelineWidth)
}

function updateTimeline(current, songLength, maxWidth) {
  var timelineCurrent = document.getElementById('nzqm-timer-pointer');
  var timeLineBackgroud = document.getElementById('nzqm-timer-background');
  var modifier = current / songLength;

  setTime(current)
  timelineCurrent.style.left = (modifier * maxWidth) + 'px'
  timeLineBackgroud.style.width = (modifier * maxWidth) + 'px'
  updateTimelineTimeout = setTimeout(() => {
    clearTimeout(updateTimelineTimeout);
    updateTimeline(current + 1, songLength, maxWidth);
  }, 1000);
  return updateTimelineTimeout;
}

function setupAnimation() {
  const container = document.getElementById('nzqm-timer-bar-container');
  const background = document.getElementById('nzqm-timer-background');

  const bar = document.getElementById('nzqm-timer-bar');
  const maxWidth = bar.clientWidth;
  const leftOffset = bar.getBoundingClientRect().x;
  const rightOffset = maxWidth + leftOffset;

  container.addEventListener('drag', drag, false);
  container.addEventListener('dragend', stopDrag, false);
  container.addEventListener('click', click, false);

  function drag(ev) {
    if (updateTimelineTimeout) clearTimeout(updateTimelineTimeout);

    if (ev.clientX > leftOffset && ev.clientX <= rightOffset) {
      setTimeLine(ev.clientX - leftOffset);
    }
  }
  function stopDrag(ev) {
    const ratio = background.clientWidth / maxWidth

    if (updateTimelineTimeout) startTimeline(~~ratio)
    backgroundPage.moveTimeline(ratio)
  }
  function click(ev) {
    drag(ev);
    stopDrag(ev);
  }
}

function openOptionsPage() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

function applySelectedTheme() {
  chrome.storage.sync.get(['theme'], function (result) {
    const playerContainer = document.querySelector('#nzqm-player-container');
    if(result && result['theme']) {
      playerContainer.classList.add(result['theme']);
      const settingsIcon = document.querySelector('#nzqm-settings-icon');
      if (result['theme'] !== 'light') settingsIcon.src = 'img/settings-white.svg';
    } else {
      playerContainer.classList.add('light');
    }
  });
}


chrome.runtime.onMessage.addListener(updateUI);
