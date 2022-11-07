const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController');

router.get('/getcart', cartController.getCart)
router.post('/removefromcart', cartController.removeFromCart)
router.post('/removeallitemfromcart', cartController.removeAllItemFromCart)
router.post('/addtocart', cartController.addToCart)

module.exports = router