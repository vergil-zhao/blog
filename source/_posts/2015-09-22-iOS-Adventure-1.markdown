layout: post
title: "iOS Adventure: 初章"
title-en: "iOS Adventure: First Chatper"
date: 2015-07-09 06:53:13
comments: true
tags: iOS Adventure
categories: iOS

---

很多零散的问题总结起来并不容易，尤其是在之后的日子想要把 _当时是如何解决的？_ 这件事想起来。所以开始尝试记录这些零散的问题。

<!-- more -->

## 跳动的元素

### Combat

> 当从有 TabBar 的 `Controller A` 向一个需要隐藏 TabBar 的 `Controller B` push 时，`Controller B` 中设置好 Autolayout 与底部相距的 Constraint 的元素们，会在刚刚出现时在下方留下一个 TabBar 高度的空白，稍后就会跳动到正常位置。
>
> <div align=center><img src="/images/2015_7/2015-07-09-Constrains_A.png"></div>
> <div align=center>类似这样的 Constraint</div>

### Conflict Resolved

其实这个时候的 Constraint 是这个样子的

<div align=center><img src="/images/2015_7/2015-07-09-Contraints_detail.png"></div>
<div align=center><font color="gray">与 Bottom Layout Guide.Top 连接的 Constraint</font></div>

这个时候只要很简单的改成这个样子就可以了

<div align=center><img src="/images/2015_7/2015-07-09-Constraint_Correct.png"></div>
<div align=center><font color="gray">与 Bottom Layout Guide.Bottom 连接的 Constraint</font></div>

<br /><br /><br />

## 推送的陷阱

### Combat

> 开发环境的推送操作起来基本很简单，生产环境下则会遇到一些小问题，例如这样
>
> <div align=center><img src="/images/2015_7/2015-07-22-Push_problem.jpg"></div>
>
> 又或者都设置好了，但是就是收不到。

### Conflict Resolved

首先呢，要在 _Developer Member Center_ 把该有的 Certificates, Identifiers, Provisioning Profiles 都设置或者生成好。这里关键的步骤是这样的

---

首先是创建 App ID

<div align=center><img src="/images/2015_7/2015-07-22-ids.png"></div>

---

然后是创建证书，这个是给服务器用的，下面两个根据需要创建

<div align=center><img src="/images/2015_7/2015-07-22-certificates.png"></div>

---

这个选择是跟上面对应的，选择了开发环境的证书，这里也要选择开发环境。下面之所以选择 Ad Hoc 是因为需要真机测试就需要这个，在使用 Xcode 发布到 Apple Store 的时候会选择另外的，这里不需要为此担心。创建完成之后下载生成好的 Provisioning Profile。

<div align=center><img src="/images/2015_7/2015-07-22-provisioning.png"></div>

---

双击下载好的 Provisioning Profile 完成导入。之后需要设置

<div align=center><img src="/images/2015_7/2015-07-22-xcode.png"></div>

选择刚刚导入的文件，上面的 _Code Signning Identity_ 也需要选择对应的 Developer (对应 Development) 或者 Distribution (对应 Production)。

So, you have already done!

当然不要忘记下面这些

<div align=center><img src="/images/2015_7/2015-07-22-other1.png"></div>
<div align=center><img src="/images/2015_7/2015-07-22-other2.png"></div>

<br /><br /><br />

## 覆盖不掉的属性

### Combat

> 当你想直接覆盖一个系统类的属性时，会得到一个错误
>
> <div align=center><img src="/images/2015_7/2015-07-09-Override-Error.png"></img></div>
> <div align=center><font color=gray>直接重载是不行的</font></div>

### Conflict Resolved

错误信息很明确

> Setter for 'selected' with Objective-C selector 'setSelected:' conflicts with setter for 'selected' from superclass 'UICollectionViewCell' with the same Objective-C selector
> Cannot override with a stored property 'selected'

不能直接重载，需要加上 setter 和 getter

<div align=center><img src="/images/2015_7/2015-07-09-Override-solved.png"></img></div>

<script src="/js/category.js"></script>
