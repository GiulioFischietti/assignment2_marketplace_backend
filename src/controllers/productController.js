const { Beer } = require('../models/beer');
const { Book } = require('../models/book');
const { Monitor } = require('../models/monitor');
const { Product } = require('../models/product');

const updateBook = async (req, res) => {
    try {
        await Book.updateBookData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const updateBeer = async (req, res) => {
    const [beers] = await Beer.updateBeerData(req)
    if (beers != []) {
        try {
            res.send({ "success": true, data: beers[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const updateMonitor = async (req, res) => {
    try {
        const [monitors] = await Monitor.updateMonitorData(req)
        res.send({ "success": true, data: monitors[0] })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const getBeers = async (req, res, next) => {
    const [beers] = await Beer.getBeersData(req)
    try {
        res.send({ "success": true, data: beers })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getBooks = async (req, res, next) => {
    const books = await Book.getBooksData(req)
    try {
        res.send({ "success": true, data: books })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getMonitors = async (req, res, next) => {
    const monitors = await Monitor.getMonitorsData(req)
    try {
        res.send({ "success": true, data: monitors })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getBookById = async (req, res) => {
    try {
        const book = await Book.getBookByIdData(req);
        res.send({ "success": true, data: book })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}



const getBeerById = async (req, res) => {
    const beer = await Beer.getBeerByIdData(req)
    console.log(req.query)
    if (beer != null) {
        try {
            res.send({ "success": true, data: beer })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getMonitorById = async (req, res) => {
    const monitor = await Monitor.getMonitorByIdData(req)
    try {
        res.send({ "success": true, data: monitor })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const getBooksByBrand = async (req, res) => {
    const [brands] = await Book.getBookBrands()
    if (brands != []) {
        try {
            var books = []
            for (let i = 0; i < brands.length; i++) {
                const books_by_brand = await Book.getBooksByBrandData(brands[i].brand)
                books.push({ "brand": brands[i].brand, "books": books_by_brand })
            }
            res.send({ "success": true, data: books })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getMonitorsByBrand = async (req, res) => {
    const [brands] = await Monitor.getMonitorBrands()

    if (brands != []) {

        try {
            var monitors = []
            for (let i = 0; i < brands.length; i++) {
                const monitors_by_brand = await Monitor.getMonitorsByBrandData(brands[i].brand)
                monitors.push({ "brand": brands[i].brand, "monitors": monitors_by_brand })
            }
            res.send({ "success": true, data: monitors })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getBeersByBrand = async (req, res) => {
    const [brands] = await Beer.getBeerBrands()

    if (brands != []) {

        try {
            var beers = []
            for (let i = 0; i < brands.length; i++) {
                const beers_by_brand = await Beer.getBeersByBrandData(brands[i].brand)
                beers.push({ "brand": brands[i].brand, "beer": beers_by_brand })
            }

            res.send({ "success": true, data: beers })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getProductsByCategory = async (req, res) => {
    const [categories] = await Product.getProductCategories()
    if (categories != []) {
        try {
            var products = []
            for (let i = 0; i < categories.length; i++) {
                const products_by_category = await Product.getProductsByCategory(categories[i].category)
                products.push({ "category": categories[i].category, "products": products_by_category })
            }
            res.send({ "success": true, data: products })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const createBeer = async (req, res) => {
    try {
        Beer.createBeerData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const createMonitor = async (req, res) => {
    try {
        Monitor.createMonitorData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const createBook = async (req, res) => {
    try {
        Book.createBookData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const searchProducts = async (req, res) => {
    const products = await Product.searchProductsData(req)
    if (products != []) {
        try {
            res.send({ "success": true, data: products })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(200).send({ success: false, data: "No products found" });
    }
}

module.exports = {
    updateBook,
    updateBeer,
    updateMonitor,

    getBeers,
    getMonitors,
    getBooks,

    getBookById,
    getBeerById,
    getMonitorById,

    getBooksByBrand,
    getMonitorsByBrand,
    getBeersByBrand,

    getProductsByCategory,

    createBeer,
    createBook,
    createMonitor,

    searchProducts

}