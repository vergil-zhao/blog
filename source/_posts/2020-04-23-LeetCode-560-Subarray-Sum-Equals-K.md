---
layout: post
title: "[LeetCode] #560. Subarray Sum Equals K"
date: 2020-04-23 02:37:00
tags:
  - LeetCode
categories:
  - Algorithm
---

[560. Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/description/)

题目：在给定的 `(0 < n <= 20000)` 个由 `-1000` 至 `1000` 的数字组成的数组中求连续元素组成的子数组其和为 `k` 的数量。

<!-- more -->

## 基本思路

对于所有长度 `1` 到 `n` 的子数组求和，可以得到答案，当然复杂度
是会超时的。但是本题是沿着最简单算法的思路优化的。

```swift
for len in 1...nums.count {
    for start in 0...nums.count - len {
        if nums[start..<start + len].reduce(0, +) == k {
            result += 1
        }
    }
}
```

## 优化重复求和

题目下方有明确的提示，实际上整个过程中有重复求和的部分，例如当计算长度 `4` 的时候，之前计算过的长度 `3` 的又被求和了一遍。我们设定 $S_{i,j}$ 为数组中第 $i$ 到 $j$ 的元素的和，那么有：

$$
S_{i,j}=S_{0,i-1}+S_{0,j}
$$

所以通过增加一个“和数组”，我们可以省去重复求和：

```swift
for num in nums {
    s += num
    sums.append(s)
}
```

注意到，我们不需要存储 $S_{i,j}$ ，而式子后面的两个数字仅需要一个数组即可。

对于第一步的算法可以改成：

```swift
for len in 1...nums.count {
    for j in 0...nums.count - len {
        let end = j + len - 1
        if j == 0 && sums[end] == k ||
           j > 0 && sums[end] - sums[j - 1] == k {
            result += 1
        }
    }
}
```

复杂度降至 $O(n^2)$ ，用 Swift 代码在 LeetCode 上提交已经可以通过，但是耗时超过 3000ms

## 优化计数中的重复判断

首先我们并不需要把数组序列记录下来，只需要总数。上面的算法中

`sums[end] - sums[j - 1] == k`

可以变成

`sums[end] - k == sums[j - 1]`

其中`end`和`j - 1`在整个过程中会多次经过`sums`里所有的值，所以我们就知道了对于

$$
S_t=S_i-k
$$

实际上在循环中所有的判断里，我们对所有满足上面式子的 S_t 都进行了计数。那么，我们就可以记录 S_t 出现的次数，减少判断。

增加一个 map 来记录和值出现的次数，并计算结果：

```swift
var result = 0

// 每个和值对应一个出现的次数
// 因为 k > 0，和值 0 是第 1 个从开始到某一位和为 0 的计数
var sumsMap = [0: 1]

var sum = 0

for num in nums {
    sum += num // 相当于之前的 sums 数组

    // 相当于之前 sums[end] - sums[j - 1] == k 的判断
    if let count = sumsMap[sum - k] {
        result += count
    }

    // 按顺序记录和值出现次数
    sumsMap[sum] = (sumsMap[sum] ?? 0) + 1
}
```

最后时间和空间复杂度都为 $O(n)$，可以说妙不可言(｀・ω・´)
