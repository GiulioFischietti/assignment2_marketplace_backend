const express = require('express')
const util = require('util');
require('dotenv').config()
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const redis = require('redis');
const { json } = require('body-parser');

const {
    REDIS_DATABASE_URL,
    REDIS_DATABASE_PORT,
    DATABASE_URL,
    db_username,
    db_password,
    database,
} = process.env


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.listen(3000, () => console.log("Server started"))

const client = redis.createClient({
    socket: {
        host: REDIS_DATABASE_URL,
        port: REDIS_DATABASE_PORT
    }
});
client.get = util.promisify(client.get);

const db = mysql.createPool({
    host: DATABASE_URL,
    user: db_username,
    password: db_password,
    database: database,
    port: 3306
}).promise()



app.get('/', async (req, res) => {

    try {
        const [rows] = await db.query('select * from user')
        res.status(200).send({ data: rows })
    } catch (error) {
        console.log(error)
        res.status(500).send({ "error": error })
    }
})

app.post('/signup', async (req, res) => {
    try {
        const [users] = await db.query("select * from user where username = '" + req.body.username + "'")
        console.log(users)
        if (users.length == 0) {

            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await db.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');")
            const [user] = await db.query("select name, username from user where username = '" + req.body.username + "'")
            res.status(200).send({ success: true, data: user[0] });
        }
        else {
            res.status(200).send({ success: false, data: "Username already registered" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, data: error })
    }
})

app.post('/login', async (req, res) => {
    const [user] = await db.query("select customer.id, user.name, user.password, user.username, user.image_url, customer.user_id, customer.address, customer.country, customer.phone from user INNER join customer on user.id = customer.user_id where user.username = '$username';".replace("$username", req.body.username))
    console.log(user);
    if (user != []) {
        try {
            if (await bcrypt.compare(req.body.password, user[0].password))
                res.send({ "success": true, data: user[0] })
            else res.status(403).send({ "success": false, data: "Wrong username/password" })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})

app.post('/updateuser', async (req, res) => {
    try {
        await db.query("UPDATE user AS u JOIN customer AS c on u.id = c.user_id SET u.name = '$name', u.username = '$username', c.phone = '$phone', c.address = '$address' WHERE u.id = $id".replace("$name", req.body.name).replace("$username", req.body.username).replace("$phone", req.body.phone).replace("$address", req.body.address).replace("$id", req.body.id))
        const [user] = await db.query("select customer.id, user.name, user.password, user.username, user.image_url, customer.user_id, customer.address, customer.country, customer.phone from user INNER join customer on user.id = customer.user_id where user.username = '$username';".replace("$username", req.body.username))
        console.log(user)
        res.send({ "success": true, data: user[0] })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})


app.get('/getcart', async (req, res) => {
    try {
        var cartItems = []
        var cart_ids = JSON.parse(await client.get("cust:$cust_id:cart_ids".replace("$cust_id", req.query.id)))
        if (cart_ids != null) {
            for (let i = 0; i < cart_ids.length; i++) {
                var cartItem = JSON.parse(await client.get("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_ids[i])))
                // console.log("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_ids[i]))
                var cartItemQuantity = await client.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_ids[i]))
                // console.log(cartItemQuantity)
                var cartItemProductId = await client.get("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_ids[i]))
                cartItem.quantity = parseInt(cartItemQuantity)
                cartItem.product_id = parseInt(cartItemProductId)
                cartItems.push(cartItem)
            }
        }
        res.status(200).send({ data: cartItems })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

// removal can be simplified by removing by id: if quantity==0 pop that id from cart_ids, otherwise quantity-- where cust:$user_id:$cart_item_id = id
app.post('/removefromcart', async (req, res) => {
    try {

        client.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id)).then(async (reply) => {
            if (reply - 1 == 0) {
                client.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
                client.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
                client.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))

                var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id)))
                var index = currentIds.indexOf(req.body.id);
                currentIds.splice(index, 1);
                client.set("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIds))

            } else {
                client.set("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id), (parseInt(reply) - 1))
            }
        })
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

app.post('/removeallitemfromcart', async (req, res) => {
    try {
        client.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
        client.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
        client.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))

        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id)))
        var index = currentIds.indexOf(req.body.id);
        currentIds.splice(index, 1);
        client.set("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIds))


        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})
app.post('/addtocart', async (req, res) => {
    try {

        var cart_max_index = await client.get("cust:$user_id:cart_max_index".replace("$user_id", req.body.user_id))
        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id)))

        if (currentIds != null && cart_max_index != null) {
            var currentIdsCopy = [...currentIds]
            // console.log(currentIds)
            // console.log(cart_max_index)
            var cart_max_index = parseInt(cart_max_index)
            for (let i = 0; i <= currentIds.length; i++) {
                var productInCart = ((await client.get("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", currentIds[i]))) == req.body.product_id)
                if (productInCart) {
                    client.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", currentIds[i])).then((reply) => {
                        client.set("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", currentIds[i]), (parseInt(reply) + 1))
                    })
                    break
                }
            }
            if (!productInCart) {
                currentIdsCopy.push(cart_max_index + 1)
                req.body.id = cart_max_index + 1
                client.set("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIdsCopy))
                client.set("cust:$cust_id:$cart_max_index:quantity".replace("$cart_max_index", cart_max_index + 1).replace("$cust_id", req.body.user_id), 1)
                client.set("cust:$cust_id:$cart_max_index:product_id".replace("$cart_max_index", cart_max_index + 1).replace("$cust_id", req.body.user_id), req.body.product_id)
                client.set("cust:$cust_id:cart_max_index".replace("$cust_id", req.body.user_id), cart_max_index + 1)
                client.set("cust:$cust_id:$cart_max_index:cart_item".replace("$cart_max_index", cart_max_index + 1).replace("$cust_id", req.body.user_id), JSON.stringify(req.body))
            }
        } else {
            req.body.id = 1
            client.set("cust:$cust_id:cart_ids".replace("$cust_id", req.body.user_id), JSON.stringify([1]))
            client.set("cust:$cust_id:$cart_max_index:product_id".replace("$cart_max_index", cart_max_index + 1).replace("$cust_id", req.body.user_id), req.body.product_id)
            client.set("cust:$cust_id:1:quantity".replace("$cust_id", req.body.user_id), 1)
            client.set("cust:$cust_id:cart_max_index".replace("$cust_id", req.body.user_id), 1)
            client.set("cust:$cust_id:1:cart_item".replace("$cart_max_index", cart_max_index + 1).replace("$cust_id", req.body.user_id), JSON.stringify(req.body))
        }
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})


app.get('/orders', async (req, res) => {
    const [orders] = await db.query("SELECT * FROM order_customer where order_customer.customer_id = $customer_id ORDER BY order_customer.order_date DESC;".replace("$customer_id", req.query.id))
    if (orders != []) {
        try {
            res.send({ "success": true, data: orders })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.get('/orderdetails', async (req, res) => {
    const [orders] = await db.query("SELECT product.id as product_id, product.category, product.price, product_order.total, product.image_url, product.name, order_customer.id as order_id, product_order.quantity FROM order_customer INNER JOIN product_order ON order_customer.id = product_order.order_id INNER JOIN product on product_order.product_id = product.id WHERE order_customer.customer_id = $customer_id and order_customer.id = $order_id;".replace("$customer_id", req.query.id).replace("$order_id", req.query.order_id))
    if (orders != []) {
        try {
            res.send({ "success": true, data: orders })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.get('/beers', async (req, res) => {
    const [beers] = await db.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
    if (beers != []) {
        try {

            res.send({ "success": true, data: beers })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})

app.get('/monitors', async (req, res) => {
    const [monitors] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
    if (monitors != []) {
        try {

            res.send({ "success": true, data: monitors })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})

app.get('/books', async (req, res) => {
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
    console.log("SELECT * FROM product INNER JOIN book ON product.id = book.product_id LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
    if (books != []) {
        try {

            res.send({ "success": true, data: books })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})


app.get('/bookbyid', async (req, res) => {
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE book.product_id = $book_id".replace("$book_id", req.query.product_id))
    if (books != []) {
        try {
            res.send({ "success": true, data: books[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.get('/beerbyid', async (req, res) => {
    const [beers] = await db.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE beer.product_id = $beer_id".replace("$beer_id", req.query.product_id))
    if (beers != []) {
        try {
            res.send({ "success": true, data: beers[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.get('/monitorbyid', async (req, res) => {
    const [monitors] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE monitor.product_id = $monitor_id".replace("$monitor_id", req.query.product_id))
    if (monitors != []) {
        try {
            res.send({ "success": true, data: monitors[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})


app.get('/booksbybrand', async (req, res) => {
    const [brands] = await db.query("SELECT DISTINCT brand FROM product INNER JOIN book ON product.id = book.product_id GROUP BY product.brand")

    if (brands != []) {

        try {
            var books = []
            for (let i = 0; i < brands.length; i++) {
                const [books_by_brand] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE product.brand = '$brand'".replace("$brand", brands[i].brand))
                books.push({ "brand": brands[i].brand, "books": books_by_brand })
            }
            res.send({ "success": true, data: books })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})


app.get('/monitorsbybrand', async (req, res) => {
    const [brands] = await db.query("SELECT DISTINCT brand FROM product INNER JOIN monitor ON product.id = monitor.product_id GROUP BY product.brand")

    if (brands != []) {

        try {
            var monitors = []
            for (let i = 0; i < brands.length; i++) {
                const [monitors_by_brand] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE product.brand = '$brand'".replace("$brand", brands[i].brand))
                monitors.push({ "brand": brands[i].brand, "monitors": monitors_by_brand })
            }
            res.send({ "success": true, data: monitors })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})


app.get('/beersbybrand', async (req, res) => {
    const [brands] = await db.query("SELECT DISTINCT brand FROM product INNER JOIN beer ON product.id = beer.product_id GROUP BY product.brand")

    if (brands != []) {

        try {
            var beers = []
            for (let i = 0; i < brands.length; i++) {
                const [beers_by_brand] = await db.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE product.brand = '$brand'".replace("$brand", brands[i].brand))
                beers.push({ "brand": brands[i].brand, "beer": beers_by_brand })
            }
            res.send({ "success": true, data: beers })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})



app.post('/searchproducts', async (req, res) => {
    const [products] = await db.query("SELECT * FROM product WHERE name LIKE '%$keyword%'".replace("$keyword", req.body.keyword != null ? req.body.keyword : ""))
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
       
        var rows = await db.query("INSERT INTO order_customer (customer_id, order_date, shipping_country, shipping_address, payment_type, status, total) VALUES ('$customer_id', '$order_date', '$shipping_country', '$shipping_address', '$payment_type', '$status', '$total');"
            .replace("$customer_id", req.body.id)
            .replace("$order_date", (new Date()).toLocaleString())
            .replace("$shipping_country", req.body.shipping_country)
            .replace("$shipping_address", req.body.shipping_address)
            .replace("$payment_type", req.body.payment_type)
            .replace("$status", "Paid")
            .replace("$total", req.body.product_orders.map((e) => e.price * e.quantity)
                .reduce((a, b) => a + b)))

        for (let i = 0; i < req.body.product_orders.length; i++) {
            db.query("INSERT INTO product_order (order_id, product_id, quantity, total) VALUES ('$order_id', '$product_id', '$quantity', '$total');"
                .replace("$order_id", rows[0].insertId)
                .replace("$product_id", req.body.product_orders[i].product_id)
                .replace("$quantity", req.body.product_orders[i].quantity)
                .replace("$total", req.body.product_orders[i].price * req.body.product_orders[i].quantity)
            )
            db.query("UPDATE product SET stock = stock - $quantity WHERE id = $product_id".replace("$product_id", req.body.product_orders[i].product_id).replace("$quantity", req.body.product_orders[i].quantity))
        }

        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_ids".replace("$cust_id", req.body.id)))

        for (let i = 0; i < currentIds.length; i++) {
            client.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            client.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            client.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
        }
        client.set("cust:$cust_id:cart_ids".replace("$cust_id", req.body.id), JSON.stringify([]))
        res.send({ "success": true, data: null })
    
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})