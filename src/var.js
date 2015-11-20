var M = window.M;
var $tracker = M.TimeTracker;

var w = window;
var performance = w.performance;
var tracker;
var now = function () {
  return performance.now();
};
