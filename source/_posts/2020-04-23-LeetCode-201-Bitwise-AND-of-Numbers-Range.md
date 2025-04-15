---
layout: post
title: "[LeetCode] #201. Bitwise AND of Numbers Range"
date: 2020-04-23 19:40:00
tags:
  - LeetCode
categories:
  - Algorithm
---

[201. Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/description/)

这道题可以说是简单到妙不可言。

<!-- more -->

给定两个在`[0, Int32.max]`区间的数字 m 和 n (m <= n)，求 m 到 n 之间所有数字的按位求和的结果。

例如 5 到 7

```text
101
110
111 &
-----
100
```

## 简单算法：只要某一位可以是 0，那么结果就是 0

根据 and 的规则，以上是个明显的结论。那么只要当前位是 0 那么结果的当前位也是 0。如果当前位是 1，那么使得当前位为 0 的最小值不大于 `n`，那么就代表当前位会出现 0，结果为 0。

也就是当前位以后清零，再加一个仅有当前位的值得到的结果，即是最小结果。

```swift
for (i, digit) in mString.enumerated().reversed() {
    if digit == "0" {
        result += "0"
    } else {
        let num = ((m >> (i - 1)) + 1) << (i - 1)

        if i > 0 && num <= n && num >= 0 {
            result += "0"
        } else {
            result += "1"
        }
    }
}
```

可以通过移位实现。

## 让他更简单：只要某一位可以变，那么结果就是 0

可以说上面的算法已经是在判断当前位可以不可以改变，只要可以改变，就代表会出现一个 0 和一个 1。对于任何两个 m 和 n，只要他们不相等，那就代表着最左边的位可以变化，所以结果是 0，例如

```text
m = 110
n = 111
```

所以对于任意的 m 和 n 的任意前缀都可以做同样的判断，所以只需要移位判断是否相等即可：

```swift
while m != n {
    m = m >> 1
    n = n >> 1
    count += 1
}

return n << count
```

可以说很神奇的简单。

## 让他更妙：他们的共同前缀即是结果

上面的算法实际上的结果就是求得了两个数字二进制的共同前缀(不足位补零)，所以甚至可以直接求个前缀即可

```swift
var ms = String(m, radix: 2)
let ns = String(n, radix: 2)

// 不足高位补零
if ms.count < ns.count {
    ms = String(repeating: "0", count: ns.count - ms.count)
}

// 共同前缀
let common = ms.commonPrefix(with: ns)

// 向左移位，恢复前缀的位置
return (Int(common, radix: 2) ?? 0) << (ns.count - common.count)
```

(･ω´･ )
