---
layout: post
title: CS:APP Lab 1 - Data Lab
date: 2018-04-02 18:11:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

这里就不写具体题目要求了，直接上代码

<!-- more -->

```c
// 不用 & 求 &
int bitAnd(int x, int y) {
  return ~(~x | ~y);
}

// 提取第 n 字节
int getByte(int x, int n) {
  // 就是移动 8 位的问题，8位就是 << 3
  int a = n << 3;
  return (x >> a) & 0xFF;
}

// 逻辑左移
int logicalShift(int x, int n) {
  // x + ~x + 1 = 0
  // -x = ~x + 1
  // 31 - n = 31 + (~x + 1)
  int k = 32 + (~n);

  // 单纯的左移会溢出，<< n 其中 n 的值被定义为 0 到 31
  // https://stackoverflow.com/questions/7401888/why-doesnt-left-bit-shift-for-32-bit-integers-work-as-expected-when-used

  // 可以得到包括第 k 和高于第 k 的位为零其他位为 1
  int a = (~0) + (1 << k);

  // 再把第 k 位给加回来
  a = a + (1 << k);

  // 通过 & 把前面的 1 都干掉
  return (x >> n) & a;
}

// 求 1 的个数
int bitCount(int x) {
  // 分治法, 相当于把里面全部的 1 求和
  // 那么分两段，总 = (左 >> (位宽 / 2)) + 右
  // 一直分到只有两位，最后就相当于把所有的 1 都加起来
  // 这里有个蛋疼的问题，带上 -O 优化参数，会使得编译器会把超出 INT_MAX 的部分干掉
  // https://stackoverflow.com/questions/47934277/why-does-clang-produces-wrong-results-for-my-c-code-compiled-with-o1-but-not-wi

  // 0x5 = 0101
  // 0x3 = 0011
  // 0x0F = 0000 1111
  // 0x00FF = 0000 0000 1111 1111
  // 0x0000FFFF = 0000 0000 0000 0000 1111 1111 1111 1111
  int mask1 = 0x55 | (0x55 << 8); // = 0x5555
  mask1 = mask1 + (mask1 << 16); //  = 0x5555 5555
  int mask2 = 0x33 | (0x33 << 8); // = 0x3333
  mask2 = mask2 | (mask2 << 16); //  = 0x3333 3333
  int mask3 = 0x0F | (0x0F << 8); // = 0x0F0F
  mask3 = mask3 | (mask3 << 16); //  = 0x0F0F 0F0F
  int mask4 = 0xFF | (0xFF << 16); //= 0x00FF 00FF
  int mask5 = 0xFF | (0xFF << 8); // = 0x0000 FFFF

  int ans = (x & mask1) + ((x >> 1) & mask1);
  ans = (ans & mask2) + ((ans >> 2) & mask2);
  ans = (ans & mask3) + ((ans >> 4) & mask3);
  ans = (ans & mask4) + ((ans >> 8) & mask4);
  ans = (ans & mask5) + ((ans >> 16) & mask5);

  return ans;
}

// 不用 !， 求 !
int bang(int x) {
  // 非 0 的数字 x 和 -x 其中一个最高位也就是符号位是一定是 1
  // 而 0 和 -0 最高位都是 0

  // 确保得到最高位的数字 x | (-x)
  int a = x | (~x + 1);

  // 把最高位的数字移到最低位
  int b = a >> 31;

  // 取反，相当于对每一位求 !
  int c = ~b;

  // 把除最低位以外其他位都干掉
  return c & 1;
}

// 最小 int
int tmin(void) {
  return 1 << 31;
}

// 判断 x 能否放进 n 位的空间里
int fitsBits(int x, int n) {
  // 先左移到最高位，再右移回来，会自动获得算术右移的结果
  // 这样得到的结果是相当于 n 位的补码表示的数字
  // 与 -x 相加最后得到 0 即为可以表示，非零则无法表示
  // 时刻记住 -x = ~x + 1

  int k = 32 + (~n + 1);
  return !(((x << k) >> k) + ~x + 1);
}

// x/(2^n)
int divpwr2(int x, int n) {
  // 首先 x >> n 的自然结果是向下 round
  // 也就是说 *不能被整除* 的 *负数* 得到结果后加 1 就可以

  // 把最高位移下来可以得出是否为负数
  int isXNegative = (x >> 31) & 1;

  // 求得 x 的低 n 位是否为 0，是则能被整除，否则不能被整除
  int xNotDivisible = x & ~((1 << 31) >> (31 + ~n + 1));

  // 通过两次 ! 可以得到 0 或 1
  return (x >> n) + (isXNegative & !!xNotDivisible);
}

// -x
int negate(int x) {
  return ~x + 1;
}

// x 是否为正数
int isPositive(int x) {
  // 首先最高位是 1 就是负数
  // !操作就是说不是负数，但是 0 也不是正数，所以要排除
  // x <> 0 时 !x = 0 且 !!x = 1
  // 依旧是通过两次 ! 得到一个 0 或者 1
  return !((x >> 31) & 1) & !!x;
}

// x <= y
int isLessOrEqual(int x, int y) {
  int isXNegative = (x >> 31) & 1;
  int isYNegative = (y >> 31) & 1;
  int isNegative = ((x + ~y + 1) >> 31) & 1;
  int isZero = !(x + ~y + 1);

  // 两个数字符号不同时会有溢出可能，但是符号不同时只有 x 为负数时返回 1
  return ((isNegative | isZero) &
          ((isXNegative & isYNegative) |
           (!isXNegative & !isYNegative))) |
          (isXNegative & !isYNegative);
}

// return floor(log base 2 of x)
int ilog2(int x) {
  // 问题可以转化为 x 最高的 1 在哪个位置上，结果即为 0 到 31
  // 这题，二分搜索？

  int ans = 0;
  // 搜索的条件如下
  // 移动 16 如果说不等于 0 那么意味着高 16 位有 1，则答案至少为 16，也就是 1 << 4
  // 如果说等于 0 那么就在低 16 位
  // 这个结果不仅代表数值还代表下一次搜索的位置
  // 以此类推
  ans = ans + ((!!(x >> (16 + ans))) << 4); // = 0 or = 16
  ans = ans + ((!!(x >> (8 + ans))) << 3);
  ans = ans + ((!!(x >> (4 + ans))) << 2);
  ans = ans + ((!!(x >> (2 + ans))) << 1);
  ans = ans + ((!!(x >> (1 + ans))) << 0);

  return ans;
}

// 浮点符号反转
unsigned float_neg(unsigned uf) {
  unsigned k = uf & (0x7FFFFFFF);
  if (k > 0x7f800000) {
    return uf;
  }
  return uf + 0x80000000; // uf ^ 0x80000000 也可以
}

// int to float
unsigned float_i2f(int x) {
  // 有些费劲，写了很久，但其实理清思路并不是难，而是是否清晰的理解 IEEE 的浮点定义
  // 首先 0 直接返回
  // 接下来开始寻找最高的 1 在哪里，最高的一代表了指数
  // 尾数是 23 位
  // 注意到整数不会出现非规格数，所以尾数中不需要最高位 1，因为浮点的定义中尾数有隐含的 1
  // 分为两种情况：
  // 指数小于等于 23，左移至满 23 位
  // 指数大于 23，此时有舍入的问题，取最后所有位和移位后的最后一位，axxx
  // xxx 是会被干掉的部分，注意此处不是限定三位，是后面所有位
  // 向偶数舍入：
  // a = 1 且 xxx = 100... 则入 1
  // a = 0 且 xxx = 100... 则舍去
  // xxx > 100... 时入 1
  // xxx < 100... 时舍去

  if (!x) return x;

  // 提取符号并转为正数
  int isXNegative = (x >> 31) & 1;
  int k = x;
  if (isXNegative) {
    k = ~x + 1; // -x
  }

  // 寻找最高位的 1
  int e = 31;
  int t = 0;
  while (t == 0 && e >= 0) {
    t = k & (1 << e);
    e = e - 1;
  }
  // 得到指数
  e = e + 1;


  int low = 0;

  // 尾数 mask
  int mask = ~((1 << 31) >> 8);

  int needRound = 0;
  if (e > 23) {
    // 失去的位数
    int lost = e - 23;

    // 失去位的 mask
    int fmask = mask >> (23 - lost);

    // 舍入前的尾数
    low = (k >> lost) & mask;

    // 失去位的值
    int f = k & fmask;
    // 用于对比的正中间值，即 100...
    int p = 1 << (lost - 1);
    // 临近失去位的一位值的mask
    int lmask = 1 << lost;
    // 临近失去位的一位值
    int l = k & lmask;


    if (f > p) {// 失去位大于正中间，入 1
      needRound = 1;
    } else if (f == p && l == lmask) {// 失去位在正中间，且前一位是奇数，入 1
      needRound = 1;
    }

  } else { // 右移或者不移动没有舍入问题
    low = (k << (23 - e)) & mask;
  }

  // 实际的阶码
  e = (e + 127) << 23;

  return (isXNegative << 31) + e + low + needRound;
}

// 乘 2
unsigned float_twice(unsigned uf) {
  // 相对于上一道要简单许多，按照 IEEE 的定义来计算即可

  int t = 0x7F800000;

  // 提取符号
  int s = uf & 0x80000000;

  // 提取阶码
  int e = uf & t;

  // 提取尾数
  int f = uf & 0x007FFFFF;

  // 原始赋值
  int ans = uf;

  // 非规格化情况
  if (e == 0) {
    // 符号 + 尾数左移一位
    // 主要归功于定义使得规格和非规格化之间可以平滑过渡
    // 所以此处不需要担心尾数移位直接进入阶码的情况
    // 非规格化数的尾数左移移位至多使得阶码加一，刚刚好代表了同样的意思
    ans = s + (f << 1);
  } else if (e != t) {
    // 符号 + （阶码 + 1） + 尾数
    ans = s + e + (1 << 23) + f;
  }
  // 如果是 NaN 或者 无穷大，直接无视掉

  return ans;
}
```
