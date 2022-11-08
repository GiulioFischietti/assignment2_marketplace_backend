const { mysqlClient } = require("../config/mysqlDB");
const { Product } = require("./product");

class Book extends Product {
    constructor(data) {
        super(data)
        this.id = data.id;
        this.product_id = data.product_id;
        this.summary = data.summary;
        this.language = data.language;
        this.n_pages = data.n_pages;
    }

    static updateBookData = async (req) => {
        try {
            const response = await mysqlClient.query("UPDATE product AS p JOIN book AS b on p.id = b.product_id SET p.name = '$name',p.brand = '$brand', p.short_description = '$short_description', p.description = '$description', p.price = $price,p.stock = $stock,  b.summary = '$summary', b.language = '$language', b.language = '$language', b.n_pages = $n_pages WHERE b.product_id = $product_id"
                .replace("$name", req.body.name)
                .replace("$short_description", req.body.short_description)
                .replace("$description", req.body.description)
                .replace("$price", req.body.price)
                .replace("$n_pages", req.body.n_pages)
                .replace("$language", req.body.language)
                .replace("$summary", req.body.summary)
                .replace("$product_id", req.body.product_id)
                .replace("$stock", req.body.stock)
                .replace("$brand", req.body.brand))
            return response
        }
        catch (error) {
            console.log(error)
        }
    }

    static getBooksData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
            return response.map((item) => new Book(item))
        } catch (error) {
            console.log(error)
        }
    }

    static getBookByIdData = async (req) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE book.product_id = $book_id".replace("$book_id", req.query.product_id))
            return new Book(response[0])
        } catch (error) {
            console.log(error)
        }
    }


    static getBookBrands = async () => {
        try {
            return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN book ON product.id = book.product_id GROUP BY product.brand")
        } catch (error) {
            console.log(error)
        }
    }

    static getBooksByBrandData = async (brand) => {
        try {
            const [response] = await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
            return response.map((item) => new Book(item))
        } catch (error) {
            console.log(error)
        }
    }


    static createBookData = async (req) => {
        try {
            const [createdProduct] = await mysqlClient.query("INSERT INTO product (category, name, brand, short_description, description,price,stock) VALUES ('book', '$name', '$brand', '$short_description', '$description', $price, $stock)"
                .replace("$name", req.body.name)
                .replace("$short_description", req.body.short_description)
                .replace("$description", req.body.description)
                .replace("$price", req.body.price)
                .replace("$stock", req.body.stock)
                .replace("$brand", req.body.brand))

            mysqlClient.query("INSERT INTO book (product_id, summary, n_pages) VALUES ($product_id, '$summary', $n_pages)"
                .replace("$product_id", createdProduct.insertId)
                .replace("$summary", req.body.summary)
                .replace("$n_pages", req.body.n_pages))


        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    Book
}