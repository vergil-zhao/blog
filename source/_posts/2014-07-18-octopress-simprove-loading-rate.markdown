---
layout: post
title: "关于提升 Octopress 的加载速度"
date: 2014-07-18 15:46:47 +0800
comments: true
categories: Blog_Build_Tech
---

在 `/source/includes/custom/head` 注释掉两句下载Google font的link标签，另外就是尽量不要使用站外的资源，可以查看各个文件中引用外部的资源的语句，在国内可以大幅度提高加载速度。