import websockets
import asyncio
import json
import numpy as np
import time

from aiCore import AICore

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


def tst_send_json():
    # 把字典dump成json的string，然后发送


    a = {"message":"message from python",
         "got":""}

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

def tst_got_image_and_give_fake_result():
    '''
    测试js发送图片，然后这里给出假的分类结果，要求能够解析成矩阵！
    :return:
    '''

    model = AICore()
    async def hello(websocket, path):
        # TODO: 这里开另一个线程处理image然后send

        # TODO：然后这个线程仅仅用来接受！
        while True:
            msg = await websocket.recv()

            #print(msg)
            '''
            注意，接受message的线程不要处理东西，在另一个线程处理东西然后send！
            比如这里sleep 1，而js是sleep 0.2调用，会出现js那边延迟积累，然后即使js程序关闭，这里也会处理一直发过来的东西!
            '''

            msg = msg.split(",")
            image = np.array(msg).astype(np.uint8)
            # 得到的是4通道的数据!因为rgba
            image = image.reshape(224,320,4)[:,:,:-1]
            model.detect_img(image)




    # 虚拟机中的ip,需要ifconfig查看
    start_server = websockets.serve(hello, '10.10.9.168', 8080)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()


if __name__ == '__main__':
    #tst_send_normal_websocket_message()
    #tst_send_json()
    tst_got_image_and_give_fake_result()
