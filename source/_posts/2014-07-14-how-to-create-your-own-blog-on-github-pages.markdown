---
layout: post
title: "使用Github + Octopress建立博客"
date: 2014-07-14 14:50:09 +0800
comments: true
categories: Blog_Build_Tech
---

学习研究的过程需要不断地总结，没有总结的学习会很快丢失那些记忆，建立一个博客是个很好的方法。

在 *[Github](http://github.com/)* 上建立博客的好处是，不需要去申请域名去租用一个空间，而且建立的过程可以学到很多东西。

接下来总结一下使用 *GitHub Pages* 提供的托管服务的静态博客的建立流程以及一些问题。

以下操作环境都是在Mac中，不在Mac下可能会有不少差别，需要手动安装Git、ruby等等。

<!-- more -->

<br /><br /><br />

###<font color="330000">申请一个 *GitHub* 账号</font>

---
首先需要一个 *GitHub* 的账号，这个Coder通常都有，进入 *[Github](http://github.com/)* ，首页就可以快速的注册一个账号。

<br /><br /><br />

###<font color="330000">建立一个新的仓库(Repository)</font>

---
登录之后点击网页的右上角的加号可以快速建立一个Repo，建立的Repo名称格式需要是`your_username.github.io`，建立时不用初始化。

<br /><br /><br />

###<font color="330000">安装 *Octopress* 以及所需依赖</font>

---
*Octopress* 是一个静态的博客系统，而它是基于 *jekyll*，一个静态blog生成工具。这是一套很好的方案，并且有很多人在用。

clone 一份 *Octopress* 到本地，注意整理好路径

``` bash
git clone git://github.com/imathis/octopress.git octopress
cd octopress
```
然后安装一些依赖

``` bash
sudo gem install bundler    #这句需要root权限，所以需要在前面添加sudo
rbenv rehash	              #没有安装rbenv，这句可省
bundle install
```

安装 *Octopress* 的默认主题

``` bash
rake install
```

这个过程可能需要一段时间，命令`gem`你可以使用`-V`参数来监视完整的输出，另外如果速度过慢，或者失败的话，可以替换`gem`的源为`http://ruby.taobo.org/`，命令如下

``` bash
gem sources -r https://rubygems.org/
gem sources -a http://ruby.taobao.org/    #这里可能需要一些时间
gem sources -l                            #查看当前源，保证当前源是只有一个的
```

<br /><br /><br />

###<font color="330000">配置并部署 Octopress</font>

---
执行下面语句来设置 *GitHub Pages*

``` bash
rake setup_github_pages
```

这个过程会要求在 *GitHub* 上建立的Repo的地址

`SSH` 地址

`git@github.com:username/username.github.io.git`

或者 `HTTPS` 地址

`https://github.com/your_username/your_username.github.io.git`

会有以下的操作，引用自 [Octopress官方文档](http://octopress.org/docs/deploying/github/])

>- Ask for and store your Github Pages repository url.
- Rename the remote pointing to imathis/octopress from 'origin' to 'octopress'
- Add your Github Pages repository as the default origin remote.
- Switch the active branch from master to source.
- Configure your blog's url according to your repository.
- Setup a master branch in the _deploy directory for deployment.

接下来

``` bash
rake generate
rake deploy
```

执行后会生成静态博客，并将生成的文件复制到 `_deploy/` 目录下，`add`到git，然后`commit` & `push` 到 `master branch`。打开 `http://your_userrname.github.io/` 就可以看到新建的博客了。

注意把源代码 `push` 到 `source branch`

``` bash
git add .
git commit -m 'your message'
git push origin source
```

关于博客的设置一般在 `_config.yml` 文件中，具体内容参照官方说明 [Configure your blog](http://octopress.org/docs/configuring)。

<br /><br /><br />

###<font color="330000">开始撰写博客</font>

---
博客的每个post都在 `source/_post` 目录下，文件名的按照 *jekyll* 的建议命名方式 `YYYY-MM-DD-post-title.markdown`。

简单的建立方式是利用下面的命令

####Syntax
``` bash
rake new_post["title"]
```

它会按照上面所说的方式命名文件，扩展名为 `markdown`，这个可以再 `Rakefile` 中设置。还会在文件中加入 *yaml* 的头部。

还可以添加新的页面

``` bash
rake new_page[super-awesome]
# creates /source/super-awesome/index.markdown

rake new_page[super-awesome/page.html]
# creates /source/super-awesome/page.html
```

博客的内容使用 *markdown* 标记，具体的语法参见 [Markdown 语法说明](http://wowubuntu.com/markdown/)。

还可以使用 *Liquid* 模板引擎的语法，具体参见 [Liquid for Designers](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)。

使用以下语句可以在本地预览

``` bash
rake preview
```

这样会生成并自动观察变化重生成，打开 `http://localhost:4000/` 中可以看到结果。

或者可以在 `generate` 之后使用

``` bash
jekyll serve
```

###<font colot="330000">文章中代码的高亮</font>

---
最直接简单的办法

``` 
``` language
your code 
	```
```

使用 *Pygments* 来实现高亮，可用的语言参考 [Available lexers](http://pygments.org/docs/lexers/)。

完整参数参考 [Sharing Code Snippets](http://octopress.org/docs/blogging/code/)。

<br /><br /><br />

###<font color="330000">过程中的一些问题</font>

---
`push` 或者 `rake deploy` 的过程中会遇到injected的问题，原因是文件重复，不能直接覆盖，使用以下语句解决

``` bash
cd _deploy
git pull
cd ..
rake deploy
# 以上是使用rake时解决办法

git push -f
#强制覆盖
```

git 的两条设置

``` bash
git config --global push.default simple
# 设置push的时候只push当前分支

git config --global push.default matching
# push所有变动
```


<br />
<br />
<br />
<br />

####参考资料

---
1. [Octopress 官网](http://octopress.org/)