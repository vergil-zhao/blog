---
layout: post
title: "在 Mac 上使用 Nginx + Passenger 部署 Rails"
title-en: "Rails Deployment on Nginx with Passenger - Mac"
date: 2015-01-15 13:06:58 +0800
comments: true
categories: Web
---

开始接触 Rails 看到很多关于它的赞誉(其实最早看到的是负面的 ┐(─ _ ─)┌ 结尾附上链接)，不过在一开始就遭遇了很多问题，要把整个基本的流程走一遍还是一波三折的( ╯─ _ ─)╯┴—┴

这次整理一下关于部署的问题。

<!-- more -->

### 前提一览

---

各种版本号

<pre>
Mac OS X             10.10.2
Nginx                1.6.2
Phusion Passenger    4.0.57
Ruby                 2.0.0p481
Rails                4.1.7
Rake                 10.4.2
</pre>

Rails 的示例项目使用这个 ➡️[Rails 使用指南 - Rails 入门](http://guides.ruby-china.org/getting_started.html)⬅️ 里面的项目

### 问题一览

---

在这个环境下遇到的问题如下

- Passenger 安装配置比较蛋疼
- Nginx 的配置
- Rails 项目直接复制粘贴是无法正常使用的

### 完整流程

---

好了，终于到了搞定这些问题的时候。

#### ~ 安装服务器 ~

首先我们要安装 _Nginx_ 和 _Passenger_ ，这里选择了一个偷懒的办法，安装 Passenger 然后使用它自带的工具 `passenger-install-nginx-module` 来完成 Nginx 的安装配置。原因是 Nginx 默认的编译是不能支持 Passenger 的，所以需要重新编译，这个工具就是为了省掉这个步骤。

在 Mac 环境下，使用 _HomeBrew_ 来安装 Passenger 和 MySQL，只需要灰常简单的两句 `brew install passenger` `brew install mysql` 搞定，这里可以使用 `which passenger` 来查看安装的位置。

然后关于 MySQL 也是需要处理一下才能正常使用

```bash
#这条命令查看配置文件的读取位置及顺序，可以看到类似下面的输出
#/etc/my.cnf /etc/mysql/my.cnf /usr/local/etc/my.cnf ~/.my.cnf
#如果这些目录下面本来有文件，需要删除来保证初始化为默认配置
mysqld --help --verbose | more

#初始化安装 MySQL
sudo mysql_install_db \
--verbose --user=`root` \
--basedir="$(brew --prefix mysql)" \
--datadir=/usr/local/var/mysql \
--tmpdir=/tmp \
--explicit_defaults_for_timestamp

#启动和停止
mysql.server start
mysql.server stop

```

这个时候就可以按需修改 my.cnf

接下来执行 `passenger-install-nginx-module` 按照指示安装 Nginx 即可。

<br />

#### ~ 配置 Nginx ~

直接上例子

```cf3
server {

    # 需要监听的端口
    listen       8080;

    # 这里根据服务器的域名来修改
    server_name  localhost;

    # 可以再这里填写 Rails 项目的位置，注意一定要指向 public 目录
    root         /your_rails_project/public;

    # 打开 Passenger
    passenger_enabled on;

    # 输出日志到文件
    error_log /your_log_dir/your_log_file.txt debug;

    # 下面是可选方案
    #location / {
    #    root   /your_rails_project/public;
    #    index  index.html index.php;
    #    passenger_enabled on;
    #}

    # 也可以指定自己需要的 URI
    #location ~ ^/subapp(/.*|$) {
    #    alias /Users/silence/Vez/web/Nginx/blog/public$1;
    #    passenger_base_uri /subapp;
    #    passenger_app_root /Users/silence/Vez/web/Nginx/blog;
    #    passenger_document_root /Users/silence/Vez/web/Nginx/blog/public;
    #    passenger_enabled on;
    #}
}
```

### ~ 部署 Rails 项目 ~

复制整个项目到上面配置里写下的路径，或者已经直接设置路径到项目目录。这个时候直接打开浏览器查看，会出现一个错误，查看 Nginx 日志，会有类似这样的记录

```
2015/01/15 11:57:51 [error] 29238#0: *1 upstream prematurely closed connection while reading response header from upstream, client: 127.0.0.1, server: localhost, request: "GET / HTTP/1.1", upstream: "passenger:/tmp/passenger.1.0.29230/generation-0/request:", host: "localhost:8080"
```

在项目目录下执行命令 `rake secret RAILS_ENV=production`，打开文件 `config/secret.yml`，修改其中的 `<%= ENV["SECRET_KEY_BASE"] %>` 为前面命令的输出值。

这个时候再用浏览器访问，会发现依旧有错误，查看项目日志，是类似于数据库没有那个表又或者资源找不到的问题。执行命令 `rake assets:precompile RAILS_ENV=production` 和 `rake db:migrate RAILS_ENV=production`，其他单独的 js 和 css 文件在 `config/initializers/assets.rb` 里面配置。

这个时候再打开浏览器，终于可以正常访问啦 ╭(￣ ▽ ￣)╯╧═╧

#### 参考链接

---

1. [让 30 台服务器缩减到 2 台：从 Ruby 迁移到 Go 语言](http://developer.51cto.com/art/201303/386391.htm)
2. [Ruby 社区应该去 Rails 化了](http://robbinfan.com/blog/40/ruby-off-rails)
