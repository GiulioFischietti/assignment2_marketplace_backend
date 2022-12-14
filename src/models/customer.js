const { mysqlClient } = require('../config/mysqlDB');
const { User } = require('./user');

class Customer extends User {
    constructor(data) {
        super(data);
        this.id = data.id;
        this.user_id = data.user_id;
        this.country = data.country;
        this.address = data.address;
        this.phone = data.phone;
    }


    static getCustomerByUsername = async (req) => {
        try {
            const [response] = await mysqlClient.query("select * from user INNER join customer on user.id = customer.user_id where user.username = '$username';".replace("$username", req.body.username))
            return response.map((item)=> new Customer(item))
        } catch (error) {
            console.log(error)
        }
    }

    static createCustomer = async (req, hashedPassword) => {
        try {
            const newUser = await mysqlClient.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');")
            const newCustomer = await mysqlClient.query("INSERT INTO customer (address, phone, user_id) values ('" + req.body.address + "', '" + req.body.phone + "', '" + newUser[0].insertId + "');")
            return newCustomer
        } catch (error) {
            console.log(error)
        }
    }


    static updateCustomer = async (req) => {
        try {
            const response = await mysqlClient.query("UPDATE user AS u JOIN customer AS c on u.id = c.user_id SET u.name = '$name', u.username = '$username', c.phone = '$phone', c.address = '$address' WHERE u.id = $id".replace("$name", req.body.name).replace("$username", req.body.username).replace("$phone", req.body.phone).replace("$address", req.body.address).replace("$id", req.body.id))
            return response
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    Customer
}