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
app.listen(3000, "0.0.0.0", ()=>console.log("Server started"));

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
app.post('/signupasamanager', async (req, res) => {
    try {
        const [users] = await db.query("select * from user where username = '" + req.body.username + "'")
    
        if (users.length == 0) {

            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await db.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');")
            const newManager = await db.query("INSERT INTO manager (user_id) values ('"  + newUser[0].insertId +  "');")
            
            const [user] = await db.query("select * from user INNER join manager on user.id = manager.user_id where user.username = '$username';".replace("$username", req.body.username))
            res.status(200).send({ success: true, data: user[0] });
        }
        else {
            console.log("Manager already registered")
            res.status(500).send({ success: false, data: "Username already registered" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, data: error })
    }
})
app.post('/signup', async (req, res) => {
    try {
        const [users] = await db.query("select * from user where username = '" + req.body.username + "'")
    
        if (users.length == 0) {

            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await db.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');")
            const newCustomer = await db.query("INSERT INTO customer (address, phone, user_id) values ('" + req.body.address + "', '" + req.body.phone + "', '" + newUser[0].insertId +  "');")
            
            const [user] = await db.query("select customer.id, user.name, user.password, user.username, user.image_url, customer.user_id, customer.address, customer.country, customer.phone from user INNER join customer on user.id = customer.user_id where user.username = '$username';".replace("$username", req.body.username))
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
    console.log("helo")
    const [user] = await db.query("select customer.id, user.name, user.password, user.username, user.image_url, customer.user_id, customer.address, customer.country, customer.phone from user INNER join customer on user.id = customer.user_id where user.username = '$username';".replace("$username", req.body.username))
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
app.post('/updatestatusorder', async (req, res) => {

    try {
        db.query("UPDATE order_customer SET status = '$status' WHERE id = $id;".replace("$status", req.body.status).replace("$id", req.body.id))
        res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

app.post('/loginasmanager', async (req, res) => {
    console.log("Hello")
    const [user] = await db.query("select * from user INNER join manager on user.id = manager.user_id where user.username = '$username';".replace("$username", req.body.username))
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
        var cart_product_ids = JSON.parse(await client.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.query.id)))
        console.log("cust:$cust_id:cart_product_ids".replace("$cust_id", req.query.id))
        console.log(cart_product_ids)
        if (cart_product_ids != null) {
            for (let i = 0; i < cart_product_ids.length; i++) {
                // console.log("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_product_ids[i]))
                var cartItemQuantity = await client.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.query.id).replace("$cart_item_index", cart_product_ids[i]))
                // console.log(cartItemQuantity)
                var cartItemProductId =  cart_product_ids[i]
                
                var cartItem = JSON.parse(await client.get("prod:$product_id".replace("$product_id", cartItemProductId)))

                
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

// removal can be simplified by removing by id: if quantity==0 pop that id from cart_product_ids, otherwise quantity-- where cust:$user_id:$cart_item_id = id
app.post('/removefromcart', async (req, res) => {
    try {
        console.log("Removing " + req.body.id)

        client.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id)).then(async (reply) => {
            if (reply - 1 == 0) {
                client.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
                client.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
                client.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))

                var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id)))
                var index = currentIds.indexOf(req.body.id);
                currentIds.splice(index, 1);
                client.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIds))

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

        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id)))

        var index = currentIds.indexOf(req.body.id);
        currentIds.splice(index, 1);
        client.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIds))


        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

app.post('/addtocart', async (req, res) => {
    try {
        
        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id)))
        
        var product_in_redis = false;
        product_in_redis = await client.get("prod:$product_id".replace("$product_id", req.body.product_id))
        
        if(!product_in_redis) {
            client.set("prod:$product_id".replace("$product_id", req.body.product_id), JSON.stringify(req.body))
        }
        
        if (currentIds != null) {
            var currentIdsCopy = [...currentIds]
            // console.log(currentIds)
            // console.log(cart_max_index)
            // var cart_max_index = parseInt(cart_max_index)
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
                currentIdsCopy.push(req.body.product_id)
                // req.body.id = req.body.product_id
                client.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIdsCopy))
                client.set("cust:$cust_id:$cart_item_index:quantity".replace("$cart_item_index", req.body.product_id).replace("$cust_id", req.body.user_id), 1)
                client.set("cust:$cust_id:$cart_item_index:product_id".replace("$cart_item_index", req.body.product_id).replace("$cust_id", req.body.user_id), req.body.product_id)
            }
        } else {
            client.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id), JSON.stringify([req.body.product_id]))
            client.set("cust:$cust_id:$cart_item_index:product_id".replace("$cart_item_index", req.body.product_id).replace("$cust_id", req.body.user_id), req.body.product_id)
            client.set("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.product_id), 1)
        }
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})


app.get('/orders', async (req, res) => {
    console.log("test")
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

app.get('/managerorders', async (req, res) => {
    const [orders] = await db.query("SELECT * FROM order_customer ORDER BY order_customer.order_date DESC LIMIT 100;")
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
    const [beers] = await db.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
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
    const [monitors] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
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
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
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


app.post('/updatebook', async (req, res) => {

    const [books] = await db.query("UPDATE product AS p JOIN book AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price,p.stock = $stock,  b.summary = '$summary', b.language = '$language', b.language = '$language', b.n_pages = $n_pages WHERE b.product_id = $product_id"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$n_pages", req.body.n_pages)
        .replace("$language", req.body.language)
        .replace("$summary", req.body.summary)
        .replace("$product_id", req.body.product_id)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))
    console.log(books)
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

app.post('/updatebeer', async (req, res) => {
    console.log(req.body)
    const [beers] = await db.query("UPDATE product AS p JOIN beer AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price, p.stock = $stock, b.alcohol_percentage = $alcohol_percentage, b.volume_ml = $volume_ml WHERE b.product_id = '$product_id'"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$alcohol_percentage", req.body.alcohol_percentage)
        .replace("$volume_ml", req.body.volume_ml)
        .replace("$product_id", req.body.product_id)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))
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
app.post('/createbeer', async (req, res) => {
    console.log(req.body)
    const [createdProduct] = await db.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('beer', '$name', '$brand', '$short_description', '$description', $price, $stock)"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))

    const [createdBeer] = await db.query("INSERT INTO beer (product_id, volume_ml, alcohol_percentage) VALUES ($product_id, $volume_ml, $alcohol_percentage)"
        .replace("$product_id", createdProduct.insertId)
        .replace("$volume_ml", req.body.volume_ml)
        .replace("$alcohol_percentage", req.body.alcohol_percentage))


    if (createdBeer != []) {
        try {
            res.send({ "success": true, data: createdBeer[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.post('/createbook', async (req, res) => {
    console.log(req.body)
    const [createdProduct] = await db.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('book', '$name', '$brand', '$short_description', '$description', $price, $stock)"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))

    const [createdBook] = await db.query("INSERT INTO book (product_id, summary, n_pages) VALUES ($product_id, '$summary', $n_pages)"
        .replace("$product_id", createdProduct.insertId)
        .replace("$summary", req.body.summary)
        .replace("$n_pages", req.body.n_pages))


    if (createdBook != []) {
        try {
            res.send({ "success": true, data: createdBook[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})


app.post('/createmonitor', async (req, res) => {
    console.log(req.body)
    const [createdProduct] = await db.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('monitor', '$name', '$brand', '$short_description', '$description', $price, $stock)"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))

    const [createdMonitor] = await db.query("INSERT INTO monitor (product_id, refresh_rate, special_features, screen_size, resolution) VALUES ($product_id, $refresh_rate, '$special_features', $screen_size, '$resolution')"
        .replace("$product_id", createdProduct.insertId)
        .replace("$refresh_rate", req.body.refresh_rate)
        .replace("$special_features", req.body.special_features)
        .replace("$resolution", req.body.resolution)
        .replace("$screen_size", req.body.screen_size))
    console.log(createdMonitor)
    if (createdMonitor != []) {
        try {
            res.send({ "success": true, data: createdMonitor[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
})
app.post('/updatemonitor', async (req, res) => {
    const [monitors] = await db.query("UPDATE product AS p JOIN monitor AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price,p.stock = $stock,  b.refresh_rate = $refresh_rate, b.resolution = '$resolution', b.special_features = '$special_features' WHERE b.product_id = '$product_id'"
        .replace("$name", req.body.name)
        .replace("$short_description", req.body.short_description)
        .replace("$description", req.body.description)
        .replace("$price", req.body.price)
        .replace("$refresh_rate", req.body.refresh_rate)
        .replace("$resolution", req.body.resolution)
        .replace("$special_features", req.body.special_features)
        .replace("$product_id", req.body.product_id)
        .replace("$stock", req.body.stock)
        .replace("$brand", req.body.brand))
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


app.get('/bookbyid', async (req, res) => {
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE book.product_id = $book_id".replace("$book_id", req.query.product_id))
    console.log(req.query)
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
    console.log(req.query)
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
    console.log(req.query)
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

app.get('/productsbycategory', async (req, res) => {
    const [categories] = await db.query("SELECT DISTINCT product.category FROM product GROUP BY product.category")
    if (categories != []) {
        try {
            var products = []
            for (let i = 0; i < categories.length; i++) {
                console.log("SELECT * FROM product WHERE product.category = '$category' orderby id desc".replace("$category", categories[i].category))
                const [products_by_category] = await db.query("SELECT * FROM product WHERE product.category='$category' order by product.id desc".replace(/\$category/g, categories[i].category))
                products.push({ "category": categories[i].category, "products": products_by_category })
            }
            res.send({ "success": true, data: products })
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
    const [products] = await db.query("SELECT id as product_id, name, brand, image_url, category, price, short_description, description FROM product WHERE name LIKE '%$keyword%'".replace("$keyword", req.body.keyword != null ? req.body.keyword : ""))
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

        var currentIds = JSON.parse(await client.get("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.id)))

        for (let i = 0; i < currentIds.length; i++) {
            client.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            client.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
            client.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.id).replace("$cart_item_index", currentIds[i]))
        }
        client.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.id), JSON.stringify([]))
        res.send({ "success": true, data: null })

    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

app.get('/productanalytics', async (req, res) => {

    try {
        const [beer_analytics] = await db.query(`
    SELECT COUNT(product_order.product_id) AS product_count, beer.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join beer on product.id = beer.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        const [book_analytics] = await db.query(`
    SELECT COUNT(product_order.product_id) AS product_count, book.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join book on product.id = book.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

        const [monitor_analytics] = await db.query(`
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
       
        const [users] = await db.query(`
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
       
        const [users] = await db.query(`
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