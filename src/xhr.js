function initXhrTracker() {
  var Xhr = w.XMLHttpRequest;
  try{
    w.XMLHttpRequest = function () {
      var req = new Xhr();
      var _open = req.open;
      var startTime;
      var readyStateTimes = {};
      try {
        req.open = function (type, url) {
          if (ifCaptureAjaxTimingData(url)) {
            startTime = now();
            readyStateTimes[0] = startTime;
            req.addEventListener('readystatechange', function () {
              readyStateTimes[req.readyState] = now();
            });
            req.addEventListener('loadend', function() {
              handleReqLoadEnd({
                type: type,
                url: url,
                readyStateTimes: readyStateTimes
              });
            });
          }
          return _open.apply(req, arguments);
        };
      } catch (e) {
        req.open = _open;
      }
      return req;
    };
  } catch (e) {
    w.XMLHttpRequest = Xhr;
  }
  function handleReqLoadEnd(params) {
      pushReadyStateTimes(params);
      tracker.flush('ax');
  }
  //准备ajax的性能数据
  function pushReadyStateTimes(params) {
      //key: xhr readystate(1,2,3,4)
      var push = tracker.push.bind(tracker);
      var times = params.readyStateTimes;
      var url = params.url;
      var last = times[0];
      var mapping = {
          1: 'open',
          2: 'received',
          3: 'loading',
          4: 'done'
      };
      for (var i in mapping) {
          if (mapping.hasOwnProperty(i) && mapping[i]) {
            push('ax', mapping[i], Math.round(times[i] - last));
            last = times[i];
          }
      }
      push('ax', 'url', url.substring(0, url.indexOf('?') || url));
  }
}
