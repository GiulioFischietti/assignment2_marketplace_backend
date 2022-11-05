import json
from random import randint, random


sql_output = open('product.sql', 'a')

sql_output.write('USE marketplace;\n')


volumes = [300, 500, 660, 750, 1000]
alcohol_percentages = [4, 6, 7.5, 8, 12]
stocks = [10, 20, 50, 100]
f = open('beer.json')
beers = json.load(f)

products = beers.copy()

index = 1

for product in products:
    if(index<100):
        beers[index]['id'] = index
        beers[index]['product_id'] = index
        beers[index]['volume_ml'] = volumes[randint(0, 4)]
        beers[index]['alcohol_percentage'] = alcohol_percentages[randint(0, 4)]

        product['id'] = index
        product['short_description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        product['description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        product['brand'] = product['name'].replace("'","")
        product['name'] = (product['name'] + ' - ' + str(beers[index]['volume_ml'])+'mL' + ' - ' + str(beers[index]['alcohol_percentage'])+'%vol').replace("'","")
        product['image_url'] = product['image']
        product['stock'] = stocks[randint(0, 3)]
        del product['rating']
        del product['image']
        
        sql_output.write('INSERT INTO product (id, short_description, description, brand, name, image_url, stock, price) values (' + str(index) + ", '" + product["short_description"] + "', '" + product["description"] + "', '"+ product["brand"] + "', '"+ product["name"] + "', '"+ product["image_url"] + "', "+ str(product["stock"]) + ", " + str(product['price']) +');\n')
        sql_output.write('INSERT INTO beer (id, product_id, volume_ml, alcohol_percentage) values (' + str(beers[index]["product_id"]) + ", " + str(beers[index]["product_id"]) + ", " + str(beers[index]["volume_ml"]) + ", "+ str(beers[index]["alcohol_percentage"]) + ');\n')

        index += 1
