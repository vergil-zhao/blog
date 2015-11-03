layout: post
title: One Word API - (1)
title-en:
date: 2015-09-24 05:43:08
comments: true
tags: one word api
categories: iOS
---

有一些不是很常用的 API 看到之后可能根本看不出来是干什么的，或者看过文档之后很快就忘记了，又或者其实根本不知道文档在说什么(¦3[▓▓] 。

本文仅以大概一句话来说明API是做什么用的，在考虑如何实现一个功能时可以想起来需要用到的 API

本篇 API 收集自 [NSHipster](http://nshipster.com)

<!-- more -->
<br /><br />

##`UIKeyCommand`
提供 iPad 上的键盘快捷键的实现，并且可以显示快捷键列表在屏幕上。

##`NSIndexSet`
可以理解为存储 index 的 set，它是有序的无符号整数集合，例如数组的 index，它的功能不仅仅限于此，请打开脑洞。

##`NSCache`
基本上相当于一个 `NSMutableDictionary` ，但是它会在需要的时候自动删除对象来释放内存，同它的名字一样 缓存。

##`NSSort​Descriptor`
基本上它可以让你一行完成常用的排序的需求。
```swift
let numbers: NSArray = [2, 1, 4, 3, 5, 6, 9, 0, 7 ,8]
numbers.sortedArrayUsingDescriptors([NSSortDescriptor(key: "", ascending: true)])
```
`key` 参数可以指定数组内对象的 *keyPath* 的值来选择你需要根据哪个属性排序。

##`CFString​Transform`
这个函数对于中文来说最大的用处应该是这个了吧
```swift
let string = NSMutableString(string: "中文")
CFStringTransform(string, nil, kCFStringTransformMandarinLatin, false) // zhōng wén
CFStringTransform(string, nil, kCFStringTransformStripCombiningMarks, false) // zhong wen
```
然后你的脑洞就可以做很多事了ԅ(≖‿≖ԅ)

##`NSOperation` <font color=gray size=2>抽象类</font>
与 GCD 相比，它可以相对简单的用面向对象的方式来处理稍微复杂的多线程任务，**它可以取消**。`NSBlockOperation` 是一个好用的实体类。结合 `NSOperationQueue` 来控制任务的进行。

##`CFBag`
这确实是一个晦涩的数据类型，集合中的元素可以出现多次，并且会被计数。它的可变版 `CFMutableBag` 还提供了一堆回调 `struct CFBagCallBacks`。这里用它对应的 Foundation API `NSCountedSet` 简单说明。
```swift
let set = NSCountedSet(array: [1, 1, 1, 1, 1, 2, 2, 2])
set.countForObject(1) // 5
set.countForObject(2) // 3
```

##`UIAccessibility` <font color=gray size=2>非正式协议</font>
*UIKit* 中所有的标准视图和控件都实现了这个协议，利用协议提供的方法可以方便的添加辅助功能，可以让 *VoiceOver* 读出你的控件。

##`NSCharacter​Set`
它和它的可变版本 `NSMutableCharacterSet`，用面向对象的方式来表示一组 Unicode 字符。它经常与 `NSString` 及 `NSScanner` 组合起来使用，在不同的字符上做过滤、删除或者分割操作。