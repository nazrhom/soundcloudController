const backgroundPage = chrome.extension.getBackgroundPage()
let updateTimelineTimeout
let UI_STATUS

function updateUI(status) {
  UI_STATUS = status
  // Get current status to properly display UI
  setPlayPauseButton(status.playing, status.songCurrentTime)
  setRepeat(status.repeating)
  setMute(status.muted)
  setArtist(status.artist)
  setTitle(status.title)
  setLike(status.liking)
  setImage(status.image)
  setTime(status.songCurrentTime)
  setTimeLineCursor(status.songCurrentTime, status.songLength)
  console.log(status)
}

function executeBackgroundCommand(command) {
  return backgroundPage.executeCommand.bind(null, command)
}

document.addEventListener('DOMContentLoaded', function () {
  backgroundPage.emitPageStatus()
  applySelectedTheme()

  // Setup Listeners
  document.getElementById('nzqm-play-pause-button').addEventListener('click', togglePlayPause)
  document.getElementById('nzqm-previous-button').addEventListener('click', executeBackgroundCommand('previous'))
  document.getElementById('nzqm-next-button').addEventListener('click',  executeBackgroundCommand('next'))
  document.getElementById('nzqm-repeat-button').addEventListener('click', executeBackgroundCommand('repeat'))
  document.getElementById('nzqm-volume-button').addEventListener('click', executeBackgroundCommand('mute-unmute'))
  document.getElementById('nzqm-like-button').addEventListener('click', executeBackgroundCommand('like'))
  document.getElementById('nzqm-settings-button').addEventListener('click', openOptionsPage)
  setupAnimation()
})

function togglePlayPause() {
  if (UI_STATUS && !UI_STATUS.playing && updateTimelineTimeout) {
    clearTimeout(updateTimelineTimeout)
  }
  backgroundPage.executeCommand('play-or-pause')
}

function setPlayPauseButton(playing, songCurrentTime) {
  var icon = document.getElementById('nzqm-play-pause')

  if (playing) {
    startTimeline(songCurrentTime)
    icon.className  = 'icon-pause'
  } else {
    if (updateTimelineTimeout) {
      clearTimeout(updateTimelineTimeout)
    }
    icon.className  = 'icon-play'
  }
}



function setRepeat(repeating) {
  var icon = document.getElementById('nzqm-replay')
  if (repeating === 1) {
    icon.className  = 'icon-repeat_one'
  } else if (repeating === 2) {
    icon.className  = 'icon-repeat_all'
  } else {
    icon.className  = 'icon-repeat'
  }
}

function setMute(muted) {
  var icon = document.getElementById('nzqm-volume')
  if (muted) {
    icon.className  = 'icon-mute'
  } else {
    icon.className  = 'icon-max_volume'
  }
}

function setLike(liking) {
  var icon = document.getElementById('nzqm-like-icon')
  if (liking) {
    icon.className  = 'icon-like'
  } else {
    icon.className  = 'icon-dislike'
  }
}

function setArtist(artist) {
  var artistSection = document.querySelector('#nzqm-artist small b')
  artistSection.innerHTML = artist
}

function setTitle(title) {
  var titleSection = document.getElementById('nzqm-title')
  titleSection.innerHTML = title
  if (title.length > 24) {
    titleSection.setAttribute('class', 'scroll')
  } else {
    titleSection.setAttribute('class', '')
  }
}

function setImage(image) {
  const playerImage = document.getElementById('nzqm-song-image')
  playerImage.style.backgroundImage = image
}

function setTime(current) {
  const clock = document.getElementById('nzqm-clock')
  clock.innerHTML = formatTime(current)
}

function setTimeLine(px) {
  const pointer = document.getElementById('nzqm-timer-pointer')
  const background = document.getElementById('nzqm-timer-background')

  pointer.style.left = px + "px"
  background.style.width = px + "px"
}

function setTimeLineCursor(current, max) {
  const bar = document.getElementById('nzqm-timer-bar')
  const maxWidth = bar.clientWidth
  setTimeLine((current / max) * maxWidth)
}

function formatTime(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600)
  var mins = ~~((time % 3600) / 60)
  var secs = time % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}

function startTimeline(current) {
  updateTimelineTimeout && clearTimeout(updateTimelineTimeout)
  var timelineWidth = document.getElementById('nzqm-timer-bar').clientWidth

  setTime(current)
  return updateTimeline(current, UI_STATUS.songLength, timelineWidth)
}

function updateTimeline(current, songLength, maxWidth) {
  var modifier = current / songLength
  if (modifier >= 1) {
    backgroundPage.emitPageStatus()
    return
  } else {
    setTime(current)
    setTimeLine((modifier * maxWidth))
    updateTimelineTimeout = setTimeout(() => {
      clearTimeout(updateTimelineTimeout)
      updateTimeline(current + 1, songLength, maxWidth)
    }, 1000)
    return updateTimelineTimeout  
  }
}

function setupAnimation() {
  const container = document.getElementById('nzqm-timer-bar-container')
  const background = document.getElementById('nzqm-timer-background')

  const bar = document.getElementById('nzqm-timer-bar')
  const maxWidth = bar.clientWidth
  const leftOffset = bar.getBoundingClientRect().x
  const rightOffset = maxWidth + leftOffset
  const img = new Image()
  img.src = 'img/empty.svg'

  document.addEventListener('dragover', function(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  })
  container.addEventListener('dragstart', function(e) {
    e.dataTransfer.setDragImage(img, 10, 10)
  })

  container.addEventListener('drag', drag, false)
  container.addEventListener('dragend', stopDrag, false)
  container.addEventListener('click', click, false)

  function drag(ev) {
    if (updateTimelineTimeout) clearTimeout(updateTimelineTimeout)

    if (ev.clientX > leftOffset && ev.clientX <= rightOffset) {
      setTimeLine(ev.clientX - leftOffset)
    }
  }
  function stopDrag(ev) {
    const ratio = background.clientWidth / maxWidth
    backgroundPage.moveTimeline(ratio)
  }
  function click(ev) {
    drag(ev)
    stopDrag(ev)
  }
}

function openOptionsPage() {
  window.location.href = 'settings.html'
}

function applySelectedTheme() {
  chrome.storage.sync.get(['theme'], function (result) {
    const playerContainer = document.querySelector('#nzqm-player-container')
    if(result && result['theme']) {
      playerContainer.classList.add(result['theme'])
      const settingsIcon = document.querySelector('#nzqm-settings-icon')
      if (result['theme'] !== 'light') settingsIcon.className  = 'icon-settings-white'
    } else {
      playerContainer.classList.add('light')
    }
  })
}


chrome.runtime.onMessage.addListener(updateUI)
