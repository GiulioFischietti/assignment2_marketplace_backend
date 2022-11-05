var service = require('../services/productService');

const updateBook = async (req, res) => {
    const [books] = await service.updateBookData(req)
    if (books != []) {
        try {
            res.send({ "success": true, data: books[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const updateBeer = async (req, res) => {
    const [beers] = await service.updateBeerData(req)
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
        const [monitors] = await service.updateMonitorData(req)
        res.send({ "success": true, data: monitors[0] })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const getBeers = async (req, res, next) => {
    const [beers] = await service.getBeersData(req)
    try {
        res.send({ "success": true, data: beers })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getBooks = async (req, res, next) => {
    const [books] = await service.getBooksData(req)
    try {
        res.send({ "success": true, data: books })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getMonitors = async (req, res, next) => {
    const [monitors] = await service.getMonitorsData(req)
    try {
        res.send({ "success": true, data: monitors })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getBookById = async (req, res) => {
    const [books] = await service.getBookByIdData(req);
    if (books != []) {
        try {
            res.send({ "success": true, data: books[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getBeerById = async (req, res) => {
    const [beers] = await service.getBeerByIdData(req)
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

const getMonitorById = async (req, res) => {
    const [monitors] = await service.getMonitorByIdData(req)
    if (monitors != []) {
        try {
            res.send({ "success": true, data: monitors[0] })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getBooksByBrand = async (req, res) => {
    const [brands] = await service.getBookBrands()
    if (brands != []) {
        try {
            var books = []
            for (let i = 0; i < brands.length; i++) {
                const [books_by_brand] = await service.getBooksByBrandData(brands[i].brand)
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
    const [brands] = await service.getMonitorBrands()

    if (brands != []) {

        try {
            var monitors = []
            for (let i = 0; i < brands.length; i++) {
                const [monitors_by_brand] = await service.getMonitorsByBrandData(brands[i].brand)
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
    const [brands] = await service.getBeerBrands()

    if (brands != []) {

        try {
            var beers = []
            for (let i = 0; i < brands.length; i++) {
                const [beers_by_brand] = await service.getBeersByBrandData(brands[i].brand)
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
    const [categories] = await service.getProductCategories()
    if (categories != []) {
        try {
            var products = []
            for (let i = 0; i < categories.length; i++) {
                const [products_by_category] = await service.getProductsByCategory(categories[i].category)
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
        service.createBeerData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}
const createMonitor = async (req, res) => {
    try {
        service.createMonitorData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}
const createBook = async (req, res) => {
    try {
        service.createBookData(req)
        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
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
    createMonitor

}