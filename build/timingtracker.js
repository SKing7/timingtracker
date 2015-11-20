/*global define*/
/*
 * timingtracker v0.0.1 | JavaScript TimingTracker Library
 *
 * Copyright 2015 liuzhe.pt<@alibaba-inc.com> - All rights reserved.
 * Dual licensed under MIT and Beerware license 
 *
 * :: 2015-11-20 17:14
 */
;(function (name, factory) {
if (typeof define === "function" && define.amd) {
    define(name, ["util/history"], factory);
  } 
})("common/timingtracker", function ($history) {
(function initPollfill() {
  var w = window;
  if (typeof w.performance === 'undefined') {
    w.performance = {};
  }
  if (!w.performance.now){
    var s = Date.now ? Date.now() : +(new Date());
    if (performance.timing && performance.timing) {
      s = performance.timing.navigationStart;
      w.performance.now = function() {
        var n = Date.now ? Date.now() : +(new Date());
        return n-s;
      };
    }
  }
}());

var M = window.M;
var $tracker = M.TimeTracker;

var w = window;
var performance = w.performance;
var tracker;
var now = function () {
  return performance.now();
};

var config = {
  url: 'http://203.130.42.237/s.gif',
  aid: 1, 
  prefixMap: {
    rt: 'rt_'
  },
  //flush相关类型性能指标时，可指定关联指标一并发送
  relatedIndexes: {
    ol: ['rt']
  }
};


function createImg(data) {
  var img = new Image();
  img.style.cssText= 'width:1px;height:1px;visibility:hidden;';
  img.onload = function () {
    img.parentNode.removeChild(img);
  };
  img.src = config.url + '?' + data;
  return img;
}
//当前用户 是否命中为性能指标的样本用户
function trackerSwitchFun() {
  return !M.re.isPreRendering && (M.env !== 'production' || Math.random() >= 0.5);
}
//检查是否是属于收集ajax性能数据的api白名单
function ifCaptureAjaxTimingData(url) {
  if (url) {
    var legals = ['/service/poi/keywords', '/service/valueadded/infosearch'];
    var blackList = ['/navigation/search'];
    var i;
    for (i = 0; i < blackList.length; i++) {
      if (getPid().indexOf(blackList[i]) === 0) {
        return false;
      }
    }
    for (i = 0; i < legals.length; i++) {
      if (url.indexOf(legals[i]) === 0) {
        return true;
      }
    }
  }
  return false;
}
function getPid() {
  var state = $history.getState().data;
  return '/' + state.module + '/' + state.action + '/';
}
function getFirstByteStartTime() {
  var time = $tracker.fht;
  $tracker.fht = -1;
  return time;
}

/*
function parseUrl(url) {
  if (typeof url === 'string') {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
  }
  return url;
}
*/

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

var q = {};
var _timingMapper = {};
var trackerSwitch = trackerSwitchFun();

function Tracker () {
  this.isMonitorStarted = false;
  this.isOnLoadFired = false;
}
var proto = Tracker.prototype;

proto.getPid = getPid;
proto.now = now;

proto.setOnLoadStatus = function (st) {
  this.isOnLoadFired = st; 
};
proto.monitor = function () {
  if (!trackerSwitch || this.isMonitorStarted) { 
    return;
  }
  initXhrTracker();
  bindEventWhenMonitor();
  this.isMonitorStarted = true;
};
proto.flush = function (type) {
  if (!trackerSwitch) {
    q[type] = null;
    return;
  }
  var ndImg = createImg(packData(type)); 
  document.body.appendChild(ndImg);
};
proto.push = function (type, key, data) {
  var prefixMap = config.prefixMap;
  var prefix = prefixMap[type] || '';
  q[type] = q[type] || {};
  q[type][prefix + key] = encodeURIComponent(data);
};
//打点开始
proto.start = function (id) {
  var key = getMarkerKey(id);
  _timingMapper[key] = getNowTime();
};
//打点结束
proto.end = function (id) {
  var key = getMarkerKey(id);
  var startTime = _timingMapper[key];
  //如果没有打点开始时间，则认为使用首屏的打点
  if (!startTime) {
      startTime = getFirstByteStartTime();
  }
  if (!startTime || startTime < 0) {
    return;
  }
  this.push('rt', key, getNowTime() - startTime);
  //onload之后或者未初始化
  if (this.isOnLoadFired || !this.isMonitorStarted) {
      this.flush('rt');
  }
  _timingMapper[key] = null;
};
function getMarkerKey(id) {
  return id;
}
function getNowTime() {
  return new Date().getTime();
}
//根据type类型，打包数据
function packData(type) {
  type = type || 'ol';
  //关联指标一并打包
  var rels = config.relatedIndexes;
  var packedData = '';
  var rel = rels[type];
  if (rel) {
    for (var i = 0; i < rel.length; i++) {
      packedData += pack(q[rel[i]]);
      q[rel[i]] = null;
    }
  }
  packedData += pack(q[type]);
  packedData += 'tp=' + type;
  packedData += '&aid=' + config.aid;
  packedData += '&pid=' + encodeURIComponent(getPid());
  if (navigator.connection && navigator.connection.type !== void 0) {
    packedData += '&ct=' + navigator.connection.type;
  }
  q[type] = null;
  return packedData;
}
function pack(data) {
  var tmpPackData = '';
  if (data) {
    for(var i in data) {
      if (data.hasOwnProperty(i)) {
        tmpPackData += i + '=' + data[i] + '&';
      }
    }
  }
  return tmpPackData;
} 
tracker = new Tracker();

return tracker;


});