const { redisClient } = require('../databases/redisDB')

const getCartProductIds = async (user_id) => {
    try {
        console.log(user_id)
        return await JSON.parse(await redisClient.get("cust:$cust_id:cart_product_ids".replace("$cust_id", user_id)))
    } catch (error) {
        console.log(error)
    }
}

const getCartProductQuantity = async (user_id, cart_product_id) => {
    try {
        const quantity = await redisClient.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", user_id).replace("$cart_item_index", cart_product_id))
        return quantity
    } catch (error) {
        console.log(error)
    }
}

const getCartProductInfo = async (req, cart_product_id) => {
    try {
        return await JSON.parse(await redisClient.get("prod:$product_id".replace("$product_id", cart_product_id)))
    } catch (error) {
        console.log(error)
    }
}

const deleteCartProduct = async (req) => {
    try {
        redisClient.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
        redisClient.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
        redisClient.del("cust:$cust_id:$cart_item_index:cart_item".replace("$cust_id", req.body.user_id).replace("$cart_item_index", req.body.id))
    } catch (error) {
        console.log(error)
    }
}

const updateCartProductIds = async (req, currentIds) => {
    try {
        return await redisClient.set("cust:$cust_id:cart_product_ids".replace("$cust_id", req.body.user_id), JSON.stringify(currentIds))
    } catch (error) {
        console.log(error)
    }
}

const updateCartQuantity = async (user_id, product_id, quantity) => {
    try {
        redisClient.set("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", user_id).replace("$cart_item_index", product_id), quantity)
    } catch (error) {
        console.log(error)
    }
}

const setCartItemProductId = async (user_id, product_id) => {
    try {
        redisClient.set("cust:$cust_id:$cart_item_index:product_id".replace("$cart_item_index", product_id).replace("$cust_id", user_id), product_id)
    } catch (error) {
        console.log(error)
    }
}

const getProductById = async (product_id) => {
    try {
        return await redisClient.get("prod:$product_id".replace("$product_id", product_id))
    } catch (error) {
        console.log(error)
    }
}

const addProductInRedis = async (req) => {
    try {
        redisClient.set("prod:$product_id".replace("$product_id", req.body.product_id), JSON.stringify(req.body))
    } catch (error) {
        console.log(error)
    }
}

const getCartItemProductId = async (req, product_id) => {
    try {
        return await redisClient.get("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", product_id))
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getCartProductIds,
    getCartProductQuantity,
    getCartProductInfo,

    deleteCartProduct,
    
    updateCartProductIds,
    updateCartQuantity,
    
    getProductById,
    addProductInRedis,

    getCartItemProductId,
    setCartItemProductId
}