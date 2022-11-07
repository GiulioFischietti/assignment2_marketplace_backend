const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController');

router.get('/orders', orderController.getOrdersOfUser);
router.get('/orderdetails', orderController.getOrderDetails)
router.post('/updatestatusorder', orderController.updateStatusOrder)
router.post('/createorder', orderController.createOrder)
router.get('/managerorders', orderController.getOrdersOfManager)

module.exports = router