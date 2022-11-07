const orderService = require('../services/orderService');
const cartService = require('../services/cartService')

const getOrdersOfManager = async (req, res) => {
    const [orders] = await orderService.getOrdersOfManagerData(req)
        try {
            res.send({ "success": true, data: orders })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
}

const updateStatusOrder = async (req, res) => {
    try {
        await orderService.updateStatusOrderData(req)
        res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getOrdersOfUser = async (req, res) => {

    const [orders] = await orderService.getOrdersOfUserData(req)
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
        const [orders] = await orderService.getOrderDetailsData(req)
        res.send({ "success": true, data: orders })
    } catch (error) {
        console.log(error)
        res.status(500).send()

    }
}

const createOrder = async (req, res) => {
    try {
        orderService.createOrderData(req)
        var currentIds = await cartService.getCartProductIds(req.body.id)
        for (let i = 0; i < currentIds.length; i++) {
            cartService.deleteCartProduct(req.body.id, currentIds[i])
        }
        cartService.updateCartProductIds(req.body.id, [])
        
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