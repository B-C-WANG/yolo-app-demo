


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


            // 这一段对应于python的tst send json
            // console.log(message);
            // let obj = JSON.parse(message.data);
            // console.log(obj.got);
            // console.log(obj.message);

            // 这里对应于python的tst_got_image_and_give_fake_result

        };
        this.ws.onopen = function () {
            console.log("ws open");
            root.wsConnected = true;
            console.log("now ws status: "+root.wsConnected.toString());


        };
        this.ws.onclose = function () {
            console.log("ws close");
            root.wsConnected = false;
            console.log("now ws status: "+root.wsConnected.toString());
        }
    }









}


// ______________主函数_____________


var websocket = new WebsocketTools('10.10.9.128', 8080);
console.log(websocket.wsConnected);
websocket.createWebsocket();
console.log(websocket.wsConnected);


setInterval(
    function () {
        console.log("message sent "+websocket.wsConnected.toString());
        if (websocket.wsConnected) { // 注意需要连接过后send
            console.log("message sent");

            // 发送假的图片数据
            let dataArray = [];
            for (let i=0;i<256*256*3;i++){
                dataArray.push(120);
            }
            // 直接按照原始发送，避免序列化操作！
            websocket.ws.send(dataArray);
        }
    },
    200
)
