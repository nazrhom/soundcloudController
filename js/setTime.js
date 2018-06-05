function mouseEvent(type, sx, sy) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type != "mousemove"),
    view: window,
    detail: 0,
    screenX: sx,
    screenY: sy,
    clientX: sx,
    clientY: sy
  };
  if (typeof( document.createEvent ) == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type,
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (prop in e) {
    evt[prop] = e[prop];
  }
    evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
  }
  return evt;
}

function dispatchEvent (el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    el.fireEvent('on' + type, evt);
  }
  return evt;
}

function fakeClick(el, x, y) {
  var down = mouseEvent("mousedown", x, y);
  var up = mouseEvent("mouseup", x, y);
  el.dispatchEvent(down)
  el.dispatchEvent(up)
}
console.log(config.frac)
var timeline = document.getElementsByClassName('playbackTimeline__progressWrapper')[0]
var t = timeline.getBoundingClientRect()
fakeClick(timeline, t.x + (config.frac * t.width), t.y);
