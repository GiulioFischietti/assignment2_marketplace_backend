var { mysqlClient } = require('../databases/mysqlDB');

const updateBookData = async (req) => {
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

const updateBeerData = async (req) => {
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
const updateMonitorData = async (req) => {
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


const getBeersData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
        return response
    } catch (error) {
        console.log(error)
    }
}
const getMonitorsData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
        return response
    } catch (error) {
        console.log(error)
    }
}
const getBooksData = async (req) => {
    try {
        const response = await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id order by product.id desc LIMIT $limit".replace("$limit", req.body.limit != null ? req.body.limit : 10))
        return response
    } catch (error) {
        console.log(error)
    }
}

const getBookByIdData = async (req) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE book.product_id = $book_id".replace("$book_id", req.query.product_id))
    } catch (error) {
        console.log(error)
    }
}

const getBeerByIdData = async (req) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE beer.product_id = $beer_id".replace("$beer_id", req.query.product_id))
    } catch (error) {
        console.log(error)
    }
}

const getMonitorByIdData = async (req) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE monitor.product_id = $monitor_id".replace("$monitor_id", req.query.product_id))
    } catch (error) {
        console.log(error)
    }
}

const getBookBrands = async () => {
    try {
        return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN book ON product.id = book.product_id GROUP BY product.brand")
    } catch (error) {
        console.log(error)
    }
}

const getBooksByBrandData = async (brand) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN book ON product.id = book.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
    } catch (error) {
        console.log(error)
    }
}

const getMonitorBrands = async () => {
    try {
        return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN monitor ON product.id = monitor.product_id GROUP BY product.brand")
    } catch (error) {
        console.log(error)
    }
}

const getMonitorsByBrandData = async (brand) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN monitor ON product.id = monitor.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
    } catch (error) {
        console.log(error)
    }
}

const getBeerBrands = async () => {
    try {
        return await mysqlClient.query("SELECT DISTINCT brand FROM product INNER JOIN beer ON product.id = beer.product_id GROUP BY product.brand")
    } catch (error) {
        console.log(error)
    }
}


const getBeersByBrandData = async (brand) => {
    try {
        return await mysqlClient.query("SELECT * FROM product INNER JOIN beer ON product.id = beer.product_id WHERE product.brand = '$brand'".replace("$brand", brand))
    } catch (error) {
        console.log(error)
    }
}

const getProductCategories = async () => {
    try {
        return await mysqlClient.query("SELECT DISTINCT product.category FROM product GROUP BY product.category")
    } catch (error) {
        console.log(error)
    }
}

const getProductsByCategory = async (category) => {
    try {
        return await mysqlClient.query("SELECT * FROM product WHERE product.category='$category' order by product.id desc".replace(/\$category/g, category))
    } catch (error) {
        console.log(error)
    }
}

const createBeerData = async (req) => {
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

const createBookData = async (req) => {
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

const createMonitorData = async (req) => {
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


const searchProductsData = async (req) => {
    try {
        const [response] = await mysqlClient.query("SELECT id as product_id, name, brand, image_url, category, price, short_description, description FROM product WHERE name LIKE '%$keyword%'".replace("$keyword", req.body.keyword != null ? req.body.keyword : ""))
        return response
    } catch (error) {
        console.log(error)
    }

}




module.exports = {
    updateBookData,
    updateBeerData,
    updateMonitorData,

    getBeersData,
    getMonitorsData,
    getBooksData,

    getBookByIdData,
    getBeerByIdData,
    getMonitorByIdData,

    getBookBrands,
    getMonitorBrands,
    getBeerBrands,

    getBooksByBrandData,
    getMonitorsByBrandData,
    getBeersByBrandData,

    getProductCategories,

    getProductsByCategory,

    createBeerData,
    createBookData,
    createMonitorData,

    searchProductsData,
    


}