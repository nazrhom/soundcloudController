var tabInfo = {};

tabInfo.playing = document.getElementsByClassName('playControl')[0].classList.contains('playing');

tabInfo.repeating = getRepeatInfo();

tabInfo.muted = document.getElementsByClassName('volume')[0].classList.contains('muted');

tabInfo.liking = document.getElementsByClassName('playbackSoundBadge__like')[0] == undefined ? false : document.getElementsByClassName('playbackSoundBadge__like')[0].classList.contains('sc-button-selected');

tabInfo.artist = document.getElementsByClassName('playbackSoundBadge__lightLink')[0].title || '';

var tabTitle = document.querySelector('.playbackSoundBadge__title a');

tabInfo.title = tabTitle ? tabTitle.title : '';

tabInfo.image = document.querySelector('.playbackSoundBadge__avatar div span').style.backgroundImage;

tabInfo;


function getRepeatInfo() {
    var repeatElement = document.getElementsByClassName('repeatControl')[0];
    if (repeatElement.classList.contains('m-one')) {
        return 1
    } else if (repeatElement.classList.contains('m-all')) {
        return 2
    }
    return 3
}