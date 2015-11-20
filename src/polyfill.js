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
