from datetime import datetime, timedelta
from itertools import product
import json
from random import randint, random


sql_output = open('order.sql', 'a')

sql_output.write('USE marketplace;\n')

c = open('customer.json')
customers = json.load(c)

p = open('product.json')
products = json.load(p)

payment_types = ['card', 'cash']
statuses = ['Paid', 'In preparation', 'Shipped', 'Delivered']

order_index = 1
product_order_index = 1
for idx, customer in list(enumerate(customers)):
    
    n_orders = randint(1,20)

    for i in list(range(n_orders)):
        order = {}
        order['total'] = 0

        order['order_index'] = order_index
        order['customer_id'] = customer['id']
        order_date = datetime(2022, randint(1,12), randint(1,28), randint(0,23), randint(0,59))
        order['order_date'] = order_date

        status = statuses[randint(0,3)]
        order['status'] = status
        if(status != "Paid"):
            order['shipping_date'] = (order_date + timedelta(days=randint(0,3), hours=randint(0,23), minutes=randint(0,59))).strftime('%Y-%m-%d %H:%M:%S')
        else:
            order['shipping_date'] = "NULL"

        order['shipping_address'] = customer['address']
        order['shipping_country'] = customer['country']
        order['payment_type'] = payment_types[randint(0,1)]

        n_product_order = randint(1, 10)
        sql_output.write('INSERT INTO order_customer (id, customer_id, order_date, shipping_date, shipping_address, shipping_country, payment_type, status, total) values (' + str(order_index) + ", " + str(order['customer_id']) + ", '" + str(order['order_date']) + "', '"+  str(order['shipping_date'])  + "', '"+  str(order['shipping_address'])  + "', '"+  str(order['shipping_country']) + "', '"+  str(order['payment_type'])  + "', '"+  str(order['status'])  + "', "+  str(order['total'])  + ');\n')
        
        for i in list(range(n_product_order)):
            product_order = {}
            product_order['id'] = product_order_index
            product_order['order_id'] = order_index
            rand_index = randint(0,998)
            product_id = products[rand_index]['id']
            # print(len(products))
            
            product_order['product_id'] = product_id
            product_order['quantity'] = randint(1,3)
            product_order['total'] = products[product_id-1]['price'] * product_order['quantity']
            
            order['total'] += product_order['total']
            sql_output.write('INSERT INTO product_order (id, product_id, order_id, quantity, total) values (' + str(product_order_index) + ", " + str(product_order["product_id"]) + ", " + str(product_order["order_id"]) + ", "+ str(product_order["quantity"]) + ", "+ str(product_order["total"]) + " "+ ');\n')
            product_order_index += 1

        order_index += 1
