import json
from random import randint, random


sql_output = open('monitor.sql', 'a')

sql_output.write('USE marketplace;\n')

stocks = [10, 20, 50, 100]
sizes = [11, 13.3, 15, 17.7]
prices = [199.99, 249.99, 399.99, 499.99]
refresh_rates = [60, 90, 120, 144]
resolutions = ["640x400", "720x480", "800x600", "1024x768", "1600x1200", "2560x1440"]
special_features = ["Wireless", "Eye protection system", "4 Year warranty", "Touch screen"]
brands = ["HP", "Asus", "Apple", "Samsung", "Acer", "MSI"]



index = 101

for brand in brands:
    for i in list(range(100)):
        monitor = {}
        monitor['id'] = index
        monitor['product_id'] = index
        monitor['screen_size'] = sizes[randint(0, 3)]
        monitor['resolution'] = resolutions[randint(0, 3)]
        monitor['special_features'] = special_features[randint(0, 3)]
        monitor['refresh_rate'] = refresh_rates[randint(0, 3)]

        product = {}
        product['id'] = index
        product['short_description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        product['description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        product['brand'] = brand
        product['image_url'] = ""
        product['name'] = brand + ' Monitor ' + monitor['resolution'] + ' - ' + str(monitor['screen_size'])
        product['stock'] = stocks[randint(0, 3)]
        product['price'] = prices[randint(0, 3)]

        sql_output.write('INSERT INTO product (id, short_description, description, brand, name, image_url, stock, price) values (' + str(index) + ", '" + product["short_description"] + "', '" + product["description"] + "', '"+ product["brand"] + "', '"+ product["name"] + "', '"+ product["image_url"] + "', "+ str(product["stock"]) + ", " + str(product['price']) +');\n')
        sql_output.write('INSERT INTO monitor (id, product_id, screen_size, resolution, special_features, refresh_rate) values (' + str(monitor["product_id"]) + ", " + str(monitor["product_id"]) + ", " + str(monitor["screen_size"]) + ", '"+ str(monitor["resolution"]) + "', '"+ str(monitor["special_features"]) + "', '"+ str(monitor["refresh_rate"])  + '\');\n')

        index += 1
