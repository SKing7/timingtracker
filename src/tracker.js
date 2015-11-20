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
proto.add = function (key, data) {
  this.push('rt', key, data);
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
