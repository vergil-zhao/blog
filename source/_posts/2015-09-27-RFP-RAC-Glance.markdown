layout: post
title: ReactiveCocoa 初见
title-en:
date: 2015-09-27 03:39:49
comments: true
tags: RAC
categories: iOS
---

<blockquote class="blockquote-center">
**闲话**: 听说学 Haskell 可以打开新世界的大门
</blockquote>

刚刚发现 *[ReactiveCocoa][]* 的时候，看到相关的术语 *signal*、*subscriber* 之类的，不明觉厉。再加上 *FRP - Functional Reactive Programming*，我似乎看到了新世界的大门。

作为初见，希望尽可能地提取关键概念来理解这个非常热门但是有些难懂的框架，减少打开新世界大门的阻力。

<br /><br />

<!-- more   -->

## 编程范式 Programming Paradigm 

在 *Wikipedia* 上搜索这个关键词的话，就可以看到在这个词条右边列出了几十个编程范式，领略一下前人的脑洞。<br />
(￣ε(#￣)☆╰╮o(￣皿￣///)

咳咳，对于 *[ReactiveCocoa][]* 这个框架最先应该了解的是 *[Functional Programming][]* 和 *[Reactive Programming][]*

### 函数式编程 Functional Programming

参考 *Wikipedia* 我的理解是：

- 函数可以作为参数传递
- 组合各种函数来实现所需

还有纯函数式编程语言里没有变量之类的暂时不去深究。这个范式其实在现代编程语言中大多都支持。

### 响应式编程 Reactive Programming

重点就一个，数据可以随着事件动态变化，就如同 Wiki 中所说的，表达式的结果会因为表达式中的变量改变自动更新。

那么上面两种范式结合之后是什么？

### 函数响应式编程 Functional Reactive Programming

重点还是在响应，通过组合函数可以实现复杂的响应过程。

希望详细了解，[这里][4] 有一篇很好的关于 *FRP* 的文章

<br />

## MVC vs MVVM

iOS 开发过程中会遇到在一个 View Controller 的文件里，有着几百上千行的代码。View Controller 总是承担着过多的任务，这里 MVVM 的出现就是为了剥离 View Controller 中过多的代码，objc.io 的第一个 issue 就是一篇分离 View Controller 和 Table View 的很好的文章，[英文版][5]，[中文版][6]。

另外 [这里][7] 有一篇很好的用 ReactiveCocoa 实现 MVVM 的文章，重点是轻量化 ViewController，组合两种架构，不是完全替换 MVC。

<br />

## Reactive Cocoa

终于进入正题。这个框架，就是吸收了如同 *Haskell* 这类函数式语言的思想，从微软的 Rx 演化来的。利用它就可以很好的实现 MVVM 的架构，防止臃肿杂乱的 View Controller。

使用它会进入完全不同的另一种编程思维，用这另一种思维去看以前遇到的问题，就看到新世界的大门了<br />
(๑•̀ㅂ•́)و✧

RAYWENDERLICH 上的 [一篇文章][8] 很详细的介绍了框架基本的用法。不过无论是这篇还是上一节的那篇文章，篇幅都很长，根据本文的初衷，下面总结一下。

### 信号 Signal

这个就是最核心的概念，操作都基于对信号的各种处理上。信号就是用来 **承载** 数据的，跟满天飞来飞去的无线电波一样。我们可以对信号做各种处理，像是监听、过滤等等，在 Reactive Cocoa 中的信号非常类似于人们自然理解的信号。

### 操作符 Operator

处理信号使用操作符，代码上其实就是一个参数是 block 的函数。block 里面就是怎么处理信号。框架里面提供了很多操作符，参看 github 上的 [文档][9]。

<br />

## 应用内切换语言

如果已经看过之前提到的两篇教程文章，相比那接下来的示例会更简单。之前两篇文章都是用了搜索 Twitter 的推文来展示框架的用法，鉴于你懂得的原因，和新浪微博的接口复杂一些，搜索功能也很限制，所以我用了这个想到就会觉得实现起来会很麻烦的功能。

> 产品的国际化就像牙线：所有人都知道他们应该使用，却可能都不去用。 -- [NSHipster][10]

这个例子的完整代码可以在 github 上找到 [RAC-International-Example][11]

首先我们先看一下成果

<image src="/images/2015_9/RAC-International-Example.gif" width=320></image>

最终在我们需要国际化的地方的代码长这样

```objc
@weakify(self);
[LanguageChangedSignal subscribeNext:^(NSString *languageCode) {
    @strongify(self);
    self.languageButton.title = LocalizedString(@"Language");
    self.titleLabel.text = LocalizedString(@"Hello World");
    [self.button setTitle:LocalizedString(@"Button") forState:UIControlStateNormal];
    self.label.text = LocalizedString(@"Label");
    self.textView.text = LocalizedString(@"It's a pretty day.");
}];
```

在任何需要国际化的地方只要这么写就可以，其实国际化就是一劳永逸的工作，习惯之后其实非常简单。

`@weakify(self)` 和 `@strongify(self)` 是用来方便地解决循环引用的，需要另外包含头文件 `#import "EXTScope.h"`。

`subscribeNext:` 方法是订阅信号，会在信号发送 `sendNext` 时执行 block 内的代码，这里就是刷新 UI

下面是如何发送信号

### 创建语言管理(视图模型)类

我们整个的信号流程很简单：修改语言(变化产生数据流) --> 加载语言文件 --> 刷新 UI

首先呢，不得不放弃 `NSLocalizedString` 的方法，我还没找到可以直接修改地区的方法。

创建一个语言管理的单例类

```objc
@class RACSignal;

@interface LanguageManager : NSObject

+ (LanguageManager *)shareInstance;

- (RACSignal *)languageChangedSignal;
- (NSString *)localizedString:(NSString *)key;

- (NSArray *)languages;
- (void)changeLanguageTo:(NSString *)language;

@end

#define LanguageViewModel [LanguageManager shareInstance]
#define LocalizedString(key) [LanguageViewModel localizedString:(key)]
#define LanguageChangedSignal [LanguageViewModel languageChangedSignal]
```

`languageChangedSignal` 方法返回了一个语言变化的信号，用来给全局需要变化的地方订阅用<br />
`localizedString:` 方法获取当前语言的字符串<br />
`languages` 方法返回所有支持的语言列表，在语言选择的 Table View 里使用<br />
`changeLanguageTo:` 方法用来变更当前语言<br />
另外下面添加了几个使代码整洁的宏。

我们只需要关注 `languageChangedSignal` 的实现

```objc
- (RACSignal *)languageChangedSignal {
    if (!_languageChangedSignal) {
        @weakify(self);
        self.languageChangedSignal = [RACObserve(self, currentLanguage) doNext:^(NSString *currentLanguage) {
            @strongify(self);
            [[NSUserDefaults standardUserDefaults] setObject:currentLanguage forKey:@"currentLanguage"];
            NSBundle *localizeBundle = [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:self.currentLanguage ofType:@"lproj"]];
            self.stringsFile = [[NSDictionary alloc] initWithContentsOfFile:[localizeBundle pathForResource:LocalizationFile ofType:@"strings"]];
            if (!self.stringsFile) {
                NSBundle *baseBunble = [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"Base" ofType:@"lproj"]];
                self.stringsFile = [[NSDictionary alloc] initWithContentsOfFile:[baseBunble pathForResource:LocalizationFile ofType:@"strings"]];
            }
        }];
    }
    return _languageChangedSignal;
}
```

这段代码看起来比较乱，只需要关注 `RACObserve` 这个框架提供的宏和 `doNext:` 方法。

`RACObserve(self, currentLanguage)` 就是创建了 `currentLanguage` 这个属性的变化的信号。<br />
`doNext:^(NSString *currentLanguage) {...}` 这个方法是在更改 UI 之前插入需要执行的动作。block 中略长的内容是根据语言代码获取对应的 strings 文件。

Reactive Cocoa 是基于 KVO 的，所以要注意观察的属性是不是支持 KVO。在这里就是如果你使用下划线的熟悉去修改，就不会发生任何你想要的事，需要使用 setter 的方式去修改(`self.currentLanguage`)。

### 接下来

其实没有接下来了，没错，就是这么简单，核心部分的代码就是这样。

其他细节实现可以 clone 或下载本示例项目 [RAC-International-Example][11]

<br />

## 新世界的大门

新世界的大门打开了，使用 Reactive Cocoa 确实让代码变得很不同，虽然很多陌生的概念，但是当你熟悉和深入了解之后，他就是进入新世界的钥匙。

<br />

## 附录

1. [Github Repo - ReactiveCocoa][ReactiveCocoa]
2. [Wikipedia - Functional Programming][Functional Programming]
3. [Wikipedia - Reactive Programming][Reactive Programming]
4. [函数式反应型编程(FRP) —— 实时互动应用开发的新思路][4]
5. [objc.io - Lighter View Controllers][5]
6. [Sprynthesis - ReactiveCocoa and MVVM, an Introduction][7]
7. [RayWenderlich ReactiveCocoa Tutorial – The Definitive Introduction][8]
8. [Github - ReactiveCocoa Documentation][9]
9. [NSHipster - NSLocale][10]
10. [示例代码 - RAC-International-Example][11]

[ReactiveCocoa]: https://github.com/ReactiveCocoa/ReactiveCocoa
[Functional Programming]: https://en.wikipedia.org/wiki/Functional_programming
[Reactive Programming]: https://en.wikipedia.org/wiki/Reactive_programming
[4]: http://www.infoq.com/cn/articles/functional-reactive-programming/
[5]: https://www.objc.io/issues/1-view-controllers/
[6]: http://www.objccn.io/issue-1/
[7]: http://www.sprynthesis.com/2014/12/06/reactivecocoa-mvvm-introduction/
[8]: http://www.raywenderlich.com/62699/reactivecocoa-tutorial-pt1
[9]: https://github.com/ReactiveCocoa/ReactiveCocoa/tree/master/Documentation
[10]: http://nshipster.cn/nslocale/
[11]: https://github.com/Veracruz/RAC-International-Example