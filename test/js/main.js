// 在启用了python的websocket之后运行！

class  WebsocketTools {
    constructor(ip,port) {
        this.ip = ip;
        this.port = port;

    }

    createWebsocket(){
        let wsUri = 'ws://' + this.ip + ":" + this.port;
        this.ws = new WebSocket(wsUri);
        // TODO：写成收到pb的
        this.ws.onmessage=function (message) {
            console.log(message);
        }
    }

    wsTestSend(){
        // TODO：写成send pb的

        this.ws.send("123123");
        console.log("message sended");
    }

}


// ______________主函数_____________


var ws = new WebsocketTools('10.10.9.128',8080);
ws.createWebsocket();

setInterval(
    ws.wsTestSend,
    2000
)
