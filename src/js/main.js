/*
* 在启用了python的websocket之后运行！
* 注意事项：
* 成员函数不能够在setTimeOut和setInterval等地方使用，因为this不一样了！
*
* */

class WebsocketTools {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;
        this.wsConnected = false;


    }

    createWebsocket() {
        let wsUri = 'ws://' + this.ip + ":" + this.port;
        this.ws = new WebSocket(wsUri);
        let root = this;
        // 因为回调函数的this实际上到了另一个变量域中了，所以这里let另一个指针代替this
        // 可以理解为let this = this
        this.ws.onmessage = function (message) {

            // 这个函数会在主函数中重载

            // 这一段对应于python的tst send json
            // console.log(message);
            // let obj = JSON.parse(message.data);
            // console.log(obj.got);
            // console.log(obj.message);

            // 这里对应于python的tst_got_image
            // 处理结果，打印
            // let obj = JSON.parse(message.data);
            // for (let i=0;i<obj.data.length;i++){
            //     console.log(obj.data[i].label);
            //     console.log(obj.data[i].left);
            //     console.log(obj.data[i].right);
            //     console.log(obj.data[i].top);
            //     console.log(obj.data[i].bottom);
            // }

        };
        this.ws.onopen = function () {
            console.log("ws open");
            root.wsConnected = true;
            console.log("now ws status: " + root.wsConnected.toString());


        };
        this.ws.onclose = function () {
            console.log("ws close");
            root.wsConnected = false;
            console.log("now ws status: " + root.wsConnected.toString());
        }
    }


}

class VideoStream {

    constructor(videoElement,
                canvasContext2dElement,
                imageWidth,
                imageHeight,
                websocket) {
        //构造函数
        this.video = videoElement;
        this.context2d = canvasContext2dElement;
        this.imageW = imageWidth;
        this.imageH = imageHeight;
        this.context2d.width = this.imageW;
        this.context2d.height = this.imageH;
        this.websocket = websocket;

    }

    static getUserMedia(constraints, success, error) {
        //访问用户媒体设备的兼容方法
        if (navigator.mediaDevices.getUserMedia) {
            //最新的标准API
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia) {
            //webkit核心浏览器
            navigator.webkitGetUserMedia(constraints, success, error)
        } else if (navigator.mozGetUserMedia) {
            //firfox浏览器
            navigator.mozGetUserMedia(constraints, success, error);
        } else if (navigator.getUserMedia) {
            //旧版API
            navigator.getUserMedia(constraints, success, error);
        }
    }

    startProcess(interval = 250) {
        //因为在callback中不支持this，所以需要二次赋值
        let context2d = this.context2d;
        let video = this.video;
        let imageW = this.imageW;
        let imageH = this.imageH;
        let websocket = this.websocket;
        setInterval(
            function () {
                // 将帧写入图片显示
                context2d.drawImage(video, 0, 0, imageW, imageH);
                // 得到图片
                let imageData = context2d.getImageData(0, 0, imageW, imageH);

                let dataArray = imageData.data;
                // 得到的数据是imageW * imageH * 4的，数据类型是Uint8ClampedArray，可以尝试直接python解析这个结果，这里是转成普通的array解析
                let normalArray = Array.from(Array.prototype.slice.call(dataArray));
                websocket.ws.send(normalArray);

            },
            interval
        )
    }

    start() {
        // 启动摄像头并持续获取视频流显示，写入this.video
        //因为在callback中不支持this，所以需要二次赋值
        let video = this.video;

        function onSuccess(stream) {
            //兼容webkit核心浏览器
            let CompatibleURL = window.URL || window.webkitURL;
            //将视频流设置为video元素的源
            //console.log(stream);
            //video.src = CompatibleURL.createObjectURL(stream);

            video.srcObject = stream;
            video.play();
        }

        function onError(error) {
            console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
        }

        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
            //调用用户媒体设备, 访问摄像头
            VideoStream.getUserMedia({
                video: {
                    width: this.imageW,
                    height: this.imageH,
                    facingMode: {exact: "environment"}
                }
            }, onSuccess, onError);
        } else {
            alert('不支持访问用户媒体');
        }
    }

}


// // -----------主函数-------------

let video1 = document.getElementById('video');
let canvas = document.getElementById('canvas');
var websocket = new WebsocketTools('10.10.9.168', 8080);
websocket.createWebsocket();

var vs = new VideoStream(
    video1,
    canvas.getContext('2d'),
    // 注意下面的参数要和python那边统一
    192,
    192,
    websocket);
vs.start();
vs.startProcess();
// 重载onmessage函数，因为需要调用videoStream画出矩形框
websocket.ws.onmessage = function (message) {
    let obj = JSON.parse(message.data);
    for (let i = 0; i < obj.data.length; i++) {
        let label = obj.data[i].label;
        let left = obj.data[i].left;
        let right = obj.data[i].right;
        let top = obj.data[i].top;
        let bottom = obj.data[i].bottom;

        //边框颜色
        vs.context2d.strokeStyle = "#51c1ff";
        vs.context2d.lineWidth = 4;
        vs.context2d.strokeRect(x=left,y=top,w=Math.abs(right-left),h=Math.abs(bottom-top));
        vs.context2d.fillText(label,left,top);

    }


};

// setInterval(
//     function () {
//         console.log("message sent "+websocket.wsConnected.toString());
//         if (websocket.wsConnected) { // 注意需要连接过后send
//             console.log("message sent");
//
//             // 发送假的图片数据
//             let dataArray = [];
//             for (let i=0;i<256*256*3;i++){
//                 dataArray.push(120);
//             }
//             // 直接按照原始发送，避免序列化操作！
//             websocket.ws.send(dataArray);
//         }
//     },
//     200
// )
