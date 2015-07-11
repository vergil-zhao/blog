---
layout: post
title: "关于提升 Octopress 的加载速度"
date: 2014-07-18 15:46:47 +0800
comments: true
categories: Blog_Build_Tech
---

在 `/source/_includes/custom/head.html` 注释掉两句下载Google font的link标签，另外就是尽量不要使用站外的资源，可以查看各个文件中引用外部的资源的语句，在国内可以大幅度提高加载速度。

另外在 `/source/_includes/head.html` 中还有坑爹的用 Google 的 jquery cdn，明明本地有，所以果断改为本地的 `{{ root_url }}/javascripts/libs/jquery.min.js` 即可。