import os
from PIL import Image


for image_path in os.listdir('./manager'):

    image = Image.open('./manager/' + image_path)
    # print(image.size)
    new_image = image.resize((360, 760))
    new_image.save('./manager/' + image_path)