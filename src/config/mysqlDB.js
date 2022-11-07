var mysql = require('mysql2');

const {
    DATABASE_URL,
    db_username,
    db_password,
    database,
} = process.env

const mysqlClient = mysql.createPool({
    host: DATABASE_URL,
    user: db_username,
    password: db_password,
    database: database,
    port: 3306
}).promise()


module.exports = { mysqlClient }