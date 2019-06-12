import websockets
import asyncio
import json
import numpy as np
import time
from aiCore import AICore


class WebServer(object):

    @staticmethod
    def tst_send_normal_websocket_message():
        # 测试websocket发送简单消息

        async def hello(websocket, path):
            while True:
                msg = await websocket.recv()
                print("recive: %s" % msg)
                await websocket.send(msg + "from python")
                print("send:")

        start_server = websockets.serve(hello, '10.10.9.128', 8080)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    @staticmethod
    def tst_send_json():
        # 把字典dump成json的string，然后发送

        a = {"message": "message from python",
             "got": ""}

        async def hello(websocket, path):
            while True:
                msg = await websocket.recv()
                a["got"] = msg
                string = json.dumps(a)
                print("recive: %s" % msg)
                await websocket.send(string)
                print("send:")

        start_server = websockets.serve(hello, '10.10.9.128', 8080)

        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    @staticmethod
    def launch(ip,port,imageH,imageW):

        model = AICore()
        async def hello(websocket, path):
            # TODO: 这里开另一个线程处理image然后send
            # TODO：然后这个线程仅仅用来接受！
            while True:
                msg = await websocket.recv()
                start = time.time()  # 注意度量程序开始的时间不应该是从await开始,否则会计算上js的interval延迟

                # print(msg)
                '''
                注意，接受message的线程不要处理东西，在另一个线程处理东西然后send！
                比如这里sleep 1，而js是sleep 0.2调用，会出现js那边延迟积累，然后即使js程序关闭，这里也会处理一直发过来的东西!
                '''
                # 接受过来的是array的string list
                msg = msg.split(",")
                image = np.array(msg).astype(np.uint8)
                image = image.reshape(imageW, imageH, 4)[:, :, :-1]  # 得到的是4通道的数据!因为rgba
                result = model.detect_img(image)

                # 发送result
                await websocket.send(json.dumps(result))
                # 打印出一次请求完全完成所需的时间,用于设置js的调用频率,大约0.2s
                print(time.time() - start)

        # 虚拟机中的ip,需要ifconfig查看
        start_server = websockets.serve(hello, ip, port)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()


if __name__ == '__main__':
    #tst_send_normal_websocket_message()
    #tst_send_json()
    WebServer.launch(ip='10.10.9.168',port=8080,imageW=192,imageH=192)
