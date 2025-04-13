---
layout: post
title: "Ubuntu 13.04 的几个常用设置(grub背景、自动挂载、网络连接设置)"
date: 2013-05-31 00:08:00 +0800
comments: true
categories: Ancient Blog
---

_<font color = "gray">这是一篇从旧博客迁移来的文章</font>_

<!-- more -->

### grub 的背景设置

---

root 权限下修改`/boot/grub.d/05_debian_theme
在ubuntu 13.04下的这个文件中有一行是
`for background in .jpg ... ... do`
中间还有很多格式我省略掉了 这行可以用这种格式添加你的图片目录`{/home/xxx/}
之后`sudo update-grub`就 ok

注：前面都是废话:p，它上面有一句注释，直接把图片放到`/boot/grub/`下然后`sudo update-grub`就 ok 了

### 硬盘分区自动挂载

去修改一个文件就 ok
`/etc/fstab`
这个文件的格式如下：

<table>
	<th>设备</th>
	<th>挂载位置</th>
	<th>分区格式</th>
	<th>挂载选项</th>
	<th>dump(备份)</th>
	<th>fsck(磁盘检查)</th>
	<tr>
		<td>/dev/sda1</td>
		<td>/media/c</td>
		<td>ntds</td>
		<td>defaults</td>
		<td>0</td>
		<td>0</td>
	</tr>
</table>

上面这个例子就是自动挂载的例子，在分区管理器(ubuntu 自带)中可以查看你的磁盘对应的标签`sda1`还是`sda2`还是其他的
挂载位置可以自选，一般在`/media/`下
挂载选项有 7 个，一般用不到，`defaults`就 ok，剩下两项一般 0 就可以

另外：如果因为修改了 fstab 而导致不能开机的话，要用 _ubuntu liveCD_ 进去之后修改原来系统的`fstab`，提前做好准备

### 网络连接的一个问题

关于手动设置了 ip 等之后重启系统会自动新建一个连接的问题，自己新建一个连接，手动设置好 ip，在限制到接口那个选项要选任意，默认是`eth0`
