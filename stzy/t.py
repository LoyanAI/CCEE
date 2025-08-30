import os

def process_folder(root_dir, fn, ext=None):
    """
    root_dir : 要遍历的目录
    fn       : 你的处理函数，签名 fn(full_path:str)
    ext      : 只处理指定后缀，如 ['.jpg','.png']；None=全部
    """
    for dirpath, _, files in os.walk(root_dir):
        for name in files:
            if ext is None or name.lower().endswith(tuple(ext)):
                full_path = os.path.join(dirpath, name)
                fn(full_path)

# 调用示例
def my_ocr(path):
    if len(path)<=10:
        print('处理', path,end=' ')
    

process_folder(r'./img', my_ocr)