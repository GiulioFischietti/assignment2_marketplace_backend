const { redisClient } = require('../config/redisDB')
const { ProductOrder } = require('./product_order');

class Cart {
    constructor(data) {
        this.productsCart = data.productOrders
    }

    static getCartProductIds = async (user_id) => {
        try {
            return await JSON.parse(await redisClient.get("cust:$cust_id:cart_product_ids".replace("$cust_id", user_id)))
        } catch (error) {
            console.log(error)
        }
    }

    static getCartProductQuantity = async (user_id, cart_product_id) => {
        try {
            const quantity = await redisClient.get("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", user_id).replace("$cart_item_index", cart_product_id))
            return quantity
        } catch (error) {
            console.log(error)
        }
    }

    static getCartProductInfo = async (req, cart_product_id) => {
        try {
            return await JSON.parse(await redisClient.get("prod:$product_id".replace("$product_id", cart_product_id)))
        } catch (error) {
            console.log(error)
        }
    }



    static deleteCartProduct = async (user_id, product_id) => {
        try {
            redisClient.del("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", user_id).replace("$cart_item_index", product_id))
            redisClient.del("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", user_id).replace("$cart_item_index", product_id))
        } catch (error) {
            console.log(error)
        }
    }

    static updateCartProductIds = async (user_id, currentIds) => {
        try {
            return await redisClient.set("cust:$cust_id:cart_product_ids".replace("$cust_id", user_id), JSON.stringify(currentIds))
        } catch (error) {
            console.log(error)
        }
    }

    static updateCartQuantity = async (user_id, product_id, quantity) => {
        try {
            redisClient.set("cust:$cust_id:$cart_item_index:quantity".replace("$cust_id", user_id).replace("$cart_item_index", product_id), quantity)
        } catch (error) {
            console.log(error)
        }
    }

    static setCartItemProductId = async (user_id, product_id) => {
        try {
            redisClient.set("cust:$cust_id:$cart_item_index:product_id".replace("$cart_item_index", product_id).replace("$cust_id", user_id), product_id)
        } catch (error) {
            console.log(error)
        }
    }

    static getProductById = async (product_id) => {
        try {
            return await redisClient.get("prod:$product_id".replace("$product_id", product_id))
        } catch (error) {
            console.log(error)
        }
    }

    static addProductInRedis = async (req) => {
        try {
            redisClient.set("prod:$product_id".replace("$product_id", req.body.product_id), JSON.stringify(req.body))
        } catch (error) {
            console.log(error)
        }
    }

    static getCartItemProductId = async (req, product_id) => {
        try {
            return await redisClient.get("cust:$cust_id:$cart_item_index:product_id".replace("$cust_id", req.body.user_id).replace("$cart_item_index", product_id))
        } catch (error) {
            console.log(error)
        }
    }

    static getCart = async (req) => {
        var cartItems = []
        var cart_product_ids = await this.getCartProductIds(req.query.id)

        if (cart_product_ids != null) {
            for (let i = 0; i < cart_product_ids.length; i++) {

                var cartItemQuantity = await this.getCartProductQuantity(req.query.id, cart_product_ids[i])
                var cartItem = await this.getCartProductInfo(req, cart_product_ids[i])

                cartItem.quantity = parseInt(cartItemQuantity)
                cartItem.product_id = parseInt(cart_product_ids[i])
                cartItems.push(cartItem)
            }
        }

        return cartItems.map((item)=>new ProductOrder(item))
    }
}

module.exports = {
    Cart
}