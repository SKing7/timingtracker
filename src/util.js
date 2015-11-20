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
