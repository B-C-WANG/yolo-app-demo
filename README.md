# 效果展示
![](./result.gif)
# 运行
- 首先运行py_webserver服务，注意填入有效的ip地址（ifconfig可查看）
- 使用Hbuilder运行到手机,填入服务器ip和端运行
- 注意server端和手机端在同一局域网，或者server端可公网访问
- 为了保证通信速率，可以采用服务器电脑开热点给手机连接的方式（windows下设置-移动热点）

# 开发流程
## 通信和序列化
- 通信采用websocket
- 序列化暂时使用json，考虑到有图片传输，因此建议使用更高效的序列化工具如protobuf
## 数据流
- 摄像头-js前端-json-python后端-模型-预测结果-json-js前端-显示
## 模型部分（建议linux下进行）
- 采用keras-yolo3: https://github.com/qqwweee/keras-yolo3
- clone上述仓库,按照其中的README.md的QuickStart教程下载相应的权重和cfg文件,使用converter转换.h5模型（转换部分建议在linux下进行，Windows上可以把转换过后的.h5文件拿到）
- 因为采用外部引用的方式,aiCore.py引用YOLO,所以需要把文件夹keras-yolo3重命名为kerasYolo3,并加上__init__.py成为Python的package
- keras-yolo3里面文件本身会有引用问题,需要fix(比如把.yolo.utils改成.utils等等)
- 同时,如果采用的tiny weights,还需要在model_data中把tiny_yolo_anchors.txt重命名为yolo_anchors并覆盖(或者在YOLO构造函数中指定anchors_path)
- 完成过后,运行aiCore进行测试,测试后开始更改原仓库的代码,同时增加aiCore.py文件封装api
- aiCore.py中的代码参考yolo_video中的detect_img来完成,对接webserver
- 需要对keras-yolo3仓库代码进行的改动:原来的yolo是直接输出加了mask和bounding box的图像,可以选择直接把图像矩阵传给js,也可以选择把分类结果和bounding box坐标传给js进行绘制
- 如果传图片,通信开销较大,如果只是传分类结果和bounding box而没有mask,相对开销较小(注意mask也是矩阵,并且是分层的,所以传递mask不如直接传结果图片)
## app打包
- 可以使用HBuilderX自带的云打包，证书可以选择使用DCloud公用证书
- 因为打包过后不再通过修改源代码的方式设置ip port，所以需要留出接口填入ip port
## 关于性能
- 实测yolo总运行时间只需要60ms，但是加上通信，时间达到了170ms，使得js请求需要设置成间隔250ms，也就是4帧/s，需要改进。
- 如果局域网网络较差，通信耗时更长
## debug
- 传递yolo所需的标准图片大小416,416,3时,出现websocket大小超出size的错误,尝试采用更小的图片,yolo中会进行resize
- 注意获取的图片最好就是1:1大小,不允许拉伸
- 传输较大的图片可以采用传送多次来完成,每次json对象中设置好index
- 如果是context2d通过getImage方法获得,结果的数据类型是Uint8ClampedArray,这个可以尝试直接发送给python解析,并未实现,因此转成普通数组.另外传递过去的一位数组是H\*W\*4的,应该是rgba的
- 传入图片一直没有判定出box:先用图片进行debug,正常后,尝试摄像头远景,或者摄像头识别电脑中图片,注意保持长宽比,不要拉伸压缩




