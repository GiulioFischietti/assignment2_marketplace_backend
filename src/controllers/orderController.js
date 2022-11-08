const { Cart } = require('../models/cart');
const { Order } = require('../models/order');
const { ProductOrder } = require('../models/product_order');

const getOrdersOfManager = async (req, res) => {
    const orders = await Order.getOrdersOfManagerData(req)
    try {
        console.log(orders)
        res.send({ "success": true, data: orders })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const updateStatusOrder = async (req, res) => {
    try {
        await Order.updateStatusOrderData(req)
        res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getOrdersOfUser = async (req, res) => {

    const orders = await Order.getOrdersOfUserData(req)
    if (orders != []) {
        try {
            res.send({ "success": true, data: orders })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await ProductOrder.getOrderDetailsData(req)
        res.send({ "success": true, data: orderDetails })
    } catch (error) {
        console.log(error)
        res.status(500).send()

    }
}

const createOrder = async (req, res) => {
    try {
        Order.createOrderData(req)
        var currentIds = await Cart.getCartProductIds(req.body.id)
        for (let i = 0; i < currentIds.length; i++) {
            Cart.deleteCartProduct(req.body.id, currentIds[i])
        }
        Cart.updateCartProductIds(req.body.id, [])

        res.send({ "success": true, data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}


module.exports = {
    getOrdersOfManager,
    updateStatusOrder,
    getOrdersOfUser,
    getOrderDetails,
    createOrder,

}