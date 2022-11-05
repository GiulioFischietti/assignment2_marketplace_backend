var { mysqlClient } = require('../databases/mysqlDB')

const getOrdersOfManagerData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT * FROM order_customer ORDER BY order_customer.order_date DESC LIMIT 100;")
        return response
    }
    catch (error) {
        console.log(error)
    }
}

const updateStatusOrderData = async (req) => {
    const response = await mysqlClient.query("UPDATE order_customer SET status = '$status' WHERE id = $id;".replace("$status", req.body.status).replace("$id", req.body.id))
    return response
}


const getOrdersOfUserData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT * FROM order_customer where order_customer.customer_id = $customer_id ORDER BY order_customer.order_date DESC;".replace("$customer_id", req.query.id));
        return response
    } catch (error) {
        console.log(error)
    }
}

const getOrderDetailsData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT product.id as product_id, product.category, product.price, product_order.total, product.image_url, product.name, order_customer.id as order_id, product_order.quantity FROM order_customer INNER JOIN product_order ON order_customer.id = product_order.order_id INNER JOIN product on product_order.product_id = product.id WHERE order_customer.customer_id = $customer_id and order_customer.id = $order_id;".replace("$customer_id", req.query.id).replace("$order_id", req.query.order_id))
        return response
    } catch (error) {
        console.log(error)
    }
}

const createOrderData = async (req) => {

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
module.exports = {
    getOrdersOfManagerData,
    updateStatusOrderData,
    getOrdersOfUserData,
    getOrderDetailsData,
    createOrderData
}