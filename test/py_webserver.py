
import websockets
import asyncio

# 测试wensocket发送

async def hello(websocket, path):
    while True:
        msg = await websocket.recv()
        print("recive:")
        await websocket.send(msg)
        print("send:")


start_server = websockets.serve(hello, '10.10.9.128', 8080)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

