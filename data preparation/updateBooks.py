import csv
import json
from random import randint, random


sql_output = open('update_books.sql', 'a')
sql_output.write('USE marketplace;\n')

file = open('main_dataset.csv', 'r')
reader = list(csv.reader(file))

        
for i in list(range(701,1001)):

    sql_output.write("UPDATE product SET name = '" + reader[i][1].replace("'","") + "', image_url = '" + reader[i][0] + "' where id = " + str(i)+ ';\n')
    