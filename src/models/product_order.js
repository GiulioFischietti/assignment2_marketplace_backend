var { mysqlClient } = require('../config/mysqlDB');
const { Product } = require('./product');

class ProductOrder extends Product {
    constructor(data) {
        super(data);
        this.id = data.id;
        this.order_id = data.order_id;
        this.product_id = data.product_id;
        this.quantity = data.quantity;
        this.total = data.total;
    }

    static getOrderDetailsData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT product.id as product_id, product.category, product.price, product_order.total, product.image_url, product.name, order_customer.id as order_id, product_order.quantity FROM order_customer INNER JOIN product_order ON order_customer.id = product_order.order_id INNER JOIN product on product_order.product_id = product.id WHERE order_customer.customer_id = $customer_id and order_customer.id = $order_id;".replace("$customer_id", req.query.id).replace("$order_id", req.query.order_id))
            return response.map((item)=>new ProductOrder(item))
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = {
    ProductOrder
}