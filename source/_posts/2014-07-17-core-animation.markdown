---
layout: post
title: "Core Animation 中的3D变换以及简单应用"
date: 2014-07-17 22:36:21 +0800
comments: true
categories: iOS
---

本篇介绍 iOS 中的 _Core Animation_ 的 3D 变换，_CATransform3D_ 矩阵变换。

<!-- more -->

_Core Animation_ 是 iOS 中自带的动画框架，它包含了一些常用的变换和动画，旋转、缩放、平移、透视等。平面的动画有 _facebook_ 的 _pop_ 开源框架，下一篇讲介绍。三维的框架有 _Unity3D_，通常用 CA 做一个 3D 的动画还是很繁琐的，iOS 上的 _OpenGL ES_ 可能更科学。

这个层面已经涉及到一些计算机图形学的知识，这里只说明基本的意义。

首先，通过查看 _CATransform3D_ 的定义可以知道，这是一个三维齐次变换矩阵。

左上到右下的对角线是 1，而其他的都为 0 的时候，就是 `CATransform3DIdentity` 变换，即恒等变换。一般的常用变换，CA 都给出了一些 C 函数，例如 `CATransform3DRotate()`。

这些操作都是在一个 layer 上，`layer.anchorPoint` 这个属性会影响到一些变换，比如旋转的轴。

这里提一下 iOS 中坐标系的问题，CA 中用的是左手坐标系，x 轴正方向向右，y 轴正方向向下，z 轴正方向垂直于屏幕向上，也就是朝着用户的方向。所以这里，旋转的正方向就是顺时针，而旋转的角度的范围事实上为-180 到 180，所以如果使用变换来做动画，则使用 `CAKeyFrameAnimation` 来实现超过 180 度的旋转动画，而使用 keypath 的方式就不需要。

在做 animation 的时候，使用 `CABasicAnimation` 用 _keypath_ 来添加动画，这里有一个非官方的不完整列表，官方似乎并未提供完整列表。转载自[CABasicAnimation animationWithKeyPath 一些规定的值](http://www.cnblogs.com/pengyingh/articles/2379631.html)

- sublayerTransform
- transform
- rotation
- scale
- translation
- opacity
- margin
- zPosition
- backgroundColor
- cornerRadius
- borderWidth
- bounds
- contents
- contentsRect
- cornerRadius
- frame
- hidden
- mask
- masksToBounds
- opacity
- position
- shadowColor
- shadowOffset
- shadowOpacity
- shadowRadius

其中有一些是可以用 `.` 来连接子属性的，例如 `rotation.x`。

有一个简单明了的示例是 Mgen 的一个旋转立方体，我这里给出 `ViewController.m` 的完整代码和我增加的几条注释，转载自[iOS CALayer 和 3D (1): 定义一个简单的旋转 3D 立方体](http://www.mgenware.com/blog/?p=498)。

```objc
//
//  ViewController.m
//  CALayer_3DCube_from_Mgen_Blog
//
//  Created by Veracruz on 14-7-17.
//  Copyright (c) 2014年 Veracruz. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@property (strong, nonatomic) CALayer *rootLayer; //主layer，这里应理解为一个放置layer的舞台

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.

    _rootLayer = [CALayer layer];
    _rootLayer.contentsScale = [UIScreen mainScreen].scale;
    _rootLayer.frame =self.view.bounds;

    //前
    [self addLayer:@[@0, @0, @50, @0, @0, @0, @0]];
    //后
    [self addLayer:@[@0, @0, @(-50), @(M_PI), @0, @0, @0]];
    //左
    [self addLayer:@[@(-50), @0, @0, @(-M_PI_2), @0, @1, @0]];
    //右
    [self addLayer:@[@50, @0, @0, @(M_PI_2), @0, @1, @0]];
    //上
    [self addLayer:@[@0, @(-50), @0, @(-M_PI_2), @1, @0, @0]];
    //下
    [self addLayer:@[@0, @50, @0, @(M_PI_2), @1, @0, @0]];

    //主Layer的3D变换
    CATransform3D transform = CATransform3DIdentity;
    //这是做了一个透视
    transform.m34 = -1.0 / 700;
    //在X轴上做一个20度的小旋转
    transform = CATransform3DRotate(transform, M_PI / 9, 1, 0, 0);
    //设置CALayer的sublayerTransform
    _rootLayer.sublayerTransform = transform;
    //添加Layer
    [self.view.layer addSublayer:_rootLayer];

    //动画
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"sublayerTransform.rotation.y"];
    //从0到360度
    animation.toValue = [NSNumber numberWithFloat:2 * M_PI];
    //间隔3秒
    animation.duration = 3.0;
    //无限循环
    animation.repeatCount = HUGE_VALF;
    //开始动画
    [_rootLayer addAnimation:animation forKey:@"rotation"];
}

- (void)addLayer:(NSArray *)params
{
    //可以渐变颜色的layer
    CAGradientLayer *gradientLayer = [CAGradientLayer layer];

    //这句似乎在有内容的时候才是必须的
    gradientLayer.contentsScale = [UIScreen mainScreen].scale;

    gradientLayer.bounds = CGRectMake(0, 0, 100, 100);
    gradientLayer.position = self.view.center;

    //设置渐变的颜色序列
    gradientLayer.colors = @[(id)[UIColor grayColor].CGColor,
                             (id)[UIColor blackColor].CGColor];
    //设置每个颜色起始的比例位置
    gradientLayer.locations = @[@0, @1];

    //两个点的连线就是渐变的方向
    gradientLayer.startPoint = CGPointMake(0, 0);
    gradientLayer.startPoint = CGPointMake(0, 1);

    CATransform3D transform =
        CATransform3DMakeTranslation([[params objectAtIndex:0] floatValue],
                                     [[params objectAtIndex:1] floatValue],
                                     [[params objectAtIndex:2] floatValue]);
    transform =
        CATransform3DRotate(transform,
                            [[params objectAtIndex:3] floatValue],
                            [[params objectAtIndex:4] floatValue],
                            [[params objectAtIndex:5] floatValue],
                            [[params objectAtIndex:6] floatValue]);

    gradientLayer.transform = transform;

    [_rootLayer addSublayer:gradientLayer];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
```

上面代码实现了一个立方体的旋转动画，通过这段代码即可了解 CA 中的变换和动画的一些用法。
