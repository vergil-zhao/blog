---
layout: post
title: "AFNetworking & ASIHTTPRequest 的初步使用方法"
date: 2014-07-16 13:54:07 +0800
comments: true
categories: iOS
---

总结一下 _AFNetworking_ 和 _ASIHTTPRequest_ 两个网络库的基本使用以及一些问题

<!-- more -->

首先到 _github_ 下载这两个库，_ASIHTTPRequest_ 从 2011 年就停止更新了，写这篇文章的时候 _AFNetworking_ 的版本是 `2.3.1`。

当前使用的环境是

```
Mac OS X 10.9.4
Xcode 5.1.1
iOS 7.1
```

下面是两个库的地址

`https://github.com/pokeb/asi-http-request`
`https://github.com/AFNetworking/AFNetworking`

这两个库都封装了网络的一些操作，可以方便的进行各种 Request，包含一些高级的功能，另外还有一个库 MKNetworking 可以选择，下面有一个对比的表格，转载自 [AFNetworking、MKNetworkKit 和 ASIHTTPRequest 对比](http://www.cnblogs.com/snake-hand/p/3177938.html)

<table class="ynote_table" style="border-width: 1px; border-style: solid; border-color: #999999; border-collapse: collapse; margin: 6px auto; width: 100%;" border="1" cellspacing="0" cellpadding="2">
<tbody>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>&nbsp;</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>AFNetworking</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>MKNetworkKit</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">ASIHTTPRequest</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">更新情况</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">维护和使用者相对多</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">维护和使用者相对少</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">停止更新</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>支持iOS和OSX</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>是</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>是</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>ARC</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>是</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>是</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>断点续传</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top"><span style="font-size: 12px; line-height: 18px;">否，可通过</span><span style="font-size: 12px; line-height: 18px;">AFDownloadRequestOperation</span></td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">同步异步请求</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">只支持异步</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>图片缓存到本地</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>否，通过SDURLCache或AFCache</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>否</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>图片缓存到内存</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">
<div>是</div>
</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">后台下载</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">下载进度</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否，可通过AFDownloadRequestOperation</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">缓存离线请求</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否，<span style="font-size: 12px; line-height: 18px;">通过SDURLCache或AFCache</span></td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
</tr>
<tr>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">JSON、XML</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">是</td>
<td style="word-break: break-all; border: #999999 1px solid;" valign="top">否</td>
</tr>
</tbody>
</table>

## AFNetworking

这个框架现在的版本和以前的用法有一些区别，而且有一些设置比较隐蔽。其中扩展了一些系统的 UI 类，可以非常方便的使用 UIProgressView、UIImageView 等实现进度条，图片加载等功能。

### 导入库

---

只要将下载之后的目录下的 `AFNetworking` 和 `UIKit+AFNetworking` 两个文件夹导入到工程即可，并且不需要添加其他框架。

### GET 请求并解析 JSON

---

它有自己的管理类，这种请求非常简单明了，会直接解析 JSON 到一个 `NSDictionary`，当然前提是返回的响应是很规范的，可是很多时候并不是这样。这种请求方式要求响应头中的 `Content-type` 字段的值必须是 `text/json`，也就是`Content-type: text/json`。很多时候返回的响应头这个字段的值是 `text/html`, 这个时候这个库就会返回一个错误。当然错误格式的 JSON 数据也会返回错误。下面是调用的代码段.

```objectivec
AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];

//设置支持所有的MIME格式，略隐蔽的设置选项
manager.responseSerializer.acceptableContentTypes = nil;

[manager GET:JSON_URL parameters:nil success:^(AFHTTPRequestOperation *operation, id responseObject) {
    NSLog(@"%@ : ", [responseObject class], responseObject);
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    NSLog(@"error : %@", error);
    }];
```

### 通用请求

---

这个库提供了响应的序列化器(serializer)，就是解析器，这个可以自己定制，如果不指定则不会解析，仅接收原始数据在 block 的参数 `responseObject` 中。`operation`有很多有用的属性，例如`operation.response.allHeaderFields` 可以查看完整的响应头。下面这段代码指定了 XML 的序列化器。

```objectivec
NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:SOME_URL]];
AFHTTPRequestOperation *operation = [[AFHTTPRequestOperation alloc] initWithRequest:request];

//指定序列化器
operation.responseSerializer = [AFXMLParserResponseSerializer serializer];

[operation setCompletionBlockWithSuccess:^(AFHTTPRequestOperation *operation, id responseObject) {
    NSLog(@"%@ : ", [responseObject class], responseObject);
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    NSLog(@"error : %@", error);
    }];

[[NSOperationQueue mainQueue] addOperation:operation];
```

从上面的代码的输出可以看到，它使用了 iOS 自带的 XML 解析器。

### 文件下载保存

---

下面的代码很方便的实现了一个文件的下载。

```objectivec
AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:FILE_URL]];

NSURLSessionDownloadTask *task = [manager downloadTaskWithRequest:request progress:nil destination:^NSURL *(NSURL *targetPath, NSURLResponse *response)
    {
    NSURL *documentURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
    return [documentURL URLByAppendingPathComponent:FILE_NAME];
    } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error)
    {
    NSLog(@"error : %@", error);
    }];

//不要忘记开始任务
[task resume];
```

## ASIHTTPRequest

这个停止更新很久的库使用的是 MRC，并且在新的系统中使用可能会遇到一些问题，但确实一个很好地库，支持断点续传、缓存、身份验证等等。

### 导入库

---

下载库之后，将目录下的 `Classes` 和 `External` 文件夹导入到项目中，这并不是完整的导入，它的单元测试模块的一些文件并不包含在这个目录中，需要用 _ruby_ 相关的命令来导入。这里只需要删除 `Classes` 目录下的 `Test` 删除即可。

### 项目设置

---

需要添加以下框架和库

`CFNetworking.framework	`
`SystemConfiguration.framework`
`MobileCoreServices.framework`
`libz.dylib`
`libxml2.dylib`

还要在项目的 `Build Settings` 中的 `Header Search Paths` 字段中添加 `/usr/include/libxml2/`。

如果项目是 ARC，请在这个库的所有文件添加标签 `-fnobjectivec-arc`，在 `Build Phases` 中的 `Compile Sources`。或者也可以把项目改成 mrc 而你自己创建的文件添加标签 `-fobjectivec-arc`。

另外在 64 位的 iOS 系统下会有很多类型警告，按照推荐的修改即可。

### 数据请求

---

有同步和异步请求，同步的意义不大，这里给出异步请求。请求的处理有两种方式，一种是代理，一种是 `block`。下面给出 `block` 方式的，代理方式在 `ASIHTTPRequestDelegate` 的文件中的定义很容易理解。

```objectivec
NSURL *url = [NSURL URLWithString:SOME_URL];

//使用__weak来防止使用block出现的retain循环
__weak ASIHTTPRequest *request = [ASIHTTPRequest requestWithURL:url];

//使用代理方式则添加下面这句
//request.delegate = self;

[request setCompletionBlock:^{
    NSLog(@"%@", request.responseString);
    }];
[request setFailedBlock:^{
	NSLog(@"%@", request.error);
    }];
[request startAsynchronous];
```

### 文件下载缓存

---

支持多种缓存策略，这里使用永久缓存的策略。

```objectivec
NSURL *url = [NSURL URLWithString:FILE_URL];
__weak ASIHTTPRequest *request = [ASIHTTPRequest requestWithURL:url];

request.downloadCache = [ASIDownloadCache sharedCache];

//指定缓存策略
request.cachePolicy = ASIOnlyLoadIfNotCachedCachePolicy;

[request setCompletionBlock:^{
    [request.responseData writeToFile:LOCAL_FILE_URL atomically:YES];
    }];
[request setFailedBlock:^{
  	NSLog(@"%@", request.error);
    }];

[request startAsynchronous];
```

下载任务是支持进度显示的，需要用一个 UIProgressView 代理，和设置显示精确进度，下面两句

```objectivec
request.showAccurateProgress = YES;
request.downloadProgressDelegate = progressView;
```

---

---

以上就是两个库的基本用法，还有一些上传数据，身份验证等等点击下面的参考资料中的链接查看。

<br /><br /><br /><br />

#### 参考资料

---

1. [专题：iOS 教程之 ASIHttpRequest 完全攻略](http://mobile.51cto.com/iphone-405168.htm)
2. [ASIHTTPRequest 官方文档](http://allseeing-i.com/ASIHTTPRequest/How-to-use)
3. [AFNetworking 官方文档](http://cocoadocs.org/docsets/AFNetworking/2.3.1/index.html)
