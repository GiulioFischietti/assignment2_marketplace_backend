const service = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        var cartItems = []
        var cart_product_ids = await service.getCartProductIds(req.query.id)

        if (cart_product_ids != null) {
            for (let i = 0; i < cart_product_ids.length; i++) {

                var cartItemQuantity = await service.getCartProductQuantity(req.query.id, cart_product_ids[i])
                var cartItem = await service.getCartProductInfo(req, cart_product_ids[i])

                cartItem.quantity = parseInt(cartItemQuantity)
                cartItem.product_id = parseInt(cart_product_ids[i])
                cartItems.push(cartItem)
            }
        }
        res.status(200).send({ data: cartItems })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const removeFromCart = async (req, res) => {
    try {
        var cartItemQuantity = await service.getCartProductQuantity(req.body.user_id, req.body.id)
        if (cartItemQuantity - 1 == 0) {
            service.deleteCartProduct(req.body.user_id, req.body.id)
            var currentIds = await service.getCartProductIds(req.body.user_id)
            var index = currentIds.indexOf(req.body.id);
            currentIds.splice(index, 1);
            service.updateCartProductIds(req.body.user_id, currentIds)
        } else {
            service.updateCartQuantity(req.body.user_id, req.body.id, (parseInt(cartItemQuantity) - 1))
        }
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const removeAllItemFromCart = async (req, res) => {
    try {
        service.deleteCartProduct(req.body.user_id, req.body.id)
        console.log(req.body)
        var currentIds = await service.getCartProductIds(req.body.user_id)

        var index = currentIds.indexOf(req.body.id);
        currentIds.splice(index, 1);
        service.updateCartProductIds(req.body.user_id, currentIds)

        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const addToCart = async (req, res) => {
    try {
        var currentIds = await service.getCartProductIds(req.body.user_id)
        var product_in_redis = false;
        product_in_redis = await service.getProductById(req.body.product_id)

        if (!product_in_redis) {
            service.addProductInRedis(req)
        }

        if (currentIds != null) {
            var currentIdsCopy = [...currentIds]

            for (let i = 0; i <= currentIds.length; i++) {
                var productInCart = ((await service.getCartItemProductId(req, currentIds[i])) == req.body.product_id)
                if (productInCart) {
                    var quantity = await service.getCartProductQuantity(req.body.user_id, req.body.product_id)
                    await service.updateCartQuantity(req.body.user_id, req.body.product_id, parseInt(quantity) + 1)
                    break
                }
            }
            if (!productInCart) {
                currentIdsCopy.push(req.body.product_id)  
                service.updateCartProductIds(req.body.user_id, currentIdsCopy)
                service.updateCartQuantity(req.body.user_id, req.body.product_id, 1)
                service.setCartItemProductId(req.body.user_id, req.body.product_id)
                
            }
        } else {
            service.updateCartProductIds(req.body.user_id, [req.body.product_id])
            service.updateCartQuantity(req.body.user_id, req.body.product_id, 1)
            service.setCartItemProductId(req.body.user_id, req.body.product_id)
            
        }
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

module.exports = {
    getCart,
    removeFromCart,
    removeAllItemFromCart,
    addToCart

}