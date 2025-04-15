---
layout: post
title: CS:APP Lab 2 - Bomb Lab - 带彩蛋
date: 2018-04-02 18:33:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

彩蛋在最后。

<!-- more -->

列出一些很有用的命令

```shell
$ gdb bomb
$ objdump -d bomb > bomb.s
# ctrl + x, ctrl + a 切换至 TUI 模式方便查看

# help 大概才是最有用的命令吧（滑稽）
(gdb) help
(gdb) help x

# 添加 breakpoint 在函数 phase_1 上
(gdb) b phase_1
# 添加 breakpoint 在对应的地址上
(gdb) b *0x40124d

# step in = step instruction = stepi
(gdb) si

# step out = finish
(gdb) fin

# step over = next instruction = nexti
(gdb) ni

# 从头开始运行
(gdb) run

# 打印寄存器内容 print
(gdb) p $rdi
# 将内容看做 char
(gdb) p/c $rdi

# 解引用内容 x = eXamine
(gdb) x $rdi
# 常数地址
(gdb) x 0x402400
# 以字符串解析 s = string
(gdb) x/s $rsp+0x10
# 按 word (4 bytes) 为宽度显示 6 个 16进制数字
# x = heXadecimal
(gdb) x/6wx $rsp
```

## Phase 1

```x86asm
0x400ee0 <phase_1>      sub    $0x8,%rsp
0x400ee4 <phase_1+4>    mov    $0x402400,%esi
0x400ee9 <phase_1+9>    callq  0x401338 <strings_not_equal>
0x400eee <phase_1+14>   test   %eax,%eax
0x400ef0 <phase_1+16>   je     0x400ef7 <phase_1+23>
0x400ef2 <phase_1+18>   callq  0x40143a <explode_bomb>
0x400ef7 <phase_1+23>   add    $0x8,%rsp
0x400efb <phase_1+27>   retq
```

可以看到 `phase_1()` 里面调用了判断函数 `strings_not_equal()`。后边紧跟着 `test %eax, %eax`，是对刚刚的函数返回值的判断。

运行到上面的第三行时使用 `x/s $esi` 可以打印出对应的字符串。或者继续跳进函数，查看第一个参数也可以得到 `x/s $rdi`，第二个参数 `x/s $rsi` 会得到你输入的字符串。

作者说每次下载的到的答案都是不一样的。
我的答案是：

```text
Border relations with Canada have never been better.
```

## Phase 2

像上一个一样进入 `phase_2()` 函数中，直接分析汇编：

```x86asm
<+0>: push %rbp
<+1>: push %rbx
<+2>: sub $0x28,%rsp
<+6>: mov %rsp,%rsi
<+9>: callq 0x40145c <read_six_numbers>
<+14>: cmpl $0x1,(%rsp)
<+18>: je 0x400f30 <phase_2+52>
<+20>: callq 0x40143a <explode_bomb>
<+25>: jmp 0x400f30 <phase_2+52>
<+27>: mov -0x4(%rbx),%eax
<+30>: add %eax,%eax
<+32>: cmp %eax,(%rbx)
<+34>: je 0x400f25 <phase_2+41>
<+36>: callq 0x40143a <explode_bomb>
<+41>: add $0x4,%rbx
<+45>: cmp %rbp,%rbx
<+48>: jne 0x400f17 <phase_2+27>
<+50>: jmp 0x400f3c <phase_2+64>
<+52>: lea 0x4(%rsp),%rbx
<+57>: lea 0x18(%rsp),%rbp
<+62>: jmp 0x400f17 <phase_2+27>
<+64>: add $0x28,%rsp
<+68>: pop %rbx
<+69>: pop %rbp
<+70>: retq
```

`+9` 位置是读取六个数字的函数，可以看到 `+6` 位置把栈指针传入为第二个参数，看一下函数内容：

```x86asm
<+0>: sub $0x18,%rsp
<+4>: mov %rsi,%rdx
<+7>: lea 0x4(%rsi),%rcx
<+11>: lea 0x14(%rsi),%rax
<+15>: mov %rax,0x8(%rsp)
<+20>: lea 0x10(%rsi),%rax
<+24>: mov %rax,(%rsp)
<+28>: lea 0xc(%rsi),%r9
<+32>: lea 0x8(%rsi),%r8
<+36>: mov $0x4025c3,%esi
<+41>: mov $0x0,%eax
<+46>: callq 0x400bf0 <__isoc99_sscanf@plt>
<+51>: cmp $0x5,%eax
<+54>: jg 0x401499 <read_six_numbers+61>
<+56>: callq 0x40143a <explode_bomb>
<+61>: add $0x18,%rsp
<+65>: retq
```

`context: read_six_numbers()`

看到用了 `sscanf` 函数，再次跳进可以查看参数 `%rdi` 和 `rsi` 分别是格式和你的输入，格式就是用空格分割的六个数字。

从 `+7` 位置开始到 `+32` 都是在为 `sscanf` 的参数准备，`+0` 位置移动栈指针，就是为了六个数字的空间。

`content: phase_2()`

那么回到外层，可以知道 `+14` 的地方是在判断第一个数字是否为 `1`。

接下来跳到 `+52` 到 `+62` 这段是取下一个数字的栈地址并判断是否取完。

跳到 `+27` 到 `+32` 可以看出来就是在判断这个数字是否是上一个的两倍。到这里基本上可以猜到六个数字了。
调到 `+41` 到 `+45` 移动位置。

最后答案是：

```text
1 2 4 8 16 32
```

## Phase 3

```x86asm
<+0>: sub $0x18,%rsp
<+4>: lea 0xc(%rsp),%rcx
<+9>: lea 0x8(%rsp),%rdx
<+14>: mov $0x4025cf,%esi
<+19>: mov $0x0,%eax
<+24>: callq 0x400bf0 <__isoc99_sscanf@plt>
<+29>: cmp $0x1,%eax
<+32>: jg 0x400f6a <phase_3+39>
<+34>: callq 0x40143a <explode_bomb>
<+39>: cmpl $0x7,0x8(%rsp)
<+44>: ja 0x400fad <phase_3+106>
<+46>: mov 0x8(%rsp),%eax
<+50>: jmpq \*0x402470(,%rax,8)
...
<+106>: callq 0x40143a <explode_bomb>
...
<+118>: mov $0x137,%eax
<+123>: cmp 0xc(%rsp),%eax
<+127>: je 0x400fc9 <phase_3+134>
<+129>: callq 0x40143a <explode_bomb>
<+134>: add $0x18,%rsp
<+138>: retq
```

同之前的操作一样，这次看起来有些长，但是其实有一半不需要看，所以这里就不列出来了。

运行到 `+19` 位置后即可直接查看 `%esi` 也就是 `0x4025cf` 为地址的内存里面存着 `"%d %d"`，所以可以确定输入为两个数字，`+29` 和 `+32` 位置也可以看出同样的意思。

接下来 `+4` 和 `+9` 分别设定了 `sscanf()` 的第三和第四参数，所以 `0x8(%rsp)` 内存位置是你输入的第一个数字，`+39` 和 `+44` 很明显这个数字小于 `7` 即可。

来到 `+50` 这里有一个 `\*`，实际跳转是 `0x402470(,%rax,8)` 地址里面所存储的地址，可以不用去管他，`ni` 会帮你跳到该到的位置。

实际回来到 `+118` 的位置，接下来的三行就同上了，结果是要求等于 `0x137` 也就是 `311`。

最后答案可以是：

```text
1 311
```

## Phase 4

```x86asm
<+0>: sub $0x18,%rsp
<+4>: lea 0xc(%rsp),%rcx
<+9>: lea 0x8(%rsp),%rdx
<+14>: mov $0x4025cf,%esi
<+19>: mov $0x0,%eax
<+24>: callq 0x400bf0 <__isoc99_sscanf@plt>
<+29>: cmp $0x2,%eax
<+32>: jne 0x401035 <phase_4+41>
<+34>: cmpl $0xe,0x8(%rsp)
<+39>: jbe 0x40103a <phase_4+46>
<+41>: callq 0x40143a <explode_bomb>
<+46>: mov $0xe,%edx
<+51>: mov $0x0,%esi
<+56>: mov 0x8(%rsp),%edi
<+60>: callq 0x400fce <func4>
<+65>: test %eax,%eax
<+67>: jne 0x401058 <phase_4+76>
<+69>: cmpl $0x0,0xc(%rsp)
<+74>: je 0x40105d <phase_4+81>
<+76>: callq 0x40143a <explode_bomb>
<+81>: add $0x18,%rsp
<+85>: retq
```

同样的方法会知道和上面一样是两个数字，`+34` 这里第一个数字要小于 `0xe` 也就是 `14`，接下来会调用一个有递归的函数 `func4()`

先来到 `+69` 这里可以看到第二个数字需要为 `0`
因为输入已经确定到一个很小的范围了，其实到这里不看下去也是可以的，直接给出答案 `1 0`
当然为了拆掉会炸飞自己的炸弹，你可能不会这么草率（滑稽）

```x86asm
<+0>: sub $0x8,%rsp
<+4>: mov %edx,%eax
<+6>: sub %esi,%eax
<+8>: mov %eax,%ecx
<+10>: shr $0x1f,%ecx
<+13>: add %ecx,%eax
<+15>: sar %eax
<+17>: lea (%rax,%rsi,1),%ecx
<+20>: cmp %edi,%ecx
<+22>: jle 0x400ff2 <func4+36>
<+24>: lea -0x1(%rcx),%edx
<+27>: callq 0x400fce <func4>
<+32>: add %eax,%eax
<+34>: jmp 0x401007 <func4+57>
<+36>: mov $0x0,%eax
<+41>: cmp %edi,%ecx
<+43>: jge 0x401007 <func4+57>
<+45>: lea 0x1(%rcx),%esi
<+48>: callq 0x400fce <func4>
<+53>: lea 0x1(%rax,%rax,1),%eax
<+57>: add $0x8,%rsp
<+61>: retq
```

从外部可以看出这个函数有三个参数，分别是你输入的数字，`0` 和 `14`。可以说到 `+13` 为止的操作都没什么实际作用，`+15` 这里 `14` 右移了一位，变成了 `7` 。

到 `+17` 这里为止结果就是把第三个参数 `14` 除以二 `7` 放进了 `%ecx`，如果大于你输入的数字继续。

`7 - 1` 放入第三个参数，递归调用自己。三个参数分别是你输入的数字，`0` 和 `6`。
这个时候已经可以判断输入 `1` 是正确的了。

最后答案可以是：

```text
1 0
```

## Phase 5

```x86asm
<+0>: push %rbx
<+1>: sub $0x20,%rsp
<+5>: mov %rdi,%rbx
<+8>: mov %fs:0x28,%rax
<+17>: mov %rax,0x18(%rsp)
<+22>: xor %eax,%eax
<+24>: callq 0x40131b <string_length>
<+29>: cmp $0x6,%eax
<+32>: je 0x4010d2 <phase_5+112>
<+34>: callq 0x40143a <explode_bomb>
<+39>: jmp 0x4010d2 <phase_5+112>
<+41>: movzbl (%rbx,%rax,1),%ecx
<+45>: mov %cl,(%rsp)
<+48>: mov (%rsp),%rdx
<+52>: and $0xf,%edx
<+55>: movzbl 0x4024b0(%rdx),%edx
<+62>: mov %dl,0x10(%rsp,%rax,1)
<+66>: add $0x1,%rax
<+70>: cmp $0x6,%rax
<+74>: jne 0x40108b <phase_5+41>
<+76>: movb $0x0,0x16(%rsp)
<+81>: mov $0x40245e,%esi
<+86>: lea 0x10(%rsp),%rdi
<+91>: callq 0x401338 <strings_not_equal>
<+96>: test %eax,%eax
<+98>: je 0x4010d9 <phase_5+119>
<+100>: callq 0x40143a <explode_bomb>
<+105>: nopl 0x0(%rax,%rax,1)
<+110>: jmp 0x4010d9 <phase_5+119>
<+112>: mov $0x0,%eax
<+117>: jmp 0x40108b <phase_5+41>
<+119>: mov 0x18(%rsp),%rax
<+124>: xor %fs:0x28,%rax
<+133>: je 0x4010ee <phase_5+140>
<+135>: callq 0x400b30 <__stack_chk_fail@plt>
<+140>: add $0x20,%rsp
<+144>: pop %rbx
<+145>: retq
```

不要太过畏惧长度，因为后面还有更长的。`+24` 之前的直接略过，关于 `mov %fs:0x28, %rax` 周围的语句，是一个栈检查的操作，这里有个解释：[Stackoverflow - Why does this memory address have a random value?](https://link.zhihu.com/?target=https%3A//stackoverflow.com/questions/10325713/why-does-this-memory-address-have-a-random-value)

`+24` 看函数名也可以得知识计算你输入字符串的长度，进去查看可以看到是通过检查字符串结尾的 `0` 来判断长度的，这里就不列出来了。紧接的两行要求你输入的字符串长度为 `6`

经过 `+112` 行的清零之后回到 `+41`，接下来到 `+74` 这段行程一个 `while` 循环，可以看出是在遍历字符串，逐句阅读可以得到这段的操作是，取得当前字符的数字的低 `4` 位值，从起始点 `0x4024b0` 内存位置偏移刚刚的数字量后得到的数据放入栈空间。通过查看刚刚的内存位置可以看到以下内容：

```text
maduiersnfotvbylSo you think you can stop the bomb with ctrl-c, do you?
```

`+81` 到 `+96` 这里可以看出是要和刚刚组成的字符串与地址 `0x40245e` 上的字符串比较，查看内存可以看到内容是 `flyers`。可以理解成一个有字典的加密。

最后答案可以是：

```text
9?>567
```

## Phase 6

嗯，这是最长的了。这从头到尾分析一遍，当然这可能并不是最好最快的办法，但是能保证对代码理解清晰。

```x86asm
# 初始化

<+0>: push %r14
<+2>: push %r13
<+4>: push %r12
<+6>: push %rbp
<+7>: push %rbx
<+8>: sub $0x50,%rsp

        # 读取 6 个数字

<+12>: mov %rsp,%r13
<+15>: mov %rsp,%rsi
<+18>: callq 0x40145c <read_six_numbers>
<+23>: mov %rsp,%r14
<+26>: mov $0x0,%r12d

---

        # 这个嵌套循环用于判断所有的数字都不一样且都小于等于 6 则通过
        # 判断是否小于等于 6，否则爆炸

<+32>: mov %r13,%rbp
<+35>: mov 0x0(%r13),%eax
<+39>: sub $0x1,%eax
<+42>: cmp $0x5,%eax
<+45>: jbe 0x401128 <phase_6+52>
<+47>: callq 0x40143a <explode_bomb>

# %r12d 相当于 i，循环 6 次

# %ebx 相当于 j，循环 i 次

<+52>: add $0x1,%r12d
<+56>: cmp $0x6,%r12d
<+60>: je 0x401153 <phase_6+95> # 跳出循环
<+62>: mov %r12d,%ebx # j = i

        # 判断两个数字相等，相等则爆炸

<+65>: movslq %ebx,%rax
<+68>: mov (%rsp,%rax,4),%eax
<+71>: cmp %eax,0x0(%rbp)
<+74>: jne 0x401145 <phase_6+81>
<+76>: callq 0x40143a <explode_bomb>

        # j += 1, j <= 5

<+81>: add $0x1,%ebx
<+84>: cmp $0x5,%ebx
<+87>: jle 0x401135 <phase_6+65>
<+89>: add $0x4,%r13
<+93>: jmp 0x401114 <phase_6+32>

---

        # %rsi 存储 6 个数字后的空间
        # %rax 存储栈顶
        # %ecx = 7

<+95>: lea 0x18(%rsp),%rsi
<+100>: mov %r14,%rax
<+103>: mov $0x7,%ecx

        # 循环 7 减去每一个数字再放回去
        # 结束之后 %esi 置零

<+108>: mov %ecx,%edx
<+110>: sub (%rax),%edx
<+112>: mov %edx,(%rax)
<+114>: add $0x4,%rax
<+118>: cmp %rsi,%rax
<+121>: jne 0x401160 <phase_6+108>
<+123>: mov $0x0,%esi
<+128>: jmp 0x401197 <phase_6+163>

---

        # 这一段最终的结果是按照减过的数字作为序号顺序
        # 把链表的地址拿出放进栈空间

        # 链表寻址循环

<+130>: mov 0x8(%rdx),%rdx
<+134>: add $0x1,%eax
<+137>: cmp %ecx,%eax
<+139>: jne 0x401176 <phase_6+130>
<+141>: jmp 0x401188 <phase_6+148>

        # 这个地址是链表的第一个节点地址
        # 查看方式及内容单独列在下面

<+143>: mov $0x6032d0,%edx

        # 将当前节点地址移入栈空间

<+148>: mov %rdx,0x20(%rsp,%rsi,2)
<+153>: add $0x4,%rsi
<+157>: cmp $0x18,%rsi
<+161>: je 0x4011ab <phase_6+183>

        # 按顺序取减过的数字

<+163>: mov (%rsp,%rsi,1),%ecx
<+166>: cmp $0x1,%ecx
<+169>: jle 0x401183 <phase_6+143>
<+171>: mov $0x1,%eax
<+176>: mov $0x6032d0,%edx
<+181>: jmp 0x401176 <phase_6+130>

---

        # 反转链表初始化
        # %rbx 是链表最后一个节点地址
        # %rax 是链表链表最后一个节点存储下一个结点地址的地址
        # %rsi 是栈空间存储链表顺序的结尾

<+183>: mov 0x20(%rsp),%rbx
<+188>: lea 0x28(%rsp),%rax
<+193>: lea 0x50(%rsp),%rsi
<+198>: mov %rbx,%rcx

        # 按照栈空间存储的顺序把链表结点存储的地址修正

<+201>: mov (%rax),%rdx
<+204>: mov %rdx,0x8(%rcx)
<+208>: add $0x8,%rax
<+212>: cmp %rsi,%rax
<+215>: je 0x4011d2 <phase_6+222>
<+217>: mov %rdx,%rcx
<+220>: jmp 0x4011bd <phase_6+201>

                        # 清空最后一个处理的节点存储的地址

<+222>: movq $0x0,0x8(%rdx)
<+230>: mov $0x5,%ebp

---

        # %rbx 没有变化过还是链表第一个节点的地址
        # 检查链表是否从大到小排列

<+235>: mov 0x8(%rbx),%rax
<+239>: mov (%rax),%eax
<+241>: cmp %eax,(%rbx)
<+243>: jge 0x4011ee <phase_6+250>
<+245>: callq 0x40143a <explode_bomb>

                        # 未到达链表结尾时循环

<+250>: mov 0x8(%rbx),%rbx
<+254>: sub $0x1,%ebp
<+257>: jne 0x4011df <phase_6+235>

<+259>: add $0x50,%rsp
<+263>: pop %rbx
<+264>: pop %rbp
<+265>: pop %r12
<+267>: pop %r13
<+269>: pop %r14
<+271>: retq
```

使用命令查看链表，前一个数值是存储的数据，后一个数值是下一个节点的地址

```shell
(gdb) x/12g 0x6032d0
0x6032d0 <node1>: 0x000000010000014c 0x00000000006032e0
0x6032e0 <node2>: 0x00000002000000a8 0x00000000006032f0
0x6032f0 <node3>: 0x000000030000039c 0x0000000000603300
0x603300 <node4>: 0x00000004000002b3 0x0000000000603310
0x603310 <node5>: 0x00000005000001dd 0x0000000000603320
0x603320 <node6>: 0x00000006000001bb 0x0000000000000000
```

按从大到小的顺序序号是， `3 4 5 6 1 2`， 但是还要用 `7` 减一遍
那么最后答案就有了：

```text
4 3 2 1 6 5
```

## Secret Phase 彩蛋

直接查看完整的汇编代码可以发现有一个 `secret_phase()` 的函数，_Dr. Evil_ 还埋了个彩蛋。

首先打两个断点，一个在 `main()` 函数里第一个 `read_line()` 之前，一个在 `secret_phase()` 里的 `read_line()` 之后，这些位置通过查看完整的汇编文件可以找到对应的地址。接着运行到第一个断点时 `call secret_phase()` 即可。

```x86asm
<+0>: push %rbx
<+1>: callq 0x40149e <read_line>
<+6>: mov $0xa,%edx
<+11>: mov $0x0,%esi
<+16>: mov %rax,%rdi
<+19>: callq 0x400bd0 <strtol@plt>
<+24>: mov %rax,%rbx
<+27>: lea -0x1(%rax),%eax
<+30>: cmp $0x3e8,%eax
<+35>: jbe 0x40126c <secret_phase+42>
<+37>: callq 0x40143a <explode_bomb>

        # 要运行到这里，需要输入一个数字，转为 long，小于 0x3e8
        # 为 fun7 准备参数
        # 0x6030f0 处存着一个链表，下面会列出内容
        # 需要 fun7 的返回值为 2 才能通过

<+42>: mov %ebx,%esi
<+44>: mov $0x6030f0,%edi
<+49>: callq 0x401204 <fun7>
<+54>: cmp $0x2,%eax
<+57>: je 0x401282 <secret_phase+64>

<+59>: callq 0x40143a <explode_bomb>
<+64>: mov $0x402438,%edi
<+69>: callq 0x400b10 <puts@plt>
<+74>: callq 0x4015c4 <phase_defused>
<+79>: pop %rbx
<+80>: retq
```

链表的内容如下，稍微处理了一下，方便观察：

```x86asm
0x6030f0 <n1>: 36 0x603110
0x603100 <n1+16>: 0x603130 null

0x603110 <n21>: 8 0x603190
0x603120 <n21+16>: 0x603150 null

0x603130 <n22>: 50 0x603170
0x603140 <n22+16>: 0x6031b0 null

0x603150 <n32>: 22 0x603270
0x603160 <n32+16>: 0x603230 null

0x603170 <n33>: 45 0x6031d0
0x603180 <n33+16>: 0x603290 null

0x603190 <n31>: 6 0x6031f0
0x6031a0 <n31+16>: 0x603250 null

0x6031b0 <n34>: 107 0x603210
0x6031c0 <n34+16>: 0x6032b0 null

0x6031d0 <n45>: 40 null
0x6031e0 <n45+16>: null null

0x6031f0 <n41>: 1 null
0x603200 <n41+16>: null null

0x603210 <n47>: 99 null
0x603220 <n47+16>: null null

0x603230 <n44>: 35 null
0x603240 <n44+16>: null null

0x603250 <n42>: 7 null
0x603260 <n42+16>: null null

0x603270 <n43>: 20 null
0x603280 <n43+16>: null null

0x603290 <n46>: 47 null
0x6032a0 <n46+16>: null null

0x6032b0 <n48>: 1001 null
0x6032c0 <n48+16>: null null
```

稍微观察一下就发现这是个二叉树，还是个满二叉树。左边的标记已经标示出每个节点的位置。把树画出来你还会发现这个是个二叉排序树。

详细分析 `fun7`：

```x86asm
<+0>: sub $0x8,%rsp

        # 指针为空返回 -1

<+4>: test %rdi,%rdi
<+7>: je 0x401238 <fun7+52>

        # 输入的数字和当前节点数字比较

<+9>: mov (%rdi),%edx
<+11>: cmp %esi,%edx
<+13>: jle 0x401220 <fun7+28>

        # 当前节点数字 大于 输入的数字
        # 取左指针继续递归 fun7

<+15>: mov 0x8(%rdi),%rdi
<+19>: callq 0x401204 <fun7>

        # 设上方返回值为 x
        # return x + x

<+24>: add %eax,%eax
<+26>: jmp 0x40123d <fun7+57>

        # 如果输入的数字和当前节点数字 相等
        # return 0

<+28>: mov $0x0,%eax
<+33>: cmp %esi,%edx
<+35>: je 0x40123d <fun7+57>

        # 当前节点数字 小于 输入的数字
        # 取右指针继续递归 fun7

<+37>: mov 0x10(%rdi),%rdi
<+41>: callq 0x401204 <fun7>

        # 设上方的返回值为 x
        # x = x + x + 1
        # return x

<+46>: lea 0x1(%rax,%rax,1),%eax
<+50>: jmp 0x40123d <fun7+57>

        # return -1

<+52>: mov $0xffffffff,%eax

<+57>: add $0x8,%rsp
<+61>: retq
```

那么答案已经可以得到了：

```text
22

Wow! You've defused the secret stage!
```
