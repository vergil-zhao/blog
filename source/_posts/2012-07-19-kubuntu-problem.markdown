---
layout: post
title: "Kubuntu终端root用户下出现cannot connect to X server 和 unable to open DISPLAY 的解决办法"
date: 2012-07-19 15:11:00 +0800
comments: true
categories: Ancient Blog
---

*<font color = "gray">这是一篇从旧博客迁移来的文章</font>*

<br />

在网上查找关于解决这个问题的资料很久，上次在kubuntu 11.10中只需要在添加access的名称即可，但是这次在12.04中却不能解决问题。

<!-- more -->

{% img /images/post_image/old_blog/kubuntu.png %}

目前我和试过的三种可行办法如下：

1.首先假设用户名是 `username`, 在获得 root 用户权限之前先输入以下命令

```bash
export DISPLAY=:0.0
xhost +username
xhost +root
```

这种办法在 `11.10` 下顺利解决问题



2.网上看到有不少地方在转载同一个解决办法, 先安装 *vncserver* 用 `apt-get` 安装即可。然后输入命令 `vncserver` 然后会有提示, 其中会有例如 `localhost:1` 的字样, 其中 `localhost`  是你在安装 *kubuntu* 时设定的计算机的名字, 之后输入命令

```bash
export DISPLAY=localhost:1
xhost +
```

就会有提示关闭了验证控制，任何客户都可以访问 <br />
但是在我试图启动 *kate* 时，出现一系列错误，不知道在其他机子上是否有效。



3.下面这种办法在我的 `12.04` 上解决了问题，不过应该算是一种替代解决办法，并没有解决 *cannot connect to X server* 和 *unable to open display* 的问题。

首先 `sudo -i` 获得root权限, 然后利用 `sed` 修改 `/etc/kde4/kdm/kdmrc` 文件，目的是可是以root身份登录桌面, 命令如下

```bash
sed -e 's/AllowRootLogin=false/AllowRootLogin=true/' -i /etc/kde4/kdm/kdmrc
```

然后设置 root 密码

```bash
sudo passwd root
```

之后注销用 root 登录即可，这样以最高权限使用系统。