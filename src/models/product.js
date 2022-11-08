var { mysqlClient } = require('../config/mysqlDB');
class Product {

    constructor(data) {
        this.id = data.id != null ? data.id : data.product_id;
        this.name = data.name;
        this.short_description = data.short_description;
        this.description = data.description;
        this.brand = data.brand;
        this.image_url = data.image_url;
        this.price = data.price;
        this.stock = data.stock;
        this.category = data.category;
        this.deleted = data.deleted;
    }

    static getProductCategories = async () => {
        try {
            return await mysqlClient.query("SELECT DISTINCT product.category FROM product GROUP BY product.category")
        } catch (error) {
            console.log(error)
        }
    }

    static getProductsByCategory = async (category) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product WHERE product.category='$category' order by product.id desc".replace(/\$category/g, category))
            return response.map((item)=>new Product(item))
        } catch (error) {
            console.log(error)
        }
    }

    static searchProductsData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT id as product_id, name, brand, image_url, category, price, short_description, description FROM product WHERE name LIKE '%$keyword%'".replace("$keyword", req.body.keyword != null ? req.body.keyword : ""))
            return response.map((item)=>new Product(item))
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    Product
}