---
layout: post
title: "[LeetCode] Biweekly Contest 24 (#1413 ~ #1416)"
date: 2020-04-19 22:25:00
tags:
  - LeetCode
categories:
  - Algorithm
---

以下代码是 Accepted 但不一定是最优解，仅供参考

前三道题比较简单，重点是第四道，喜闻乐见 DP

## [1413. Minimum Value to Get Positive Step by Step Sum](https://leetcode.com/problems/minimum-value-to-get-positive-step-by-step-sum/description/)

求最小值初始值使得按给定序列加和始终为正整数(>= 1)。

例如，对于序列 `[-3,2,-3,4,2]` 最小值为 5，即

```text
5 - 3 = 2
2 + 2 = 4
4 - 3 = 1
1 + 4 = 5
5 + 2 = 7
```

实际上初始值对于每次加和的结果影响是固定的，也就是每次结果都多出了同一个初始值，所以只要求加和序列里的最小值与 1 的差值即可。

```swift
class Solution {
    func minStartValue(_ nums: [Int]) -> Int {
        if nums.count == 0 {
            return 1
        }

        var sums = [nums.first!]
        for i in 1..<nums.count {
            sums.append(sums[i - 1] + nums[i])
        }

        let ans = 1 - sums.min()!

        return ans > 0 ? ans : 1
    }
}
```

## [1414. Find the Minimum Number of Fibonacci Numbers Whose Sum Is K](https://leetcode.com/problems/find-the-minimum-number-of-fibonacci-numbers-whose-sum-is-k/description/)

给定一个正整数 `k`，在斐波那契数列中的取 `n` 个数字使得其和为 `k`，求 `n` 的最小值。

例如对于 `k = 7`，数列前 6 个数字是 `1, 1, 2, 3, 5, 8 ...` ，所以 `n` 最小为 2，`2 + 5 = 7` 。

题目有 `1 <= k <= 10^9` ，我们可以简单求得我们需要的斐波那契数列长度最长为 43。

我们知道数列中对于任意一个 $I_i$ 都有 $I_i=I_{i-1}+I_{i-2}$ ，那么可以得到对于任意一个 $I_i$ 都有 $I_i \geqslant I_p+I_q(p,q<i)$ ，也就是不可能用更少数量的数字得到一个我们需要的目标值。

所以我们倒序贪心求和至达到目标值即可：

```swift
class Solution {
    func findMinFibonacciNumbers(_ k: Int) -> Int {
        var result = 1
        var f1 = 1
        var f2 = 1
        var list = [f1, f2]

        // Get a Fibonacci list of which the max
        // number is lesser or equal than k
        while result <= k {
            result = f1 + f2
            f1 = f2
            f2 = result

            list.append(result)
        }


        var remain = k - f1
        var count = 1
        for num in list.reversed() {
            if remain - num >= 0 {
                remain -= num
                count += 1
            }
        }

        return count
    }
}
```

## [1415. The k-th Lexicographical String of All Happy Strings of Length n](https://leetcode.com/problems/the-k-th-lexicographical-string-of-all-happy-strings-of-length-n/description/)

仅由字母 `["a", "b", "c"]` 组成一个长度为 `n` 的所有字符串中，调出符合对于任意元素都满足
（即相邻元素不同）的所有字符串并按字典序，选出第 `k` 个字符串。

给定 `n` 最大 10，`k` 最大 100，所以这题直接按要求生成字符串即可，实际上全部生成只需要小于
的复杂度，没有难度。

```swift
class Solution {
    var count = 0
    var k = 0
    var n = 0
    var ans = ""

    func getHappyString(_ n: Int, _ k: Int) -> String {
        self.n = n
        self.k = k
        self.count = 0

        combo(0, "", [])

        return ans
    }

    func combo(_ index: Int, _ last: String, _ result: [String]) {
        if index == n {
            count += 1
            if count == k {
                ans = result.reduce("", +)
            }
            return
        }
        for i in ["a", "b", "c"] {
            if i != last {
                combo(index + 1, i, result + [i])
            }
        }
    }
}
```

## [1416. Restore The Array](https://leetcode.com/problems/restore-the-array/description/)

给定一个仅由数字组成的字符串 `s`，将其分割为一个数组，给定一个数字 `k`，求有多少种分割方法满足数组中任意数字都在 `[1, k]` 的范围内，其中任意数字不可以有前置 0 。

本题 `n` 最大 $10^5$，第一眼没能看出来是 DP，想着可以用组合公式计算结果。

假定 $f(i)$ 为 `s` 从 `i` 开始至结尾的子串可以满足分割的结果，那么固定增加一个数字 $s_{i-1}$ 到这个组合的首部，分割组合的数量是不变的。所以当这个数字满足要求的时候我们有：

$$
f(i-1)=f(i)
$$

当增加一个数字由 $s_{i-1}$ 和 $s_i$ 组成的数字 $p=s_{i-1} \times 10 + s_i$ 到 $f(i+1)$ 上，其中 $1 \leqslant p \leqslant k$ ，就可以得到：

$$
f(i-1)=f(i)+f(i+1)
$$

所以只需要累加可能的结果即可。另外，当 $p>k$ 时后续的结果都一定大于 `k`，此时即可停止向后计算。当 $p=0$ 时，也不需要继续计算，后续的值都有前置 0 不满足要求。

```swift
class Solution {
    func numberOfArrays(_ s: String, _ k: Int) -> Int {
        var f = Array(repeating: 0, count: s.count)
        f.append(1)

        let digits = s.map({ Int(String($0))! }) + [1000000001]

        for (i, digit) in digits.enumerated().reversed() {
            var num = digit
            var j = i + 1
            while 0 < num && num <= k && j <= digits.count {
                f[i] += f[j]
                f[i] %= 1000000007
                num = num * 10 + digits[j]
                j += 1
            }
        }

        return f[0]
    }
}
```

本题的状态也可以由前向后转移，但是会比倒序要复杂，这里不再赘述。
