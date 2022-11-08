const { Cart } = require('../models/cart');

const getCart = async (req, res) => {
    try {
        const cartItems = await Cart.getCart(req)
        res.status(200).send({ data: cartItems })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const removeFromCart = async (req, res) => {
    try {
        var cartItemQuantity = await Cart.getCartProductQuantity(req.body.user_id, req.body.id)
        if (cartItemQuantity - 1 == 0) {
            Cart.deleteCartProduct(req.body.user_id, req.body.id)
            var currentIds = await Cart.getCartProductIds(req.body.user_id)
            var index = currentIds.indexOf(req.body.id);
            currentIds.splice(index, 1);
            Cart.updateCartProductIds(req.body.user_id, currentIds)
        } else {
            Cart.updateCartQuantity(req.body.user_id, req.body.id, (parseInt(cartItemQuantity) - 1))
        }
        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const removeAllItemFromCart = async (req, res) => {
    try {
        Cart.deleteCartProduct(req.body.user_id, req.body.id)
        
        var currentIds = await Cart.getCartProductIds(req.body.user_id)

        var index = currentIds.indexOf(req.body.id);
        currentIds.splice(index, 1);
        Cart.updateCartProductIds(req.body.user_id, currentIds)

        res.status(200).send({ data: null })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

const addToCart = async (req, res) => {
    try {
        var currentIds = await Cart.getCartProductIds(req.body.user_id)
        var product_in_redis = false;
        product_in_redis = await Cart.getProductById(req.body.product_id)

        if (!product_in_redis) {
            Cart.addProductInRedis(req)
            console.log("not in redis")
        }

        if (currentIds != null) {
            var currentIdsCopy = [...currentIds]

            for (let i = 0; i <= currentIds.length; i++) {
                var productInCart = ((await Cart.getCartItemProductId(req, currentIds[i])) == req.body.product_id)
                if (productInCart) {
                    var quantity = await Cart.getCartProductQuantity(req.body.user_id, req.body.product_id)
                    await Cart.updateCartQuantity(req.body.user_id, req.body.product_id, parseInt(quantity) + 1)
                    break
                }
            }
            if (!productInCart) {
                currentIdsCopy.push(req.body.product_id)  
                Cart.updateCartProductIds(req.body.user_id, currentIdsCopy)
                Cart.updateCartQuantity(req.body.user_id, req.body.product_id, 1)
                Cart.setCartItemProductId(req.body.user_id, req.body.product_id)
                
            }
        } else {
            Cart.updateCartProductIds(req.body.user_id, [req.body.product_id])
            Cart.updateCartQuantity(req.body.user_id, req.body.product_id, 1)
            Cart.setCartItemProductId(req.body.user_id, req.body.product_id)
            
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