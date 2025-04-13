---
layout: post
title: "使用CreateJS，以及遇到的一些问题"
date: 2014-10-31 13:58:45 +0800
comments: true
categories: Web
---

最近由于公司要做一个微信小游戏，所以用了一点时间看了一下 _CreateJS_，写了一个很挫的小游戏，总结一下遇到的一些问题。

<!-- more -->

### 关于 _CreateJS_

---

_CreateJS_ 是一组 JS 工具集，包括 _EaselJS_ _TweenJS_ _SoundJS_ _PreloadJS_ 。

[CreateJS 官网](http://www.createjs.com) 有很多例子，[CreateJS Github](https://github.com/CreateJS) 上 clone 下来可以研究代码。

官网的文档排版很清晰，看起来会比较容易。

### _CreateJS_

---

这个问题不大，注意几个地方，下面代码解释

```javascript
//绘制完成时使用，不刷新是不会显示内容的
stage.update();

//增加动画时需要添加的，这句事实上就是周期调用stage.update()
createjs.Ticker.addEventListener("tick", stage);

//这两句在旧的安卓浏览器上似乎不起作用，未解决
stage.clear();
stage.removeAllChildren();
```

### 浏览器

---

用这个工具集写一个小游戏本身难度不大，而且写起来也很顺手，但是就是会遇到几个让我这个新手蛋疼的事情。

- 浏览器单击事件的 300ms 延迟
- Size VS DPI

300ms 延迟是为了在移动设备上的双击事件，而双击事件是为了缩放

```html
<meta
  name="viewport"
  content="width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
/>
```

这句可以再安卓上的 chrome 浏览器解决延迟，没有了缩放也就没有了 300ms，但是 iOS 上的 safari 还是不行的，最后还是用了一个叫做 [_FastClick_](https://github.com/ftlabs/fastclick) 的 JS 库，顺利解决。

但是由此引出一个新的问题，当`width=device-width`的时候，用 `document.documentElement.clientWidth` 和 `document.documentElement.clientHeight` 获取的值不是实际的像素值。例如 Retina 屏，@2x 实际上是 2 个点，所以我们可以这样设置。

```html
<canvas
  id="testCanvas"
  width="640"
  height="1136"
  style="width: 320px; height: 568px;"
></canvas>
```

标签属性包含了实际的像素值，css 的设置控制了他显示的大小，问题解决
