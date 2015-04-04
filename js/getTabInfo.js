var tabInfo = {};

tabInfo.playing = document.getElementsByClassName('playControl')[0].classList.contains('playing');

tabInfo.repeating = document.getElementsByClassName('repeatControl')[0].classList.contains('m-active');

tabInfo.muted = document.getElementsByClassName('volume')[0].classList.contains('muted');

var tabTitle = document.getElementsByClassName('playbackSoundBadge__title')[0];

tabInfo.title = tabTitle ? tabTitle.title : '';

tabInfo;
