var { mysqlClient } = require('../config/mysqlDB')

class Order {

    constructor(data) {
        this.id = data.id;
        this.customer_id = data.customer_id;
        this.order_date = data.order_date;
        this.shipping_date = data.shipping_date;
        this.shipping_address = data.shipping_address;
        this.shipping_country = data.shipping_country;
        this.payment_type = data.payment_type;
        this.status = data.status;
        this.total = data.total;
        this.shipping_name = data.shipping_name;
    }

    static getOrdersOfManagerData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM order_customer WHERE order_customer.order_date <= '$today' ORDER BY order_customer.order_date DESC LIMIT 100;"
                .replace("$today", (new Date()).toLocaleString()))
            return response.map((item) => new Order(item))
        }
        catch (error) {
            console.log(error)
        }
    }

    static updateStatusOrderData = async (req) => {
        const response = await mysqlClient.query("UPDATE order_customer SET status = '$status' WHERE id = $id;".replace("$status", req.body.status).replace("$id", req.body.id))
        return response
    }


    static getOrdersOfUserData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM order_customer where order_customer.customer_id = $customer_id ORDER BY order_customer.order_date DESC;".replace("$customer_id", req.query.id));
            return response.map((item) => new Order(item))
        } catch (error) {
            console.log(error)
        }
    }

    
    static createOrderData = async (req) => {

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
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = {
    Order
}
