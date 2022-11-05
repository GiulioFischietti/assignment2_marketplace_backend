var service = require('../services/orderService');

const getOrdersOfManager = async (req, res) => {
    const [orders] = await service.getOrdersOfManagerData(req)
        try {
            res.send({ "success": true, data: orders })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
}

const updateStatusOrder = async (req, res) => {
    try {
        await service.updateStatusOrderData(req)
        res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const getOrdersOfUser = async (req, res) => {

    const [orders] = await service.getOrdersOfUserData(req)
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
        const [orders] = await service.getOrderDetailsData(req)
        res.send({ "success": true, data: orders })
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

}