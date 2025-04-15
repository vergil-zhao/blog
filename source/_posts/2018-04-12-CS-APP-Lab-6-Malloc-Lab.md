---
layout: post
title: CS:APP Lab 6 - Malloc Lab
date: 2018-04-12 20:48:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

目标实现一个动态内容分配器，根据内存使用率和吞吐量评分。仔细阅读书中 _9.9.5_ 至 _9.9.14_ 节，这里包含了所有需要用到的内容。

<!-- more -->

根据题目要求不能声明任何全局的或者 `static` 修饰的复合数据结构，包括数组。那么选择用显式空闲链表实现。

注意一下几个事项：

一定要写内存检查器
实际运行时一定要把检查和打印 log 的地方清理干净
抽离可重用逻辑 Keep DRY

```c
// log 开关
// #define DEBUG

// 打印 log
#ifdef DEBUG
#define log(format, args...) printf(format, ##args)
#else
#define log(format, args...)
#endif

// 检查内存
#ifdef DEBUG
static void mm_check(void);
#endif
```

从隐式空闲链表开始
这部分和 writeup 的建议一样，先把书上的代码跟着写一遍。基本上你就得到了一个快要及格的分数。基于这个，我们事实上只需要增加两个链表操作方法，一个用于添加空闲节点，另一个用来删除，将他们插入到合适地方。再将寻找链表的方法改为对应的查找方法。

需要放置增加节点的地方有：

堆扩展
空闲块被分割
释放一个块
需要放置移除几点的地方有：

合并时
前面有空闲块
后面有空闲块
两面有空闲块
分配块时

下面列出关键的函数：

```c
static void *find_fit(size_t asize) {
    void *bp;

    // 从头顺序查找，首次适配
    for (bp = list_root; bp != NULL; bp = (void *)GET(bp + WSIZE)) {
        if (asize <= GET_SIZE(HDRP(bp))) {
            return bp;
        }
    }

    return NULL;
}

static void add_node(void *ptr) {
    // 每次都添加至最开头，前驱节点为空
    PUT(ptr, NULL);
    // 后继节点为之前的开头
    PUT(ptr + WSIZE, list_root);
    // 如果链表不为空，则要设置原来第一个节点前驱
    if (list_root != NULL) {
        PUT(list_root, ptr);
    }

    // 指向第一个节点
    list_root = ptr;
}

static void remove_node(void *ptr) {
    void *prev = (void *)GET(ptr);
    void *next = (void *)GET(ptr + WSIZE);

    // 如果删除的是第一个节点，则需要把根修改至第二个节点
    if (ptr == list_root) {
        list_root = (void *)GET(ptr + WSIZE);
    }

    // 删除之后将前后两个节点连接起来
    if (prev != NULL) {
        PUT(prev + WSIZE, next);
    }
    if (next != NULL) {
        PUT(next, prev);
    }
}
```

实际上，过程中因为没有注意关闭打印相关函数，使得吞吐量在不同的测试数据下慢了几十到一百倍不等。要善用性能分析工具，mac 下 Instrument 很好使，可以帮助你发现你忽略掉的问题。

![发现 `fflush` 让你变成蜗牛](images/2018/flush.jpg)

上面的 `fflush()` 每次运行都会消耗 1 - 3 ms。

![删去 `fflush` 之后](images/2018/no_flush.png)
