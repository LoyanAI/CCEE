from paddleocr import PaddleOCR

ocr = PaddleOCR(lang='ch')
result = ocr.predict('7.jpg')  # 返回是一个列表，里面每一项是一张图的结果

print(result)