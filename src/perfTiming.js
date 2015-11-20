//准备performance timing数据
function pushNaviTimingData() {
  var timing = performance.timing;
  var start = timing.navigationStart;
  var timingData = {};
  timingData.ns  =  start;
  if (timing.redirectStart) {
    timingData.rds  =  timing.redirectStart;
    timingData.rde  =  timing.redirectEnd;
  }
  timingData.fs   = timing.fetchStart;
  timingData.dls  = timing.domainLookupStart;
  timingData.dle  = timing.domainLookupEnd;
  timingData.cs   = timing.connectStart;
  timingData.ce   = timing.connectEnd;
  timingData.rqs  = timing.requestStart;
  timingData.rss  = timing.responseStart;
  timingData.rse  = timing.responseEnd;
  timingData.ds   = timing.domLoading;
  timingData.di   = timing.domInteractive;
  timingData.dcs  = timing.domContentLoadedEventStart;
  timingData.dce  = timing.domContentLoadedEventEnd;
  timingData.de   = timing.domComplete;
  timingData.ls   = timing.loadEventStart;
  if (timing.loadEventEnd) {
    timingData.le = timing.loadEventEnd;
  }
  for (var i in timingData) {
    if (timingData.hasOwnProperty(i)) {
      tracker.push('ol', i, timingData[i] - start);
    }
  }
}
