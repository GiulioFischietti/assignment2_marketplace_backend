var { mysqlClient } = require('../config/mysqlDB');
const { Product } = require('./product');

class Beer extends Product {

    constructor(data) {
        super(data);
        this.id = data.id;
        this.product_id = data.product_id;
        this.ingredients = data.ingredients;
        this.alcohol_percentage = data.alcohol_percentage;
        this.volume_ml = data.volume_ml;
    }

    static getBeerBrands = async () => {
        try {
            return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN beer ON product.id = beer.product_id GROUP BY product.brand")
        } catch (error) {
            console.log(error)
        }
    }


    static getBeersByBrandData = async (brand) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
            return response.map((item)=> new Beer(item))
        } catch (error) {
            console.log(error)
        }
    }

    static createBeerData = async (req) => {
        try {
            const [createdProduct] = await mysqlClient.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('beer', '$name', '$brand', '$short_description', '$description', $price, $stock)"
                .replace("$name", req.body.name)
                .replace("$short_description", req.body.short_description)
                .replace("$description", req.body.description)
                .replace("$price", req.body.price)
                .replace("$stock", req.body.stock)
                .replace("$brand", req.body.brand))

            mysqlClient.query("INSERT INTO beer (product_id, volume_ml, alcohol_percentage) VALUES ($product_id, $volume_ml, $alcohol_percentage)"
                .replace("$product_id", createdProduct.insertId)
                .replace("$volume_ml", req.body.volume_ml)
                .replace("$alcohol_percentage", req.body.alcohol_percentage))

        } catch (error) {
            console.log(error)
        }
    }

    static getBeersData = async (req) => {
        try {
            const response = await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
            return response
        } catch (error) {
            console.log(error)
        }
    }

    static getBeerByIdData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE beer.product_id = $beer_id".replace("$beer_id", req.query.product_id))
            return new Beer(response[0])
        } catch (error) {
            console.log(error)
        }
    }

    static updateBeerData = async (req) => {
        try {
            const response = await mysqlClient.query("UPDATE product AS p JOIN beer AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price, p.stock = $stock, b.alcohol_percentage = $alcohol_percentage, b.volume_ml = $volume_ml WHERE b.product_id = '$product_id'"
                .replace("$name", req.body.name)
                .replace("$short_description", req.body.short_description)
                .replace("$description", req.body.description)
                .replace("$price", req.body.price)
                .replace("$alcohol_percentage", req.body.alcohol_percentage)
                .replace("$volume_ml", req.body.volume_ml)
                .replace("$product_id", req.body.product_id)
                .replace("$stock", req.body.stock)
                .replace("$brand", req.body.brand))
            return response
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    Beer
}