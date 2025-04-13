---
layout: post
title: "解决 gem 安装 sqlite3 失败的问题"
date: 2014-12-11 11:02:14 +0800
comments: true
categories: Web
---

最近开始接触 _Ruby on Rails_ , 刚刚新建一个工程就出现问题

<!-- more -->

问题的主要描述节选如下

```bash
# Create a new project of rails
rails new blog

#Then it will run command 'bundle install' automatically
bundle install

#And then a problem occured
ERROR: Error installing sqlite3:
    ...
```

截图如下

{% img /images/2014_12/sqlite3_problem_of_rails.jpg %}

然后尝试了一些解决办法, 以及万能的 _Stack Overflow_, 但是没有解决到. 而实际上问题很简单, 错误提示中的 `port install sqlite3 +universal` 就能搞定.

之所以没有立即使用 _MacPorts_, 考虑到是否可以用管理 _ruby_ 依赖的 _brew_ 来解决, 但是我想多了......

可以看得出这个时候是需要一个开发版的库, 所以还是要选择使用 _MacPorts_ 来安装那些开源库

[MacPorts.org](http://www.macports.org)

```bash
# First of all, need to install MacPorts
# Get the .pkg file from 'http://www.macports.org' directly
# Then need to export path to PATH, default path is '/opt/local/'
export PATH=/opt/local/bin:$PATH
export PATH=/opt/local/sbin:$PATH

# Install sqlite3
sudo port install sqlite3 +universal

# Install sqlite3 gem
sudo gem install sqlite3 -- --with-opt-dir=/opt/local/

# Go to the rails project path
bundle install

# Preview your project
sudo rails serve
```

打开浏览器 http://localhost:3000

问题解决~~
