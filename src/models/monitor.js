const { mysqlClient } = require("../config/mysqlDB");
const { Product } = require("./product");

class Monitor extends Product {
    constructor(data) {
        super(data);
        this.id = data.id;
        this.product_id = data.product_id;
        this.screen_size = data.screen_size;
        this.resolution = data.resolution;
        this.special_features = data.special_features;
        this.refresh_rate = data.refresh_rate;
    }

    static updateMonitorData = async (req) => {
        try {
            const response = await mysqlClient.query("UPDATE product AS p JOIN monitor AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price,p.stock = $stock,  b.refresh_rate = $refresh_rate, b.resolution = '$resolution', b.special_features = '$special_features' WHERE b.product_id = '$product_id'"
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
            return response
        } catch (error) {
            console.log(error)
        }
    }


    static getMonitorsData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
            return response.map((item) => new Monitor(item))
        } catch (error) {
            console.log(error)
        }
    }


    static getMonitorByIdData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE monitor.product_id = $monitor_id".replace("$monitor_id", req.query.product_id))
            return new Monitor(response[0])
        } catch (error) {
            console.log(error)
        }
    }


    static getMonitorBrands = async () => {
        try {
            return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN monitor ON product.id = monitor.product_id GROUP BY product.brand")
        } catch (error) {
            console.log(error)
        }
    }

    static getMonitorsByBrandData = async (brand) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
            return response.map((item) => new Monitor(item))
        } catch (error) {
            console.log(error)
        }
    }


    static createMonitorData = async (req) => {
        try {
            const [createdProduct] = await mysqlClient.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('monitor', '$name', '$brand', '$short_description', '$description', $price, $stock)"
                .replace("$name", req.body.name)
                .replace("$short_description", req.body.short_description)
                .replace("$description", req.body.description)
                .replace("$price", req.body.price)
                .replace("$stock", req.body.stock)
                .replace("$brand", req.body.brand))

            mysqlClient.query("INSERT INTO monitor (product_id, refresh_rate, special_features, screen_size, resolution) VALUES ($product_id, $refresh_rate, '$special_features', $screen_size, '$resolution')"
                .replace("$product_id", createdProduct.insertId)
                .replace("$refresh_rate", req.body.refresh_rate)
                .replace("$special_features", req.body.special_features)
                .replace("$resolution", req.body.resolution)
                .replace("$screen_size", req.body.screen_size))
        } catch (error) {
            console.log(error)
        }
    }




}

module.exports = {
    Monitor
}