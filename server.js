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
            const newUser = await db.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');" )
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
                res.send({ "success": true, data: user })
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
