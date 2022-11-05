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


module.exports = { 
    getOrdersOfManagerData,
    updateStatusOrderData,
    getOrdersOfUserData,
    getOrderDetailsData
}