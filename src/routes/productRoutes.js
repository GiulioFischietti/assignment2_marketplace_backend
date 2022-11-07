const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController');

router.get('/beers', productController.getBeers)
router.get('/monitors', productController.getMonitors)
router.get('/books', productController.getBooks)

router.post('/updatebook', productController.updateBook)
router.post('/updatebeer', productController.updateBeer)
router.post('/updatemonitor', productController.updateMonitor)

router.post('/createbeer', productController.createBeer)
router.post('/createbook', productController.createBook)
router.post('/createmonitor', productController.createMonitor)

router.get('/bookbyid', productController.getBookById)
router.get('/beerbyid', productController.getBeerById)
router.get('/monitorbyid', productController.getMonitorById)

router.get('/booksbybrand', productController.getBooksByBrand)
router.get('/monitorsbybrand', productController.getMonitorsByBrand)
router.get('/beersbybrand', productController.getBeersByBrand)

router.post('/searchproducts', productController.searchProducts)
router.get('/productsbycategory', productController.getProductsByCategory)

module.exports = router