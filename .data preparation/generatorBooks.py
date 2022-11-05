import json
from random import randint, random


sql_output = open('book.sql', 'a')

sql_output.write('USE marketplace;\n')


brands = ["Mondadori", "Feltrinelli", "De Agostini"]
languages = ["IT", "EN", "FR", "DE"]

f = open('mock_data.json')
books = json.load(f)

products = books.copy()

index = 701

for idx, book in list(enumerate(books)):
    
    book['id'] = idx
    book['product_id'] = index
    book['summary'] = products[idx]['description']
    book['n_pages'] = randint(149, 899)
    book['language'] = languages[randint(0, 3)]

    product = {}
    product['id'] = index
    product['short_description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    product['description'] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    product['brand'] = brands[randint(0, 2)]
    product['name'] = book['name'].replace("'","")
    product['image_url'] = ""
    product['stock'] = book['stock']
    product['price'] = book['price']
    
    sql_output.write('INSERT INTO product (id, short_description, description, brand, name, image_url, stock, price) values (' + str(index) + ", '" + product["short_description"] + "', '" + product["description"] + "', '"+ product["brand"] + "', '"+ product["name"] + "', '"+ product["image_url"] + "', "+ str(product["stock"]) + ", " + str(product['price']) +');\n')
    sql_output.write('INSERT INTO book (id, product_id, summary, language, n_pages) values (' + str(idx+1) + ", " + str(book['product_id']) + ", '" + str(book["summary"]) + "', '"+ str(book["language"]) + "', "+ str(book["n_pages"])+ ');\n')

    index += 1
