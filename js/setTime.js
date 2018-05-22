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
  return evt;
}
return evt;
}

function fakeClick(el, x, y) {
  var down = mouseEvent("mousedown", x, y);
  var up = mouseEvent("mouseup", x, y);
  dispatchEvent(el, down)
  dispatchEvent(el, up)
}

var timeline = document.getElementsByClassName('playbackTimeline__progressWrapper')[0]
var r = timeline.getBoundingClientRect()
fakeClick(timeline, r.x , r.y);
