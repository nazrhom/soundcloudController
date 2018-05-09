var tabInfo = {};

tabInfo.playing = document.getElementsByClassName('playControl')[0].classList.contains('playing');

tabInfo.repeating = document.getElementsByClassName('repeatControl')[0].classList.contains('m-active');

tabInfo.muted = document.getElementsByClassName('volume')[0].classList.contains('muted');

tabInfo.liking = document.getElementsByClassName('playbackSoundBadge__like')[0] == undefined ? false : document.getElementsByClassName('playbackSoundBadge__like')[0].classList.contains('sc-button-selected');

var tabTitle = document.getElementsByClassName('playbackSoundBadge__title')[0];

tabInfo.title = tabTitle ? tabTitle.title : '';

tabInfo;
