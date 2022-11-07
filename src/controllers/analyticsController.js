const service = require('../services/analyticsService');

const productAnalytics = async (req, res) => {

    try {
        const [beer_analytics] = await service.getBeerAnalytics(req)
        const [book_analytics] = await service.getBookAnalytics(req)
        const [monitor_analytics] = await service.getMonitorAnalytics(req)

        res.send({ "success": true, data: { "beers": beer_analytics, "books": book_analytics, "monitors": monitor_analytics } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const customerAnalytics = async (req, res) => {
    try {
        const [users] = await service.getCustomerAnalytics(req)
        res.send({ "success": true, data: { "users": users } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}

const expencesAnalytics = async (req, res) => {
    try {
        const [users] = await service.getExpencesAnalytics(req)

        res.send({ "success": true, data: { "users": users } })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }

}



module.exports = {
    productAnalytics,
    customerAnalytics,
    expencesAnalytics
}