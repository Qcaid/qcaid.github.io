---
title: 记一次默认配置导致的问题
date: 2025-04-19 00:56:08
tags: 技术
cover: https://code.visualstudio.com/assets/home/home-screenshot-copilot-light.png
---

### 前言

朋友告诉我，他的vscode插件无法正常使用了，于是我远程解决问题

### 插件描述

这款插件叫Open In Browser,作用是可以右键便捷打开html文件，并到浏览器打开。
[插件地址](https://marketplace.visualstudio.com/items?itemName=techer.open-in-browser)

### 问题描述

由于默认配置的问题：在默认配置中将 **.html** 的默认方式改为了vscode，这就导致插件功能无法正确指向至浏览器，这便是导致问题发生的原因。

### 解决方法

右键打开文件属性，将 **.html** 文件的默认打开方式改回浏览器即可正常实现插件的功能