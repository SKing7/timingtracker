function bindEventWhenMonitor() {
  M.util.pgLoadHandler.push(handleLoad);

  function handleLoad() {
    var push = tracker.push.bind(tracker);
    if ($tracker.fpt >= 0) {
      push('ol', 'la', $tracker.ld - $tracker.fpt);
      push('ol', 'dl', $tracker.dcl - $tracker.fpt);
    }
    pushToOl();
    $tracker.fpt = $tracker.dcl = $tracker.ld = -1;
    w.setTimeout(function () {
      if (performance.timing) {
        pushNaviTimingData();
      }
      tracker.flush();
      tracker.setOnLoadStatus(true);
    }, 50);
  }
  //暂存的数据push到tracker中
  function pushToOl() {
    var olObj = w.M.TS.t_ol;
    for (var i in olObj) {
      if (olObj.hasOwnProperty(i)) {
        tracker.push('ol', i, olObj[i]);
      }
    }
  }
}
