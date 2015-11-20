##TimingTracker
前端性能收集 Javacript Library

##统计数据类型
####自定义打点
收集打点时间间隔的数据
####浏览器性能接口数据
主要是performance.timing
相关代码在`src/perfTiming.js`
####Ajax数据
通过`XMLHttpRequest.readyState`得到各个状态的耗时
###Usage
[M站性能收集规范](http://wiki.amap.alibaba-inc.com/M:%E6%95%B0%E6%8D%AE%E6%94%B6%E9%9B%86%E8%A7%84%E8%8C%83)

###Example

####自定义打点
```js
require('common/timingtracker', function ($tracker) {
  $tracker.start('gl_android_ugi_fa');
  //...
  $tracker.end('gl_android_ugi_fa');
})
//or
//也可手动设置时间
require('common/timingtracker', function ($tracker) {
  trackStartTime = $tracker.now();
  //...
  //add方法会默认增加type为rt的指标
  $tracker.add('gl_android_ugi_fa', $tracker.now() - trackStartTime);
})
//or
require('common/timingtracker', function ($tracker) {
  trackStartTime = $tracker.now();
  //...
  $tracker.push('rt', 'gl_android_ugi_fa', $tracker.now() - trackStartTime);
})
```
