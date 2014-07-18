---
layout: post
title: "Core Animation 中的3D变换以及简单应用"
date: 2014-07-17 22:36:21 +0800
comments: true
categories: iOS
---

本篇介绍iOS中的 *Core Animation* 的3D变换，*CATransform3D* 矩阵变换。

<!-- more -->

*Core Animation* 是iOS中自带的动画框架，它包含了一些常用的变换和动画，旋转、缩放、平移、透视等。平面的动画有 *facebook* 的 *pop* 开源框架，下一篇讲介绍。三维的框架有 *Unity3D*，通常用CA做一个3D的动画还是很繁琐的，iOS上的 *OpenGL ES* 可能更科学。

这个层面已经涉及到一些计算机图形学的知识，这里只说明基本的意义。

首先，通过查看 *CATransform3D* 的定义可以知道，这是一个三维齐次变换矩阵. *4 * 4* 的矩阵，表示为

<pre>
A A A C 
A A A C 
A A A C 
B B B D
</pre>

A区是的变换是，旋转、比例、错切等变换，B区是平移变换，C区是透视变换，D是全比例变换。

左上到右下的对角线是1，而其他的都为0的时候，就是 `CATransform3DIdentity` 变换，即恒等变换。一般的常用变换，CA都给出了一些C函数，例如 `CATransform3DRotate()`。

这些操作都是在一个layer上，`layer.anchorPoint` 这个属性会影响到一些变换，比如旋转的轴。

这里提一下iOS中坐标系的问题，CA中用的是左手坐标系，x轴正方向向右，y轴正方向向下，z轴正方向垂直于屏幕向上，也就是朝着用户的方向。所以这里，旋转的正方向就是顺时针，而旋转的角度的范围事实上为-180到180，所以如果使用变换来做动画，则使用 `CAKeyFrameAnimation` 来实现超过180度的旋转动画，而使用keypath的方式就不需要。

在做animation的时候，使用 `CABasicAnimation` 用 *keypath* 来添加动画，这里有一个非官方的不完整列表，官方似乎并未提供完整列表。转载自[CABasicAnimation animationWithKeyPath 一些规定的值](http://www.cnblogs.com/pengyingh/articles/2379631.html)

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

有一个简单明了的示例是Mgen的一个旋转立方体，我这里给出 `ViewController.m` 的完整代码和我增加的几条注释，转载自[iOS CALayer和3D (1): 定义一个简单的旋转3D立方体](http://www.mgenware.com/blog/?p=498)。

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

上面代码实现了一个立方体的旋转动画，通过这段代码即可了解CA中的变换和动画的一些用法。