---
title: 利用Cloudflare R2对象存储搭建图床
date: 2025-05-10 15:19:47
tags: 技术
cover: https://img.vegecai.moe/R2.png
---
# 利用Cloudflare R2对象存储搭建图床

## 前言

在享受过cf大善人的便利之后，产生了将能免费用的东西都挂在cf大善人上的想法，于是便盯上了Cloudflare R2对象储存。本站部分图片都是托管在R2上面的

### 什么是Cloudflare R2对象储存

> 用于存储所有数据的对象存储。
>
> Cloudflare R2 存储允许开发人员存储大量非结构化数据，而无需支付与典型云存储服务相关的昂贵的出口带宽费用。
>
> 您可以将 R2 用于多种场景，包括但不限于：
>
> - 云原生应用程序的存储
> - Web 内容的云存储
> - 播客节目的存储
> - 数据湖（分析和大数据）
> - 大型批处理过程的云存储输出，例如机器学习模型工件或数据集

### Cloudflare R2定价

| 类型     | 免费额度           | 超额付费          |
| :------- | ------------------ | ----------------- |
| 存储     | 10 GB-月/月        | $0.015/GB/月      |
| A类操作  | 100 万个请求 / 月  | $4.50/100万个请求 |
| B类操作  | 1000 万个请求 / 月 | $4.50/100万个请求 |
| 出口流量 | 全球免费①          | 全球免费①         |

**注解①**：
通过以下方式访问R2时，不收取数据传输（出口）费用：

- 通过[Workers API](https://zhida.zhihu.com/search?content_id=253838073&content_type=Article&match_order=1&q=Workers+API&zhida_source=entity)直接访问
- 通过[S3兼容API](https://zhida.zhihu.com/search?content_id=253838073&content_type=Article&match_order=1&q=S3兼容API&zhida_source=entity)访问
- 通过[r2.dev子域名](https://zhida.zhihu.com/search?content_id=253838073&content_type=Article&match_order=1&q=r2.dev子域名&zhida_source=entity)访问

> API有不同操作，这里指的是下载/获取（GET操作）数据，为出口流量；上传（PUT操作）数据，为入口流量（不收费），计入A 类操作。

出口流量（Egress）：数据从R2存储桶传输到公共互联网产生的流量。

在大多数云服务中，比如AWS S3或腾讯云COS，当用户下载文件时，数据从存储服务传输到用户的设备，通常会涉及到出口流量费用。而Cloudflare R2的特殊之处在于，如果通过其特定的方式访问数据（比如通过Workers、S3 API或r2.dev域名），出口流量是免费的。

- **传统云存储计费模式**（如AWS S3）：
  当用户请求资源（如图片）时 → 数据经云厂商网络出口到公网 → 按GB收费
- **Cloudflare R2的革新模式**：
  当用户请求资源（如图片）时 → 数据经Cloudflare全球网络内部路由 → 零费用

![存储桶](https://img.vegecai.moe/R2-01.png)

### 账户配置

登录[Cloudflare](https://link.zhihu.com/?target=https%3A//www.cloudflare-cn.com/)账号，点击R2对象存储，这里需要添加一个付款方式才能使用，支持信用卡或PayPal，添加完成后，点击 将R2订阅添加到我的帐户 即可。

> 实测支持国内银联信用卡，没有信用卡也可以用PayPal账户（可绑定普通银行卡）
> 只有当你使用量超过每月限额时，超额部分才会向收费。

### 储存桶创建

点击创建存储桶

![创建](https://img.vegecai.moe/R2-02.png)

存储桶名称设置一个简单好记的（比如blogimg），存储桶类型选择标准，如果要兼顾国内访问，存储桶地区最好选择亚太地区

### 通过后台上传文件

![后台](https://img.vegecai.moe/R2-03.png)

直接拖拽上传即可

### 通过r2.dev子域名访问

上传图片到存储桶后，存储桶需要开启公共URL访问（也就是Cloudflare R2提供的r2.dev子域名访问），这样我们才能通过链接访问图片

在存储桶页面，点击设置，找到R2.dev 子域选项，点击允许访问

### 使用自定义域访问

为存储桶开启公共URL访问时，官方已经明确提示：公共存储桶 URL 有速率限制。请将自定义域连接到存储桶来支持生产工作负载。

根据官方文档[Public buckets · Cloudflare R2 docs](https://link.zhihu.com/?target=https%3A//developers.cloudflare.com/r2/buckets/public-buckets/%23custom-domains)的说明，通过自定义域访问域有一个很重要的好处，就是允许使用[Cloudflare Cache](https://link.zhihu.com/?target=https%3A//developers.cloudflare.com/cache/)来加速对 R2 存储桶的访问，这样能显著提高我们图片的加载速度。

Cloudflare的核心优势在于其全球分布的边缘节点网络，系统会根据用户的地理位置，通过智能路由自动从最近的节点提供数据，这种动态分发机制能显著降低延迟，提升访问速度与稳定性。

注意，要将你买的域名托管到Cloudflare后，才能进入下文的操作。



在存储桶页面，点击设置找到添加自定义域，设置访问链接，可以设置成img开头，比如我设置的就是img.vegecai.moe，然后点击继续

Cloudflare会自动为我们已经托管在其上的域名添加DNS记录，点击连接域

### 通过rclone+S3 API便捷操作云文件

[Rclone](https://link.zhihu.com/?target=https%3A//rclone.org/)是一个命令行程序，用于管理云存储上的文件，[支持 70 多种云存储产品](https://link.zhihu.com/?target=https%3A//rclone.org/%23providers)，通过使用rclone+S3 API的方式，我们可以更方便地对存储桶中的文件进行增删改查等操作。

#### 配置rclone

安装rclone后，可以在命令行输入rclone查看是否已安装。

接下来要对rclone进行配置，首先到Cloudflare R2后台创建一个API令牌，如下图所示，点击API>管理API令牌

![api](https://img.vegecai.moe/R2-04.png)

点击创建API令牌

设置令牌名称，权限设置为对象读和写，其它的安全配置按需设置或者保持默认，然后点击创建API令牌

API令牌创建成功后，会显示凭据信息，将内容填入后文rclone的配置文件中即可

> ❗注意：API令牌凭据信息要保管好，避免暴露给其他人，导致数据丢失和存储桶被盗刷的风险。

![token](https://img.vegecai.moe/R2-05.png)

这里访问密钥只会显示一次，如果忘了，可以重新更新一下：点击轮转或在编辑页面里点击更新

rclone配置文件本地位置：如果没有该文件的话自行创建一个

```text
C:\Users\你的用户名\AppData\Roaming\rclone\rclone.conf
```


配置内容格式如下：provider提供商要设置为Cloudflare，access_key_id、secret_access_key、endpoint填入前面申请的API令牌对应的凭据信息即可

```text
[cf]
type = s3
provider = Cloudflare
access_key_id = xxxxxx
secret_access_key = xxxxxx
endpoint = https://xxx.r2.cloudflarestorage.com
acl = private
```


配置文件可以添加多个配置，如下图所示：
其中方括号中自定义的名字就是每个配置的别名，通过命令行访问云存储时，需要指定一个配置(也就是输入对应的别名)

![cof](https://img.vegecai.moe/R2-06.png)

#### 文件查询

查看云端目录树结构：

```bash
rclone tree <配置文件中自定义的别名>:<你的存储桶名>
```

![tree](https://img.vegecai.moe/R2-07.png)

列出指定路径所有对象的大小和文件名：

```bash
rclone ls <配置别名>:<存储桶名>/路径
如果文件不存在，那么没有任何输出
```

#### 文件上传

```bash
rclone copy <本地路径> <配置别名>:<存储桶名>/云端路径

可选参数：
+ 查看实时传输统计信息：-P（注意是大写P） 或 --progress
```

注意：如果路径有空格的话要用引号""包起来

#### 文件删除

```bash
rclone delete <配置别名>:<存储桶名>/云端路径
可选参数：
测试模式（进行无永久性更改的试运行）
-n, --dry-run
交互模式（会以问答模式和你确认要执行的操作）
-i, --interactive
```

测试模式，顾名思义就是仅供测试，不会真的执行删除操作

- 使用这个参数可以先测试删除操作是否能够执行成功，同时会返回如下图所示的测试删除文件列表提示
- 通过返回的测试删除文件列表，我们也可以查看这些文件是不是我们要删除的
- 如果返回空，说明要删除的云端文件不存在

## 后记

至此，我的博客完全实现了Cloudflare全站式托管：

[Cloudflare全站托管体系]
├── **应用层**
│ └── Cloudflare Pages（网站托管 — Hexo静态博客）
├── **存储层**
│ └── Cloudflare R2（对象存储引擎 — 图床）
└── **网络基础设施层**
├── Cloudflare DNS（智能域名解析）
├── Cloudflare CDN（全球加速+安全防护）
└── Cloudflare SSL/TLS（全域加密 — 自动化证书管理）

最后，请允许我用程序员的方式致谢：

```java
public class DearCloudflare {
    public static void main(String[] args) {
        System.out.print("Cloudflare, 我亲爱的赛博大善人");
    }
}
```


方案参考：
晚阳Crown https://www.oneyangcrown.top/posts/cloudflare-r2-free-image-hosting-guide/
