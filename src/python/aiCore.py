# coding:utf-8


from kerasYolo3.yolo import YOLO

from PIL import Image

class AICore(object):
    def __init__(self):
        self.yolo = YOLO(
            model_path="./kerasYolo3/model_data/yolo.h5",
            anchors_path= './kerasYolo3/model_data/yolo_anchors.txt',
            classes_path= './kerasYolo3/model_data/coco_classes.txt',
        )


    def detect_img(self,image_array):
        # TODO:读取图片并展示,返回所有bounding box等信息,传给js解析绘制

        # TODO: yolo传入的是cv2的image,而不是array!
        img = Image.fromarray(image_array)

        self.yolo.detect_image(img)
        print("Finished detect img")

    def test_example_img(self):
        img = Image.open("./exampleImg.jpeg")
        img = img.resize((320,210))

        self.yolo.detect_image(img).show()



if __name__ == '__main__':
    tst = AICore()
    tst.test_example_img()