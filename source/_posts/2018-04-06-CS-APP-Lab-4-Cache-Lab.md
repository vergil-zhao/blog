---
layout: post
title: CS:APP Lab 4 - Cache Lab
date: 2018-04-06 10:34:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

## Part A

目标是模拟缓存机制，没有实际的数据操作，只要理解了缓存机制之后就很简单了，剩下的就是注意细节，这里说几个小坑。

首先是 _LRU (Least-Recently Used)_ 策略，我被这个名字误导了，其实简单的解释就是，抛弃一个队列里最远的那个。经常被使用的就会总在队列前面的部分，所以远的就有可能不再需要了。

题目中执行指令 I 直接忽略就可以了，M 就等于两次 L，另外 S 和 L 这里处理起来是一样的。所以其实就只有一种指令而已。

题目中处理队列可以简化成计数，不用维护一个队列，但是要知道实际中用计数是有限制，超过类型最大值会出问题。

那么这里只列出最主要的部分代码：

```c
typedef struct _CacheLine {
    int valid;
    long tag;
    long lru;
} CacheLine;

// 创建缓存
CacheLine cache[1 << option.s][option.E];
// 初始化缓存
init_cache(1 << option.s, option.E, cache);

// 对于每个缓存组的操作是一样的，计数可以是对于整个缓存的，对于单独的组也可以
int read_cache(CacheLine cache_set[], int lines, long tag, long *counter) {
    // 用于简化标记队列
    *counter += 1;

    for (int i = 0; i < lines; ++i) {
        // 如果搜索到 tag 值相同且已标记为缓存过的，则是 命中
        if (cache_set[i].tag == tag && cache_set[i].valid) {
            cache_set[i].lru = *counter;
            return HIT;
        }
        // 如果没搜索到 tag 相同的，且遇到了没有标记的，也就是空闲的，就是 冷 miss
        if (!cache_set[i].valid) {
            cache_set[i].valid = 1;
            cache_set[i].tag = tag;
            cache_set[i].lru = *counter;
            return MISS;
        }
    }
    // 如果缓存组已满，则是冲突 miss，需要 evict 掉队列中最久没用过的
    evict_lru(cache_set, lines, tag, *counter);
    return EVICT;
}

void evict_lru(CacheLine cache_set[], int lines, long tag, long counter) {
    long lru = cache_set[0].lru;
    int index = 0;
    // 寻找队列最久没有动过的缓存
    for (int i = 0; i < lines; ++i) {
        if (cache_set[i].lru < lru) {
            lru = cache_set[i].lru;
            index = i;
        }
    }
    // 覆盖
    cache_set[index].tag = tag;
    cache_set[index].lru = counter;
}
```

## Part B

使用 `Blocking` 针对缓存优化性能。

这部分对于缓存都给定了 `(s, E, b) = (5, 1, 5)`，也就是 1024 字节，能放下 256 个 `int` 类型。

因为 `E = 1` 也就是 _Direct-Mapped Cache_, 正如字面意思一样，它能映射连续的 1024 个字节的内存。那么也就是说每隔 1024 字节（256 个 `int`）都有可能出现冲突 miss。

对于 32x32 来说，就是每隔 8 行会有冲突，那么我们就确定了这个时候的用 8x8 的块是可以保证在块内不会有冲突。

```c
for (out_row = 0; out_row < N; out_row += 8) {
    for (out_col = 0; out_col < M; out_col += 8) {
        for (in_row = out_row; in_row < out_row + 8; in_row++) {
            a0 = A[in_row][out_col + 0];
            a1 = A[in_row][out_col + 1];
            a2 = A[in_row][out_col + 2];
            a3 = A[in_row][out_col + 3];
            a4 = A[in_row][out_col + 4];
            a5 = A[in_row][out_col + 5];
            a6 = A[in_row][out_col + 6];
            a7 = A[in_row][out_col + 7];

            B[out_col + 0][in_row] = a0;
            B[out_col + 1][in_row] = a1;
            B[out_col + 2][in_row] = a2;
            B[out_col + 3][in_row] = a3;
            B[out_col + 4][in_row] = a4;
            B[out_col + 5][in_row] = a5;
            B[out_col + 6][in_row] = a6;
            B[out_col + 7][in_row] = a7;
        }
    }
}
```

8x8 的块并不会占满整个缓存，为什么不能直接 `B[in_col][in_row] = A[in_row][in_col]` ，因为数组元素的数量使得在对角线上，A 和 B 会用到同一块缓存区域，产生交替的 eviction，来回 miss。这个时候用局部变量，也可以理解为把寄存器当做更高级的缓存来避免 miss。

对于 61x67 来说，没有了正好在地址上出现同一个区域的冲突，我们直接把缓存占满，也就是 16x16 = 256 即可达到足够的优化效果：

```c
for (out_row = 0; out_row < N; out_row += 16) {
    for (out_col = 0; out_col < M; out_col += 16) {
        for (in_row = out_row; in_row < min(out_row + 16, N); in_row++) {
            for (in_col = out_col; in_col < min(out_col + 16, M); in_col++) {
                B[in_col][in_row] = A[in_row][in_col];
            }
        }
    }
}
```

最后我们再说 64x64 的问题。对于 64x64 来说，每隔 4 行会有冲突，这个时候同上面一样，只是用更小的 4x4 块的话，也能产生优化效果，但是并不能拿到满分。我们也可以强行用更大的缓存，这就要考虑不仅 A B 在对角线上本来就有冲突，块内的前四行和后四行会冲突。那么我能就要把块内也分成前四行和后四行两个部分来操作。

```c
for (out_row = 0; out_row < N; out_row += 8) {
    for (out_col = 0; out_col < M; out_col += 8) {
        // 先把 A 前四行的都放在 B 的前四行
        for (in_row = out_row; in_row < out_row + 4; in_row++) {
            a0 = A[in_row][out_col + 0];
            a1 = A[in_row][out_col + 1];
            a2 = A[in_row][out_col + 2];
            a3 = A[in_row][out_col + 3];
            a4 = A[in_row][out_col + 4];
            a5 = A[in_row][out_col + 5];
            a6 = A[in_row][out_col + 6];
            a7 = A[in_row][out_col + 7];

            B[out_col + 0][in_row] = a0;
            B[out_col + 1][in_row] = a1;
            B[out_col + 2][in_row] = a2;
            B[out_col + 3][in_row] = a3;
            B[out_col + 0][in_row + 4] = a4;
            B[out_col + 1][in_row + 4] = a5;
            B[out_col + 2][in_row + 4] = a6;
            B[out_col + 3][in_row + 4] = a7;
        }
        // 上一个操作最后结果是 B 的前四行都在缓存之中
        for (in_col = out_col; in_col < out_col + 4; in_col++) {
            // 所以先把 B 放错的部分读出来
            a0 = B[in_col][out_row + 4];
            a1 = B[in_col][out_row + 5];
            a2 = B[in_col][out_row + 6];
            a3 = B[in_col][out_row + 7];
            // 再把 A 后四行的列读出来
            a4 = A[out_row + 4][in_col];
            a5 = A[out_row + 5][in_col];
            a6 = A[out_row + 6][in_col];
            a7 = A[out_row + 7][in_col];
            // 把 A 的部分放进 B 的前四行正确的位置
            B[in_col][out_row + 4] = a4;
            B[in_col][out_row + 5] = a5;
            B[in_col][out_row + 6] = a6;
            B[in_col][out_row + 7] = a7;
            // 在把 B 放错的放回正确的位置
            B[in_col + 4][out_row + 0] = a0;
            B[in_col + 4][out_row + 1] = a1;
            B[in_col + 4][out_row + 2] = a2;
            B[in_col + 4][out_row + 3] = a3;
        }
        // 上一步的结果是 B 的后四行都在缓存中
        // 把最后的四分之一放好
        for (in_row = out_row + 4; in_row < out_row + 8; in_row++) {
            a4 = A[in_row][out_col + 4];
            a5 = A[in_row][out_col + 5];
            a6 = A[in_row][out_col + 6];
            a7 = A[in_row][out_col + 7];

            B[out_col + 4][in_row] = a4;
            B[out_col + 5][in_row] = a5;
            B[out_col + 6][in_row] = a6;
            B[out_col + 7][in_row] = a7;
        }
    }
}
```

在上面第二步中，对 A 的跨行的操作产生了不可避免的 miss，但是对 B 的三段操作因为在行内都只会有一次 miss，也就是提升了空间上的局部性，减少了 miss。
