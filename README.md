


# 运行
- 首先运行py_webserver服务
- 然后使用Hbuilder打开项目，双击index.html，然后运行到浏览器

# 开发流程
## 通信和序列化
- 通信采用websocket
- 序列化暂时使用json，考虑到有图片传输，因此建议使用更高效的序列化工具如protobuf
## 数据流
- 摄像头-js前端-json-python后端-模型-预测结果-json-js前端-显示
## 模型部分（建立linux下进行）
- 采用keras-yolo3: https://github.com/qqwweee/keras-yolo3
- clone上述仓库，按照其中的README.md的QuickStart教程下载权重并转换




