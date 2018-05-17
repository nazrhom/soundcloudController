function dispatchMouseEvent(target, var_args) {
  var e = document.createEvent("MouseEvents");
  // If you need clientX, clientY, etc., you can call
  // initMouseEvent instead of initEvent
  e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
  target.dispatchEvent(e);
};

dispatchMouseEvent(document.getElementsByClassName('playbackSoundBadge__like')[0], 'click', true, true);


chrome.runtime.onMessage.addListener(getElement);