---
layout: post
title: "使用 Facebook 的 pop 开源动画库做顺畅的2D动画"
date: 2014-07-18 15:15:58 +0800
comments: true
categories: iOS
---

_pop_ 是 _Facebook_ 的在 _Paper_ 中使用的动画库，开源之后非常受欢迎，它是一个成熟且经过良好测试的框架，使用它可以做出顺畅的 2D 动画。

<!-- more -->

_pop_ 的理念是一切即可动画，你不仅仅可以在一个 view 或者 layer 上做动画，它是直接在 `NSObject` 做了扩展，任意一个继承于 `NSObject` 的对象都可以添加一个动画。

在 [5 Steps For Using Facebook Pop](https://github.com/maxmyers/FacebookPop) 上有一个很好的使用方法说明，官方 Repo 在这里 [facebook/pop](https://github.com/facebook/pop)。

在 _pop_ 中有三种是直接应用于 view 和 layer,分别是 `POPBasicAnimation` `POPSpringAnimation` `POPDecayAnimation`，分别对应，基本动画、弹性动画、衰减动画。有一个非常好的示例程序，github 上的 [poping](https://github.com/schneiderandre/popping) 库。
在 CocoaChina 上有一篇好的文章 [Facebook Pop 使用指南](http://www.cocoachina.com/applenews/devnews/2014/0527/8565.html)。

关于在导入库的时候，使用 cocoapods 是很方便的，但是如果使用复制的方式导入的话，则会遇到找不到头文件的问题，这里使用正则表达式把所有的头文件引用都替换。

`Find -> Find and Replace in Project`

然后左边就会出现替换的对话，然后在左边栏上部选择 `Regular Expression`，接下来查找框中输入 `<POP/([a-zA-Z.]+)>`，替换框中输入 `"$1"`，然后 preview，确定替换替换正确，然后确定即可编译成功。

这里说一点需要注意的地方，根据动画的类型不同，这三个属性 `velocity` `fromValue` `toValue` 必须是同一类型，例如

```objectivec
POPDecayAnimation *animation = [POPDecayAnimation animationWithPropertyNamed:kPOPViewCenter];
animation.velocity = [NSValue valueWithCGPoint:CGPointMake(100, 100)];
animation.name = @"spring to center";
UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 100, 100)];
view.center = self.view.center;
view.backgroundColor = [UIColor blueColor];
[self.view addSubview:view];
[view pop_addAnimation:animation forKey:@"decay"];
```
