var { mysqlClient } = require('../config/mysqlDB')

const getBeerAnalytics = async (req) => {
    try {
        return await mysqlClient.query(`
    SELECT COUNT(product_order.product_id) AS product_count, beer.product_id, name, image_url, category, price 
    FROM marketplace.order_customer 
    join product_order on product_order.order_id = order_customer.id 
    join product on product_order.product_id = product.id  
    join beer on product.id = beer.product_id  
    where (order_date > '$start_date' and order_date < '$end_date') 
    group by product_order.product_id 
    order by product_count $order
    LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

    } catch (error) {
        console.log(error)
    }

}
const getBookAnalytics = async (req) => {
    try {
        return await mysqlClient.query(`
            SELECT COUNT(product_order.product_id) AS product_count, book.product_id, name, image_url, category, price 
            FROM marketplace.order_customer 
            join product_order on product_order.order_id = order_customer.id 
            join product on product_order.product_id = product.id  
            join book on product.id = book.product_id  
            where (order_date > '$start_date' and order_date < '$end_date') 
            group by product_order.product_id 
            order by product_count $order
            LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

    } catch (error) {
        console.log(error)
    }
}

const getMonitorAnalytics = async (req) => {
    try {
        return await mysqlClient.query(`
        SELECT COUNT(product_order.product_id) AS product_count, monitor.product_id, name, image_url, category, price 
        FROM marketplace.order_customer 
        join product_order on product_order.order_id = order_customer.id 
        join product on product_order.product_id = product.id  
        join monitor on product.id = monitor.product_id  
        where (order_date > '$start_date' and order_date < '$end_date') 
        group by product_order.product_id 
        order by product_count $order
        LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 10).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))
    } catch (error) {
        console.log(error)
    }

}

const getCustomerAnalytics = async (req) => {
    try {
        return await mysqlClient.query(`
        SELECT COUNT(order_customer.customer_id) AS order_count, order_customer.customer_id, name, image_url, created_at, updated_at
        FROM marketplace.order_customer 
        join customer on order_customer.customer_id = customer.id
        join user on customer.user_id = user.id
        where (order_date > '$start_date' and order_date < '$end_date') 
        group by order_customer.customer_id 
        order by order_count $order
        LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 5).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))

    } catch (error) {
        console.log(error)
    }
}

const getExpencesAnalytics = async (req) => {
    try {
        return await mysqlClient.query(`
        SELECT SUM(order_customer.total) AS order_total, order_customer.customer_id, name, image_url
        FROM marketplace.order_customer 
        join customer on order_customer.customer_id = customer.id
        join user on customer.user_id = user.id
        where (order_date > '$start_date' and order_date < '$end_date') 
        group by order_customer.customer_id 
        order by order_total $order
        LIMIT $limit;`.replace("$order", req.query.sorting != null ? req.query.sorting : 'desc').replace("$limit", req.query.limit != null ? req.query.limit : 5).replace("$start_date", req.query.start_date).replace("$end_date", req.query.end_date))
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getBeerAnalytics,
    getBookAnalytics,
    getMonitorAnalytics,
    getCustomerAnalytics,
    getExpencesAnalytics

}