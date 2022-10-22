const express = require('express')
require('dotenv').config()
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');

const {
    DATABASE_URL,
    db_username,
    db_password,
    database,
} = process.env


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.listen(3000, () => console.log("Server started"))


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
    const [user] = await db.query("select * from user where username = '" + req.body.username + "'")
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
    const [monitors] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id  $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
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
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id  $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
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
    const [books] = await db.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE book.id = $book_id".replace("$book_id", req.query.id))
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
    const [beers] = await db.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE beer.id = $beer_id".replace("$beer_id", req.query.id))
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
    const [monitors] = await db.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE monitor.id = $monitor_id".replace("$monitor_id", req.query.id))
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
                beers.push({ "brand": brands[i].brand, "beers": beers_by_brand })
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