const express = require('express')
require('dotenv').config()
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');


var { redisClient } = require('./databases/redisDB');
var { mysqlClient } = require('./databases/mysqlDB');

const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const authController = require('./controllers/authController');
const cartController = require('./controllers/cartController');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.listen(3000, "0.0.0.0", ()=>console.log("Server started"));


app.post('/signupasamanager', authController.signUpAsManager)
app.post('/loginasmanager', authController.logInAsManager)


app.post('/signup', authController.signUp)
app.post('/login', authController.logIn)

app.post('/updateuser', authController.updateCustomer)

app.post('/updatestatusorder', orderController.updateStatusOrder)



app.get('/getcart', cartController.getCart)
app.post('/removefromcart', cartController.removeFromCart)
app.post('/removeallitemfromcart', cartController.removeAllItemFromCart)
app.post('/addtocart', cartController.addToCart)


app.get('/orders', orderController.getOrdersOfUser);
app.get('/orderdetails', orderController.getOrderDetails)

app.get('/managerorders', orderController.getOrdersOfManager)

app.get('/beers', productController.getBeers)
app.get('/monitors', productController.getMonitors)
app.get('/books', productController.getBooks)

app.post('/updatebook', productController.updateBook)
app.post('/updatebeer', productController.updateBeer)
app.post('/updatemonitor', productController.updateMonitor)


app.post('/createbeer', productController.createBeer)
app.post('/createbook', productController.createBook)
app.post('/createmonitor', productController.createMonitor)

app.get('/bookbyid', productController.getBookById)
app.get('/beerbyid', productController.getBeerById)
app.get('/monitorbyid', productController.getMonitorById)


app.get('/booksbybrand', productController.getBooksByBrand)
app.get('/monitorsbybrand', productController.getMonitorsByBrand)
app.get('/beersbybrand', productController.getBeersByBrand)

app.get('/productsbycategory', productController.getProductsByCategory)


app.post('/searchproducts', async (req, res) => {
    const [products] = await mysqlClient.query("SELECT id as product_id, name, brand, image_url, category, price, short_description, description FROM product WHERE name LIKE '%$keyword%'".replace("$keyword", req.body.keyword != null ? req.body.keyword : ""))
    if (products != []) {
        try {

            res.send({ "success": true, data: products })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(200).send({ success: false, data: "No products found" });
    }
})

app.post('/createorder', async (req, res) => {
    try {

        var rows = await mysqlClient.query("INSERT INTO order_customer (customer_id, order_date, shipping_country, shipping_address, payment_type, status, total) VALUES ('$customer_id', '$order_date', '$shipping_country', '$shipping_address', '$payment_type', '$status', '$total');"
            .replace("$customer_id", req.body.id)
            .replace("$order_date", (new Date()).toLocaleString())
            .replace("$shipping_country", req.body.shipping_country)
            .replace("$shipping_address", req.body.shipping_address)
            .replace("$payment_type", req.body.payment_type)
            .replace("$status", "Paid")
            .replace("$total", req.body.product_orders.map((e) => e.price * e.quantity)
                .reduce((a, b) => a + b)))

        for (let i = 0; i < req.body.product_orders.length; i++) {
            mysqlClient.query("INSERT INTO product_order (order_id, product_id, quantity, total) VALUES ('$order_id', '$product_id', '$quantity', '$total');"
                .replace("$order_id", rows[0].insertId)
                .replace("$product_id", req.body.product_orders[i].product_id)
                .replace("$quantity", req.body.product_orders[i].quantity)
                .replace("$total", req.body.product_orders[i].price * req.body.product_orders[i].quantity)
            )
            mysqlClient.query("UPDATE product SET stock = stock - $quantity WHERE id = $product_id".replace("$product_id", req.body.product_orders[i].product_id).replace("$quantity", req.body.product_orders[i].quantity))
        }

        var currentIds = JSON.parse(await redisClient.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.id)))

        for (let i = 0; i < currentIds.length; i++) {
            redisClient.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            redisClient.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            redisClient.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
        }
        redisClient.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.id), JSON.stringify([]))
        res.send({ "success": true, data: null })

    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

app.get('/productanalytics', async (req, res) => {

    try {
        const [beer_analytics] = await mysqlClient.query(`
    SELECT COUNT(product_order.product_id) AS product_count, beer.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join beer on product.id = beer.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        const [book_analytics] = await mysqlClient.query(`
    SELECT COUNT(product_order.product_id) AS product_count, book.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join book on product.id = book.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        const [monitor_analytics] = await mysqlClient.query(`
    SELECT COUNT(product_order.product_id) AS product_count, monitor.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join monitor on product.id = monitor.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        res.send({ "success": true, data: { "beers": beer_analytics, "books": book_analytics, "monitors": monitor_analytics } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

})


app.get('/customeranalytics', async (req, res) => {

    try {
       
        const [users] = await mysqlClient.query(`
        SELECT COUNT(order_customer.customer_id) AS order_count, order_customer.customer_id, name, image_url
        FROM marketplace.order_customer 
        join customer on order_customer.customer_id = customer.id
        join user on customer.user_id = user.id
        where (order_date > '$start_date' and order_date < '$end_date') 
        group by order_customer.customer_id 
        order by order_count $order
        LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 5).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        res.send({ "success": true, data: { "users": users } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

})



app.get('/expencesanalytics', async (req, res) => {

    try {
       
        const [users] = await mysqlClient.query(`
        SELECT SUM(order_customer.total) AS order_total, order_customer.customer_id, name, image_url
        FROM marketplace.order_customer 
        join customer on order_customer.customer_id = customer.id
        join user on customer.user_id = user.id
        where (order_date > '$start_date' and order_date < '$end_date') 
        group by order_customer.customer_id 
        order by order_total $order
        LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 5).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        res.send({ "success": true, data: { "users": users } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

})